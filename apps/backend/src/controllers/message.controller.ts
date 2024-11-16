// src/controllers/message.controller.ts
import { Request, Response } from 'express';
import { MessageService } from '../services/MessageService';

export class MessageController {
  constructor(private messageService: MessageService) {}

  sendMessage = async (req: Request, res: Response) => {
    try {
      const { from, to, content, chainId } = req.body;
      const message = await this.messageService.sendMessage({
        from,
        to,
        content,
        chainId,
      });
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getMessages = async (req: Request, res: Response) => {
    try {
      const { address1, address2 } = req.params;
      const messages = await this.messageService.getMessages(address1, address2);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  markAsRead = async (req: Request, res: Response) => {
    try {
      const { messageIds } = req.body;
      const { address } = req.params;
      await this.messageService.markAsRead(messageIds, address);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
