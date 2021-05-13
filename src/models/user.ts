import { IUser } from '../interfaces/IUser';
import mongoose from 'mongoose';

const User = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter the your name']
    },

    surname: {
      type: String,
      required: [true, 'Please enter your surname']
    },

    cell_number: {
      type: String,
      required: [true, 'Please enter your cell number'],
      unique: true,
      index: true,
    },

    email: {
      type: String,
      required: [true, 'Please enter your email'],
      lowercase: true,
      unique: true,
      index: true,
    },

    role: {
      type: String,
      default: 'user',
    },

    birthday: {
      type: Date,
      required: [true, 'Please enter your birthday'],
    },

    pin: String,

    salt: String,

    last_signin: Date,
  },
  
  { timestamps: true },
);

export default mongoose.model<IUser & mongoose.Document>('User', User);
