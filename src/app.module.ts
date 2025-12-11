import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NotificationController, PublicNotificationController } from './controllers/notification.controller';
import { NotificationService } from './services/notification.service';
import { WebSocketService } from './services/websocket.service';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'alpha_tech_notifications',
      entities: [Notification],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([Notification]),
  ],
  controllers: [NotificationController, PublicNotificationController],
  providers: [NotificationService, WebSocketService],
  exports: [NotificationService, WebSocketService],
})
export class AppModule {}