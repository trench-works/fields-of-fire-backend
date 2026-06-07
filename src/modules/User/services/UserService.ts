import { HttpError, Provide } from "../../../core";
import { User } from "../data/User";
import { UserRepository } from "../data/UserRepository";

export class UserService {
    @Provide(UserRepository)
    private readonly userRepository!: UserRepository;

    async authenticate(userName: string): Promise<User | HttpError> {
        const user = (await this.userRepository.list()).find(
            (user) => user.username === userName
        );
        if (!user) {
            return new HttpError(400, "User doesnt exist");
        }
        return user;
    }
}
