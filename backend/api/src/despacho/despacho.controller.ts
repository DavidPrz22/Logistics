import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DespachoService } from './despacho.service';
import {
  CreateOrdenODT,
  UpdateDetallesOrdenODT,
  UpdateOrdenODT,
  LiquidacionDespachoODT,
} from './ODTs/despacho.odts';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Usuario } from 'src/users/types/users.types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guards/jwt-auth-guards.guard';
@Controller('despacho')
export class DespachoController {
  constructor(private readonly despachoService: DespachoService) {}

  @Get('lotes/search')
  async searchLotes(@Query('q') q?: string) {
    return this.despachoService.searchLotes(q);
  }

  @Post('orden-despacho')
  async createOrdenDespacho(@Body() createOrdenODT: CreateOrdenODT) {
    return this.despachoService.createOrdenDespacho(createOrdenODT);
  }

  @Put('orden-despacho/:id')
  async updateOrdenDespacho(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateOrdenODT,
  ) {
    return this.despachoService.updateOrdenDespacho(id, data);
  }

  @Put('orden-despacho/:id/detalles')
  async updateDetallesOrdenDespacho(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateDetallesOrdenODT,
  ) {
    return this.despachoService.updateDetallesOrdenDespacho(
      id,
      data.detalles,
      data.totalFacturado,
    );
  }

  @Get('ordenes-despacho')
  async getAllDespachos() {
    return this.despachoService.getAllDespachos();
  }

  @Get('orden-despacho/:id')
  async findOneOrdenDespacho(@Param('id', ParseIntPipe) id: number) {
    return this.despachoService.findOneOrdenDespacho(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('orden-despacho/:id')
  async updateOrdenDespachoById(
    @CurrentUser() user: Usuario,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.despachoService.updateOrdenEstado(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('orden-despacho/:id/liquidar')
  async updateOrdenDespachoLiquidar(
    @CurrentUser() user: Usuario,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: LiquidacionDespachoODT,
  ) {
    return this.despachoService.updateOrdenDespachoLiquidar(id, data, user.id);
  }
}
