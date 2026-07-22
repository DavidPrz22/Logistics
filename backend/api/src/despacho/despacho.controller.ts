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
} from '@nestjs/common';
import { DespachoService } from './despacho.service';
import { CreateOrdenODT, UpdateOrdenODT } from './ODTs/despacho.odts';

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

  @Get('ordenes-despacho')
  async getAllDespachos() {
    return this.despachoService.getAllDespachos();
  }

  @Get('orden-despacho/:id')
  async findOneOrdenDespacho(@Param('id', ParseIntPipe) id: number) {
    return this.despachoService.findOneOrdenDespacho(id);
  }

  @Patch('orden-despacho/:id')
  async updateOrdenDespachoById(@Param('id', ParseIntPipe) id: number) {
    return this.despachoService.updateOrdenEstado(id);
  }
}
