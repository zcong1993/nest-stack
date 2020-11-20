import { NestFactory } from '@nestjs/core';
import { setupContext } from '../../src';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupContext(app);

  await app.listen(3001);
}

bootstrap();
