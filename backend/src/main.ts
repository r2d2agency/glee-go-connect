import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsEnv = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean);
  app.enableCors({
    origin: corsEnv && corsEnv.length ? corsEnv : true,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`Glee-go ID backend on :${port}`);
}
bootstrap();