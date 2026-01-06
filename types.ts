
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
  tipologia?: string;
  // New fields for Reclassification view
  situacaoProjeto?: string;
  situacaoObra?: string;
  inicioObra?: string;
  saldoObraPrazo?: number;
  saldoObraValor?: string;
  // New field for Approval view
  gestorLocal?: string;
}

export interface User {
  id: string;
  nif: string;
  name: string;
  email: string;
  unidade: string;
  profile: string;
  createdBy: string;
  createdAt: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
  updatedAt: string;
  // Fields added after registration
  sigoProfiles?: string[];
  linkedUnits?: string[];
  registrationDate?: string;
}

export interface Unit {
  id: number;
  codigoUnidade: string;
  entidade: 'SESI' | 'SENAI';
  tipo: string;
  centro: string;
  cat: string;
  unidade: string;
  cidade: string;
  bairro: string;
  endereco: string;
  cep: string;
  re: string;
  responsavelRE: string;
  ra: string;
  responsavelRA: string;
  responsavelRAR: string;
  tipoDeUnidade: string;
  unidadeResumida: string;
  gerenteRegional: string;
  emailGR: string;
  site: string;
  latitude: string;
  longitude: string;
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
  reclassified?: boolean;
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
  entidade?: string;
  categoria?: string;
  tipologia?: string;
  changes?: Partial<PlanningData>; // Stores original values of changed fields
}

export interface AccessProfile {
  id: string;
  name: string;
  permissions: string[]; // List of view IDs or functionality names
}
