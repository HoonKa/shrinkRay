import { createHash } from 'crypto';
import { Link } from '../entities/Link';
import { User } from '../entities/User';
import { AppDataSource } from '../dataSource';

const linkRepository = AppDataSource.getRepository(Link);

// async function getLinkById(linkId: string): Promise<Link | null> {
//   if (!linkId) {
//     return null;
//   }
//   const link = await linkRepository
//     .createQueryBuilder('link')
//     .where('linkId = :linkId', { linkId })
//     .select(['link.linkId', 'link.originalUrl', 'link.isAccessedOn', 'link.numHit', 'link.user'])
//     .getOne();
//   return link;
// }
async function getLinkById(linkId: string): Promise<Link | null> {
  const link = await linkRepository.findOne({ where: { linkId } });
  return link;
}

function createLinkId(originalUrl: string, userId: string): string {
  const md5 = createHash('md5');
  md5.update(`${originalUrl}${userId}`);
  const urlHash = md5.digest('base64url');
  const linkId = urlHash.slice(0, 9);

  return linkId;
}

async function createNewLink(originalUrl: string, linkId: string, creator: User): Promise<Link> {
  let newLink = new Link();
  newLink.originalUrl = originalUrl;
  newLink.linkId = linkId;
  // newLink.numHit = 0;
  newLink.user = creator;
  newLink.lastAccessedOn = new Date();

  newLink = await linkRepository.save(newLink);

  return newLink;
}

async function updateLinkVisits(link: Link): Promise<Link> {
  let updatedLink = link;
  const now = new Date();
  updatedLink.numHit += 1;
  updatedLink.lastAccessedOn = now;

  updatedLink = await linkRepository.save(updatedLink);

  return updatedLink;
}

async function getLinksByUserId(userId: string): Promise<Link[]> {
  const links = await linkRepository
    .createQueryBuilder('link')
    // .where('userId = :userId', { user: { userId } })
    .where({ user: { userId } })
    .leftJoin('link.user', 'user')
    .select(['link.linkId', 'link.originalUrl', 'user.userId', 'user.username', 'user.isAdmin'])
    .getMany();

  return links;
}

async function getLinksByUserIdForOwnAccount(userId: string): Promise<Link[]> {
  const links = await linkRepository
    .createQueryBuilder('link')
    // .where('userId = :userId', { user: { userId } })
    .where({ user: { userId } })
    .leftJoin('link.user', 'user')
    .select([
      'link.linkId',
      'link.originalUrl',
      'link.numHits',
      'link.lastAccessedOn',
      'user.userId',
      'user.username',
      'user.isPro',
      'user.isAdmin',
    ])
    .getMany();

  return links;
}

async function deleteLinkByLinkId(linkId: string): Promise<void> {
  await linkRepository
    .createQueryBuilder('link')
    .delete()
    .from(Link)
    .where('linkId = :linkId', { linkId })
    .execute();
}

export {
  createLinkId,
  createNewLink,
  getLinkById,
  updateLinkVisits,
  getLinksByUserId,
  getLinksByUserIdForOwnAccount,
  deleteLinkByLinkId,
};
