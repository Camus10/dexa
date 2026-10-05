import { SetMetadata } from '@nestjs/common';

/** Key metadata untuk pesan sukses. */
export const RESPONSE_MESSAGE_KEY = 'response_message';

/** Key metadata untuk menandai handler yang mengirim response mentah (file). */
export const RAW_RESPONSE_KEY = 'raw_response';

/**
 * Menempelkan pesan sukses ke sebuah handler.
 * TransformInterceptor membaca metadata ini lalu memakainya sebagai `message`
 * pada envelope response.
 *
 * Contoh: @ResponseMessage('Absen masuk berhasil dicatat')
 */
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE_KEY, message);

/**
 * Menandai handler agar response-nya TIDAK dibungkus envelope JSON.
 *
 * Wajib dipakai endpoint export CSV: kalau response dibungkus
 * { success, message, data }, isi file CSV-nya jadi rusak.
 */
export const RawResponse = () => SetMetadata(RAW_RESPONSE_KEY, true);
