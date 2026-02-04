
import React from 'react';
import { XMarkIcon, ArrowDownTrayIcon, DocumentTextIcon } from './Icons';
import type { Request } from '../types';

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
}

const ReadOnlyField: React.FC<{ label: string; value: string; fullWidth?: boolean }> = ({ label, value, fullWidth = false }) => (
  <div className={`mb-4 ${fullWidth ? 'col-span-2' : 'col-span-1'}`}>
    <label className="block text-sm font-semibold text-gray-700 mb-1">{label}:</label>
    <div className="w-full bg-[#F3F4F6] border border-gray-200 rounded-md px-3 py-2 text-gray-600 text-sm">
      {value || '-'}
    </div>
  </div>
);

const TextAreaField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="mb-4 col-span-2">
    <label className="block text-sm font-semibold text-gray-700 mb-1">{label}:</label>
    <div className="w-full bg-[#F3F4F6] border border-gray-200 rounded-md px-3 py-2 text-gray-600 text-sm min-h-[60px]">
      {value || '-'}
    </div>
  </div>
);

const AttachmentItem: React.FC<{ name: string; type: 'pdf' | 'image' }> = ({ name, type }) => (
  <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg mb-3">
    <div className="flex items-center space-x-3 overflow-hidden">
      <div className="flex-shrink-0">
         <DocumentTextIcon className="w-8 h-8 text-sky-500" />
      </div>
      <span className="text-sm text-gray-700 truncate font-medium" title={name}>{name}</span>
    </div>
    <button className="p-2 bg-[#0EA5E9] text-white rounded-md hover:bg-sky-600 transition-colors">
      <ArrowDownTrayIcon className="w-5 h-5" />
    </button>
  </div>
);

