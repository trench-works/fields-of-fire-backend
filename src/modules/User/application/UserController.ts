import { HttpController, HttpError, Provide } from "../../../core";
import { PostListenerOptions } from "../../../core/app/Controller/HttpController";
import { UserService } from "../services/UserService";
import { Authenticate } from "./interfaces/Authenticate";
import { AuthenticateUserResponse } from "./interfaces/AuthenticateUserResponse";
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
    }: PostListenerOptions<object, Authenticate>): Promise<
        AuthenticateUserResponse | HttpError
    > {
        return await this.userService.authenticate(body);
    }

    async register({
        body,
    }: PostListenerOptions<object, Register>): Promise<
        AuthenticateUserResponse | HttpError
    > {
        return await this.userService.register(body);
    }
}
