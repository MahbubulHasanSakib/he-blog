import { ObjectId } from 'mongodb';
export interface IUser {
  _id: ObjectId;
  name: string;
  password: string;
  email: string;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
