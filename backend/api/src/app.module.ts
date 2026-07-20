import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CoreModule } from './core/core.module';
import { DespachoModule } from './despacho/despacho.module';

@Module({
  imports: [PrismaModule, CoreModule, DespachoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
