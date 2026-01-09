
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
  // New creation fields
  solicitante?: string;
  gerencia?: string;
  objetivo?: string;
  expectativaResultados?: string;
  justificativa?: string;
  resumoServicos?: string;
  aumento?: string[];
  necessidades?: string[];
  servicosNecessarios?: string[];
  servicosEspecificos?: string[];
  areaIntervencao?: number;
  dataUtilizacao?: string;
  possuiProjeto?: string;
  possuiLaudo?: string;
  temAutorizacao?: string;
  realizouConsulta?: string;
  houveNotificacao?: string;
  referencia?: string;
  areaResponsavel?: string;
  areasEnvolvidas?: string;
  programaNecessidades?: string;
  instalacoesSesiSenai?: string;
  localObra?: string;
  atividade?: string;
  local?: string;
  problemasNaoAtendida?: string;
  prazoAcao?: string;
  probabilidadeEvolucao?: string;
  observacao?: string;
}

export interface User {
  id: string;
  nif: string;
  name: string;
  email: string;
  // unidade: string; // Deprecated
  // profile: string; // Deprecated
  createdBy: string;
  createdAt: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
  updatedAt: string;
  // Fields added after registration
  sigoProfiles?: string[];
  linkedUnits?: string[];
  registrationDate?: string;
  instituicao?: string;
  isActive?: boolean;
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
  status: boolean;
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
  category?: 'SESI' | 'SENAI' | 'CORPORATIVO' | 'GERAL';
  permissions: string[];
  isActive?: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  lastAction?: 'Cadastro' | 'Edição' | 'Inativação' | 'Reativação';
}

export interface Tipologia {
  id: number;
  titulo: string;
  descricao: string;
  dataInclusao: string;
  criadoPor: string;
  status: boolean;
}

export interface TipoLocal {
  id: number;
  descricao: string;
  dataInclusao: string;
  criadoPor: string;
  status: boolean;
}
