import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  RAW_RESPONSE_KEY,
  RESPONSE_MESSAGE_KEY,
} from '../decorators/response-message.decorator';

/** Bentuk response sukses yang konsisten di seluruh service. */
export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

const DEFAULT_MESSAGE = 'Permintaan berhasil diproses';

/**
 * Membungkus seluruh response controller ke dalam envelope yang seragam:
 * { success, message, data, timestamp }.
 *
 * Handler yang ditandai @RawResponse() dilewatkan apa adanya supaya file
 * (mis. CSV export) tidak rusak karena dibungkus JSON.
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T> | T>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<T> | T> {
    const isRaw = this.reflector.getAllAndOverride<boolean>(RAW_RESPONSE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isRaw) {
      return next.handle();
    }

    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? DEFAULT_MESSAGE;

    return next.handle().pipe(
      map((data) => ({
        success: true as const,
        message,
        data: (data ?? null) as T,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
