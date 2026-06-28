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
const ALLOWED_FILES = [
  '.pdf', '.epub', '.mobi', '.zip', '.rar', '.7z',
  '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.txt', '.csv', '.rtf',
  '.mp3', '.wav', '.m4a', '.ogg',
  '.mp4', '.mov', '.webm',
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
];

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
    const base = resolveBase(req);
    const url = `${base}/uploads/${file.filename}`;
    return { url, filename: file.filename, size: file.size };
  }

  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        if (!ALLOWED_FILES.includes(ext)) {
          return cb(
            new BadRequestException(
              'Formato não suportado. Use PDF, EPUB, ZIP, DOC, MP3, MP4, imagens, entre outros.',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: any, @Req() req: any) {
    if (!file) throw new BadRequestException('Arquivo ausente.');
    const base = resolveBase(req);
    const url = `${base}/uploads/${file.filename}`;
    return {
      url,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}

function resolveBase(req: any): string {
  const envBase = process.env.PUBLIC_BACKEND_URL?.replace(/\/+$/, '');
  if (envBase) return envBase;
  const xfProto = (req.headers['x-forwarded-proto'] || '').toString().split(',')[0].trim();
  const xfHost = (req.headers['x-forwarded-host'] || '').toString().split(',')[0].trim();
  const proto = xfProto || req.protocol || 'https';
  const host = xfHost || req.get('host');
  return `${proto}://${host}`;
}