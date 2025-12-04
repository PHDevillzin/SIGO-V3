
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
  if (!isOpen || !request) return null;

  // Mock data to match the image fidelity where the Request object might lack specific fields
  const mockData = {
    planoDiretor: 'Não',
    cat: '-',
    descricao: request.description.length > 20 ? request.description : 'reforma do balneário do CAT Cubatão - 6 piscinas, 2 casas de máquinas e a esplanada toda',
    objetivo: 'melhor atendimento do usuário e aluno da escola que atualmente está utilizando a instalação parcialmente devido ao fechamento de 2 piscinas que estão com problemas de vazamento e otimização dos recursos físicos, materiais e financeiros devido as constantes manutenção e aumento da demanda para o tratamento das piscinas',
    justificativa: 'Atualmente o balneário está com diversas áreas de desnível de piso, podendo acarretar acidentes, 2 piscinas fechadas devido a vazamentos e as casas de máquinas obsoletas, os azulejos das piscinas estão velhos e constantemente quebram causando acidentes nos frequentadores do espaço. O balneário possui uma alta demanda de utilização, chegando a ter no verão 2.000 pessoas por dia.',
    resumo: 'reforma das 6 piscinas, reforma das 2 casas de máquinas e troca de todo o piso da esplanada',
    inicioUso: '02/01/2028'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[90%] h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#0B1A4E]">Detalhes</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-gray-200">
            <div className="flex space-x-6">
                <button className="pb-3 border-b-2 border-[#0EA5E9] text-[#0EA5E9] font-medium text-sm">
                    Detalhes solicitação
                </button>
                <button className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
                    Movimentos de solicitação
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column: Form Data */}
                <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
                    <div className="grid grid-cols-2 gap-x-4">
                        <ReadOnlyField label="Entidade" value={request.entidade || 'SESI'} />
                        <ReadOnlyField label="Categoria" value={request.categoriaInvestimento || 'Reforma Operacional'} />
                        
                        <ReadOnlyField label="Unidade" value={request.unit} />
                        <ReadOnlyField label="Criticidade" value={request.criticality} />
                        
                        <ReadOnlyField label="Plano diretor" value={mockData.planoDiretor} />
                        <ReadOnlyField label="CAT" value={mockData.cat} />
                        
                        <TextAreaField label="Descrição" value={mockData.descricao} />
                        <TextAreaField label="Objetivo" value={mockData.objetivo} />
                        <TextAreaField label="Justificativa" value={mockData.justificativa} />
                        <TextAreaField label="Resumo dos Serviços" value={mockData.resumo} />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-x-4 mt-2">
                        <ReadOnlyField label="Valor esperado" value={request.expectedValue} />
                        <ReadOnlyField label="Início esperado" value={request.expectedStartDate} />
                        <ReadOnlyField label="Início uso esperado" value={mockData.inicioUso} />
                    </div>
                </div>

                {/* Right Column: Attachments */}
                <div className="w-full lg:w-1/3">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Anexos</h3>
                    <div className="space-y-4">
                        <AttachmentItem 
                            name="relatorio_de_vistoria_tecnica_cubatao_assinado_assinado.pdf-DocumentoTecnicoResposta-20251112_143658.pdf" 
                            type="pdf" 
                        />
                        <AttachmentItem 
                            name="areabalneario.png-PlantaBaixa-20251112_143658.png" 
                            type="image" 
                        />
                        <AttachmentItem 
                            name="dji_0819.jpg-FotografiasLocal-20251112_143658.JPG" 
                            type="image" 
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;
