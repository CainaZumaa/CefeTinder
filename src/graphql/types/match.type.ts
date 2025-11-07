import { ObjectType, Field, ID } from 'type-graphql';

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