import Exception from "./Handler";

export class UnauthorizedException extends Exception {
    constructor(message: string) {
        super(message, 403);
    }
}