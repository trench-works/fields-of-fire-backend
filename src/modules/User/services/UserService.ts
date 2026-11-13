import { Hash, HttpError, Id, Provide, TokenService } from "../../../core";
import { UserRepository } from "../data/repository/UserRepository";
import { Authenticate } from "../application/interfaces/Authenticate";
import { AuthenticateUserResponse } from "../application/interfaces/AuthenticateUserResponse";

export class UserService {
    @Provide(UserRepository)
    private readonly userRepository!: UserRepository;
    @Provide(TokenService)
    private readonly tokenService!: TokenService;

    async authenticate({
        username,
        password,
    }: Authenticate): Promise<AuthenticateUserResponse | HttpError> {
        const user = await this.userRepository.findOne({
            where: { username: username },
        });
        if (!user) {
            return new HttpError(400, "User doesnt exist");
        }
        if (await Hash.compare(password, user.password)) {
            return {
                id: user.id,
                username: user.username,
                token: this.tokenService.encode({ user: { id: user.id } }),
            };
        } else {
            return new HttpError(400, "Unable to authenticate");
        }
    }

    async register({
        username,
        password,
    }: Authenticate): Promise<AuthenticateUserResponse | HttpError> {
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
        return {
            id: newUser.id,
            username: newUser.username,
            token: this.tokenService.encode({ user: { id: newUser.id } }),
        };
    }
}
