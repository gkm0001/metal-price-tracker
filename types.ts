export type MetalType = 'gold' | 'silver';

export interface MarketData {
  price: number;
  change24h: number;
  changePercent: number;
  lastUpdated: string;
  currency: string;
  unit: string;
  metalCode: string;
}

export interface TaxInfo {
  percentage: number;
  country: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag?: string;
}

export interface Country {
  name: string;
  code: string;
  flag: string;
}

export interface HistoricalPoint {
  date: string;
  price: number;
}