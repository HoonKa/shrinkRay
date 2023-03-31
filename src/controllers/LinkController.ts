import { Request, Response } from 'express';
import { createLinkId, createNewLink, getLinkById, updateLinkVisits } from '../models/LinkModel';
import { getUserById } from '../models/UserModels';
import { parseDatabaseError } from '../utils/db-utils';

async function shortenUrl(req: Request, res: Response): Promise<void> {
  // // Make sure the user is logged in
  if (!req.session.isLoggedIn) {
    res.sendStatus(401);
    return;
  }

  // // Get the userId from `req.session`
  // // Retrieve the user's account data using their ID
  const { userId } = req.session.authenticatedUser;
  const user = await getUserById(userId);
  // // Check if you got back `null`
  if (!user) {
    res.sendStatus(404);
    return;
  }
  const { isPro, isAdmin } = req.session.authenticatedUser;
  // // Check if the user is neither a "pro" nor an "admin" account
  if (!isPro || !isAdmin) {
    // // if they have generated 5 links
    if (user.links.length >= 5) {
      res.sendStatus(403);
      console.log(`You have exceeded the maximum number of shortened links allowed.`);
      return;
    }
  }

  // // Generate a `linkId`
  const { originalUrl } = req.body as OriginalUrl;
  const linkId = createLinkId(originalUrl, userId);

  // // Add the new link to the database (wrap this in try/catch)
  try {
    const newLink = await createNewLink(originalUrl, linkId, user);
    // // Respond with status 201 if the insert was successful
    res.sendStatus(201).json(newLink);
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function getOriginalUrl(req: Request, res: Response): Promise<void> {
  // Retrieve the link data using the targetLinkId from the path parameter
  const { targetLinkId } = req.params as TargetLinkId;

  const linkData = await getLinkById(targetLinkId);

  // Check if you got back `null`
  if (!linkData) {
    res.sendStatus(404);
  }

  updateLinkVisits(linkData);
  res.redirect(301, linkData.originalUrl);
  // send the appropriate response
  // Call the appropriate function to increment the number of hits and the last accessed date
  // Redirect the client to the original URL
}

export { shortenUrl, getOriginalUrl };
