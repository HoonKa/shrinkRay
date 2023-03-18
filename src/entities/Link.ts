import { Entity, PrimaryColumn, Column, OneToMany, Relation } from 'typeorm';
import { User } from './User';

@Entity()
export class Link {
  @PrimaryColumn()
  linkId: string;

  @Column()
  originalUrl: string;

  @Column()
  lasAccessedOn: Date;

  @Column({ default: 0 })
  numHis: number;

  @OneToMany(() => User, (users) => users.links)
  users: Relation<User>[];
}
