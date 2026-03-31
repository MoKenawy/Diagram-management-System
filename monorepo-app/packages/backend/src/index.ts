import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { logger, requestLogger } from './utils/logger';
import diagramsRoutes from './routes/diagrams.routes';


import departmentsRoutes from './routes/departments.routes';
import usersRoutes from './routes/users.routes';
import reportsRoutes from './routes/reports.routes';
import adminRoutes from './routes/admin.routes';
import { startAllWorkers } from './workers';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Load Swagger YAML file
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml')); 
// Note: If running via ts-node from root, use './swagger.yaml'

app.use(helmet({
    contentSecurityPolicy: false, // Sometimes needed to allow Swagger UI to load correctly
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);



app.use('/api/diagrams', diagramsRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);

// Swagger Route
app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth', authRouter);

// ----- Health Check -----
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


// ─── Global Error Handler ────────────────────────────────────────
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    req.log?.error({ err }, 'Unhandled error');

    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Record not found' });
      return;
    }

    if ((err as any).code === 'P2002') {
      const target = (err as any).meta?.target;
      res.status(409).json({
        error: 'DUPLICATE',
        message: `A record with this ${target?.join(', ') || 'value'} already exists`,
      });
      return;
    }

    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : err.message,
    });
  }
);

// ─── Process-level Error Handlers ────────────────────────────────
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});

// ─── Start ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`Backend running on http://localhost:${PORT}`);
  logger.info(`Swagger docs at http://localhost:${PORT}/api/docs`);

  if (process.env.DISABLE_WORKERS !== 'true') {
    startAllWorkers();
  }
});

export default app;