import { Document, Model } from 'mongoose';
import { IUser } from '../../interfaces/IUser';
import { IFailedSignIn } from '../../interfaces/IFailedSignIn';
import { IForgotPin } from '../../interfaces/IForgotPin';
declare global {
  namespace Express {
    export interface Request {
      currentUser: IUser & Document;
    }    
  }

  namespace Models {
    export type UserModel = Model<IUser & Document>;
    export type FailedSignInModel = Model<IFailedSignIn & Document>;
    export type ForgotPinModel = Model<IForgotPin & Document>;
  }
}
