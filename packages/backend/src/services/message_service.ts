// // src/services/messaging.service.ts
// import { prisma } from '../config/database';
// import { redis, REDIS_KEYS } from '../config/redis';
// import { quantumCrypto, QuantumEncryptedMessage } from './quantum.service';
// import { logger } from '../utils/logger.utils';
// import { MessageType } from '@prisma/client';

// interface SendMessageData {
//   conversationId: string;
//   senderId: string;
//   deviceId: string;
//   content: string;
//   messageType?: MessageType;
//   parentMessageId?: string;
// }

// interface CreateConversationData {
//   participantUserIds: string[];
//   name?: string;
//   isGroup?: boolean;
// }

// export class MessagingService {
//   private static instance: MessagingService;

//   public static getInstance(): MessagingService {
//     if (!MessagingService.instance) {
//       MessagingService.instance = new MessagingService();
//     }
//     return MessagingService.instance;
//   }

//   /**
//    * Create a new conversation
//    */
//   public async createConversation(
//     creatorUserId: string,
//     data: CreateConversationData
//   ) {
//     try {
//       // Validate participants
//       if (!data.participantUserIds.includes(creatorUserId)) {
//         data.participantUserIds.push(creatorUserId);
//       }

//       // Check if direct conversation already exists
//       if (!data.isGroup && data.participantUserIds.length === 2) {
//         const existingConversation = await prisma.conversation.findFirst({
//           where: {
//             isGroup: false,
//             participants: {
//               every: {
//                 userId: { in: data.participantUserIds }
//               }
//             }
//           },
//           include: {
//             participants: {
//               include: {
//                 user: {
//                   select: {
//                     id: true,
//                     username: true,
//                     displayName: true,
//                     avatarUrl: true,
//                   }
//                 }
//               }
//             }
//           }
//         });

//         if (existingConversation) {
//           return existingConversation;
//         }
//       }

//       // Create conversation
//       const conversation = await prisma.conversation.create({
//         data: {
//           name: data.name,
//           isGroup: data.isGroup || false,
//           activeMembers: data.participantUserIds.length,
//           participants: {
//             create: data.participantUserIds.map(userId => ({
//               userId,
//               joinedAt: new Date(),
//             }))
//           }
//         },
//         include: {
//           participants: {
//             include: {
//               user: {
//                 select: {
//                   id: true,
//                   username: true,
//                   displayName: true,
//                   avatarUrl: true,
//                 }
//               }
//             }
//           }
//         }
//       });

//       // Cache conversation members in Redis
//       await redis.setex(
//         REDIS_KEYS.CONVERSATION_MEMBERS(conversation.id),
//         3600, // 1 hour
//         JSON.stringify(data.participantUserIds)
//       );

//       logger.info(`✅ Conversation created: ${conversation.id}`);
//       return conversation;

//     } catch (error) {
//       logger.error('❌ Failed to create conversation:', error);
//       throw error;
//     }
//   }

//   /**
//    * Send an encrypted message
//    */
//   public async sendMessage(messageData: SendMessageData): Promise<{
//     message: any;
//     encryptedForDevices: Array<{
//       deviceId: string;
//       encryptedMessage: QuantumEncryptedMessage;
//     }>;
//   }> {
//     try {
//       // Validate conversation and sender participation
//       const conversation = await prisma.conversation.findFirst({
//         where: {
//           id: messageData.conversationId,
//           participants: {
//             some: { userId: messageData.senderId }
//           }
//         },
//         include: {
//           participants: {
//             include: {
//               user: {
//                 include: {
//                   devices: {
//                     where: { isActive: true }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       });

//       if (!conversation) {
//         throw new Error('Conversation not found or access denied');
//       }

//       // Get sender device
//       const senderDevice = await prisma.device.findUnique({
//         where: { id: messageData.deviceId }
//       });

//       if (!senderDevice || senderDevice.userId !== messageData.senderId) {
//         throw new Error('Invalid sender device');
//       }

//       // Encrypt message for each recipient device
//       const encryptedForDevices: Array<{
//         deviceId: string;
//         encryptedMessage: QuantumEncryptedMessage;
//       }> = [];

//       for (const participant of conversation.participants) {
//         for (const device of participant.user.devices) {
//           if (device.id === messageData.deviceId) continue; // Skip sender device

//           try {
//             const recipientPublicKey = Buffer.from(device.pqPubKey, 'base64');
//             const encryptedMessage = await quantumCrypto.encryptMessage(
//               messageData.content,
//               recipientPublicKey,
//               messageData.senderId
//             );

