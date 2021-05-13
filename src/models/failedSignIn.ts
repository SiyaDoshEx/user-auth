import { IFailedSignIn } from '../interfaces/IFailedSignIn';
import mongoose from 'mongoose';

const FailedSignIn = new mongoose.Schema(
  {
    cell_number: {
      type: String,
      unique: true,
      index: true,
    },

    pin: {
      type: String,
      required: true,
    },

    count: {
      type: Number,
      required: true,
    },

  },
  
  { timestamps: true },
);

export default mongoose.model<IFailedSignIn & mongoose.Document>('FailedSignIn', FailedSignIn);
