import { Field, InputType, Int } from "type-graphql";

@InputType()
export class UserPreferencesInput {
  @Field(() => Int, { nullable: true })
  min_age?: number;

  @Field(() => Int, { nullable: true })
  max_age?: number;

  @Field({ nullable: true })
  preferred_gender?: string;
}
