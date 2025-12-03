
import React, { useState } from 'react';
import { PaperAirplaneIcon, XMarkIcon } from './Icons';
import { Request, Criticality } from '../types';

interface OpenStrategicRequestScreenProps {
  onClose: () => void;
  onSave?: (request: Request) => void;
}

const OpenStrategicRequestScreen: React.FC<OpenStrategicRequestScreenProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    referencia: '',
    
    // Checkboxes Group 1
    aumento: [] as string[],
    
    // Text Fields
    titulo: '',
    objetivo: '',
    expectativaResultados: '',
    justificativa: '',
    resumoServicos: '',
    
    // Areas
    areaResponsavel: 'Administração do Sistema',
    areasEnvolvidas: '',

    // Checkboxes Group 2
    necessidades: [] as string[],

    // Quantitative
    areaIntervencao: '',
    prazoExecucao: '',
    inicioExecucao: '',
    valorExecucao: '',
    dataUtilizacao: '',

    // Details
    programaNecessidades: '',
    instalacoesSesiSenai: '',

    // Files ( placeholders )
    arquivoUpload: null,
    estudoMercado: null,

    // Radios
    localObra: '',
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

  const handleCheckboxChange = (group: 'aumento' | 'necessidades', value: string) => {
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
            id: Math.floor(Math.random() * 100000) + 100,
            criticality: Criticality.MEDIA,
            unit: 'Nova Unidade',
            description: formData.titulo || 'Solicitação Estratégica',
            status: 'Análise da Sol...',
            currentLocation: 'GSO',
            expectedStartDate: formatDate(formData.inicioExecucao),
            hasInfo: true,
            expectedValue: formData.valorExecucao ? `R$ ${formData.valorExecucao}` : 'R$ 0,00',
            executingUnit: 'GSO',
            prazo: parseInt(formData.prazoExecucao) || 0,
            categoriaInvestimento: 'Intervenção Estratégica',
            entidade: 'SENAI',
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
    onClose();
  };

  const renderRadioGroup = (label: string, name: string, options: {label: string, value: string}[], required: boolean = true) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="space-y-2">
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center space-x-2 cursor-pointer">
            <input
                type="radio"
                name={name}
                value={opt.value}
                checked={formData[name as keyof typeof formData] === opt.value}
                onChange={() => handleRadioChange(name, opt.value)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="text-sm text-gray-600">{opt.label}</span>
            </label>
          ))}
      </div>
    </div>
  );

  const renderYesNoRadioGroup = (label: string, name: string) => (
      renderRadioGroup(label, name, [
          { label: 'Não ou não tenho conhecimento', value: 'Nao' },
          { label: 'Sim', value: 'Sim' }
      ])
  );

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md overflow-hidden my-6">
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <div>
            <h1 className="text-xl font-bold text-gray-800">Abrir uma solicitação</h1>
            <p className="text-sm text-gray-500 font-semibold">(Estratégica)</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        
        {/* Section 1: Classification */}
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">A demanda refere-se a: <span className="text-red-500">*</span></label>
                <select 
                    name="referencia" 
                    value={formData.referencia} 
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-600"
                >
                    <option value="">Selecione uma opção</option>
                    <option value="Nova Obra">Nova Obra</option>
                    <option value="Reforma">Reforma</option>
                    <option value="Ampliação">Ampliação</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Após o término da demanda, haverá aumento de: <span className="text-red-500">*</span></label>
                <div className="space-y-2">
                    {['Pessoal', 'Produção', 'Receitas de serviço ou custeio', 'Não haverá aumento'].map(opt => (
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
        </div>

        {/* Section 2: Text Fields */}
        <div className="space-y-6">
             {[
                { label: 'Breve descrição ou título do serviço', name: 'titulo', placeholder: 'Descrever brevemente o serviço a ser realizado' },
                { label: 'Objetivo', name: 'objetivo', placeholder: 'Detalhar objetivo da demanda' },
                { label: 'Expectativa de resultados', name: 'expectativaResultados', placeholder: 'Descrever os resultados esperados' },
                { label: 'Justificativa', name: 'justificativa', placeholder: 'Justificar a necessidade da demanda' },
                { label: 'Resumo dos Serviços', name: 'resumoServicos', placeholder: 'Descrever em tópicos os serviços a serem realizados' }
             ].map((field) => (
                <div key={field.name}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{field.label} <span className="text-red-500">*</span></label>
                    <input 
                        type="text"
                        name={field.name}
                        value={formData[field.name as keyof typeof formData] as string}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
             ))}
        </div>

        {/* Section 3: Responsibility */}
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Área Fim responsável pela aprovação <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    value={formData.areaResponsavel} 
                    disabled
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Áreas Fim a serem envolvidas: <span className="text-red-500">*</span></label>
                {/* Placeholder for a multi-select or similar component as per image it seems empty/custom */}
                <input 
                    type="text" 
                    name="areasEnvolvidas"
                    value={formData.areasEnvolvidas} 
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>
        </div>

        {/* Section 4: Needs */}
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Selecione as necessidades da unidade após a execução da demanda: <span className="text-red-500">*</span></label>
            <div className="space-y-2">
                {[
                    'Aquisição de mobiliário', 
                    'Aquisição de equipamentos gerais', 
                    'Aquisição de equipamentos de TI', 
                    'Instalação de Dados e Voz',
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

        {/* Section 5: Quantitative */}
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Qual a expectativa da área de intervenção (m2)? (somente números) <span className="text-red-500">*</span></label>
                <input 
                    type="number" 
                    name="areaIntervencao"
                    value={formData.areaIntervencao}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Qual a expectativa de prazo para execução (meses) <span className="text-red-500">*</span></label>
                <input 
                    type="number" 
                    name="prazoExecucao"
                    value={formData.prazoExecucao}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Qual é a expectativa para início da execução (data aproximada) ? <span className="text-red-500">*</span></label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">Qual é a expectativa de valor para a execução da obra (em R$)? (somente números) <span className="text-red-500">*</span></label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">Qual a expectativa de data para utilização do local totalmente equipado? <span className="text-red-500">*</span></label>
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

        {/* Section 6: Large Text Inputs & File Uploads */}
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Programa de Necessidades <span className="text-red-500">*</span></label>
                <textarea 
                    name="programaNecessidades"
                    rows={4}
                    value={formData.programaNecessidades}
                    onChange={handleChange}
                    maxLength={2000}
                    placeholder="Escreva aqui..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
                <div className="text-xs text-gray-400 mt-1">Limite máximo de 2000 caracteres.</div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Upload de Arquivo <span className="text-red-500">*</span></label>
                <div className="flex w-full border border-gray-300 rounded-md overflow-hidden">
                    <label className="bg-gray-100 text-gray-700 px-4 py-2 cursor-pointer border-r border-gray-300 hover:bg-gray-200 text-sm">
                        Escolher Arquivo
                        <input type="file" className="hidden" />
                    </label>
                    <span className="px-4 py-2 text-gray-500 text-sm flex items-center">Nenhum arquivo escolhido</span>
                </div>
                <div className="text-xs text-blue-400 mt-1 cursor-pointer hover:underline">*Link para download do modelo do arquivo disponibilizado</div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Estudo de Mercado <span className="text-red-500">*</span></label>
                <div className="flex w-full border border-gray-300 rounded-md overflow-hidden">
                    <label className="bg-gray-100 text-gray-700 px-4 py-2 cursor-pointer border-r border-gray-300 hover:bg-gray-200 text-sm">
                        Escolher Arquivo
                        <input type="file" className="hidden" />
                    </label>
                    <span className="px-4 py-2 text-gray-500 text-sm flex items-center">Nenhum arquivo escolhido</span>
                </div>
                <div className="text-xs text-blue-400 mt-1 cursor-pointer hover:underline">*Link para download do modelo do arquivo disponibilizado</div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Instalações SESI / SENAI próximas: <span className="text-red-500">*</span></label>
                <textarea 
                    name="instalacoesSesiSenai"
                    rows={4}
                    value={formData.instalacoesSesiSenai}
                    onChange={handleChange}
                    maxLength={500}
                    placeholder="Descreva as instalações próximas"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
                <div className="text-xs text-gray-400 mt-1">Limite máximo de 500 caracteres.</div>
            </div>
        </div>

        {/* Section 7: Radio Groups (Compliance) */}
        <div className="space-y-6">
            {renderRadioGroup('A obra será realizada em:', 'localObra', [
                { label: 'Área de terreno disponível na unidade', value: 'Disponivel' },
                { label: 'Novo terreno doado', value: 'Novo' }
            ])}
            {renderYesNoRadioGroup('A demanda possui algum projeto de construção elaborado ou contratado?', 'possuiProjeto')}
            {renderYesNoRadioGroup('A demanda possui algum laudo, relatório técnico ou documento complementar?', 'possuiLaudo')}
            {renderYesNoRadioGroup('A Unidade tem autorização da Prefeitura para realizar a demanda?', 'temAutorizacao')}
            {renderYesNoRadioGroup('A Unidade realizou consulta na Prefeitura quanto ao tempo médio de aprovação do processo?', 'realizouConsulta')}
            {renderYesNoRadioGroup('Houve alguma notificação de órgão público para a realização da demanda?', 'houveNotificacao')}
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
  );
};

export default OpenStrategicRequestScreen;
