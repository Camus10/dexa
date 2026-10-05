import { Controller, Get } from '@nestjs/common';

import { ALL_PREFIXES } from './proxy/proxy.config';

/**
 * Endpoint kecil untuk mengecek gateway hidup dan melihat daftar prefix
 * yang diteruskan (berguna saat debugging "kenapa request 404").
 */
@Controller()
export class AppController {
  @Get()
  index() {
    return {
      service: 'api-gateway',
      status: 'ok',
      forwardedPrefixes: ALL_PREFIXES,
    };
  }

  @Get('api/health')
  health() {
    return {
      service: 'api-gateway',
      status: 'ok',
      forwardedPrefixes: ALL_PREFIXES,
    };
  }
}
