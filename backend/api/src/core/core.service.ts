import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import {
  TasaCambioMontosVEResponse,
  DolarApiResponse,
} from './type/core.types';
@Injectable()
export class CoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  findAllAlmacenes() {
    return this.prisma.almacen.findMany();
  }

  findAllChoferes() {
    return this.prisma.chofer.findMany();
  }

  findAllClientes() {
    return this.prisma.cliente.findMany();
  }

  findAllDivisas() {
    return this.prisma.divisa.findMany();
  }

  findAllTasasCambio() {
    return this.prisma.tasaCambio.findMany({
      include: { divisaOrigen: true, divisaDestino: true },
    });
  }

  findAllMetodosPago() {
    return this.prisma.metodoPago.findMany();
  }

  findAllMotivoRechazo() {
    return this.prisma.motivoRechazo.findMany();
  }

  private async getDivisaMap() {
    return this.prisma.divisa.findMany().then((divisas) => {
      const map: Record<string, number> = {};
      divisas.forEach((divisa) => {
        map[divisa.codigo] = divisa.id;
      });
      return map;
    });
  }

  private async fetchMontosVeRates() {
    try {
      const response = await axios.get<TasaCambioMontosVEResponse>(
        'https://api.montosve.com/v1/fx/rates',
        {
          headers: {
            Accept: 'application/json',
            'X-API-Key': this.config.get<string>('MONTOSVE_API_KEY'),
          },
        },
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching from MontosVE:', error);
      return [];
    }
  }

  private async fetchDolarApiRates() {
    try {
      const response = await axios.get<DolarApiResponse>(
        'https://ve.dolarapi.com/v1/dolares/paralelo',
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching from DolarApi:', error);
      return null;
    }
  }

  async updateTasasCambio() {
    const divisaMap = await this.getDivisaMap();
    const combinedTasasCambioList: {
      divisaOrigenId: number;
      divisaDestinoId: number;
      tasa: number;
      registroTasasId: number;
      fechaVigencia: Date;
    }[] = [];

    // Creamos el evento de registro (sesión)
    const registro = await this.prisma.registroTasas.create({
      data: {
        nombre: `Tasas de Cambio - ${new Date().toISOString()}`,
      },
    });

    // Fetch and process MontosVE
    const montosVeData = await this.fetchMontosVeRates();
    for (const item of montosVeData) {
      const currencyPair = item.currency_pair.split('/');
      const divisaOrigenCodigo = currencyPair[0];
      const divisaDestinoCodigo = currencyPair[1];

      const divisaOrigenId = divisaMap[divisaOrigenCodigo];
      const divisaDestinoId = divisaMap[divisaDestinoCodigo];

      if (divisaOrigenId && divisaDestinoId) {
        combinedTasasCambioList.push({
          divisaOrigenId,
          divisaDestinoId,
          tasa: item.rate,
          registroTasasId: registro.id,
          fechaVigencia: new Date(item.updated_at),
        });
      }
    }

    // Fetch and process DolarApi
    const dolarApiData = await this.fetchDolarApiRates();
    if (dolarApiData) {
      const divisaOrigenId = divisaMap['USD'];
      const divisaDestinoId = divisaMap['VES'];

      if (divisaOrigenId && divisaDestinoId) {
        combinedTasasCambioList.push({
          divisaOrigenId,
          divisaDestinoId,
          tasa: dolarApiData.promedio,
          registroTasasId: registro.id,
          fechaVigencia: new Date(dolarApiData.fechaActualizacion),
        });
      }
    }

    // Update the database with the combined list of exchange rates
    if (combinedTasasCambioList.length > 0) {
      await this.prisma.tasaCambio.createMany({
        data: combinedTasasCambioList,
      });
    } else {
      // Si fallan todas las APIs, eliminamos el registro vacío
      await this.prisma.registroTasas.delete({
        where: { id: registro.id },
      });
    }
  }
}
