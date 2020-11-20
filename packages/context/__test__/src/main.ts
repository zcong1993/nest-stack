import { NestFactory } from '@nestjs/core';
import { setupContext } from '@zcong/nest-stack-context';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupContext(app);

  await app.listen(3001);
}

bootstrap();