//             encryptedForDevices.push({
//               deviceId: device.id,
//               encryptedMessage,
//             });
//           } catch (error) {
//             logger.error(`Failed to encrypt for device ${device.id}:`, error);
//           }
//         }
//       }

//       // Create base encrypted message (for sender device)
//       const senderPublicKey = Buffer.from(senderDevice.pqPubKey, 'base64');
//       const senderEncryptedMessage = await quantumCrypto.encryptMessage(
//         messageData.content,
//         senderPublicKey,
//         messageData.senderId
//       );

//       // Generate Dilithium signature
//       const senderSecretKey = Buffer.from(senderDevice.pqPubKey, 'base64'); // Simplified
//       const messageSignature = await quantumCrypto.signMessage(
//         messageData.content,
//         senderSecretKey
//       );

//       // Store message in database
//       const message = await prisma.$transaction(async (tx) => {
//         // Create message record
//         const savedMessage = await tx.message.create({
//           data: {
//             conversationId: messageData.conversationId,
//             senderId: messageData.senderId,
//             deviceId: messageData.deviceId,
//             encryptedBody: Buffer.from(senderEncryptedMessage.encryptedContent),
//             encryptionAlgo: senderEncryptedMessage.algorithm,
//             pqSignature: Buffer.from(messageSignature),
//             messageType: messageData.messageType || 'TEXT',
//             parentMessageId: messageData.parentMessageId,
//           },
//           include: {
//             sender: {
//               select: {
//                 id: true,
//                 username: true,
//                 displayName: true,
//                 avatarUrl: true,
//               }
//             }
//           }
//         });

//         // Update conversation
//         await tx.conversation.update({
//           where: { id: messageData.conversationId },
//           data: {
//             lastMessageAt: new Date(),
//             messageCount: { increment: 1 },
//           }
//         });

//         // Update sender's daily message count
//         const today = new Date().toISOString().split('T')[0];
//         await tx.user.update({
//           where: { id: messageData.senderId },
//           data: {
//             dailyMessageCount: { increment: 1 },
//             dailyMessageDate: new Date(today),
//           }
//         });

//         return savedMessage;
//       });

//       // Publish to Redis for real-time delivery
//       const messagePayload = {
//         messageId: message.id,
//         conversationId: messageData.conversationId,
//         senderId: messageData.senderId,
//         senderInfo: message.sender,
//         messageType: message.messageType,
//         sentAt: message.sentAt,
//         encryptedForDevices: encryptedForDevices.map(item => ({
//           deviceId: item.deviceId,
//           encryptedContent: item.encryptedMessage.encryptedContent,
//           kyberCiphertext: Array.from(item.encryptedMessage.kyberCiphertext),
//           messageHash: item.encryptedMessage.messageHash,
//         })),
//       };

//       await redis.publish('new_message', JSON.stringify(messagePayload));

//       logger.info(`✅ Message sent: ${message.id} to ${encryptedForDevices.length} devices`);

//       return {
//         message,
//         encryptedForDevices,
//       };

//     } catch (error) {
//       logger.error('❌ Failed to send message:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get conversation messages with pagination
//    */
//   public async getMessages(
//     conversationId: string,
//     userId: string,
//     options: {
//       page?: number;
//       limit?: number;
//       before?: string; // message ID
//     } = {}
//   ) {
//     try {
//       const { page = 1, limit = 50, before } = options;
//       const skip = (page - 1) * limit;

//       // Verify user access
//       const participant = await prisma.participant.findFirst({
//         where: {
//           conversationId,
//           userId,
//         }
//       });

//       if (!participant) {
//         throw new Error('Access denied');
//       }

//       // Build query conditions
//       const whereConditions: any = { conversationId };
//       if (before) {
//         const beforeMessage = await prisma.message.findUnique({
//           where: { id: before },
//           select: { sentAt: true }
//         });
//         if (beforeMessage) {
//           whereConditions.sentAt = { lt: beforeMessage.sentAt };
//         }
//       }

//       // Get messages
//       const messages = await prisma.message.findMany({
//         where: whereConditions,
//         include: {
//           sender: {
//             select: {
//               id: true,
//               username: true,
//               displayName: true,
//               avatarUrl: true,
//             }
//           },
//           replies: {
//             include: {
//               sender: {
//                 select: {
//                   id: true,
//                   username: true,
//                   displayName: true,
//                 }
//               }
//             },
//             take: 3,
//             orderBy: { sentAt: 'desc' }
//           }
//         },
//         orderBy: { sentAt: 'desc' },
//         skip,
//         take: limit,
//       });

