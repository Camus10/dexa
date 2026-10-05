import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { ServerResponse } from 'node:http';
import { createProxyMiddleware, type RequestHandler } from 'http-proxy-middleware';

import { AppModule } from './app.module';
import { SERVICE_ROUTES, UPLOADS_ROUTE, toPathFilter } from './proxy/proxy.config';

/**
 * Bikin satu middleware proxy untuk sekumpulan prefix.
 *
 * `changeOrigin: true` menyesuaikan header Host dengan target, dan
 * `pathFilter` memastikan hanya prefix milik service ini yang diteruskan
 * (prefix TIDAK dipotong, karena service tujuan memakai prefix /api yang sama).
 */
function buildProxy(
  target: string,
  prefixes: string[],
  logger: Logger,
): RequestHandler {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathFilter: toPathFilter(prefixes),
    on: {
      error: (error: Error, _request: unknown, response: unknown) => {
        logger.error(`Gagal meneruskan request ke ${target}: ${error.message}`);

        const res = response as ServerResponse;

        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
        }

        res.end(
          JSON.stringify({
            success: false,
            message: `Service tujuan (${target}) tidak dapat dihubungi. Pastikan service tersebut sudah berjalan.`,
          }),
        );
      },
    },
  });
}

async function bootstrap(): Promise<void> {
  const logger = new Logger('ApiGateway');

  // bodyParser dimatikan: gateway hanya meneruskan, jadi body (termasuk
  // multipart upload foto absensi) harus lewat apa adanya ke service tujuan.
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // CORS didaftarkan lebih dulu supaya ikut aktif untuk response proxy
  // (browser memanggil gateway, bukan service langsung).
  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
  app.enableCors({
    origin: corsOrigin.split(',').map((origin) => origin.trim()),
    credentials: true,
  });

  const server = app.getHttpAdapter().getInstance();

  for (const route of SERVICE_ROUTES) {
    server.use(buildProxy(route.target, route.prefixes, logger));
    logger.log(
      `${route.prefixes.join(', ')}  ->  ${route.target}  (${route.name})`,
    );
  }

  server.use(buildProxy(UPLOADS_ROUTE.target, UPLOADS_ROUTE.prefixes, logger));
  logger.log(
    `${UPLOADS_ROUTE.prefixes.join(', ')}  ->  ${UPLOADS_ROUTE.target}  (foto absensi)`,
  );

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  logger.log(`API Gateway siap di http://localhost:${port}`);
}

void bootstrap();
