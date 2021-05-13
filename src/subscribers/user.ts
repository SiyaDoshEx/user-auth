import { Container } from 'typedi';
import { EventSubscriber, On } from 'event-dispatch';
import events from './events';
import { IUser } from '../interfaces/IUser';
import { IFailedSignIn } from '../interfaces/IFailedSignIn';
import { IForgotPin } from '../interfaces/IForgotPin';
import mongoose from 'mongoose';
import { Logger } from 'winston';

@EventSubscriber()
export default class UserSubscriber {
  @On(events.user.signIn)
  public async onUserSignIn({ _id } : Partial<IUser>) {
    const Logger: Logger = Container.get('logger');

    try {
      const UserModel = Container.get('userModel') as mongoose.Model<IUser & mongoose.Document>
      await UserModel.updateOne({_id}, { $set: { last_signin: new Date() } });
    } catch (e) {
      Logger.error(`🔥 Error on event ${events.user.signIn}: %o`, e);
      throw e;
    }
  }

  @On(events.user.signUp)
  public onUserSignUp({ name, email, _id }: Partial<IUser>) {
    const Logger: Logger = Container.get('logger');

    try {
      /**
       * @TODO implement this
       */
      // Call the tracker tool so your investor knows that there is a new signup
      // and leave you alone for another hour.
      // TrackerService.track('user.signup', { email, _id })
      // Start your email sequence or whatever
      // MailService.startSequence('user.welcome', { email, name })
    } catch (e) {
      Logger.error(`🔥 Error on event ${events.user.signUp}: %o`, e);
      throw e;
    }
  }

  @On(events.user.failedSignIn)
  public async onFailedSignIn({ cell_number, pin } : Partial<IUser>) {
    const Logger: Logger = Container.get('logger');

    try {
      const FailedSignInModel = Container.get('failedSignInModel') as mongoose.Model<IFailedSignIn & mongoose.Document>
      const failedSignInRecord = await FailedSignInModel.findOne({ cell_number });

      if (!failedSignInRecord) {
        await FailedSignInModel.create({
          cell_number: cell_number,
          pin: pin,
          count: 1
        });
      } else {
        await FailedSignInModel.updateOne({ cell_number }, { $set: { 
          count: failedSignInRecord.count + 1,
          pin: pin,
        } });
      }
    } catch (e) {
      Logger.error(`🔥 Error on event ${events.user.failedSignIn}: %o`, e);
      throw e;
    }
  }

  @On(events.user.forgotPin)
  public async onForgotPin({ cell_number } : Partial<IForgotPin>) {
    const Logger: Logger = Container.get('logger');

    try {
      const ForgotPinModel = Container.get('forgotPinModel') as mongoose.Model<IForgotPin & mongoose.Document>
      const forgotPinModelRecord = await ForgotPinModel.findOne({ cell_number });

      if (!forgotPinModelRecord) {
        await ForgotPinModel.create({
          cell_number: cell_number,
          request_frequency: 1,
          needs_pin_change: true
        });
      } else {
        await ForgotPinModel.updateOne({ cell_number }, { $set: { 
          count: forgotPinModelRecord.request_frequency + 1,
          needs_pin_change: true,
        } });
      }
    } catch (e) {
      Logger.error(`🔥 Error on event ${events.user.forgotPin}: %o`, e);
      throw e;
    }
  }
}
