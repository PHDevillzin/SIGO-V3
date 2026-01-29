
import React, { useState, useEffect } from 'react';
import { PaperAirplaneIcon, XMarkIcon } from './Icons';
import AlertModal from './AlertModal';
import OrientationModal from './OrientationModal';
import { Request, Criticality, AccessProfile, User } from '../types';

interface OpenUnitRequestScreenProps {
    onClose: () => void;
    onSave?: (request: Request) => void;
    units: any[];
    userCategory: string;
    userLinkedUnits: string[];
    currentUser: User;
    profiles: AccessProfile[];
}

const OpenUnitRequestScreen: React.FC<OpenUnitRequestScreenProps> = ({ onClose, onSave, units, userCategory, userLinkedUnits, currentUser, profiles }) => {
    const [showOrientation, setShowOrientation] = useState(true);
    const [alertMessage, setAlertMessage] = useState('');
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    // Determine Entity restriction
    // Variable used for rendering (reactive)
    // Existing logic: const isEntityRestricted = ['SESI', 'SENAI'].includes(userCategory);

    // NIF-based Logic for 'Gestor Local' and 'Unidade Solicitante'
    const userProfileNames = profiles
        .filter(p => currentUser.sigoProfiles?.includes(p.id))
        .map(p => p.name);

    const isTargetProfile = userProfileNames.includes('Gestor Local') || userProfileNames.includes('Unidade Solicitante');

    const nifPrefix = currentUser?.nif?.substring(0, 2).toUpperCase();
    const nifEntidade = nifPrefix === 'SN' ? 'SENAI' : (nifPrefix === 'SS' ? 'SESI' : '');

    const isEntityRestricted = ['SESI', 'SENAI'].includes(userCategory) || (isTargetProfile && !!nifEntidade);
    const defaultEntity = isEntityRestricted ? userCategory : 'SENAI';

    const [formData, setFormData] = useState({
        entidade: (isTargetProfile && nifEntidade) ? nifEntidade : defaultEntity,
        unidade: '',
        planoDiretor: '', // New field
        cat: '', // New visual field, potentially derived
        local: '',
        atividade: '',

        // Text Fields
        titulo: '',
        objetivo: '',
        expectativaResultados: '',
        justificativa: '',
        resumoServicos: '',

        // Checkboxes
        aumento: [] as string[],
        necessidades: [] as string[],
        servicosEspecificos: [] as string[],

        // Quantitative
        areaIntervencao: '',
        prazoExecucao: '',
        inicioExecucao: '',
        valorExecucao: '',
        dataUtilizacao: '',

        // Files
        arquivoPlantaBaixa: '', // Updated name
        arquivoFotos: '', // Updated name
        arquivoProjeto: '',
        arquivoLaudo: '',
        arquivoAutorizacao: '',
        arquivoConsulta: '',
        arquivoNotificacao: '',

        // Radios - Compliance
        possuiProjeto: '',
        possuiLaudo: '',
        temAutorizacao: '',
        realizouConsulta: '',
        houveNotificacao: '',

        // Radios - Risk Assessment
        problemasNaoAtendida: '',
        prazoAcao: '',
        probabilidadeEvolucao: ''
    });

    // Filter Units based on Profile
    // Filter Units
    const filteredUnits = React.useMemo(() => {
        let filtered = units;

        // 1. Filter by Entity
        // If formData.entidade is selected, filter by it.
        // If not selected, and user is NOT Corporate (is restricted), filter by userCategory.
        const isCorporate = !['SESI', 'SENAI'].includes(userCategory);

        if (formData.entidade) {
            filtered = filtered.filter(u => u.entidade === formData.entidade);
        } else if (!isCorporate && userCategory) {
            filtered = filtered.filter(u => u.entidade === userCategory);
        }

        // 2. Filter by Linked Units (Prioritized)
        if (userLinkedUnits && userLinkedUnits.length > 0) {
            filtered = filtered.filter(u =>
                userLinkedUnits.includes(u.unidadeResumida) ||
                userLinkedUnits.includes(u.unidade)
            );
        }

        return filtered.sort((a, b) => (a.unidadeResumida || a.unidade).localeCompare(b.unidadeResumida || b.unidade));
    }, [units, formData.entidade, userLinkedUnits, userCategory]);

    // Mock data for auto-filling Local and Atividade
    // TODO: Use real data from Unit object if available
    useEffect(() => {
        const selectedUnit = units.find(u => u.unidadeResumida === formData.unidade || u.unidade === formData.unidade);
        if (selectedUnit) {
            setFormData(prev => ({
                ...prev,
                local: selectedUnit.cidade || selectedUnit.unidade, // Approximation from image
                atividade: selectedUnit.tipoDeUnidade || selectedUnit.tipo, // Approximation
                cat: selectedUnit.cat || selectedUnit.centro || selectedUnit.unidade, // Approximation
                entidade: selectedUnit.entidade || prev.entidade
            }));
        } else {
            setFormData(prev => ({ ...prev, local: '', atividade: '', cat: '' }));
        }
    }, [formData.unidade, units]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (group: 'aumento' | 'necessidades' | 'servicosEspecificos', value: string) => {
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


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.inicioExecucao && formData.dataUtilizacao) {
            if (formData.inicioExecucao > formData.dataUtilizacao) {
                setAlertMessage("Data de início da obra não pode ser maior que data de uso");
                setIsAlertOpen(true);
                return;
            }
        }

        try {
            const prazo = parseInt(formData.prazoExecucao) || 0;
            let criticality = Criticality.MINIMA;
            if (prazo > 10) criticality = Criticality.CRITICA;
            else if (prazo >= 4) criticality = Criticality.MEDIA;

            const payload = {
                ...formData,
                criticality,
                unit: formData.unidade || 'Unidade',
                description: formData.titulo,
                status: 'Aguardando Validação Gestor Local',
                currentLocation: 'GSO',
                gestorLocal: currentUser?.name || 'Gestor da Unidade',
                solicitante: currentUser?.name, // Add Creator Name for visibility filter
                expectedStartDate: formData.inicioExecucao,
                hasInfo: true,
                expectedValue: formData.valorExecucao,
                executingUnit: 'Unidade',
                prazo,
                categoriaInvestimento: 'Reforma Operacional',
                entidade: formData.entidade,
                ordem: `SS-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
                tipologia: '',
                situacaoProjeto: 'A Iniciar',
                situacaoObra: 'Não Iniciada',
                inicioObra: null,
                saldoObraPrazo: 0,
                saldoObraValor: 'R$ 0,00',
                planoDiretor: formData.planoDiretor,
                problemasNaoAtendida: formData.problemasNaoAtendida,
                prazoAcao: formData.prazoAcao,
                probabilidadeEvolucao: formData.probabilidadeEvolucao,
                arquivoPlantaBaixa: formData.arquivoPlantaBaixa,
                arquivoFotos: formData.arquivoFotos,
                arquivoProjeto: formData.arquivoProjeto,
                arquivoLaudo: formData.arquivoLaudo,
                arquivoAutorizacao: formData.arquivoAutorizacao,
                arquivoConsulta: formData.arquivoConsulta,
                arquivoNotificacao: formData.arquivoNotificacao
            };

            const response = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Falha ao criar solicitação');

            const savedRequest = await response.json();
            if (onSave) onSave(savedRequest);
            onClose();

        } catch (error) {
            console.error("Error creating request:", error);
            setAlertMessage("Erro ao criar solicitação. Tente novamente.");
            setIsAlertOpen(true);
        }
    };

    const renderRadioGroup = (label: string, name: string, options: { label: string, value: string }[], required: boolean = true) => (
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

    const renderSimpleRadioGroup = (label: string, name: string) => (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
                {label} <span className="text-red-500">*</span>
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
                    <span className="text-sm text-gray-600">Não</span>
                </label>
            </div>
        </div>
    );

    const renderFileUpload = (label: string, accept: string, name: string) => (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{label} <span className="text-red-500">*</span></label>
            <div className="flex w-full border border-gray-300 rounded-md overflow-hidden bg-white">
                <label className="bg-gray-100 text-gray-700 px-4 py-2 cursor-pointer border-r border-gray-300 hover:bg-gray-200 text-sm font-medium transition-colors">
                    Escolher Arquivo
                    <input
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={(e) => {
                            // Mocking file upload by setting a fake URL
                            if (e.target.files && e.target.files[0]) {
                                setFormData(prev => ({ ...prev, [name]: `https://fake-url.com/${e.target.files![0].name}` }));
                            }
                        }}
                    />
                </label>
                <span className="px-4 py-2 text-gray-500 text-sm flex items-center flex-grow">
                    {formData[name as keyof typeof formData] ? 'Arquivo selecionado' : 'Nenhum arquivo escolhido'}
                </span>
            </div>
            <div className="mt-1">
                <a href="#" className="text-xs text-blue-400 hover:text-blue-600 hover:underline">*Link para download do modelo do arquivo disponibilizado</a>
            </div>
        </div>
    );

    const MAX_CHARS = 3000;

    const servicosList = [
        'Ampliação ou construção de novas áreas cobertas de qualquer tipo',
        'Diminuição ou demolição de áreas cobertas existentes de qualquer tipo',
        'Construção de novos ambientes internos',
        'Alteração de traçados de tubulações elétricas, hidráulicas ou de gases',
        'Inclusão de pontos elétricos, hidráulicos ou de gases',
        'Climatização de novas áreas',
        'Contenção de talude',
        'Execução de fundação superficial ou profunda',
        'Pavimentação de áreas verdes',
        'Poda ou remoção de árvores',
        'Realização de laudo ou parecer técnico antes da execução',
        'Recuperação ou reforço estrutural',
        'Reforma de calçada ou áreas próximas à calçada',
        'Sondagem do solo',
        'Reforma de vestiário, piscina, refeitório ou cozinha',
        'Impacto ou alteração no fluxo de pedestres ou de veículos',
        'Reforma ou melhoria que exige aprovação prévia na Prefeitura',
        'Necessidade de intervenção temporária em outra edificação existente durante a execução da obra',
        'Nenhum serviço citado anteriormente'
    ];

    return (
        <>
            {showOrientation && <OrientationModal type="Unidade" onConfirm={() => setShowOrientation(false)} />}
            <AlertModal
                isOpen={isAlertOpen}
                onClose={() => setIsAlertOpen(false)}
                title="Atenção"
                message={alertMessage}
            />
            <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md overflow-hidden my-6">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Abrir uma solicitação</h1>
                        <p className="text-sm text-gray-500 font-semibold">(Unidade)</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">

                    {/* Section 1: Basic Info */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Entidade <span className="text-red-500">*</span></label>
                            <div className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-600">
                                {formData.entidade || 'SESI'}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Unidade <span className="text-red-500">*</span></label>
                            <select
                                name="unidade"
                                value={formData.unidade}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                            >
                                <option value="">Selecione uma unidade</option>
                                {filteredUnits.map(u => (
                                    <option key={u.id} value={u.unidadeResumida || u.unidade}>
                                        {u.unidadeResumida || u.unidade}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {renderSimpleRadioGroup('A demanda faz parte do Plano Diretor?', 'planoDiretor')}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cat:</label>
                            <div className="w-full text-sm text-gray-800 font-medium">
                                {formData.cat || 'Nome da unidade aqui'}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Local:</label>
                            <div className="w-full text-sm text-gray-800 font-medium">
                                {formData.local || 'Local unidade aqui'}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Atividade principal da edificação:</label>
                            <div className="w-full text-sm text-gray-800 font-medium">
                                {formData.atividade || 'Atividade unidade aqui'}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Text Fields */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Breve descrição ou título do serviço <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleChange}
                                maxLength={MAX_CHARS}
                                placeholder="Descrever brevemente o serviço a ser realizado. Ver exemplo no Guia de Orientações."
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <div className="text-right text-xs text-gray-500 mt-1">{formData.titulo.length}/{MAX_CHARS}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Objetivo <span className="text-red-500">*</span></label>
                            <textarea
                                name="objetivo"
                                rows={2}
                                value={formData.objetivo}
                                onChange={handleChange}
                                maxLength={MAX_CHARS}
                                placeholder="Descrever o que se pretende realizar para resolver o problema central ou explorar a oportunidade identificada. Ver exemplo no Guia de Orientações."
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                            />
                            <div className="text-right text-xs text-gray-500 mt-1">{formData.objetivo.length}/{MAX_CHARS}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Expectativa de resultados <span className="text-red-500">*</span></label>
                            <textarea
                                name="expectativaResultados"
                                rows={2}
                                value={formData.expectativaResultados}
                                onChange={handleChange}
                                maxLength={MAX_CHARS}
                                placeholder="Descrever o resultado a ser gerado com a realização da demanda. Ver exemplo no Guia de Orientações."
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                            />
                            <div className="text-right text-xs text-gray-500 mt-1">{formData.expectativaResultados.length}/{MAX_CHARS}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Justificativa <span className="text-red-500">*</span></label>
                            <textarea
                                name="justificativa"
                                rows={2}
                                value={formData.justificativa}
                                onChange={handleChange}
                                maxLength={MAX_CHARS}
                                placeholder="Descrever o problema ou a oportunidade que justifica o desenvolvimento desde projeto. Ver exemplo no Guia de Orientações."
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                            />
                            <div className="text-right text-xs text-gray-500 mt-1">{formData.justificativa.length}/{MAX_CHARS}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Resumo dos Serviços <span className="text-red-500">*</span></label>
                            <textarea
                                name="resumoServicos"
                                rows={2}
                                value={formData.resumoServicos}
                                onChange={handleChange}
                                maxLength={MAX_CHARS}
                                placeholder="Descrever em tópicos os serviços a serem realizados. Ver exemplo no Guia de Orientações."
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                            />
                            <div className="text-right text-xs text-gray-500 mt-1">{formData.resumoServicos.length}/{MAX_CHARS}</div>
                        </div>
                    </div>

                    {/* Section 3: Checkboxes */}
                    <div className="space-y-6 pt-4">
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

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Selecione as necessidades da unidade após execução da demanda: <span className="text-red-500">*</span></label>
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
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Selecione se algum dos serviços listados serão necessários à realização da demanda: <span className="text-red-500">*</span></label>
                            <div className="space-y-2">
                                {servicosList.map(opt => (
                                    <label key={opt} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.servicosEspecificos.includes(opt)}
                                            onChange={() => handleCheckboxChange('servicosEspecificos', opt)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-500">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Quantitative Inputs */}
                    <div className="space-y-6 pt-4">
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

                    {/* Section 5: File Uploads */}
                    <div className="space-y-6 pt-4">
                        {renderFileUpload(
                            "Indicar em planta baixa a localização e área de intervenção:",
                            ".pdf, .doc, .docx",
                            "arquivoPlantaBaixa"
                        )}
                        {renderFileUpload(
                            "Incluir fotografias do local da intervenção:",
                            ".jpeg, .jpg, .png, .pdf",
                            "arquivoFotos"
                        )}
                    </div>

                    {/* Section 6: Yes/No Questions - Compliance */}
                    <div className="space-y-6 pt-4">
                        <div className="space-y-4">
                            {renderRadioGroup('A demanda possui algum projeto de construção elaborado ou contratado pela Unidade?', 'possuiProjeto', [
                                { label: 'Não ou não tenho conhecimento', value: 'Nao' },
                                { label: 'Sim', value: 'Sim' }
                            ])}
                            {formData.possuiProjeto === 'Sim' && renderFileUpload('Enviar arquivo do projeto:', '.pdf, .doc, .docx', 'arquivoProjeto')}
                        </div>

                        <div className="space-y-4">
                            {renderRadioGroup('A demanda possui algum laudo, relatório técnico ou documento complementar elaborado ou contratado pela Unidade?', 'possuiLaudo', [
                                { label: 'Não ou não tenho conhecimento', value: 'Nao' },
                                { label: 'Sim', value: 'Sim' }
                            ])}
                            {formData.possuiLaudo === 'Sim' && renderFileUpload('Enviar arquivo do laudo:', '.pdf, .doc, .docx', 'arquivoLaudo')}
                        </div>

                        <div className="space-y-4">
                            {renderRadioGroup('A unidade tem autorização da Prefeitura para realizar a demanda?', 'temAutorizacao', [
                                { label: 'Não ou não tenho conhecimento', value: 'Nao' },
                                { label: 'Sim', value: 'Sim' }
                            ])}
                            {formData.temAutorizacao === 'Sim' && renderFileUpload('Enviar arquivo de autorização:', '.pdf, .doc, .docx', 'arquivoAutorizacao')}
                        </div>

                        <div className="space-y-4">
                            {renderRadioGroup('A unidade realizou consulta à Prefeitura quanto ao tempo médio de aprovação do processo?', 'realizouConsulta', [
                                { label: 'Não ou não tenho conhecimento', value: 'Nao' },
                                { label: 'Sim', value: 'Sim' }
                            ])}
                            {formData.realizouConsulta === 'Sim' && renderFileUpload('Enviar documento da consulta:', '.pdf, .doc, .docx', 'arquivoConsulta')}
                        </div>

                        <div className="space-y-4">
                            {renderRadioGroup('Houve notificação a algum órgão público sobre a realização da demanda?', 'houveNotificacao', [
                                { label: 'Não ou não tenho conhecimento', value: 'Nao' },
                                { label: 'Sim', value: 'Sim' }
                            ])}
                            {formData.houveNotificacao === 'Sim' && renderFileUpload('Enviar notificação:', '.pdf, .doc, .docx', 'arquivoNotificacao')}
                        </div>
                    </div>

                    {/* Section 7: Risk Assessment */}
                    <div className="space-y-6 pt-4">
                        {renderRadioGroup('Quais problemas podem ocorrer se a demanda não for atendida?', 'problemasNaoAtendida', [
                            { value: 'Perda de vidas', label: 'Perda de vidas humanas e/ou alta probabilidade de ocorrência de eventos destrutivos ao patrimônio ou meio ambiente e/ou alta probabilidade de ocorrência de invasões' },
                            { value: 'Ferimentos', label: 'Ferimentos aos usuários e/ou possível ocorrência de eventos destrutivos ao patrimônio ou meio ambiente e/ou possível ocorrência de invasões' },
                            { value: 'Desconforto', label: 'Desconforto aos usuários e/ou reduzida possibilidade de ocorrência de eventos destrutivos ao patrimônio ou meio ambiente e/ou reduzida possibilidade de ocorrência de invasões' },
                            { value: 'Pequenos incomodos', label: 'Pequenos incômodos aos usuários e/ou sem a ocorrência de eventos destrutivos ao patrimônio ou meio ambiente e/ou nenhuma possibilidade de ocorrência de invasões' },
                            { value: 'Nao se aplica', label: 'Não se aplica' },
                        ])}

                        {renderRadioGroup('Qual é o prazo de ação antes que os problemas piorem?', 'prazoAcao', [
                            { value: 'Imediata', label: 'Evento em ocorrência, cuja intervenção deve ser imediata' },
                            { value: 'Urgencia', label: 'Evento prestes a ocorrer, cuja intervenção deve ocorrer com alguma urgência' },
                            { value: 'Medio Prazo', label: 'Evento com expectativa de ocorrer a médio prazo, cuja intervenção deve ocorrer assim que possível' },
                            { value: 'Longo Prazo', label: 'Evento com expectativa de ocorrer a longo prazo, podendo realizar intervenção de acordo com o planejamento plurianual' },
                            { value: 'Nao se aplica', label: 'Não se aplica' },
                        ])}

                        {renderRadioGroup('Qual é a probabilidade de evolução dos problemas?', 'probabilidadeEvolucao', [
                            { value: 'Imediata', label: 'Evolução imediata' },
                            { value: 'Curto Prazo', label: 'Evolução em curto prazo, com tendência a piorar rapidamente se nada for feito' },
                            { value: 'Medio Prazo', label: 'Evolução em médio prazo, com tendência a piorar moderadamente se nada for feito' },
                            { value: 'Longo Prazo', label: 'Evolução em longo prazo, com tendência a piorar lentamente se nada for feito' },
                            { value: 'Nao se aplica', label: 'Não se aplica' },
                        ])}
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

export default OpenUnitRequestScreen;
