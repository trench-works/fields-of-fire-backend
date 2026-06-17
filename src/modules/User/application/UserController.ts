import { HttpController, HttpError, Provide } from "../../../core";
import { PostListenerOptions } from "../../../core/app/Controller/HttpController";
import { User } from "../data/User";
import { UserService } from "../services/UserService";
import { Authenticate } from "./interfaces/Authenticate";

export class UserController extends HttpController {
    @Provide(UserService)
    private readonly userService!: UserService;

    constructor() {
        super();
        this.post("/authenticate", this.authenticate.bind(this));
        this.post("/register", this.register.bind(this));
    }

    async authenticate({
        body: { username },
    }: PostListenerOptions<object, Authenticate>): Promise<User | HttpError> {
        return await this.userService.authenticate(username);
    }

    async register({
        body: { username },
    }: PostListenerOptions<object, Authenticate>): Promise<User | HttpError> {
        return await this.userService.register(username);
    }
}