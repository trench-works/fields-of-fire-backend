import { HttpController, HttpError, Provide } from "../../../core";
import { PostListenerOptions } from "../../../core/app/Controller/HttpController";
import { User } from "../data/User";
import { UserService } from "../services/UserService";
import { Authenticate } from "./interfaces/Authenticate";
import { Register } from "./interfaces/Register";

export class UserController extends HttpController {
    @Provide(UserService)
    private readonly userService!: UserService;

    constructor() {
        super();
        this.post("/authenticate", this.authenticate.bind(this), {
            authenticated: false,
        });
        this.post("/register", this.register.bind(this), {
            authenticated: false,
        });
    }

    async authenticate({
        body,
        res,
    }: PostListenerOptions<object, Authenticate>): Promise<User | HttpError> {
        return await this.userService.authenticate(body, res);
    }

    async register({
        body,
        res,
    }: PostListenerOptions<object, Register>): Promise<User | HttpError> {
        return await this.userService.register(body, res);
    }
}
