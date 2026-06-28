import { HttpError, Id, Provide } from "../../../core";
import { User } from "../data/User";
import { UserRepository } from "../data/UserRepository";

export class UserService {
    @Provide(UserRepository)
    private readonly userRepository!: UserRepository;

    async authenticate(userName: string): Promise<User | HttpError> {
        const user = await this.userRepository.repository.findOne({
            where: { username: userName },
        });
        if (!user) {
            return new HttpError(400, "User doesnt exist");
        }
        return user;
    }

    async register(username: string): Promise<User | HttpError> {
        const existingUser = (await this.userRepository.list()).find(
            (user) => user.username === username
        );
        if (existingUser) {
            return new HttpError(400, "User already exists");
        }

        const newUser = await this.userRepository.save({
            id: Id.get(),
            username,
            password: username,
        });
        if (!newUser) {
            return new HttpError(400, "Couldnt create User");
        }
        return newUser;
    }
}
