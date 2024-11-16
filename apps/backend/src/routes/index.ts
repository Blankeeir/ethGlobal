// apps/backend/src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import postRoutes from './post.routes';
import buddyRoutes from './buddy.routes';
import eventRoutes from './event.routes';
import chatRoutes from './chat.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/buddies', buddyRoutes);
router.use('/events', eventRoutes);
router.use('/chat', chatRoutes);

export default router; 
