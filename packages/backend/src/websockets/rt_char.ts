// // src/websocket/messaging.socket.ts
// import { Server as SocketIOServer } from 'socket.io';
// import { Server } from 'http';
// import jwt from 'jsonwebtoken';
// import { redis } from '../config/redis';
// import { authenticateSession } from '../middleware/auth.middleware';
// import { logger } from '../utils/logger.utils';

// export class MessagingWebSocket {
//   private io: SocketIOServer;
//   private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

//   constructor(server: Server) {
//     this.io = new SocketIOServer(server, {
//       cors: {
//         origin: process.env.FRONTEND_URL || "http://localhost:3000",
//         methods: ["GET", "POST"]
//       }
//     });

//     this.setupMiddleware();
//     this.setupEventHandlers();
//     this.subscribeToRedis();
//   }

//   private setupMiddleware(): void {
//     // Authentication middleware
//     this.io.use(async (socket, next) => {
//       try {
//         const token = socket.handshake.auth.token;
        
//         if (!token) {
//           return next(new Error('Authentication token required'));
//         }

//         // Verify JWT token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
//         if (decoded.type !== 'access') {
//           return next(new Error('Invalid token type'));
//         }

//         // Validate session
//         const sessionData = await authenticateSession(decoded.sessionToken);
//         if (!sessionData) {
//           return next(new Error('Session expired'));
//         }

//         // Add user info to socket
//         socket.data.userId = decoded.userId;
//         socket.data.deviceId = decoded.deviceId;
        
//         next();
//       } catch (error) {
//         logger.error('WebSocket authentication error:', error);
//         next(new Error('Authentication failed'));
//       }
//     });
//   }

//   private setupEventHandlers(): void {
//     this.io.on('connection', (socket) => {
//       const userId = socket.data.userId;
//       const deviceId = socket.data.deviceId;

//       logger.info(`🔌 WebSocket connected: User ${userId}, Device ${deviceId}`);

//       // Track user socket
//       if (!this.userSockets.has(userId)) {
//         this.userSockets.set(userId, new Set());
//       }
//       this.userSockets.get(userId)!.add(socket.id);

//       // Join user-specific room
//       socket.join(`user:${userId}`);
//       socket.join(`device:${deviceId}`);

//       // Handle conversation joining
//       socket.on('join-conversation', (conversationId: string) => {
//         socket.join(`conversation:${conversationId}`);
//         logger.debug(`User ${userId} joined conversation ${conversationId}`);
//       });

//       // Handle conversation leaving
//       socket.on('leave-conversation', (conversationId: string) => {
//         socket.leave(`conversation:${conversationId}`);
//         logger.debug(`User ${userId} left conversation ${conversationId}`);
//       });

//       // Handle typing indicators
//       socket.on('typing-start', (data: { conversationId: string }) => {
//         socket.to(`conversation:${data.conversationId}`).emit('user-typing', {
//           userId,
//           conversationId: data.conversationId,
//           isTyping: true,
//         });
//       });

//       socket.on('typing-stop', (data: { conversationId: string }) => {
//         socket.to(`conversation:${data.conversationId}`).emit('user-typing', {
//           userId,
//           conversationId: data.conversationId,
//           isTyping: false,
//         });
//       });

//       // Handle presence updates
//       socket.on('update-presence', (status: 'online' | 'away' | 'busy') => {
//         this.io.emit('user-presence', {
//           userId,
//           status,
//           lastSeen: new Date(),
//         });
//       });

//       // Handle disconnection
//       socket.on('disconnect', () => {
//         logger.info(`🔌 WebSocket disconnected: User ${userId}, Device ${deviceId}`);
        
//         // Remove from tracking
//         const userSocketSet = this.userSockets.get(userId);
//         if (userSocketSet) {
//           userSocketSet.delete(socket.id);
//           if (userSocketSet.size === 0) {
//             this.userSockets.delete(userId);
            
//             // Emit user offline status
//             this.io.emit('user-presence', {
//               userId,
//               status: 'offline',
//               lastSeen: new Date(),
//             });
//           }
//         }
//       });
//     });
//   }

//   private subscribeToRedis(): void {
//     // Subscribe to new message events
//     const subscriber = redis.duplicate();
    
//     subscriber.subscribe('new_message', (error) => {
//       if (error) {
//         logger.error('Redis subscription error:', error);
//       } else {
//         logger.info('📡 Subscribed to Redis new_message channel');
//       }
//     });

//     subscriber.on('message', (channel, message) => {
//       if (channel === 'new_message') {
//         try {
//           const messageData = JSON.parse(message);
//           this.handleNewMessage(messageData);
//         } catch (error) {
//           logger.error('Error parsing Redis message:', error);
//         }
//       }
//     });
//   }

//   private handleNewMessage(messageData: any): void {
//     const { conversationId, messageId, senderId, senderInfo, messageType, sentAt, encryptedForDevices } = messageData;

//     // Emit to conversation participants (except sender)
//     this.io.to(`conversation:${conversationId}`).except(`user:${senderId}`).emit('new-message', {
//       messageId,
//       conversationId,
//       senderId,
//       senderInfo,
//       messageType,
//       sentAt,
//       // Note: Don't send actual encrypted content over WebSocket
//       // Clients should fetch and decrypt via API
//     });

//     // Send device-specific encrypted content to specific devices
//     encryptedForDevices.forEach((deviceData: any) => {
//       this.io.to(`device:${deviceData.deviceId}`).emit('encrypted-message', {
//         messageId,
//         conversationId,
//         encryptedContent: deviceData.encryptedContent,
//         kyberCiphertext: deviceData.kyberCiphertext,
//         messageHash: deviceData.messageHash,
//       });
//     });

//     logger.debug(`📨 Message broadcast: ${messageId} to conversation ${conversationId}`);
//   }

//   // Public methods for external use
//   public emitToUser(userId: string, event: string, data: any): void {
//     this.io.to(`user:${userId}`).emit(event, data);
//   }

//   public emitToConversation(conversationId: string, event: string, data: any): void {
//     this.io.to(`conversation:${conversationId}`).emit(event, data);
//   }

//   public getConnectedUsers(): string[] {
//     return Array.from(this.userSockets.keys());
//   }

//   public isUserOnline(userId: string): boolean {
//     return this.userSockets.has(userId);
//   }
// }
