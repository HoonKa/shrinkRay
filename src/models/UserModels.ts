import { AppDataSource } from '../dataSource';
import { User } from '../entities/User';

const userRepository = AppDataSource.getRepository(User);

// async function getUserById(userId: string): Promise<User | null> {
//   if (!userId) {
//     return null;
//   }
//   const user = await userRepository
//     .createQueryBuilder('user')
//     .where({ userId })
//     .select([
//       'user.userId',
//       'user.username',
//       'user.passwordHash',
//       'user.isPro',
//       'user.isAdmin',
//       'user.links',
//     ])
//     .getOne();
//   return user;
// }

async function getUserById(userId: string): Promise<User | null> {
  const user = await userRepository.findOne({ where: { userId }, relations: ['links'] });
  return user;
}

async function getUserByUsername(username: string): Promise<User | null> {
  if (!username) {
    return null;
  }
  const user = await userRepository
    .createQueryBuilder('user')
    // .where({ username })
    .leftJoinAndSelect('user.links', 'links')
    .where('username = :username', { username })
    // .select(['user.username', 'user.profileViews', 'user.joined0n', 'user.userId'])
    .getOne();

  return user;
}

async function addNewUser(username: string, passwordHash: string): Promise<User | null> {
  let newUser = new User();
  newUser.username = username;
  newUser.passwordHash = passwordHash;
  newUser = await userRepository.save(newUser);

  return newUser;
}

async function getUserByName(username: string): Promise<User | null> {
  const user = await userRepository.findOne({ where: { username } });

  return user;
}

export { getUserByUsername, addNewUser, getUserByName, getUserById };
