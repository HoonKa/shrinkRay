import './config'; // Load environment variables
import 'express-async-errors'; // Enable default error handling for async errors

import express, { Express } from 'express';
import { registerUser, logIn } from './controllers/UserController';

const app: Express = express();
app.use(express.json());

const { PORT } = process.env;

app.post('/api/users', registerUser);
app.post('/api/login', logIn);

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
