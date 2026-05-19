import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';

const app = express();

if (env.isProd) {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(env.isProd ? 'combined' : 'dev'));
}
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

const apiRouter = express.Router();
apiRouter.use(routes);

if (process.env.NODE_ENV !== 'test') {
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
    }),
    apiRouter
  );
} else {
  app.use('/api', apiRouter);
}

app.use(errorHandler);

export default app;
