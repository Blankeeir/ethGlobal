// apps/backend/src/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { userValidation } from '../validations/user.validation';

const router = Router();
const controller = new UserController();

router.get('/profile/:address', controller.getProfile);
router.get('/stats/:address', controller.getStats);
router.put(
  '/profile',
  authMiddleware,
  validateRequest(userValidation.updateProfile),
  controller.updateProfile
);
router.get('/buddies', authMiddleware, controller.getBuddyList);
router.post(
  '/verify-buddy',
  authMiddleware,
  validateRequest(userValidation.verifyBuddy),
  controller.verifyBuddy
);

export default router;