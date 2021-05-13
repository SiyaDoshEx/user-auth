import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import UserService from '../../services/user';
import { IUserInputDTO } from '../../interfaces/IUser';
import middlewares from '../middlewares';
import { Logger } from 'winston';
import { celebrate, Joi } from 'celebrate';

export default (app: Router) => {
  app.get('/me', middlewares.isAuth, middlewares.attachCurrentUser, (req: Request, res: Response) => {
    return res.json({ user: req.currentUser }).status(200);
  });

  app.put('/forgot_pin', 
    celebrate({
      body: Joi.object({ cell_number: Joi.string().required() }),
    }),
    middlewares.isAuth, 
    async (req: Request, res: Response, next: NextFunction) => {
    const logger:Logger = Container.get('logger');
    try {
      const userServiceInstance = Container.get(UserService);
      logger.debug('Calling forgot pin endpoint for number: %o', req.body.cell_number);
      const { message } = await userServiceInstance.forgotPin(req.body.cell_number);
      return res.status(201).json({ message }).end();
    } catch (e) {
      logger.error('🔥 error %o', e);
      return next(e);
    }
  });

  app.put('/update', 
    celebrate({
      body: Joi.object({
        name: Joi.string().required(),
        surname: Joi.string().required(),
        cell_number: Joi.string().required(),
        email: Joi.string().required()
      }),
    }),
    middlewares.isAuth, middlewares.attachCurrentUser, 
    async (req: Request, res: Response, next: NextFunction) => {
    const logger:Logger = Container.get('logger');
    try {
      const userServiceInstance = Container.get(UserService);
      const user = req.currentUser;

      if(user) {
        logger.debug('Calling update endpoint for user: %o', user);
        const { updated_user, message } = await userServiceInstance.updateUser(user.cell_number,req.body as IUserInputDTO);
        return res.status(201).json({ updated_user, message }).end();
      } else {
        throw new Error('User not registered');
      }
    } catch (e) {
      logger.error('🔥 error %o', e);
      return next(e);
    }
  });

  app.delete('/delete', 
    celebrate({
      body: Joi.object({
        cell_number: Joi.string().required(),
        pin: Joi.string().required()
      }),
    }),
    middlewares.isAuth, middlewares.attachCurrentUser, async (req: Request, res: Response, next: NextFunction) => {
    const logger:Logger = Container.get('logger');
    try {
      const userServiceInstance = Container.get(UserService);
      const user = req.currentUser;

      if(user && user.cell_number == req.body.cell_number) {
        logger.debug('Calling delete endpoint for user: %o', user);
        const { message } = await userServiceInstance.deleteUser(user.cell_number);
        return res.status(201).json({ message }).end();
      } else {
        throw new Error('User not registered');
      }
    } catch (e) {
      logger.error('🔥 error %o', e);
      return next(e);
    }
  });
};
