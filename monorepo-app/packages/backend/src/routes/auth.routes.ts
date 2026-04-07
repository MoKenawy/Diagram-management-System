import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import * as ctrl from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { loginSchema } from '../schemas/auth.schema';
const authRouter = Router({ mergeParams: true });

// POST /api/auth/login
authRouter.post('/login', validate(loginSchema, 'body'), ctrl.login);

// POST /api/auth/logout
authRouter.post('/logout', authenticate, ctrl.logout);
// POST /api/auth/refresh
authRouter.post('/refresh', ctrl.refresh);
// GET /api/auth/me
authRouter.get('/me', authenticate, ctrl.getMe);


export default authRouter;