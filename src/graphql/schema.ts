import { buildSchema } from "type-graphql"
import { MatchResolver } from "./resolvers/match.resolver";
import { UserResolver } from "./resolvers/user.resolver";

export const createSchema = async () => {
    return await buildSchema({
        resolvers: [
            MatchResolver,
            UserResolver
        ],
        validate: true,
    });
}