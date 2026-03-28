import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Backend API Running', status: 'OK' });
});

app.listen(port, () => {
    console.log(`ðŸš€ Backend Server running on http://localhost:${port}`);
});