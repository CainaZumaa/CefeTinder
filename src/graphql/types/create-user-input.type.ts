import { Field, InputType } from "type-graphql";

@InputType()
export class CreateUserInput {
    @Field()
    name: string;
    
    @Field()
    email: string;

    @Field(() => Number)
    age: number;

    @Field(() => String)
    gender: string;

    @Field(() => String, { nullable: true })
    bio: string;
}