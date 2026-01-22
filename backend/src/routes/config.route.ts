import { Router } from 'express';
import { PORT, API_VERSION, API_BASE_URL, API_URL } from '../models/constants';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    PORT,
    API_VERSION,
    API_BASE_URL,
    API_URL
  });
});

export default router;
