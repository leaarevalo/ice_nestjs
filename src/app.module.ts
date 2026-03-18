import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { GroupModule } from './groups/group.module';
import { HistoryModule } from './history/history.module';
import { SmallGroupModule } from './small-groups/small-group.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    AuthModule,
    GroupModule,
    HistoryModule,
    SmallGroupModule,
    MongooseModule.forRoot(process.env.MONGO_URI),
  ],
})
export class AppModule { }
