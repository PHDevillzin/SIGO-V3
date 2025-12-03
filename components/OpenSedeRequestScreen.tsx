
import React, { useState } from 'react';
import { PaperAirplaneIcon, XMarkIcon } from './Icons';
import SedeOrientationModal from './SedeOrientationModal';
import { Request, Criticality } from '../types';

interface OpenSedeRequestScreenProps {
  onClose: () => void;
  onSave?: (request: Request) => void;
}

const OpenSedeRequestScreen: React.FC<OpenSedeRequestScreenProps> = ({ onClose, onSave }) => {
  const [showOrientation, setShowOrientation] = useState(true);
  const [formData, setFormData] = useState({
    solicitante: '',
    gerencia: 'Administração do Sistema',
    titulo: '',
    objetivo: '',
    expectativaResultados: '',
    justificativa: '',
    resumoServicos: '',
    
    // Checkboxes
    aumento: [] as string[],
    necessidades: [] as string[],
    servicosNecessarios: [] as string[],

    // Quantitative
    areaIntervencao: '',
    prazoExecucao: '',
    inicioExecucao: '',
    valorExecucao: '',
    dataUtilizacao: '',

    // Files
    plantaBaixa: null,
    fotos: null,

    // Radios
    possuiProjeto: '',
    possuiLaudo: '',
    temAutorizacao: '',
    realizouConsulta: '',
    houveNotificacao: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (group: 'aumento' | 'necessidades' | 'servicosNecessarios', value: string) => {
    setFormData(prev => {
      const currentList = prev[group];
      if (currentList.includes(value)) {
        return { ...prev, [group]: currentList.filter(item => item !== value) };
      } else {
        return { ...prev, [group]: [...currentList, value] };
      }
    });
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
        // Format date from YYYY-MM-DD to DD/MM/YYYY
        const formatDate = (dateStr: string) => {
            if (!dateStr) return 'N/A';
            const [year, month, day] = dateStr.split('-');
            return `${day}/${month}/${year}`;
        };

        const newRequest: Request = {
            id: Math.floor(Math.random() * 100000) + 100, // Simple random ID
            criticality: Criticality.MEDIA, // Default
            unit: 'Sede',
            description: formData.titulo,
            status: 'Análise da Sol...',
            currentLocation: 'Sede',
            expectedStartDate: formatDate(formData.inicioExecucao),
            hasInfo: true,
            expectedValue: formData.valorExecucao || 'R$ 0,00',
            executingUnit: 'Sede',
            prazo: parseInt(formData.prazoExecucao) || 0,
            categoriaInvestimento: 'Baixa Complexidade', // Default for now
            entidade: formData.solicitante || 'Corporativo',
            ordem: `SS-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
            tipologia: '',
            situacaoProjeto: 'A Iniciar',
            situacaoObra: 'Não Iniciada',
            inicioObra: 'N/A',
            saldoObraPrazo: 0,
            saldoObraValor: 'R$ 0,00'
        };
        onSave(newRequest);
    }
    // Logic to save would go here
    onClose();
  };

  // Helper for rendering radio group
  const renderRadioGroup = (label: string, name: string, required: boolean = true) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center space-x-6">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value="Sim"
            checked={formData[name as keyof typeof formData] === 'Sim'}
            onChange={() => handleRadioChange(name, 'Sim')}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <span className="text-sm text-gray-600">Sim</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value="Nao"
            checked={formData[name as keyof typeof formData] === 'Nao'}
            onChange={() => handleRadioChange(name, 'Nao')}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <span className="text-sm text-gray-600">Não ou não tenho conhecimento</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
    {showOrientation && <SedeOrientationModal onConfirm={() => setShowOrientation(false)} />}
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md overflow-hidden my-6">
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <div>
            <h1 className="text-xl font-bold text-gray-800">Abrir uma solicitação</h1>
            <p className="text-sm text-gray-500 font-semibold">(Sede)</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        
        {/* Section 1: Basic Info */}
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Solicitante <span className="text-red-500">*</span></label>
                <select 
                    name="solicitante" 
                    value={formData.solicitante} 
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                    <option value="">Selecione uma opção</option>
                    <option value="SESI">SESI</option>
                    <option value="SENAI">SENAI</option>
                    <option value="Corporativo">Corporativo</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gerência <span className="text-red-500">*</span></label>
                <div className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-600">
                    {formData.gerencia}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breve descrição ou título do serviço <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Descrever brevemente o serviço a ser realizado"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo <span className="text-red-500">*</span></label>
                <textarea 
                    name="objetivo"
                    rows={2}
                    value={formData.objetivo}
                    onChange={handleChange}
                    placeholder="Detalhar objetivo da demanda"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expectativa de resultados <span className="text-red-500">*</span></label>
                <textarea 
                    name="expectativaResultados"
                    rows={2}
                    value={formData.expectativaResultados}
                    onChange={handleChange}
                    placeholder="Descrever os resultados esperados"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Justificativa <span className="text-red-500">*</span></label>
                <textarea 
                    name="justificativa"
                    rows={2}
                    value={formData.justificativa}
                    onChange={handleChange}
                    placeholder="Justificar a necessidade da demanda"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resumo dos Serviços <span className="text-red-500">*</span></label>
                <textarea 
                    name="resumoServicos"
                    rows={2}
                    value={formData.resumoServicos}
                    onChange={handleChange}
                    placeholder="Descrever em tópicos os serviços a serem realizados"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
            </div>
        </div>

        {/* Section 2: Checkboxes */}
        <div className="space-y-6 pt-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Após o término da demanda, haverá aumento de: <span className="text-red-500">*</span></label>
                <div className="space-y-2">
                    {['Pessoal', 'Produção', 'Não haverá aumento'].map(opt => (
                        <label key={opt} className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                checked={formData.aumento.includes(opt)}
                                onChange={() => handleCheckboxChange('aumento', opt)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-500">{opt}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selecione as necessidades da sede após execução da demanda: <span className="text-red-500">*</span></label>
                <div className="space-y-2">
                    {[
                        'Aquisição de mobiliário', 
                        'Aquisição de equipamentos gerais', 
                        'Aquisição de equipamentos de TI', 
                        'Instalação de Dados de Voz',
                        'Alteração nos Contratos Facilities',
                        'Não haverá necessidades ou alterações adicionais'
                    ].map(opt => (
                        <label key={opt} className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                checked={formData.necessidades.includes(opt)}
                                onChange={() => handleCheckboxChange('necessidades', opt)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-500">{opt}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selecione se algum dos serviços listados serão necessários à realização da demanda: <span className="text-red-500">*</span></label>
                <div className="space-y-2">
                    {[
                        'Diminuição ou demolição de áreas cobertas existentes de qualquer tipo',
                        'Construção de novos ambientes internos',
                        'Alteração de traçados de tubulações elétricas, hidráulicas ou de gases',
                        'Inclusão de pontos elétricos, hidráulicos ou de gases',
                        'Climatização de novas áreas',
                        'Nenhum serviço citado anteriormente'
                    ].map(opt => (
                        <label key={opt} className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                checked={formData.servicosNecessarios.includes(opt)}
                                onChange={() => handleCheckboxChange('servicosNecessarios', opt)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-500">{opt}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>

        {/* Section 3: Quantitative Inputs */}
        <div className="space-y-6 pt-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qual a expectativa da área de intervenção (m2)? (somente números) <span className="text-red-500">*</span></label>
                <input 
                    type="number" 
                    name="areaIntervencao"
                    value={formData.areaIntervencao}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qual a expectativa de prazo para execução (meses) <span className="text-red-500">*</span></label>
                <input 
                    type="number" 
                    name="prazoExecucao"
                    value={formData.prazoExecucao}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qual é a expectativa para início da execução (data aproximada) ? <span className="text-red-500">*</span></label>
                <input 
                    type="date" 
                    name="inicioExecucao"
                    value={formData.inicioExecucao}
                    onChange={handleChange}
                    placeholder="dd/mm/aaaa"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-500"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qual é a expectativa de valor para a execução da obra (em R$)? (somente números) <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    name="valorExecucao"
                    value={formData.valorExecucao}
                    onChange={handleChange}
                    placeholder="R$ 0,00"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qual a expectativa de data para utilização do local totalmente equipado? <span className="text-red-500">*</span></label>
                <input 
                    type="date" 
                    name="dataUtilizacao"
                    value={formData.dataUtilizacao}
                    onChange={handleChange}
                    placeholder="dd/mm/aaaa"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-500"
                />
            </div>
        </div>

        {/* Section 4: File Uploads */}
        <div className="space-y-6 pt-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Indicar em planta baixa a localização e área de intervenção: <span className="text-red-500">*</span></label>
                <div className="flex w-full border border-gray-300 rounded-md overflow-hidden">
                    <label className="bg-gray-100 text-gray-700 px-4 py-2 cursor-pointer border-r border-gray-300 hover:bg-gray-200 text-sm">
                        Escolher Arquivo
                        <input type="file" className="hidden" />
                    </label>
                    <span className="px-4 py-2 text-gray-500 text-sm flex items-center">Nenhum arquivo escolhido</span>
                </div>
            </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Incluir fotografias do local da intervenção: <span className="text-red-500">*</span></label>
                <div className="flex w-full border border-gray-300 rounded-md overflow-hidden">
                    <label className="bg-gray-100 text-gray-700 px-4 py-2 cursor-pointer border-r border-gray-300 hover:bg-gray-200 text-sm">
                        Escolher Arquivo
                        <input type="file" className="hidden" />
                    </label>
                    <span className="px-4 py-2 text-gray-500 text-sm flex items-center">Nenhum arquivo escolhido</span>
                </div>
            </div>
        </div>

        {/* Section 5: Yes/No Questions */}
        <div className="space-y-6 pt-4">
            {renderRadioGroup('A demanda possui algum projeto de construção elaborado ou contratado pela Sede?', 'possuiProjeto')}
            {renderRadioGroup('A demanda possui algum laudo, relatório técnico ou documento complementar elaborado ou contratado pela Sede?', 'possuiLaudo')}
            {renderRadioGroup('A Sede tem autorização da Prefeitura para realizar a demanda?', 'temAutorizacao')}
            {renderRadioGroup('A Sede realizou consulta à Prefeitura quanto ao tempo médio de aprovação do processo?', 'realizouConsulta')}
            {renderRadioGroup('Houve notificação a algum órgão público sobre a realização da demanda?', 'houveNotificacao')}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center pt-8 space-x-4">
            <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#8B5CF6] text-white font-semibold rounded-md hover:bg-purple-700 transition-colors flex items-center"
            >
                <span className="mr-2 text-lg font-bold">×</span> Cancelar
            </button>
            <button
                type="submit"
                className="px-6 py-2.5 bg-[#0EA5E9] text-white font-semibold rounded-md hover:bg-sky-600 transition-colors flex items-center space-x-2"
            >
                <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                <span>Enviar</span>
            </button>
        </div>

      </form>
    </div>
    </>
  );
};

export default OpenSedeRequestScreen;
