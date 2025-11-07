import * as grpc from "@grpc/grpc-js";
import { MatchServiceClient as ProtoMatchServiceClient  } from "../proto/match_grpc_pb"
import { Match, GetMatchesRequest, LikeUserRequest } from "../proto/match_pb";

export class MatchServiceClient {
    private client: ProtoMatchServiceClient;

    constructor() {
        const matchServiceAddress =
            process.env.MATCH_SERVICE_ADDRESS || "localhost:50052";
        this.client = new ProtoMatchServiceClient(
            matchServiceAddress,
            grpc.credentials.createInsecure()
        );
    }

    async getMatches(userId: string): Promise<Match[]> {
        return new Promise<Match[]>((resolve, reject) => {
            const request = new GetMatchesRequest();
            request.setUserid(userId);

            this.client.getMatches(request, (error, response) => {
                if (error) {
                    return reject(error);
                } else if (response) {
                    return resolve(response.getMatchesList());
                } else {
                    return reject(new Error("No response received"));
                }
            });
        });
    }

    async likeUser(userId: string, targetUserId: string, isMatchLike: boolean): Promise<Match> {
        return new Promise<Match>((resolve, reject) => {
            const request = new LikeUserRequest();
            request.setUserid(userId);
            request.setTargetuserid(targetUserId);
            request.setIsmatchlike(isMatchLike);

            this.client.likeUser(request, (error, response) => {
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

    async dislikeUser(userId: string, targetUserId: string): Promise<Match> {
        return new Promise<Match>((resolve, reject) => {
            const request = new LikeUserRequest();
            request.setUserid(userId);
            request.setTargetuserid(targetUserId);
            request.setIsmatchlike(false);

            this.client.likeUser(request, (error, response) => {
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