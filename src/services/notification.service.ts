import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { CreateNotificationDto, GeofenceAlertDto } from '../dto/notification.dto';
import { NotificationType, NotificationPriority, NotificationStatus } from '../types/notification.types';
import { WebSocketService } from './websocket.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private webSocketService: WebSocketService,
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    try {
      const notification = this.notificationRepository.create(dto);
      const savedNotification = await this.notificationRepository.save(notification);

      // Enviar notificación en tiempo real
      await this.sendRealTimeNotification(savedNotification);

      this.logger.log(`Notification created: ${savedNotification.id} - ${savedNotification.type}`);
      return savedNotification;
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  async handleGeofenceAlert(alertDto: GeofenceAlertDto): Promise<Notification> {
    try {
      // Obtener información del collar/pet (simulado por ahora)
      const petInfo = await this.getPetInfoByCollar(alertDto.collarId);
      
      const notificationDto: CreateNotificationDto = {
        type: alertDto.action === 'EXIT' ? NotificationType.GEOFENCE_EXIT : NotificationType.GEOFENCE_ENTRY,
        priority: alertDto.action === 'EXIT' ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
        ownerId: petInfo.ownerId,
        petId: petInfo.petId,
        petName: petInfo.petName,
        collarId: alertDto.collarId,
        title: this.generateAlertTitle(alertDto),
        message: this.generateAlertMessage(alertDto),
        payload: {
          petId: petInfo.petId,
          petName: petInfo.petName,
          collarId: alertDto.collarId,
          ownerId: petInfo.ownerId,
          location: {
            latitude: alertDto.location.latitude,
            longitude: alertDto.location.longitude,
            timestamp: new Date().toISOString()
          }
        },
        metadata: {
          geofenceId: alertDto.geofenceId,
          geofenceName: alertDto.geofenceName,
          action: alertDto.action,
          distance: alertDto.distance
        }
      };

      return this.createNotification(notificationDto);
    } catch (error) {
      this.logger.error(`Failed to handle geofence alert: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getNotificationsByOwner(ownerId: string, limit: number = 50): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
      take: limit
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationRepository.update(notificationId, {
      status: NotificationStatus.READ,
      readAt: new Date()
    });
  }

  async getUnreadCount(ownerId: string): Promise<number> {
    return this.notificationRepository.count({
      where: {
        ownerId,
        status: NotificationStatus.SENT
      }
    });
  }

  private async sendRealTimeNotification(notification: Notification): Promise<void> {
    try {
      await this.webSocketService.sendToUser(notification.ownerId, 'notification', {
        id: notification.id,
        type: notification.type,
        priority: notification.priority,
        title: notification.title,
        message: notification.message,
        petName: notification.petName,
        createdAt: notification.createdAt,
        metadata: notification.metadata
      });

      await this.notificationRepository.update(notification.id, {
        status: NotificationStatus.SENT,
        deliveredAt: new Date()
      });
    } catch (error) {
      this.logger.error(`Failed to send real-time notification: ${error.message}`);
      await this.notificationRepository.update(notification.id, {
        status: NotificationStatus.FAILED,
        failedAt: new Date(),
        failureReason: error.message,
        retryCount: notification.retryCount + 1
      });
    }
  }

  private generateAlertTitle(alert: GeofenceAlertDto): string {
    const action = alert.action === 'EXIT' ? 'salió de' : 'entró a';
    return `🚨 Alerta: Tu mascota ${action} ${alert.geofenceName}`;
  }

  private generateAlertMessage(alert: GeofenceAlertDto): string {
    const action = alert.action === 'EXIT' ? 'ha salido de' : 'ha entrado a';
    const distance = alert.distance ? ` (${Math.round(alert.distance)}m de distancia)` : '';
    return `Tu mascota ${action} la zona "${alert.geofenceName}"${distance}. Revisa su ubicación actual.`;
  }

  private async getPetInfoByCollar(collarId: string): Promise<{
    petId: string;
    petName: string;
    ownerId: string;
  }> {
    // En un sistema real, esto consultaría el servicio de mascotas
    // Por ahora simulamos con Zeus
    if (collarId === '123456') {
      return {
        petId: '04df6c8a-2065-4b66-ad39-7cabcbea7596',
        petName: 'Zeus',
        ownerId: 'owner-uuid' // En producción vendría del servicio de usuarios
      };
    }
    
    throw new Error(`Pet not found for collar: ${collarId}`);
  }

  // Método para limpiar notificaciones antiguas (tarea programada)
  async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.notificationRepository.delete({
      createdAt: LessThan(cutoffDate),
      status: NotificationStatus.READ
    });

    this.logger.log(`Cleaned up ${result.affected} old notifications`);
    return result.affected || 0;
  }
}