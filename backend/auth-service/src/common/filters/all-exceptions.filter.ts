import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Menangkap semua exception agar bentuk response error konsisten dengan
 * response sukses:
 * { success: false, statusCode, message, path, timestamp }.
 *
 * `message` sengaja berupa string siap tampil (bukan array) supaya frontend
 * bisa langsung menampilkannya lewat toast.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.resolveMessage(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.originalUrl} -> ${status}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }

  private resolveMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        return payload;
      }

      const detail = payload as { message?: string | string[] };

      if (Array.isArray(detail.message)) {
        return detail.message.join(', ');
      }

      if (detail.message) {
        return detail.message;
      }

      return exception.message;
    }

    return 'Terjadi kesalahan pada server.';
  }
}
