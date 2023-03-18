import { Request, Response } from 'express';
import argon2 from 'argon2';
import { getUserByUsername, addNewUser, getUserByName } from '../models/UserModels';
import { parseDatabaseError } from '../utils/db-utils';

async function registerUser(req: Request, res: Response): Promise<void> {
  // TODO: Implement the registration code
  // Make sure to check if the user with the given username exists before attempting to add the account
  // Make sure to hash the password before adding it to the database
  // Wrap the call to `addNewUser` in a try/catch like in the sample code
  const { username, password } = req.body as AuthRequest;
  const userExist = await getUserByUsername(username);
  if (userExist) {
    res.sendStatus(404);
    console.log(`User already exists.`);
  }
  const passwordHash = await argon2.hash(password);

  try {
    const newUser = await addNewUser(username, passwordHash);
    console.log(newUser);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function logIn(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as AuthRequest;

  const user = await getUserByName(username);

  // Check if the user account exists for that email
  if (!user) {
    res.sendStatus(404); // 404 Not Found (403 Forbidden would also make a lot of sense here)
    return;
  }

  // The account exists so now we can check their password
  const { passwordHash } = user;

  // If the password does not match
  if (!(await argon2.verify(passwordHash, password))) {
    res.sendStatus(404); // 404 Not Found (403 Forbidden would also make a lot of sense here)
    return;
  }

  // The user has successfully logged in
  // NOTES: We will update this once we implement session management
  res.sendStatus(200); // 200 OK
}

export { registerUser, logIn };
