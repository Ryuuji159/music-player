import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import type { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const body = exception instanceof HttpException ? exception.getResponse() : { message: "Internal server error" };

    const detail = exception instanceof Error
      ? `${exception.message}\n${exception.stack}`
      : JSON.stringify(exception, null, 2);

    this.logger.error(`${req.method} ${req.url} -> ${status}\n${detail}`);

    res.status(status).json(typeof body === "string" ? { statusCode: status, message: body } : body);
  }
}