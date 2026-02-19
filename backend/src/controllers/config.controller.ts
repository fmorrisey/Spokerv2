import { RequestHandler } from 'express';
import { getConfig } from '../services/config.service';

export const getAppConfig: RequestHandler = (_req, res) => {
  res.status(200).json(getConfig());
};
