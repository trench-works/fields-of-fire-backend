import { HttpError, Provide } from "../../../core";
import { User } from "../data/User";
import { UserRepository } from "../data/UserRepository";
import { randomUUID } from 'crypto';

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

    async register(username: string): Promise<User | HttpError> {
        const existingUser = (await this.userRepository.list()).find(
            (user) => user.username === username
        );
        if (existingUser) {
            return new HttpError(400, "User already exists");
        }

        const newUser: User = {
            id: randomUUID(),
            username,
        };

        await this.userRepository.set(newUser.id, newUser);
        return newUser;
    }
}
