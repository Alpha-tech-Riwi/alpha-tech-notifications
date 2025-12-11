import { IsEnum, IsString, IsUUID, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType, NotificationPriority, NotificationPayload } from '../types/notification.types';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority = NotificationPriority.MEDIUM;

  @IsUUID()
  ownerId: string;

  @IsUUID()
  petId: string;

  @IsString()
  petName: string;

  @IsString()
  collarId: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsObject()
  @IsOptional()
  payload?: NotificationPayload;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class GeofenceAlertDto {
  @IsString()
  collarId: string;

  @IsString()
  geofenceId: string;

  @IsString()
  geofenceName: string;

  @IsEnum(['EXIT', 'ENTRY'])
  action: 'EXIT' | 'ENTRY';

  @IsObject()
  location: {
    latitude: number;
    longitude: number;
  };

  @IsOptional()
  distance?: number;
}

class LocationDto {
  @IsString()
  latitude: number;

  @IsString()
  longitude: number;
}