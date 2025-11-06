import React, { useState, useMemo, useEffect } from 'react';
import { XMarkIcon, PencilIcon, PlusIcon, MinusIcon } from './Icons';
import type { PlanningData } from '../types';

interface PlurianualDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PlanningData | null;
  initialTab?: 'details' | 'financial';
}

const ReadOnlyField: React.FC<{ label: string; value: string | React.ReactNode; large?: boolean; className?: string; id: string }> = ({ label, value, large = false, className, id }) => (
    <div className={className}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div id={id} className={`mt-1 block w-full bg-gray-100 border border-gray-200 rounded-lg shadow-sm p-2 text-gray-900 text-sm ${large ? 'h-32' : 'h-10 flex items-center'}`}>
            {value}
        </div>
    </div>
);

// Helper functions for FinancialInfoTab
const parseCurrencyToNumber = (value: string): number => {
    if (!value || typeof value !== 'string') return 0;
    return parseFloat(value.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));
};

const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const parseDate = (dateStr: string): Date | null => {
    if (!dateStr || dateStr === 'N/A' || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        return null;
    }
    const [day, month, year] = dateStr.split('/').map(Number);
    // Month is 0-indexed in JS Date
    return new Date(year, month - 1, day);
};

interface FinancialInfoTabProps {
  data: PlanningData;
  valorHomologado: number;
}

