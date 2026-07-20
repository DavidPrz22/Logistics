import { Module } from '@nestjs/common';
import { DespachoController } from './despacho.controller';
import { DespachoService } from './despacho.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DespachoController],
  providers: [DespachoService],
})
export class DespachoModule {}
