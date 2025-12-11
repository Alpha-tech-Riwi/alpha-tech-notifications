# 🔔 Alpha Tech Notification Service

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![NestJS](https://img.shields.io/badge/NestJS-10+-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)
![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

Real-time notification microservice with WebSocket support for pet collar alerts and system events.

## 🎯 Purpose

This microservice manages all notification functionality for Alpha Tech's smart pet collar ecosystem:
- Real-time WebSocket notifications
- Geofence violation alerts
- Health monitoring notifications
- System status updates
- Notification history and management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation
```bash
# Clone repository
git clone https://github.com/YourOrg/alpha-tech-notifications.git
cd alpha-tech-notifications

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run migration:run

# Start development server
npm run start:dev
```

Server runs on `http://localhost:3003`
WebSocket server on `ws://localhost:3003`

## 📡 API Endpoints

### Send Notification
```http
POST /notifications
Content-Type: application/json

{
  "userId": "user123",
  "type": "geofence_violation",
  "title": "Pet Left Safe Zone",
  "message": "Zeus has left the designated safe area",
  "collarId": "123456"
}
```

### Get User Notifications
```http
GET /notifications/user/:userId?limit=20&unread=true
```

### Mark as Read
```http
PATCH /notifications/:id/read
```

### Get Unread Count
```http
GET /notifications/user/:userId/unread-count
```

### WebSocket Events
```javascript
// Connect to WebSocket
const socket = io('ws://localhost:3003');

// Listen for notifications
socket.on('notification', (data) => {
  console.log('New notification:', data);
});

// Join user room
socket.emit('join', { userId: 'user123' });
```

## 🔧 Environment Variables

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=notifications_db

# Server
PORT=3003
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
LOCATION_SERVICE_URL=http://localhost:3002

# WebSocket
WEBSOCKET_CORS_ORIGIN=http://localhost:5173
```

## 🐳 Docker

```bash
# Build image
docker build -t alpha-tech-notifications .

# Run container
docker run -p 3003:3003 --env-file .env alpha-tech-notifications

# Docker Compose
docker-compose up -d
```

## 🏗️ Architecture

```
Location Service → Notification Service → WebSocket → Frontend
Backend Service  →                    → PostgreSQL
```

## 📊 Database Schema

### Notifications Table
- `id` - Primary key
- `userId` - Target user ID
- `type` - Notification type (geofence, health, system)
- `title` - Notification title
- `message` - Notification content
- `collarId` - Associated collar (optional)
- `isRead` - Read status
- `createdAt` - Creation timestamp
- `readAt` - Read timestamp

## 🔔 Notification Types

### Geofence Alerts
```json
{
  "type": "geofence_violation",
  "title": "Pet Left Safe Zone",
  "message": "Zeus has left the designated safe area",
  "priority": "high"
}
```

### Health Monitoring
```json
{
  "type": "health_alert",
  "title": "Unusual Heart Rate",
  "message": "Zeus's heart rate is above normal range",
  "priority": "medium"
}
```

### System Notifications
```json
{
  "type": "system_update",
  "title": "Collar Battery Low",
  "message": "Zeus's collar battery is at 15%",
  "priority": "low"
}
```

## 🌐 WebSocket Integration

### Frontend Connection
```javascript
import io from 'socket.io-client';

const socket = io('ws://localhost:3003', {
  cors: {
    origin: "http://localhost:5173"
  }
});

// Join user notifications
socket.emit('join', { userId: 'current-user-id' });

// Listen for real-time notifications
socket.on('notification', (notification) => {
  // Update UI with new notification
  showNotification(notification);
});
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# WebSocket tests
npm run test:websocket

# Test coverage
npm run test:cov
```

## 🚀 Deployment

```bash
# Production build
npm run build

# Start production server
npm run start:prod
```

## 📈 Monitoring

### Health Check
```http
GET /health
```

### Metrics
```http
GET /metrics
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

- Issues: [GitHub Issues](https://github.com/YourOrg/alpha-tech-notifications/issues)
- Documentation: [Wiki](https://github.com/YourOrg/alpha-tech-notifications/wiki)
- Email: support@alphatech.com