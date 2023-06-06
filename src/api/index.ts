import express from 'express';

import MessageResponse from '../interfaces/MessageResponse';
import short_url from './short_url';

const router = express.Router();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/url', short_url);

export default router;
