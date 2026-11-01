import { Hash, HttpError, Id, Provide, TokenService } from "../../../core";
import { User } from "../data/User";
import { UserRepository } from "../data/UserRepository";
import { Authenticate } from "../application/interfaces/Authenticate";
import { HttpResponse } from "../../../core/app/Controller/HttpController";

export class UserService {
    @Provide(UserRepository)
    private readonly userRepository!: UserRepository;
    @Provide(TokenService)
    private readonly tokenService!: TokenService;

    async authenticate(
        { username, password }: Authenticate,
        res: HttpResponse
    ): Promise<User | HttpError> {
        const user = await this.userRepository.findOne({
            where: { username: username },
        });
        if (!user) {
            return new HttpError(400, "User doesnt exist");
        }
        if (await Hash.compare(password, user.password)) {
            res.setHeader(
                "token",
                this.tokenService.encode({ user: { id: user.id } })
            );
            return this.userRepository.entityToRessource(user);
        } else {
            return new HttpError(400, "Unable to authenticate");
        }
    }

    async register(
        { username, password }: Authenticate,
        res: HttpResponse
    ): Promise<User | HttpError> {
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
        res.setHeader(
            "token",
            this.tokenService.encode({ user: { id: newUser.id } })
        );
        return newUser;
    }
}
