import { Controller, Post, Get, Body, Param, Query, Patch, HttpStatus, HttpCode } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { CreateNotificationDto, GeofenceAlertDto } from '../dto/notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createNotification(@Body() dto: CreateNotificationDto) {
    return this.notificationService.createNotification(dto);
  }

  @Post('geofence-alert')
  @HttpCode(HttpStatus.CREATED)
  async handleGeofenceAlert(@Body() alertDto: GeofenceAlertDto) {
    return this.notificationService.handleGeofenceAlert(alertDto);
  }

  @Get('owner/:ownerId')
  async getNotificationsByOwner(
    @Param('ownerId') ownerId: string,
    @Query('limit') limit?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.notificationService.getNotificationsByOwner(ownerId, limitNum);
  }

  @Get('owner/:ownerId/unread-count')
  async getUnreadCount(@Param('ownerId') ownerId: string) {
    const count = await this.notificationService.getUnreadCount(ownerId);
    return { count };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsRead(@Param('id') id: string) {
    await this.notificationService.markAsRead(id);
  }
}

@Controller('public/notifications')
export class PublicNotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('geofence-alert')
  @HttpCode(HttpStatus.CREATED)
  async handlePublicGeofenceAlert(@Body() alertDto: GeofenceAlertDto) {
    return this.notificationService.handleGeofenceAlert(alertDto);
  }
}