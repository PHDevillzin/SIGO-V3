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
  prazo?: number;
  categoriaInvestimento?: string;
  entidade?: string;
  ordem?: string;
}

export interface SummaryData {
    title: string;
    count: number;
    value: string;
    color: string;
    icon: ElementType;
}

export interface PlanningData {
  id: number;
  criticidade: Criticality;
  ordem: string;
  unidade: string;
  descricao: string;
  situacaoObra: string;
  situacaoProjeto: string;
  status: string;
  inicioProjeto: string;
  saldoProjetoPrazo: number; // in months
  saldoProjetoValor: string;
  inicioObra: string;
  saldoObraPrazo: number; // in months
  saldoObraValor: string;
  terminoProjeto: string;
  terminoObra: string;
  empenho2026: string;
  empenho2027: string;
  empenho2028: string;
  empenho2029: string;
  empenho2030: string;
}