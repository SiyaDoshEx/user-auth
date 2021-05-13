import { Service, Inject } from 'typedi';
import jwt from 'jsonwebtoken';
import MailerService from './mailer';
import config from '../config';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { IUser, IUserInputDTO } from '../interfaces/IUser';
import { IForgotPin } from '../interfaces/IForgotPin';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import events from '../subscribers/events';

@Service()
export default class AuthService {
  constructor(
    @Inject('userModel') private userModel: Models.UserModel,
    @Inject('forgotPinModel') private forgotPinModel: Models.ForgotPinModel,
    //private mailer: MailerService,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {
  }

  public async signUp(userInputDTO : IUserInputDTO) : Promise<{ user : IUser; token : string }> {
    try {
      const salt = randomBytes(32);
      this.logger.silly('Hashing pin');
      const hashedPin = await argon2.hash(userInputDTO.pin, { salt });
      this.logger.silly('Creating user db record');
      const userRecord = await this.userModel.create({
        ...userInputDTO,
        salt: salt.toString('hex'),
        pin: hashedPin,
      });
      this.logger.silly('Generating JWT');
      const token = await this.generateToken(userRecord);

      if (!userRecord) {
        throw new Error('User cannot be created');
      }
      this.logger.silly('Sending welcome email');
      //await this.mailer.SendWelcomeEmail(userRecord);

      this.eventDispatcher.dispatch(events.user.signUp, { user : userRecord });

      /**
       * @TODO There should exist a 'Mapper' layer that transforms data from layer to layer
       */
      const user = userRecord.toObject();
      Reflect.deleteProperty(user, 'pin');
      Reflect.deleteProperty(user, 'salt');
      return { user, token };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async signIn(cell_number : string, pin: string) : Promise<{ user : IUser; forgot_pin : IForgotPin; token : string }> {
    const userRecord = await this.userModel.findOne({ cell_number });
    const forgotPinRecord = await this.forgotPinModel.findOne({ cell_number });

    if (!userRecord) {
      this.eventDispatcher.dispatch(events.user.failedSignIn, {
        cell_number: cell_number,
        pin: pin
      });
      throw new Error('User not registered');
    }
  
    this.logger.silly('Checking pin');
    const validPin = await argon2.verify(userRecord.pin, pin);
    if (validPin) {
      this.logger.silly('Pin is valid!');
      this.logger.silly('Generating JWT');
      const token = await this.generateToken(userRecord);
      this.eventDispatcher.dispatch(events.user.signIn, userRecord);

      const user = userRecord.toObject();
      Reflect.deleteProperty(user, 'pin');
      Reflect.deleteProperty(user, 'salt');

      const forgot_pin = forgotPinRecord.toObject();
    
      return { user, forgot_pin, token };
    } else {
      this.eventDispatcher.dispatch(events.user.failedSignIn, {
        cell_number: userRecord.cell_number,
        pin: pin
      });
      throw new Error('Invalid Pin');
    }
  }

  private async generateToken(user) {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    this.logger.silly(`Sign JWT for userId: ${user._id}`);
    return jwt.sign(
      {
        _id: user._id,
        role: user.role,
        name: user.name,
        surname: user.surname,
        email: user.email,
        cell_number: user.cell_number,
        exp: exp.getTime() / 1000,
      },
      config.jwtSecret
    );
  }
}
