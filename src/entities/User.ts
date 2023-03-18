import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { Link } from './Link';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  passwordHash: string;

  @Column({ default: false })
  isPro: boolean;

  @Column({ default: false })
  isAdmin: boolean;

  @ManyToOne(() => Link, (links) => links.users)
  links: Relation<Link>[];

  // @Column({ unique: true })
  // email: string;

  // @Column({ default: false })
  // verifiedEmail: boolean;

  // @Column({ default: 0 })
  // profileViews: number;

  // @Column({ default: 0 })
  // updateEmail: string;
}
