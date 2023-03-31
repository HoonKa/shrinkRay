import { createHash } from 'crypto';
import { Link } from '../entities/Link';
import { User } from '../entities/User';
import { AppDataSource } from '../dataSource';

const linkRepository = AppDataSource.getRepository(Link);

function createLinkId(originalUrl: string, userId: string): string {
  const md5 = createHash('md5');
  md5.update(`${originalUrl}${userId}`);
  const urlHash = md5.digest('base64url');
  const linkId = urlHash.slice(0, 9);

  return linkId;
}

async function createNewLink(originalUrl: string, linkId: string, creator: User): Promise<Link> {
  // TODO: Implement me!
  let newLink = new Link();
  newLink.originalUrl = originalUrl;
  newLink.linkId = linkId;
  newLink.user = creator;

  newLink = await linkRepository.save(newLink);

  return newLink;
}

async function getLinkById(linkId: string): Promise<Link | null> {
  if (!linkId) {
    return null;
  }
  const link = await linkRepository
    .createQueryBuilder('link')
    .where({ linkId })
    .select(['link.linkId', 'link.originalUrl', 'link.isAccessedOn', 'link.numHit', 'link.user'])
    .getOne();
  return link;
}

export { createLinkId, createNewLink, getLinkById };
