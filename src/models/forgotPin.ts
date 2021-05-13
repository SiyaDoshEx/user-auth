import { IForgotPin } from '../interfaces/IForgotPin';
import mongoose from 'mongoose';

const ForgotPin = new mongoose.Schema(
  {
    cell_number: {
      type: String,
      unique: true,
      index: true,
    },

    request_frequency: {
      type: Number,
      required: true,
    },

    needs_pin_change: {
      type: Boolean,
      required: true,
    },
  },
  
  { timestamps: true },
);

export default mongoose.model<IForgotPin & mongoose.Document>('ForgotPin', ForgotPin);