const FinancialInfoTab: React.FC<FinancialInfoTabProps> = ({ data, valorHomologado }) => {
    const [expandedYears, setExpandedYears] = useState<{ [key: number]: boolean }>({});
    
    const toggleYear = (year: number) => {
        setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
    };

    const monthlyCommitments = useMemo(() => {
        const commitments: { [year: number]: number[] } = {};
        // Initialize for a reasonable range of years
        for (let year = 2024; year <= 2035; year++) {
            commitments[year] = Array(12).fill(0);
        }

        const distributeValue = (valueStr: string, startDateStr: string, durationMonths: number) => {
            const totalCents = Math.round(parseCurrencyToNumber(valueStr) * 100);
            const startDate = parseDate(startDateStr);

            if (totalCents <= 0 || !startDate || durationMonths <= 0) {
                return;
            }

            const monthlyCents = Math.floor(totalCents / durationMonths);
            let remainderCents = totalCents % durationMonths;
            
            let currentDate = new Date(startDate);
            for (let i = 0; i < durationMonths; i++) {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                
                let centsForThisMonth = monthlyCents;
                if (remainderCents > 0) {
                    centsForThisMonth++;
                    remainderCents--;
                }
                
                if (commitments[year]) {
                    commitments[year][month] += centsForThisMonth / 100.0;
                }
                
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        };

        distributeValue(data.saldoProjetoValor, data.inicioProjeto, data.saldoProjetoPrazo);
        distributeValue(data.saldoObraValor, data.inicioObra, data.saldoObraPrazo);
        
        return commitments;
    }, [data]);
    
    const commitmentData = useMemo(() => {
        return Object.keys(monthlyCommitments)
            .map(Number)
            .map(year => ({
                year,
                value: monthlyCommitments[year].reduce((sum, v) => sum + v, 0)
            }))
            .filter(item => item.value > 0.001); // Filter out years with no significant commitment
    }, [monthlyCommitments]);


    const totalPrevisoes = commitmentData.reduce((sum, item) => sum + item.value, 0);
    const formattedTotalPrevisoes = formatCurrency(totalPrevisoes);
    const valorHomologadoString = formatCurrency(valorHomologado);
    
    const valuesMismatch = Math.abs(totalPrevisoes - valorHomologado) > 0.01;

    const InfoRow: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
        <div className={`grid grid-cols-2 ${className}`}>
            <span className="text-gray-500">{label}:</span>
            <span className="font-semibold text-gray-800">{value}</span>
        </div>
    );
    
    const YearRow: React.FC<{
        label: string;
        value: string;
        isExpanded: boolean;
        toggle: () => void;
        children?: React.ReactNode;
    }> = ({ label, value, isExpanded, toggle, children }) => (
        <div>
            <div className="flex justify-between items-center p-2 bg-gray-100 border-b">
                <span className="font-semibold text-gray-600">{label}:</span>
                <div className="flex items-center space-x-4">
                    <span className="font-bold text-gray-800">{value}</span>
                    <button onClick={toggle} className="text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed" disabled={parseCurrencyToNumber(value) === 0}>
                        {isExpanded ? <MinusIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
            {isExpanded && children}
        </div>
    );

    return (
        <div className="text-sm">
            <div className="flex justify-between items-center bg-[#0B1A4E] text-white p-2 rounded-t-md">
                <h3 className="font-bold">Previsões de Empenho</h3>
                <button className="flex items-center space-x-1 text-sm bg-transparent border-none text-white hover:underline">
                    <PencilIcon className="w-4 h-4" />
                    <span>Editar</span>
                </button>
            </div>
            <div className="border border-t-0 p-4 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 p-4 bg-gray-50 rounded-md">
                    <InfoRow label="Valor Homologado" value={valorHomologadoString} />
                    <div></div> {/* empty div for alignment */}
                    <InfoRow label="Início Serviço" value="Capital" />
                    <div></div>
                    <InfoRow label="Início Pagamento" value="Em execução" />
                    <InfoRow label="Término Pagamento" value="Obra em 2024" />
                    <InfoRow label="Prazo (meses)" value={`${data.saldoProjetoPrazo + data.saldoObraPrazo}`} />
                    <InfoRow label="Observações (Prazo)" value="Novas Construções" />
                </div>
                
                <div className="space-y-1">
                    {commitmentData.length > 0 ? commitmentData.map(item => (
                        <YearRow
                            key={item.year}
                            label={`Previsão Empenho ${item.year}`}
                            value={formatCurrency(item.value)}
                            isExpanded={!!expandedYears[item.year]}
                            toggle={() => toggleYear(item.year)}
                        >
                            <div className="pl-4">
                                {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((monthName, index) => (
                                    <div key={index} className="flex justify-between p-2 bg-[#EAF3F3] border-b border-white">
                                        <span className="text-gray-700">{monthName}</span>
                                        <span className="font-semibold text-gray-800">{formatCurrency(monthlyCommitments[item.year]?.[index] || 0)}</span>
                                    </div>
                                ))}
                            </div>
                        </YearRow>
                    )) : (
                        <p className="text-center text-gray-500 py-4">Não há previsões de empenho com os dados atuais.</p>
                    )}
                </div>

                <div className="flex justify-between items-center p-2 bg-gray-200 mt-4 rounded-md">
                    <span className="font-bold text-gray-700">Total Previsto:</span>
                    <span className="font-bold text-gray-800">{formattedTotalPrevisoes}</span>
                </div>
                {valuesMismatch && (
                    <div className="mt-2 p-3 bg-red-100 border-l-4 border-red-500 text-red-700" role="alert">
                        <p className="font-bold">Atenção</p>
                        <p>A soma das previsões calculadas ({formattedTotalPrevisoes}) é diferente do Valor Homologado ({valorHomologadoString}). Verifique os dados de início e prazo do projeto/obra.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


const PlurianualDetailsModal: React.FC<PlurianualDetailsModalProps> = ({ isOpen, onClose, data, initialTab }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'details');
  
  useEffect(() => {
    if (isOpen) {
        setActiveTab(initialTab || 'details');
    }
  }, [isOpen, initialTab]);

  if (!isOpen || !data) {
    return null;
  }
  
  const projectValue = parseCurrencyToNumber(data.saldoProjetoValor);
  const workValue = parseCurrencyToNumber(data.saldoObraValor);
  const valorHomologado = projectValue + workValue;
  const totalValue = formatCurrency(valorHomologado);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="details-modal-title">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 id="details-modal-title" className="text-xl font-semibold text-gray-800">Detalhes plurianual</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Fechar">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b">
            <nav className="flex space-x-4">
                <button
                    onClick={() => setActiveTab('details')}
                    className={`py-2 px-1 font-medium text-sm ${activeTab === 'details' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Detalhes
                </button>
                <button
                    onClick={() => setActiveTab('financial')}
                    className={`py-2 px-1 font-medium text-sm ${activeTab === 'financial' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Previsões de Empenho
                </button>
            </nav>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto p-6">
            {activeTab === 'details' && (
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
            )}
            {activeTab === 'financial' && <FinancialInfoTab data={data} valorHomologado={valorHomologado} />}
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

export default PlurianualDetailsModal;