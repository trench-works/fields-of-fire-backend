import { Hash, HttpError, Id, Provide } from "../../../core";
import { User } from "../data/User";
import { UserRepository } from "../data/UserRepository";
import { Authenticate } from "../application/interfaces/Authenticate";

export class UserService {
    @Provide(UserRepository)
    private readonly userRepository!: UserRepository;

    async authenticate({
        username,
        password,
    }: Authenticate): Promise<User | HttpError> {
        const user = await this.userRepository.repository.findOne({
            where: { username: username },
        });
        if (!user) {
            return new HttpError(400, "User doesnt exist");
        }
        if (await Hash.compare(password, user.password)) {
            return this.userRepository.entityToRessource(user.dataValues);
        } else {
            return new HttpError(400, "Unable to authenticate");
        }
    }

    async register({
        username,
        password,
    }: Authenticate): Promise<User | HttpError> {
        const existingUser = (await this.userRepository.list()).find(
            (user) => user.username === username
        );
        if (existingUser) {
            return new HttpError(400, "User already exists");
        }

        const newUser = await this.userRepository.save({
            id: Id.get(),
            username,
            password: await Hash.hash(password),
        });
        if (!newUser) {
            return new HttpError(400, "Couldnt create User");
        }
        return newUser;
    }
}
