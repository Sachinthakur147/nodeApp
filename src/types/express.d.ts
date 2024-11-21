import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any;  // or a more specific type for user
    }
  }
}
