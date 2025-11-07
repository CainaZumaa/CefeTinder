import { ObjectType, Field, ID, Int } from 'type-graphql';

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