const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({ isOpen, onClose, request }) => {
  const [activeTab, setActiveTab] = React.useState<'detalhes' | 'movimentos' | 'ciencia'>('detalhes');

  const [movements, setMovements] = React.useState<any[]>([]);
  const [loadingMovements, setLoadingMovements] = React.useState(false);

  React.useEffect(() => {
    if (activeTab === 'movimentos' && request?.id) {
        setLoadingMovements(true);
        fetch(`/api/movements?requestId=${request.id}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setMovements(data);
                }
            })
            .catch(err => console.error('Failed to fetch movements:', err))
            .finally(() => setLoadingMovements(false));
    }
  }, [activeTab, request?.id]);

  if (!isOpen || !request) return null;

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    // If ISODate (contains T), split by T. Valid for YYYY-MM-DD too.
    const datePart = dateStr.split('T')[0];
    const [year, month, day] = datePart.split('-');
    if (!day) return dateStr; // fallback
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[90%] h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-[#0B1A4E]">Detalhes</h2>
              <p className="text-sm text-gray-500">Solicitação #{request.id || 'N/A'}</p>
            </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-gray-200">
            <div className="flex space-x-6">
                <button 
                    onClick={() => setActiveTab('detalhes')}
                    className={`pb-3 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'detalhes' 
                        ? 'border-[#0EA5E9] text-[#0EA5E9]' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Detalhes solicitação
                </button>
                <button 
                    onClick={() => setActiveTab('movimentos')}
                    className={`pb-3 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'movimentos' 
                        ? 'border-[#0EA5E9] text-[#0EA5E9]' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Movimentos de solicitação
                </button>
                <button 
                    onClick={() => setActiveTab('ciencia')}
                    className={`pb-3 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'ciencia' 
                        ? 'border-[#0EA5E9] text-[#0EA5E9]' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                   Manifestação/Ciência
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {activeTab === 'detalhes' && (
                <div className="flex flex-col gap-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Column: Form Data */}
                    <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
                        <div className="grid grid-cols-2 gap-x-4">
                            <ReadOnlyField label="Entidade" value={request.entidade || 'SESI'} />
                            <ReadOnlyField label="Categoria" value={request.categoriaInvestimento || 'Reforma Operacional'} />
                            
                            <ReadOnlyField label="Unidade" value={request.unit} />
                            <ReadOnlyField label="Criticidade" value={request.criticality} />
                            
                            <ReadOnlyField label="Plano diretor" value={'-'} />
                            <ReadOnlyField label="CAT" value={request.unit || '-'} /> 
                            
                            <TextAreaField label="Descrição" value={request.description} />
                            <TextAreaField label="Objetivo" value={request.objetivo || '-'} />
                            <TextAreaField label="Justificativa" value={request.justificativa || '-'} />
                            <TextAreaField label="Resumo dos Serviços" value={request.resumoServicos || '-'} />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-x-4 mt-2">
                            <ReadOnlyField label="Valor esperado" value={request.expectedValue} />
                            <ReadOnlyField label="Início esperado" value={formatDate(request.expectedStartDate)} />
                            <ReadOnlyField label="Início uso esperado" value={formatDate(request.dataUtilizacao)} />
                            
                            <ReadOnlyField label="Área Responsável" value={request.areaResponsavel || '-'} />
                            <ReadOnlyField label="Áreas Envolvidas" value={request.areasEnvolvidas || '-'} />
                            <ReadOnlyField label="Referência" value={request.referencia || '-'} />
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 mt-2">
                             <TextAreaField label="Expectativa de Resultados" value={request.expectativaResultados || '-'} />
                             <TextAreaField label="Programa de Necessidades" value={request.programaNecessidades || '-'} />
                             <TextAreaField label="Instalações SESI/SENAI próximas" value={request.instalacoesSesiSenai || '-'} />
                        </div>

                        <div className="mt-4 border-t pt-4">
                            <h4 className="font-bold text-gray-800 mb-2">Informações Complementares</h4>
                            <div className="grid grid-cols-2 gap-x-4 text-sm">
                                <ReadOnlyField label="Possui Projeto?" value={request.possuiProjeto || '-'} />
                                <ReadOnlyField label="Possui Laudo?" value={request.possuiLaudo || '-'} />
                                <ReadOnlyField label="Tem Autorização?" value={request.temAutorizacao || '-'} />
                                <ReadOnlyField label="Realizou Consulta?" value={request.realizouConsulta || '-'} />
                                <ReadOnlyField label="Houve Notificação?" value={request.houveNotificacao || '-'} />
                                <ReadOnlyField label="Local da Obra" value={request.localObra || '-'} />
                            </div>
                        </div>

                        {/* Risk Assessment Section */}
                        {(request.problemasNaoAtendida || request.prazoAcao || request.probabilidadeEvolucao) && (
                            <div className="mt-4 border-t pt-4">
                                <h4 className="font-bold text-gray-800 mb-2">Avaliação de Risco</h4>
                                <div className="grid grid-cols-1 gap-y-2">
                                    <ReadOnlyField label="Problemas se não atendida" value={request.problemasNaoAtendida || '-'} fullWidth />
                                    <div className="grid grid-cols-2 gap-x-4">
                                         <ReadOnlyField label="Prazo de Ação" value={request.prazoAcao || '-'} />
                                         <ReadOnlyField label="Probabilidade de Evolução" value={request.probabilidadeEvolucao || '-'} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Checkbox Arrays Section */}
                        {(request.aumento?.length > 0 || request.necessidades?.length > 0 || request.servicosNecessarios?.length > 0 || request.servicosEspecificos?.length > 0) && (
                             <div className="mt-4 border-t pt-4">
                                <h4 className="font-bold text-gray-800 mb-2">Detalhamento Técnico</h4>
                                <div className="space-y-4">
                                    {request.aumento?.length > 0 && <TextAreaField label="Aumento Previsto" value={request.aumento.join(', ')} />}
                                    {request.necessidades?.length > 0 && <TextAreaField label="Necessidades Pós-Execução" value={request.necessidades.join(', ')} />}
                                    {request.servicosNecessarios?.length > 0 && <TextAreaField label="Serviços Necessários" value={request.servicosNecessarios.join(', ')} />}
                                    {request.servicosEspecificos?.length > 0 && <TextAreaField label="Serviços Específicos" value={request.servicosEspecificos.join(', ')} />}
                                </div>
                             </div>
                        )}
                    </div>

                    {/* Right Column: Attachments */}
                    <div className="w-full lg:w-1/3">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Anexos</h3>
                        <div className="space-y-4">
                            <div className="text-sm text-gray-500 italic">Nenhum anexo disponível.</div>
                        </div>
                    </div>
                </div>
                </div>
            )}

            {activeTab === 'movimentos' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    {loadingMovements ? (
                        <div className="p-10 text-center text-gray-500">Carregando movimentos...</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {movements.length > 0 ? movements.map((move, idx) => (
                                    <tr key={idx}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(move.created_at).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {move.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{move.user_name || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{move.user_department || '-'}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Nenhum movimento registrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {activeTab === 'ciencia' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                     <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OBSERVAÇÕES</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RESPONSÁVEL</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {request.manifestations && request.manifestations.length > 0 ? request.manifestations.map((manif, idx) => {
                                const isFilled = manif.text && manif.text.length > 0;
                                if (!isFilled) return null; // Don't show empty pending manifestations in the log? Or show as pending?
                                // Requirement: "Data/Hora - Mostrará quando a ciência ou manifestação foi feita."
                                // If not done, it has no date/user usually in our logic, so we skip pending or show them?
                                // The requirement says "esse registro deverá ser feito nesta aba". implying the record of the ACTION.
                                // So we only show completed ones.

                                return (
                                <tr key={idx}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {manif.date ? new Date(manif.date).toLocaleString('pt-BR') : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {/* Status: Ciente or Comment */}
                                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${manif.text === 'Ciente' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {manif.text === 'Ciente' ? 'Ciente' : (manif.text.length > 50 ? manif.text.substring(0,50) + '...' : manif.text)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manif.user || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manif.area || '-'}</td>
                                </tr>
                            )}) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Nenhuma manifestação/ciência registrada.</td>
                                </tr>
                            )}
                            
                            {/* Filter out nulls from map if we decided to hide pending */}
                             {request.manifestations && request.manifestations.filter(m => m.text && m.text.length > 0).length === 0 && (
                                 !request.manifestations || request.manifestations.length === 0 ? null : (
                                      <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Nenhuma manifestação/ciência registrada.</td>
                                    </tr>
                                 )
                             )}

                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;
