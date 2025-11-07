import * as grpc from "@grpc/grpc-js";
import { UserServiceClient as ProtoUserServiceClient } from "../proto/user_grpc_pb";
import {
  User as ProtoUser,
  GetUserRequest,
  UpdatePreferencesRequest,
  UserPreferences as ProtoUserPreferences,
  MatchCriteria,
  CreateUserRequest,
} from "../proto/user_pb";
import { UserPreferences } from "src/types";

export class UserServiceClient {
  private client: ProtoUserServiceClient;

  constructor() {
    const userServiceAddress =
      process.env.USER_SERVICE_ADDRESS || "localhost:50051";
    this.client = new ProtoUserServiceClient(
      userServiceAddress,
      grpc.credentials.createInsecure()
    );
  }

  async GetUser(userId: string): Promise<ProtoUser> {
    return new Promise<ProtoUser>((resolve, reject) => {
      const request = new GetUserRequest();
      request.setUserid(userId);

      console.log("Sending GetUser request for userId:", userId);

      this.client.getUser(request, (error, response) => {
        if (error) {
          return reject(error);
        } else if (response) {
          return resolve(response);
        } else {
          return reject(new Error("No response received"));
        }
      });
    });
  }

  async GetPotentialMatches(userId: string): Promise<ProtoUser[]> {
    return new Promise<ProtoUser[]>((resolve, reject) => {
      const request = new MatchCriteria();
      request.setUserid(userId);
      
      this.client.getPotentialMatches(request, (error, response) => {
        if (error) {
          return reject(error);
        } else if (response) {
          return resolve(response.getUsersList());
        } else {
          return reject(new Error("No response received"));
        }
      });
    });
  }

  async UpdateUserPreferences(
    userId: string,
    preferences: Pick<
      UserPreferences,
      "max_age" | "min_age" | "gender_preference"
    >
  ) {
    return new Promise((resolve, reject) => {
      const request = new UpdatePreferencesRequest();
      request.setUserid(userId);

      const UserPreferences = new ProtoUserPreferences();
      UserPreferences.setMaxage(preferences.max_age);
      UserPreferences.setGenderpreference(preferences.gender_preference!);
      request.setPreferences(UserPreferences);

      this.client.updateUserPreferences(request, (error, response) => {
        if (error) {
          return reject(error);
        } else if (response) {
          return resolve(response);
        } else {
          return reject(new Error("No response received"));
        }
      });
    });
  }

  async CreateUser(userData: {
    name: string;
    age: number;
    email: string;
    gender: string;
    bio?: string;
  }): Promise<ProtoUser> {
    return new Promise<ProtoUser>((resolve, reject) => {
      const request = new CreateUserRequest();
      request.setName(userData.name);
      request.setAge(userData.age);
      request.setEmail(userData.email);
      request.setGender(userData.gender);
      if (userData.bio) {
        request.setBio(userData.bio);
      }

      this.client.createUser(request, (error, response) => {
        if (error) {
          return reject(error);
        } else if (response) {
          return resolve(response);
        } else {
          return reject(new Error("No response received"));
        }
      });
    });
  }
}
