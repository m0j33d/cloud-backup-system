import Exception from "./Handler";

export class NotFoundException extends Exception {
    constructor(message: string) {
        super(message, 404);
    }
}