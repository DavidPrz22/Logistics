import { Injectable } from '@nestjs/common';
import { FuenteTasaCambio } from 'prisma/generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import {
  TasaCambioMontosVEResponse,
  DolarApiResponse,
  TasaCambioItem,
  BinanceP2PResponse,
  UpdateTasasCambioResponse,
} from './type/core.types';
import { UpdateTasasCambioODT } from './ODTs/core.odts';

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

  findAllRegistroTasas() {
    return this.prisma.registroTasas.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findTasasCambioByRegistroId(registroTasasId: number) {
    return this.prisma.tasaCambio.findMany({
      where: { registroTasasId },
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

  private async fetchMontosVeRates(): Promise<TasaCambioItem[]> {
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

  private async fetchBinanceRates() {
    const payload = {
      asset: 'USDT',
      fiat: 'USD',
      merchantCheck: false,
      page: 1,
      payTypes: ['Zelle'],
      // 1. Filtrar por comerciantes verificados (como hace la app por defecto)
      publisherType: 'merchant',
      // 2. Simular el monto exacto que buscas en la app (ejemplo: 100 USD)
      transAmount: '100',
      // 3. Filtrar por comerciantes que operan con usuarios de Venezuela
      countries: ['VE'],
      rows: 5,
      tradeType: 'BUY',
    };
    try {
      const response = await axios.post<BinanceP2PResponse>(
        'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search',
        payload,
        {
          headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Lang: 'en',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching from bianance data:', error);
      return null;
    }
  }

  async updateTasasCambio() {
    const roundToFour = (num: number | string) =>
      Number(Number(num).toFixed(4));
    const divisaMap = await this.getDivisaMap();
    const combinedTasasCambioList: {
      divisaOrigenId: number;
      divisaDestinoId: number;
      tasa: number;
      registroTasasId: number;
      fechaVigencia: Date;
      fuente: FuenteTasaCambio;
    }[] = [];

    // Creamos el evento de registro (sesión)
    const registro = await this.prisma.registroTasas.create({
      data: {
        nombre: `Tasas de Cambio - ${new Date().toISOString().split('T')[0]}`,
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
      const marketUpper = item.market.toUpperCase();

      // Validate that the market string matches a valid enum value
      if (
        !(Object.values(FuenteTasaCambio) as string[]).includes(marketUpper)
      ) {
        console.warn(`Unrecognized market source: ${marketUpper}`);
        continue;
      }

      const fuente = marketUpper as FuenteTasaCambio;

      if (divisaOrigenId && divisaDestinoId) {
        combinedTasasCambioList.push({
          divisaOrigenId,
          divisaDestinoId,
          tasa: roundToFour(item.rate),
          registroTasasId: registro.id,
          fuente,
          fechaVigencia: new Date(item.updated_at),
        });
      }
    }

    // Fetch and process Binance
    const binanceData = await this.fetchBinanceRates();
    if (binanceData?.success && binanceData.data.length > 0) {
      const divisaOrigenId = divisaMap['USD'];
      const divisaDestinoId = divisaMap['VES'];

      if (divisaOrigenId && divisaDestinoId) {
        const usdtRate =
          montosVeData.find((item) => item.currency_pair === 'USDT/VES')
            ?.rate || 0;

        const zelleTotalRate = binanceData.data.reduce(
          (total, item) => total + parseFloat(item.adv.price),
          0,
        );
        const zelleAverageRate = zelleTotalRate / binanceData.data.length;
        const zelleRate = usdtRate / zelleAverageRate;
        combinedTasasCambioList.push({
          divisaOrigenId,
          divisaDestinoId,
          tasa: roundToFour(zelleRate),
          fuente: FuenteTasaCambio.ZELLE,
          registroTasasId: registro.id,
          fechaVigencia: new Date(),
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
          tasa: roundToFour(dolarApiData.promedio),
          fuente: 'PARALELO',
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

  async updateTasasCambioByRegistroId(
    registroTasasId: number,
    data: UpdateTasasCambioODT,
  ): Promise<UpdateTasasCambioResponse> {
    const registro = await this.prisma.registroTasas.findUnique({
      where: { id: registroTasasId },
    });

    if (!registro) {
      throw new Error(
        `Registro de tasas con id ${registroTasasId} no encontrado`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      for (const tasa of data.tasas) {
        await tx.tasaCambio.update({
          where: { id: tasa.id },
          data: { tasaMoficada: tasa.tasaModificada },
        });
      }
    });

    return {
      message: 'Tasas de cambio actualizadas exitosamente',
      updatedCount: data.tasas.length,
    };
  }
}
