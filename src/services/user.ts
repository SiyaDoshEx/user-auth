import { Service, Inject } from 'typedi';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';
//import MailerService from './mailer';
import { IUser, IUserInputDTO } from '../interfaces/IUser';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import events from '../subscribers/events';

@Service()
export default class AuthService {
  constructor(
    @Inject('userModel') private userModel: Models.UserModel,
    //private mailer: MailerService,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {
  }

  public async updateUser(cell_number : string, userInputDTO : IUserInputDTO) : Promise<{ updated_user : IUser, message : string}> {
    try {
      this.logger.silly('Update using cell number');
      const { nModified } = await this.userModel.updateOne({ cell_number : cell_number}, { ...userInputDTO });
      if (nModified == 1) {
        const userRecord = await this.userModel.findOne({ cell_number: userInputDTO.cell_number });
        this.logger.silly('Sending user update email');
        /** 
         * @TODO await this.sendUserUpdateEmail(userInputDTO);
         */
        const updated_user = userRecord.toObject();
        Reflect.deleteProperty(updated_user, 'pin');
        Reflect.deleteProperty(updated_user, 'salt');
        Reflect.deleteProperty(updated_user, '_id');
        Reflect.deleteProperty(updated_user, 'createdAt');
        Reflect.deleteProperty(updated_user, '__v');
        const message = 'User successfully updated';
        return { updated_user, message };
      } else{
        throw new Error('User cannot be updated');
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async deleteUser(cell_number : string) : Promise<{ message : string }> {
    this.logger.silly('Delete using cell number');
    const { deletedCount } = await this.userModel.deleteOne({ cell_number });
    if (deletedCount == 1) {
      this.logger.silly('Sending user delete email');
      /** 
       * @TODO await this.mailer.sendUserDeleteEmail('');
       */
      return { message : `User with cell number ${cell_number} successfully deleted` }
    } else{
      throw new Error('User could not be deleted.');
    }
  }

  public async forgotPin(cell_number : string) : Promise<{ message : string }> {
    this.logger.silly('Find using cell number');
    const userRecord = await this.userModel.findOne({ cell_number: cell_number });
    if (userRecord) {
      const salt = randomBytes(32);
      this.logger.silly('Generating pin');
      const pin = await this.generatePin(4);
      this.logger.silly('Hashing pin');
      const hashedPin = await argon2.hash(pin, { salt });
      this.logger.silly('Updating user db record');

      await this.userModel.updateOne({ cell_number : cell_number }, { pin : hashedPin });
      this.eventDispatcher.dispatch(events.user.forgotPin, { cell_number : cell_number });
      /** 
       * @TODO Send pin to user
       */
      return { message : `New pin sent to cell number ${cell_number}` }
    } else{
      throw new Error(`New pin for cell number ${cell_number} could not be created`);
    }
  }

  private async generatePin(length : number) {
    var generated_key = '';
    var possible = '0123456789';
    for (var i = 0; i < length; i++) {
      generated_key += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return generated_key;
}
}
