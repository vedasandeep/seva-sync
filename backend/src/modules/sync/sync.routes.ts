import { Router } from 'express';
import syncController from './sync.controller';

const router = Router();

// Mount sync controller routes
router.use('/', syncController);

export default router;
