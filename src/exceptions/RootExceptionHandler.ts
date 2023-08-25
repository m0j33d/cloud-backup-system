import ExceptionHandler from "./Handler";

export const RootExceptionHandler = async (err: ExceptionHandler, req: any, res: any, next: any) => {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message });
};