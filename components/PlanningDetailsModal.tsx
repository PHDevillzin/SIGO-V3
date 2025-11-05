import React from 'react';
import { XMarkIcon } from './Icons';
import type { PlanningData } from '../types';

interface PlanningDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PlanningData | null;
}

const ReadOnlyField: React.FC<{ label: string; value: string | React.ReactNode; large?: boolean; className?: string; id: string }> = ({ label, value, large = false, className, id }) => (
    <div className={className}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div id={id} className={`mt-1 block w-full bg-gray-100 border border-gray-200 rounded-lg shadow-sm p-2 text-gray-900 text-sm ${large ? 'h-32' : 'h-10 flex items-center'}`}>
            {value}
        </div>
    </div>
);

// Helper functions
const parseCurrencyToNumber = (value: string): number => {
    if (!value || typeof value !== 'string') return 0;
    return parseFloat(value.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));
};

const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};


const PlanningDetailsModal: React.FC<PlanningDetailsModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) {
    return null;
  }
  
  const projectValue = parseCurrencyToNumber(data.saldoProjetoValor);
  const workValue = parseCurrencyToNumber(data.saldoObraValor);
  const totalValue = formatCurrency(projectValue + workValue);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="details-modal-title">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 id="details-modal-title" className="text-xl font-semibold text-gray-800">Detalhes do planejamento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Fechar">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <ReadOnlyField id="entidade" label="Entidade:" value="SENAI" />
                        <ReadOnlyField id="unidade" label="Unidade:" value={data.unidade} />
                        <ReadOnlyField id="tipologia" label="Tipologia:" value="Reforma Estratégica" />
                        <ReadOnlyField id="descricao" label="Descrição:" value={data.descricao} />
                        <ReadOnlyField id="objetivo" label="Objetivo:" value="Melhorar a infraestrutura da unidade para atender às novas demandas de cursos." />
                        <ReadOnlyField id="justificativa" label="Justificativa:" value="A estrutura atual está obsoleta e não comporta os novos equipamentos necessários." />
                        <ReadOnlyField id="resumo_servicos" label="Resumo dos Serviços:" value="Reforma geral das salas, troca de piso, pintura e instalação de novos pontos de energia." />
                    </div>
                    {/* Right Column */}
                    <div className="space-y-4">
                        <ReadOnlyField id="categoria" label="Categoria:" value="Reforma Operacional" />
                        <ReadOnlyField id="criticidade" label="Criticidade:" value={data.criticidade} />
                        <ReadOnlyField id="origem" label="Origem:" value="Demanda da Unidade" />
                        <ReadOnlyField id="situacao_projeto" label="Situação do Projeto:" value={data.situacaoProjeto} />
                        <ReadOnlyField id="situacao_obra" label="Situação da Obra:" value={data.situacaoObra} />
                        <ReadOnlyField id="status" label="Status:" value={data.status} />
                        <ReadOnlyField id="unidade_executora" label="Unidade Executora:" value="GSO" />
                        <ReadOnlyField id="observacoes" label="Observações:" value="A obra deve ser realizada durante o período de férias para não impactar as aulas." large />
                    </div>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 pt-4 border-t mt-4">
                     <ReadOnlyField id="valor_esperado" label="Valor esperado:" value={totalValue} />
                     <ReadOnlyField id="inicio_esperado" label="Início esperado:" value={data.inicioProjeto !== 'N/A' ? data.inicioProjeto : data.inicioObra} />
                     <ReadOnlyField id="inicio_uso_esperado" label="Início uso esperado:" value="05/05/2026" />
                     <ReadOnlyField id="area" label="Área (m²):" value="1.200" />
                </div>
            </div>
        </div>
         <div className="flex justify-end items-center p-4 border-t bg-gray-50 space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
              Fechar
            </button>
        </div>
      </div>
    </div>
  );
};

export default PlanningDetailsModal;