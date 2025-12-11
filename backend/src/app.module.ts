import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { TestController } from './test/test.controller';

@Module({
  imports: [DbModule],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule {}
