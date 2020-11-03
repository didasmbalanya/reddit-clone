import { Migration } from '@mikro-orm/migrations';

export class Migration20201103124421 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" serial primary key, "username" text not null, "password" text not null, "created_at" timestamptz(0) not null default \'Now()\', "updated_at" timestamptz(0) not null default \'Now()\');');
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');
  }

}
