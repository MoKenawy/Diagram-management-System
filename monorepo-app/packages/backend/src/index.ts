import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import diagramRoutes from './routes/diagrams';

const app = express();
const port = process.env.PORT || 3000;

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



app.use('/api/diagrams', diagramRoutes);

// Swagger Route
app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth', authRoutes);

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Backend API Running', status: 'OK', docs: '/api/api-docs' });
});

app.listen(port, () => {
    console.log(`🚀 Backend Server running on http://localhost:${port}`);
    console.log(`📖 Documentation available at http://localhost:${port}/api/api-docs`);
});