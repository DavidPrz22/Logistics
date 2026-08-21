import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CoreModule } from './core/core.module';
import { DespachoModule } from './despacho/despacho.module';
import { PagosModule } from './pagos/pagos.module';
import { ConfigModule } from '@nestjs/config';
import { FacturacionModule } from './facturacion/facturacion.module';
import { KardexModule } from './kardex/kardex.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CoreModule,
    DespachoModule,
    PagosModule,
    FacturacionModule,
    KardexModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
