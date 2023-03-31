import { Request, Response } from 'express';
import {
  createLinkId,
  createNewLink,
  getLinkById,
  updateLinkVisits,
  getLinksByUserId,
  getLinksByUserIdForOwnAccount,
  deleteLinkByLinkId,
} from '../models/LinkModel';
import { getUserById } from '../models/UserModels';
import { parseDatabaseError } from '../utils/db-utils';

async function shortenUrl(req: Request, res: Response): Promise<void> {
  const { userId } = req.session.authenticatedUser;
  const user = await getUserById(userId);

  if (!user) {
    res.sendStatus(404);
    return;
  }
  if (!req.session.isLoggedIn) {
    res.sendStatus(401);
    return;
  }

  const { isPro, isAdmin } = req.session.authenticatedUser;
  if (!isPro || !isAdmin) {
    if (user.links.length >= 5) {
      res.sendStatus(403).json('You have exceeded the maximum number of shortened links allowed.');
      return;
    }
  }

  const { originalUrl } = req.body as OriginalUrl;
  const linkId = createLinkId(originalUrl, userId);

  try {
    const newLink = await createNewLink(originalUrl, linkId, user);
    res.sendStatus(201).json(newLink);
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function getOriginalUrl(req: Request, res: Response): Promise<void> {
  const { targetLinkId } = req.body as TargetLinkId;

  const linkData = await getLinkById(targetLinkId);

  if (!linkData) {
    res.sendStatus(404);
    return;
  }

  updateLinkVisits(linkData);

  res.redirect(301, linkData.originalUrl);
}

async function getLinkForProAdmin(req: Request, res: Response): Promise<void> {
  const { userId } = req.body as ProAdminUser;

  const user = await getUserById(userId);

  if (!user) {
    res.sendStatus(404);
    return;
  }
  try {
    // Check if user is logged in and is accessing their own links
    if (req.session.isLoggedIn && req.session.authenticatedUser.userId === userId) {
      const links = await getLinksByUserIdForOwnAccount(userId);
      res.json(links);
    }
    // Check if user is an admin
    else if (req.session.isLoggedIn && req.session.authenticatedUser.isAdmin) {
      const links = await getLinksByUserId(userId);
      res.json(links);
    } else if (req.session.isLoggedIn && req.session.authenticatedUser.isPro) {
      const links = await getLinksByUserId(userId);
      res.json(links);
    }
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.sendStatus(500).json(databaseErrorMessage);
  }
}

async function deleteLink(req: Request, res: Response): Promise<void> {
  if (!req.session.isLoggedIn) {
    res.sendStatus(401).json({ error: 'Not logged In' });
    return;
  }
  const { LinkId } = req.body as UserLinkID;

  const { userId, isAdmin } = req.session.authenticatedUser;
  const user = await getUserById(userId);
  if (!user) {
    res.sendStatus(402).json({ error: 'User not found' });
    return;
  }
  if (!isAdmin) {
    res.sendStatus(403).json({ error: 'Not Admin' });
  }

  const link = await getLinkById(LinkId);
  if (!link) {
    res.sendStatus(404).json({ error: 'Link not found ' });
  }

  try {
    await deleteLinkByLinkId(LinkId);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.sendStatus(500).json(databaseErrorMessage);
  }
}

export { shortenUrl, getOriginalUrl, getLinkForProAdmin, deleteLink };
