import { Container } from "inversify";
import { DatabaseClientFactory } from "../../factories/DatabaseFactory";
import { UserService } from "../../services/user/UserService";
import { TYPES } from "../../types"

const container: Container = new Container();

container.bind(TYPES.IUserRepository).toDynamicValue(() => {
    return DatabaseClientFactory.createUserRepository("postgres");
});

container.bind(UserService).toSelf();

export { container };