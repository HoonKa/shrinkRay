import './config'; // Load environment variables
import 'express-async-errors'; // Enable default error handling for async errors
import express, { Express } from 'express';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import { registerUser, logIn } from './controllers/UserController';
import { shortenUrl, deleteLink, getLinks, visitLink } from './controllers/LinkController';

const app: Express = express();
// app.set('view engine', 'ejs');
const { PORT, COOKIE_SECRET } = process.env;
const SQLiteStore = connectSqlite3(session);

app.use(express.static('public', { extensions: ['html'] }));

app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.sqlite' }),
    secret: COOKIE_SECRET,
    cookie: { maxAge: 8 * 60 * 60 * 1000 },
    name: 'session',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post('/users', registerUser);
app.post('/login', logIn);

app.post('/links', shortenUrl);
app.get('/:targetLinkId', getLinks);
app.get('/users/:targetUserId/links', visitLink);
app.delete('/users/:targetUserId/links/:targetLinkId', deleteLink);

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
