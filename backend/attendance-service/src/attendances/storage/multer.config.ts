import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';

/** Ukuran maksimal foto absensi: 5 MB. */
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

/** Tipe file gambar yang diizinkan. */
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Folder penyimpanan foto (relatif terhadap root attendance-service). */
export function uploadDirectory(): string {
  return process.env.UPLOAD_DIR ?? './uploads';
}

/**
 * Konfigurasi Multer untuk upload foto absensi.
 *
 * Nama file dibuat unik (UUID + ekstensi asli) supaya tidak bentrok, dan
 * disimpan di `uploads/` yang diserve statis lalu diproksi gateway
 * lewat `/uploads/<nama-file>`.
 */
export const photoMulterOptions: MulterOptions = {
  storage: diskStorage({
    destination: (_request, _file, callback) => {
      callback(null, uploadDirectory());
    },
    filename: (_request, file, callback) => {
      callback(null, `${randomUUID()}${extname(file.originalname) || '.jpg'}`);
    },
  }),
  limits: { fileSize: MAX_PHOTO_SIZE_BYTES },
  fileFilter: (_request, file, callback) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      callback(
        new BadRequestException(
          'Foto absensi harus berupa gambar (JPG, PNG, atau WEBP)',
        ),
        false,
      );
      return;
    }

    callback(null, true);
  },
};
