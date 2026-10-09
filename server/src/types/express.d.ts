declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: 'admin' | 'editor' | 'user'; email: string };
    }
  }
}

export {};
