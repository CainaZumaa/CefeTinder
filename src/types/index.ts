import { QueryResultRow } from "pg";

export interface IUser extends QueryResultRow {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  bio?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IUserPreferences extends QueryResultRow {
  user_id: string;
  min_age: number;
  max_age: number;
  gender_preference?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IMatch extends QueryResultRow {
  id: string;
  user1_id: string;
  user2_id: string;
  user1_liked: boolean;
  user2_liked: boolean;
  is_super_like: boolean;
  matched_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export * from "./graphql";

export const TYPES = {
  IUserRepository: Symbol.for("IUserRepository"),
}