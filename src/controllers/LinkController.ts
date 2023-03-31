import { Request, Response } from 'express';
import { Link } from '../entities/Link';
import { User } from '../entities/User';
import { parseDatabaseError } from '../utils/db-utils';
import { createLinkId, createNewLink, getLinkById } from '../models/LinkModel';
import { AppDataSource } from '../dataSource';

const linkRepository = AppDataSource.getRepository(Link);
const userRepository = AppDataSource.getRepository(User);

async function shortenUrl(req: Request, res: Response): Promise<void> {
  // const { user } = req.session;
  const { authenticatedUser } = req.session;
  const { userId } = authenticatedUser.userId;
  const userId = await ;

  // // Make sure the user is logged in
  if (!userId) {
    res.sendStatus(401);
    return;
  }

  // if (!user) {
  //   res.status(401).send('You need to be logged in to create shortened links.');
  //   return;
  // }

  // Get the userId from `req.session`
  // const { userId } = user;
  const currentUser = await userRepository.findOne({ userId: req.session.userId });

  // Retrieve the user's account data using their ID
  // const currentUser = await userRepository.findOne(userId, { relations: ['links'] });

  // Check if you got back `null`
  if (!currentUser) {
    res.sendStatus(404);
    // (`User with ID ${userId} not found.`);
    return;
  }

  // Check if the user is neither a "pro" nor an "admin" account
  if (!currentUser.isPro && !currentUser.isAdmin) {
    // check how many links they've already generated
    const linksCount = await linkRepository.count({ user: currentUser });

    // if they have generated 5 links
    if (linksCount >= 5) {
      res.sendStatus(403);
      console.log(`You have exceeded the maximum number of shortened links allowed.`);
      return;
    }


    // const numLinks = await linksCount({ where: { userId: req.session.userId } });
    // if (numLinks >= 5) {
    //     res.status(403).send("You have reached your limit of 5 shortened URLs.");
    //     return;
    // }
  //}
  }

  // Generate a `linkId`
  const linkId = createLinkId(req.body.originalUrl, userId);

  // Add the new link to the database (wrap this in try/catch)
  try {
    const newLink = await createNewLink(req.body.originalUrl, linkId, currentUser);
    res.sendStatus(201);
    console.log(`${newLink}`);
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }

  // try {
  //   if (!req.session || !req.session.userId) {
  //     res.sendStatus(401); // send the appropriate response
  //     return;
  //   }

  //   const { userId } = user;
  //   // const user = await User.findOne({ id: req.session.userId });
  //   const user = await userRepository.findOne({ userId: req.session.userId });

  //   // Check if you got back `null`
  //   if (!user) {
  //     res.sendStatus(401); // user not found.
  //     return;
  //   }

  //   // Check if the user is neither a "pro" nor an "admin" account
  //   if (!user.isPro && !user.isAdmin) {
  //     // check how many links they've already generated
  //     // const linkCount = await linkRepository.numHit({ userId });
  //     const linkCount = await linkRepository.count({ user: { userId: user.userId } });

  //     // if they have generated 5 links
  //     if (linkCount >= 5) {
  //       res.sendStatus(403); // reached max nnum of aloowed link
  //       return;
  //     }

  //     // Generate a `linkId`
  //     const linkId = createLinkId(req.body.originalUrl, user.userId);

  //     // Add the new link to the database (wrap this in try/catch)
  //     const newLink = await createNewLink(req.body.originalUrl, linkId, user);

  //     // Respond with status 201 if the insert was successful
  //     res.status(201).send(`Shortened link created with ID: ${linkId}`);
  //   }
  // } catch (err) {
  //   console.error(err);
  //   const databaseErrorMessage = parseDatabaseError(err);
  //   res.status(500).json(databaseErrorMessage);
  // }

  // // Get the userId from `req.session`

  // // Retrieve the user's account data using their ID

  // // send the appropriate response

  // // send the appropriate response

  // // Add the new link to the database (wrap this in try/catch)
  // return newLink;
}

export { shortenUrl };
