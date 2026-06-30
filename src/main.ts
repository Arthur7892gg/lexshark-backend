import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Frontend roda no Netlify (origem separada) -> CORS liberado para o domínio do app
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN?.split(',') ?? '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`LexShark backend rodando na porta ${port}`);
}
bootstrap();
