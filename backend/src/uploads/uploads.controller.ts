import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomBytes } from 'crypto';
import { mkdirSync } from 'fs';
import { JwtAuthGuard } from '../auth/jwt.guard';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads';
try { mkdirSync(UPLOAD_DIR, { recursive: true }); } catch {}

const ALLOWED = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        if (!ALLOWED.includes(ext)) {
          return cb(new BadRequestException('Formato não suportado. Use JPG, PNG, WEBP ou GIF.'), false);
        }
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFile() file: any, @Req() req: any) {
    if (!file) throw new BadRequestException('Arquivo ausente.');
    const base =
      process.env.PUBLIC_BACKEND_URL?.replace(/\/+$/, '') ||
      `${req.protocol}://${req.get('host')}`;
    const url = `${base}/uploads/${file.filename}`;
    return { url, filename: file.filename, size: file.size };
  }
}