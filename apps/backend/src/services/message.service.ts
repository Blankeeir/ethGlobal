// src/services/MessageService.ts
import { FilecoinService} from "./filecoin.service";


export class MessageService {
    constructor(
      private filecoinService: FilecoinService,
      private pushService: PushNotificationService,
      private layerZeroService: LayerZeroService
    ) {}
  
    async sendMessage({
      from,
      to,
      content,
      chainId
    }: {
      from: string;
      to: string;
      content: string;
      chainId?: string;
    }) {
      try {
        // Store message content on Filecoin
        const contentCID = await this.filecoinService.storeData({
          content,
          timestamp: Date.now(),
          metadata: {
            from,
            to
          }
        });
  
        // Create message in database
        const message = new Message({
          from,
          to,
          content,
          filecoinCID: contentCID,
          chainId
        });
        await message.save();
  
        // Send cross-chain message if needed
        if (chainId) {
          await this.layerZeroService.sendMessage(
            parseInt(chainId),
            to,
            JSON.stringify({
              type: 'chat',
              content,
              contentCID
            }),
            from,
            ethers.constants.AddressZero,
            '0x'
          );
        }
  
        // Send notification
        await this.pushService.sendNotification({
          recipient: to,
          title: 'New Message',
          body: `You have a new message`,
          payload: {
            type: 'chat',
            messageId: message._id,
            contentCID
          }
        });
  
        return message;
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    }
  
    async getMessages(address1: string, address2: string) {
      try {
        const messages = await Message.find({
          $or: [
            { from: address1, to: address2 },
            { from: address2, to: address1 }
          ]
        }).sort({ timestamp: 1 });
  
        return messages;
      } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
    }
  
    async markAsRead(messageIds: string[], reader: string) {
      try {
        await Message.updateMany(
          {
            _id: { $in: messageIds },
            to: reader
          },
          {
            $set: { status: 'read' }
          }
        );
      } catch (error) {
        console.error('Error marking messages as read:', error);
        throw error;
      }
    }
  }

  
