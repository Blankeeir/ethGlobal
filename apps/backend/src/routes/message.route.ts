// src/routes/message.routes.ts
import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const messageController = new MessageController(
  new MessageService(
    new FilecoinService(),
    new PushNotificationService(),
    new LayerZeroService(getProvider())
  )
);

router.post('/send', authenticate, messageController.sendMessage);
router.get('/:address1/:address2', authenticate, messageController.getMessages);
router.post('/read/:address', authenticate, messageController.markAsRead);

export default router;