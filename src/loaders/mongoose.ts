import mongoose from 'mongoose';
import { Db } from 'mongodb';
import config from '../config';

export default async (): Promise<Db> => {
  const connection = await mongoose.connect(config.databaseURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    ssl: true,
    sslCA:require('fs').readFileSync(`${__dirname}/cert.pem`)
  });
  return connection.connection.db;
};