//       // Get total count
//       const totalCount = await prisma.message.count({
//         where: whereConditions
//       });

//       return {
//         messages: messages.reverse(), // Reverse to show oldest first
//         pagination: {
//           page,
//           limit,
//           totalCount,
//           totalPages: Math.ceil(totalCount / limit),
//           hasNext: skip + messages.length < totalCount,
//           hasPrev: page > 1,
//         }
//       };

//     } catch (error) {
//       logger.error('❌ Failed to get messages:', error);
//       throw error;
//     }
//   }

//   /**
//    * Decrypt message for user's device
//    */
//   public async decryptMessage(
//     messageId: string,
//     userId: string,
//     deviceId: string
//   ): Promise<string> {
//     try {
//       // Get message and verify access
//       const message = await prisma.message.findFirst({
//         where: {
//           id: messageId,
//           conversation: {
//             participants: {
//               some: { userId }
//             }
//           }
//         }
//       });

//       if (!message) {
//         throw new Error('Message not found or access denied');
//       }

//       // Get user's device with secret key
//       const device = await prisma.device.findFirst({
//         where: {
//           id: deviceId,
//           userId,
//           isActive: true,
//         }
//       });

//       if (!device) {
//         throw new Error('Device not found or inactive');
//       }

//       // For this implementation, we'll decrypt using the stored encrypted body
//       // In a real implementation, you'd store separate encrypted versions for each device
//       const secretKey = Buffer.from(device.pqPubKey, 'base64'); // Simplified - should be actual secret key

//       const encryptedMessage = {
//         encryptedContent: message.encryptedBody.toString(),
//         kyberCiphertext: new Uint8Array(message.encryptedBody), // Simplified
//         messageHash: '', // Would be stored separately
//         senderId: message.senderId,
//         algorithm: message.encryptionAlgo,
//         encryptionTime: 0,
//         timestamp: message.sentAt,
//         securityLevel: 'Post-Quantum',
//       };

//       // This is simplified - in production you'd need proper key management
//       return `[DECRYPTED] Message from ${message.senderId}`;

//     } catch (error) {
//       logger.error('❌ Failed to decrypt message:', error);
//       throw error;
//     }
//   }

//   /**
//    * Mark message as read
//    */
//   public async markMessageAsRead(
//     messageId: string,
//     userId: string
//   ): Promise<void> {
//     try {
//       // Verify message access
//       const message = await prisma.message.findFirst({
//         where: {
//           id: messageId,
//           conversation: {
//             participants: {
//               some: { userId }
//             }
//           }
//         }
//       });

//       if (!message) {
//         throw new Error('Message not found or access denied');
//       }

//       // Update message read status
//       await prisma.message.update({
//         where: { id: messageId },
//         data: {
//           isRead: true,
//           readAt: new Date(),
//         }
//       });

//       // Update participant's last read timestamp
//       await prisma.participant.updateMany({
//         where: {
//           conversationId: message.conversationId,
//           userId,
//         },
//         data: {
//           lastReadAt: new Date(),
//         }
//       });

//       logger.debug(`✅ Message marked as read: ${messageId} by user: ${userId}`);

//     } catch (error) {
//       logger.error('❌ Failed to mark message as read:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get user's conversations
//    */
//   public async getUserConversations(userId: string) {
//     try {
//       const conversations = await prisma.conversation.findMany({
//         where: {
//           participants: {
//             some: { userId }
//           },
//           isArchived: false,
//         },
//         include: {
//           participants: {
//             include: {
//               user: {
//                 select: {
//                   id: true,
//                   username: true,
//                   displayName: true,
//                   avatarUrl: true,
//                 }
//               }
//             }
//           },
//           messages: {
//             take: 1,
//             orderBy: { sentAt: 'desc' },
//             include: {
//               sender: {
//                 select: {
//                   id: true,
//                   username: true,
//                   displayName: true,
//                 }
//               }
//             }
//           }
//         },
//         orderBy: { lastMessageAt: 'desc' }
//       });

//       return conversations.map(conv => ({
//         ...conv,
//         lastMessage: conv.messages[0] || null,
//         unreadCount: 0, // Would calculate based on participant.lastReadAt
//       }));

//     } catch (error) {
//       logger.error('❌ Failed to get user conversations:', error);
//       throw error;
//     }
//   }
// }

// export const messagingService = MessagingService.getInstance();
