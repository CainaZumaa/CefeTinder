// package: user
// file: user.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class User extends jspb.Message { 
    getId(): string;
    setId(value: string): User;
    getName(): string;
    setName(value: string): User;
    getEmail(): string;
    setEmail(value: string): User;
    getAge(): number;
    setAge(value: number): User;
    getGender(): string;
    setGender(value: string): User;
    getBio(): string;
    setBio(value: string): User;
    clearInterestsList(): void;
    getInterestsList(): Array<string>;
    setInterestsList(value: Array<string>): User;
    addInterests(value: string, index?: number): string;

    hasPreferences(): boolean;
    clearPreferences(): void;
    getPreferences(): UserPreferences | undefined;
    setPreferences(value?: UserPreferences): User;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): User.AsObject;
    static toObject(includeInstance: boolean, msg: User): User.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: User, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): User;
    static deserializeBinaryFromReader(message: User, reader: jspb.BinaryReader): User;
}

export namespace User {
    export type AsObject = {
        id: string,
        name: string,
        email: string,
        age: number,
        gender: string,
        bio: string,
        interestsList: Array<string>,
        preferences?: UserPreferences.AsObject,
    }
}

export class UserPreferences extends jspb.Message { 
    getMaxage(): number;
    setMaxage(value: number): UserPreferences;
    getGenderpreference(): string;
    setGenderpreference(value: string): UserPreferences;
    clearInterestpreferencesList(): void;
    getInterestpreferencesList(): Array<string>;
    setInterestpreferencesList(value: Array<string>): UserPreferences;
    addInterestpreferences(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UserPreferences.AsObject;
    static toObject(includeInstance: boolean, msg: UserPreferences): UserPreferences.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UserPreferences, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UserPreferences;
    static deserializeBinaryFromReader(message: UserPreferences, reader: jspb.BinaryReader): UserPreferences;
}

export namespace UserPreferences {
    export type AsObject = {
        maxage: number,
        genderpreference: string,
        interestpreferencesList: Array<string>,
    }
}

export class GetUserRequest extends jspb.Message { 
    getUserid(): string;
    setUserid(value: string): GetUserRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetUserRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetUserRequest): GetUserRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetUserRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetUserRequest;
    static deserializeBinaryFromReader(message: GetUserRequest, reader: jspb.BinaryReader): GetUserRequest;
}

export namespace GetUserRequest {
    export type AsObject = {
        userid: string,
    }
}

export class CreateUserRequest extends jspb.Message { 
    getName(): string;
    setName(value: string): CreateUserRequest;
    getEmail(): string;
    setEmail(value: string): CreateUserRequest;
    getAge(): number;
    setAge(value: number): CreateUserRequest;
    getGender(): string;
    setGender(value: string): CreateUserRequest;
    getBio(): string;
    setBio(value: string): CreateUserRequest;
    clearInterestsList(): void;
    getInterestsList(): Array<string>;
    setInterestsList(value: Array<string>): CreateUserRequest;
    addInterests(value: string, index?: number): string;

    hasPreferences(): boolean;
    clearPreferences(): void;
    getPreferences(): UserPreferences | undefined;
    setPreferences(value?: UserPreferences): CreateUserRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateUserRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CreateUserRequest): CreateUserRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateUserRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateUserRequest;
    static deserializeBinaryFromReader(message: CreateUserRequest, reader: jspb.BinaryReader): CreateUserRequest;
}

export namespace CreateUserRequest {
    export type AsObject = {
        name: string,
        email: string,
        age: number,
        gender: string,
        bio: string,
        interestsList: Array<string>,
        preferences?: UserPreferences.AsObject,
    }
}

export class MatchCriteria extends jspb.Message { 
    getUserid(): string;
    setUserid(value: string): MatchCriteria;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MatchCriteria.AsObject;
    static toObject(includeInstance: boolean, msg: MatchCriteria): MatchCriteria.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MatchCriteria, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MatchCriteria;
    static deserializeBinaryFromReader(message: MatchCriteria, reader: jspb.BinaryReader): MatchCriteria;
}

export namespace MatchCriteria {
    export type AsObject = {
        userid: string,
    }
}

export class PotentialMatches extends jspb.Message { 
    clearUsersList(): void;
    getUsersList(): Array<User>;
    setUsersList(value: Array<User>): PotentialMatches;
    addUsers(value?: User, index?: number): User;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PotentialMatches.AsObject;
    static toObject(includeInstance: boolean, msg: PotentialMatches): PotentialMatches.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PotentialMatches, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PotentialMatches;
    static deserializeBinaryFromReader(message: PotentialMatches, reader: jspb.BinaryReader): PotentialMatches;
}

export namespace PotentialMatches {
    export type AsObject = {
        usersList: Array<User.AsObject>,
    }
}

export class UpdatePreferencesRequest extends jspb.Message { 
    getUserid(): string;
    setUserid(value: string): UpdatePreferencesRequest;

    hasPreferences(): boolean;
    clearPreferences(): void;
    getPreferences(): UserPreferences | undefined;
    setPreferences(value?: UserPreferences): UpdatePreferencesRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UpdatePreferencesRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UpdatePreferencesRequest): UpdatePreferencesRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UpdatePreferencesRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UpdatePreferencesRequest;
    static deserializeBinaryFromReader(message: UpdatePreferencesRequest, reader: jspb.BinaryReader): UpdatePreferencesRequest;
}

export namespace UpdatePreferencesRequest {
    export type AsObject = {
        userid: string,
        preferences?: UserPreferences.AsObject,
    }
}
