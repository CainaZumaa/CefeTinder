// package: match
// file: match.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class LikeUserRequest extends jspb.Message { 
    getUserid(): string;
    setUserid(value: string): LikeUserRequest;
    getTargetuserid(): string;
    setTargetuserid(value: string): LikeUserRequest;
    getIsmatchlike(): boolean;
    setIsmatchlike(value: boolean): LikeUserRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): LikeUserRequest.AsObject;
    static toObject(includeInstance: boolean, msg: LikeUserRequest): LikeUserRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: LikeUserRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): LikeUserRequest;
    static deserializeBinaryFromReader(message: LikeUserRequest, reader: jspb.BinaryReader): LikeUserRequest;
}

export namespace LikeUserRequest {
    export type AsObject = {
        userid: string,
        targetuserid: string,
        ismatchlike: boolean,
    }
}

export class DislikeUserRequest extends jspb.Message { 
    getUserid(): string;
    setUserid(value: string): DislikeUserRequest;
    getTargetuserid(): string;
    setTargetuserid(value: string): DislikeUserRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DislikeUserRequest.AsObject;
    static toObject(includeInstance: boolean, msg: DislikeUserRequest): DislikeUserRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DislikeUserRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DislikeUserRequest;
    static deserializeBinaryFromReader(message: DislikeUserRequest, reader: jspb.BinaryReader): DislikeUserRequest;
}

export namespace DislikeUserRequest {
    export type AsObject = {
        userid: string,
        targetuserid: string,
    }
}

export class GetMatchesRequest extends jspb.Message { 
    getUserid(): string;
    setUserid(value: string): GetMatchesRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetMatchesRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetMatchesRequest): GetMatchesRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetMatchesRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetMatchesRequest;
    static deserializeBinaryFromReader(message: GetMatchesRequest, reader: jspb.BinaryReader): GetMatchesRequest;
}

export namespace GetMatchesRequest {
    export type AsObject = {
        userid: string,
    }
}

export class Match extends jspb.Message { 
    getId(): string;
    setId(value: string): Match;
    getUser1id(): string;
    setUser1id(value: string): Match;
    getUser2id(): string;
    setUser2id(value: string): Match;
    getUser1liked(): boolean;
    setUser1liked(value: boolean): Match;
    getUser2liked(): boolean;
    setUser2liked(value: boolean): Match;
    getIssuperlike(): boolean;
    setIssuperlike(value: boolean): Match;
    getMatchedat(): string;
    setMatchedat(value: string): Match;
    getCreatedat(): string;
    setCreatedat(value: string): Match;
    getUpdatedat(): string;
    setUpdatedat(value: string): Match;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Match.AsObject;
    static toObject(includeInstance: boolean, msg: Match): Match.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Match, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Match;
    static deserializeBinaryFromReader(message: Match, reader: jspb.BinaryReader): Match;
}

export namespace Match {
    export type AsObject = {
        id: string,
        user1id: string,
        user2id: string,
        user1liked: boolean,
        user2liked: boolean,
        issuperlike: boolean,
        matchedat: string,
        createdat: string,
        updatedat: string,
    }
}

export class Matches extends jspb.Message { 
    clearMatchesList(): void;
    getMatchesList(): Array<Match>;
    setMatchesList(value: Array<Match>): Matches;
    addMatches(value?: Match, index?: number): Match;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Matches.AsObject;
    static toObject(includeInstance: boolean, msg: Matches): Matches.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Matches, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Matches;
    static deserializeBinaryFromReader(message: Matches, reader: jspb.BinaryReader): Matches;
}

export namespace Matches {
    export type AsObject = {
        matchesList: Array<Match.AsObject>,
    }
}

export class Empty extends jspb.Message { 

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Empty.AsObject;
    static toObject(includeInstance: boolean, msg: Empty): Empty.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Empty, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Empty;
    static deserializeBinaryFromReader(message: Empty, reader: jspb.BinaryReader): Empty;
}

export namespace Empty {
    export type AsObject = {
    }
}
