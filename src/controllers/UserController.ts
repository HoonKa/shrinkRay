import { Request, Response } from 'express';
import argon2 from 'argon2';
import { getUserByUsername, addNewUser } from '../models/UserModels';
import { parseDatabaseError } from '../utils/db-utils';

async function registerUser(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as AuthRequest;
  const userExist = await getUserByUsername(username);
  if (userExist) {
    res.sendStatus(404).json('User already exists.');
  }

  const passwordHash = await argon2.hash(password);

  try {
    const newUser = await addNewUser(username, passwordHash);
    res.redirect('/login');
    res.sendStatus(201).json(newUser);
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function logIn(req: Request, res: Response): Promise<void> {
  console.log(req.session);

  const { username, password } = req.body as AuthRequest;

  const user = await getUserByUsername(username);

  if (!user) {
    res.sendStatus(401);
    // res.redirect("/login"); // redirect to login page.
    return;
  }

  const { passwordHash } = user;

  if (!(await argon2.verify(passwordHash, password))) {
    res.sendStatus(404);
    return;
  }

  await req.session.clearSession();

  req.session.authenticatedUser = {
    userId: user.userId,
    isPro: user.isPro,
    isAdmin: user.isAdmin,
    username: user.username,
  };

  req.session.isLoggedIn = true;

  // res.sendStatus(200);
  // res.redirect("/welcome");//redirect to welcome.html page.
  res.redirect('/shrink');
}

export { registerUser, logIn };
