import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const corsEnv = process.env.CORS_ORIGIN
    ?.split(',')
    .map(s => s.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  app.enableCors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const clean = origin.replace(/\/+$/, '');
      if (!corsEnv || corsEnv.length === 0) return cb(null, true);
      const allowed = corsEnv.includes(clean) || clean.endsWith('.easypanel.host');
      return cb(null, allowed);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');
  const uploadDir = process.env.UPLOAD_DIR || '/app/uploads';
  try { mkdirSync(uploadDir, { recursive: true }); } catch {}
  app.useStaticAssets(uploadDir, { prefix: '/uploads/' });
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`Glee-go ID backend on :${port}`);
}
bootstrap();