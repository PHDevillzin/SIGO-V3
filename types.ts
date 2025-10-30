import type { ElementType } from 'react';

export enum Criticality {
  IMEDIATA = 'Imediata',
  CRITICA = 'Crítica',
  MEDIA = 'Média',
  MINIMA = 'Mínima',
}

export interface Request {
  id: number;
  criticality: Criticality;
  unit: string;
  description: string;
  status: string;
  currentLocation: string;
  expectedStartDate: string;
  hasInfo: boolean;
  expectedValue: string;
  executingUnit: string;
}

export interface SummaryData {
    title: string;
    count: number;
    value: string;
    color: string;
    icon: ElementType;
}