export enum NotificationType {
  GEOFENCE_EXIT = 'GEOFENCE_EXIT',
  GEOFENCE_ENTRY = 'GEOFENCE_ENTRY',
  LOW_BATTERY = 'LOW_BATTERY',
  HEALTH_ALERT = 'HEALTH_ALERT',
  DEVICE_OFFLINE = 'DEVICE_OFFLINE',
  EMERGENCY = 'EMERGENCY'
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED'
}

export interface NotificationPayload {
  petId: string;
  petName: string;
  collarId: string;
  ownerId: string;
  location?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  metadata?: Record<string, any>;
}

export interface GeofenceAlert {
  geofenceId: string;
  geofenceName: string;
  action: 'EXIT' | 'ENTRY';
  location: {
    latitude: number;
    longitude: number;
  };
  distance: number;
}