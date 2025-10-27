import { ObjectType, Field, ID, Int } from "type-graphql";

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => Int)
  age: number;

  @Field()
  gender: string;

  @Field({ nullable: true })
  bio?: string;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}

@ObjectType()
export class UserPreferences {
  @Field(() => ID)
  usuarios_id: string;

  @Field(() => Int)
  min_age: number;

  @Field(() => Int)
  max_age: number;

  @Field({ nullable: true })
  gender_preference?: string;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}

@ObjectType()
export class Match {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  user1_id: string;

  @Field(() => ID)
  user2_id: string;

  @Field()
  user1_liked: boolean;

  @Field()
  user2_liked: boolean;

  @Field()
  is_super_like: boolean;

  @Field({ nullable: true })
  matched_at?: Date;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}
