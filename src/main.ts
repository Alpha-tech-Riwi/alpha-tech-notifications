import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('NotificationService');
  
  try {
    const app = await NestFactory.create(AppModule);
    
    // Global pipes
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }));
    
    // CORS configuration
    app.enableCors({
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      optionsSuccessStatus: 200
    });
    
    const port = process.env.PORT || 3003;
    await app.listen(port);
    
    logger.log(`🔔 Notification Service running on port ${port}`);
    logger.log(`📡 WebSocket server available at ws://localhost:${port}/notifications`);
  } catch (error) {
    logger.error('Failed to start Notification Service', error);
    process.exit(1);
  }
}

bootstrap();