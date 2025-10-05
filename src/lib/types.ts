import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  email: string;
  password: string; // hashed
  encryptionKey: string; // encrypted with user's password
  createdAt: Date;
  updatedAt: Date;
}

export interface VaultItem {
  _id?: ObjectId;
  userId: ObjectId;
  title: string;
  username: string;
  password: string; // encrypted
  url?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}