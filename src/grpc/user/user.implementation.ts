import * as grpc from "@grpc/grpc-js";
import { IUserServiceServer } from "../proto/user_grpc_pb";
import { User, PotentialMatches } from "../proto/user_pb";
import { container } from "./user.container";
import { UserService } from "../../services/user/UserService";

const userService = container.get<UserService>(UserService);

export const userServiceImplementation: IUserServiceServer = {
  getUser: async (call, callback) => {
    const userId = call.request.getUserid();
    console.log("Received GetUser request for userId:", userId);

    try {
      const user = await userService.getUserById(userId);
      if (!user) {
        callback(null, null);
        return;
      }

      const protoUser = new User();
      protoUser.setId(user.id);
      protoUser.setEmail(user.email);
      protoUser.setName(user.name);
      protoUser.setAge(user.age);
      protoUser.setGender(user.gender);
      protoUser.setBio(user.bio || "");

      callback(null, protoUser);
    } catch (error) {
      console.error("Error in GetUser:", error);
      callback({
        code: grpc.status.INTERNAL,
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  },

  createUser: async (call, callback) => {
    try {
      const user = await userService.createUser({
        name: call.request.getName(),
        age: call.request.getAge(),
        email: call.request.getEmail(),
        gender: call.request.getGender(),
        bio: call.request.getBio(),
      });

      const protoUser = new User();
      protoUser.setId(user.id);
      protoUser.setName(user.name);
      protoUser.setAge(user.age);
      protoUser.setEmail(user.email);
      protoUser.setBio(user.bio || "");
      protoUser.setGender(user.gender);

      callback(null, protoUser);
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  },

  getPotentialMatches: async (call, callback) => {
    const userId = call.request.getUserid();

    try {
      const matches = await userService.getPotentialMatches(userId);
      const protoMatches = new PotentialMatches();
      protoMatches.setUsersList(
        matches.map((match) => {
          const protoUser = new User();
          protoUser.setId(match.id);
          protoUser.setName(match.name);
          protoUser.setAge(match.age);
          protoUser.setGender(match.gender);
          return protoUser;
        })
      );

      callback(null, protoMatches);
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  },

  updateUserPreferences: async (call, callback) => {
    const userId = call.request.getUserid();
    const preferences = call.request.getPreferences();
    if (!preferences) {
      callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Preferences are required",
      });
      return;
    }

    try {
      await userService.updateUserPreferences(userId, preferences);
      callback(null);
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  },
};
