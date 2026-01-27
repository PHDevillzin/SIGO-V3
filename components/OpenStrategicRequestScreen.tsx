
import React, { useState, useEffect } from 'react';
import { PaperAirplaneIcon, XMarkIcon } from './Icons';
import AlertModal from './AlertModal';
import OrientationModal from './OrientationModal';
import { Request, Criticality, AccessProfile, User, Unit } from '../types';

interface OpenStrategicRequestScreenProps {
    onClose: () => void;
    onSave?: (request: Request) => void;
    userCategory: string;
    currentUser: User;
    profiles: AccessProfile[];
    units: Unit[];
    userLinkedUnits: string[];
}

const OpenStrategicRequestScreen: React.FC<OpenStrategicRequestScreenProps> = ({ onClose, onSave, userCategory, currentUser, profiles, units, userLinkedUnits }) => {
    const [showOrientation, setShowOrientation] = useState(true);
    const [alertMessage, setAlertMessage] = useState('');
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    // Determine Entity restriction for initial state
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

    // Determine default Area Responsavel based on user profiles (excluding Admin)
    const getInitialAreaResponsavel = () => {
        const userProfileIds = currentUser?.sigoProfiles || [];
        const validProfiles = profiles
            .filter(p => userProfileIds.includes(p.id))
            .filter(p => p.name !== 'Administrador do sistema' && p.name !== 'Administração do sistema');

        return validProfiles.length > 0 ? validProfiles[0].name : '';
    };

    const [formData, setFormData] = useState({
        referencia: '',
        entidade: (isTargetProfile && nifEntidade) ? nifEntidade : defaultEntity,
        unidade: '', // Added

        // Checkboxes Group 1
        aumento: [] as string[],

        // Text Fields
        titulo: '',
        objetivo: '',
        expectativaResultados: '',
        justificativa: '',
        resumoServicos: '',

        // Areas
        areaResponsavel: getInitialAreaResponsavel(),
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

    // Filter Units based on Profile
    const filteredUnits = React.useMemo(() => {
        const userProfileNames = profiles
            .filter(p => currentUser.sigoProfiles?.includes(p.id))
            .map(p => p.name);

        const isRestrictedProfile = userProfileNames.includes('Gestor Local') || userProfileNames.includes('Unidade Solicitante');

        if (isRestrictedProfile && userLinkedUnits.length > 0) {
             return units.filter(u => userLinkedUnits.includes(u.unidadeResumida) || userLinkedUnits.includes(u.unidade));
        }
        return units;
    }, [units, currentUser, profiles, userLinkedUnits]);

    // Update entidade if userCategory changes or Unit selected
    useEffect(() => {
        if (['SESI', 'SENAI'].includes(userCategory)) {
            setFormData(prev => ({ ...prev, entidade: userCategory }));
        }
    }, [userCategory]);

    // Sync Entidade with Unit
    useEffect(() => {
        const selectedUnit = units.find(u => u.unidadeResumida === formData.unidade || u.unidade === formData.unidade);
        if (selectedUnit) {
            setFormData(prev => ({
                ...prev,
                entidade: selectedUnit.entidade || prev.entidade
            }));
        }
    }, [formData.unidade, units]);

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
            const payload = {
                ...formData,
                criticality: Criticality.MEDIA,
                unit: 'Nova Unidade', // As per previous default
                description: formData.titulo || 'Solicitação Estratégica',
                status: 'Solicitação criada',
                currentLocation: 'GSO',
                gestorLocal: 'GSO',
                expectedStartDate: formData.inicioExecucao,
                hasInfo: true,
                expectedValue: formData.valorExecucao,
                executingUnit: 'GSO',
                prazo: parseInt(formData.prazoExecucao) || 0,
                categoriaInvestimento: 'Intervenção Estratégica',
                entidade: formData.entidade,
                ordem: `SS-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
                tipologia: '',
                situacaoProjeto: 'A Iniciar',
                situacaoObra: 'Não Iniciada',
                inicioObra: null,
                saldoObraPrazo: 0,
                saldoObraValor: 'R$ 0,00'
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

    const renderFileUpload = (label: string, accept: string) => (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{label} <span className="text-red-500">*</span></label>
            <div className="flex w-full border border-gray-300 rounded-md overflow-hidden bg-white">
                <label className="bg-gray-100 text-gray-700 px-4 py-2 cursor-pointer border-r border-gray-300 hover:bg-gray-200 text-sm font-medium transition-colors">
                    Escolher Arquivo
                    <input type="file" className="hidden" accept={accept} />
                </label>
                <span className="px-4 py-2 text-gray-500 text-sm flex items-center flex-grow">Nenhum arquivo escolhido</span>
            </div>
            <div className="mt-1">
                <a href="#" className="text-xs text-blue-400 hover:text-blue-600 hover:underline">*Link para download do modelo do arquivo disponibilizado</a>
            </div>
        </div>
    );

    const MAX_CHARS = 3000;

    return (
        <>
            {showOrientation && <OrientationModal type="Estratégica" onConfirm={() => setShowOrientation(false)} />}
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
                        {/* Titulo */}
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
                            <div className="text-xs text-gray-500 mt-1">Caracteres restantes: {MAX_CHARS - formData.titulo.length}</div>
                        </div>

                        {/* Objetivo */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Objetivo <span className="text-red-500">*</span></label>
                            <textarea
                                name="objetivo"
                                rows={3}
                                value={formData.objetivo}
                                onChange={handleChange}
                                maxLength={MAX_CHARS}
                                placeholder="Descrever o que se pretende realizar para resolver o problema central ou explorar a oportunidade identificada. Ver exemplo no Guia de Orientações."
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                            />
                            <div className="text-xs text-gray-500 mt-1">Caracteres restantes: {MAX_CHARS - formData.objetivo.length}</div>
                        </div>

                        {/* Expectativa de resultados */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Expectativa de resultados <span className="text-red-500">*</span></label>
                            <textarea
                                name="expectativaResultados"
                                rows={3}
                                value={formData.expectativaResultados}
                                onChange={handleChange}
                                maxLength={MAX_CHARS}
                                placeholder="Descrever o resultado a ser gerado com a realização da demanda. Ver exemplo no Guia de Orientações."
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                            />
                            <div className="text-xs text-gray-500 mt-1">Caracteres restantes: {MAX_CHARS - formData.expectativaResultados.length}</div>
                        </div>

                        {/* Justificativa */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Justificativa <span className="text-red-500">*</span></label>
                            <textarea
                                name="justificativa"
                                rows={3}
                                value={formData.justificativa}
                                onChange={handleChange}
                                maxLength={MAX_CHARS}
                                placeholder="Descrever o problema ou a oportunidade que justifica o desenvolvimento desde projeto. Ver exemplo no Guia de Orientações."
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                            />
                            <div className="text-xs text-gray-500 mt-1">Caracteres restantes: {MAX_CHARS - formData.justificativa.length}</div>
                        </div>

                        {/* Resumo dos Serviços */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Resumo dos Serviços <span className="text-red-500">*</span></label>
                            <textarea
                                name="resumoServicos"
                                rows={3}
                                value={formData.resumoServicos}
                                onChange={handleChange}
                                maxLength={MAX_CHARS}
                                placeholder="Descrever a qualidade do serviço/resultado precisa apresentar para ter valor para a área demandante. Ver exemplo no Guia de Orientações."
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                            />
                            <div className="text-xs text-gray-500 mt-1">Caracteres restantes: {MAX_CHARS - formData.resumoServicos.length}</div>
                        </div>
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

                        {renderFileUpload(
                            "Upload de Arquivo",
                            ".pdf, .doc, .docx"
                        )}

                        {renderFileUpload(
                            "Estudo de Mercado",
                            ".pdf, .doc, .docx"
                        )}

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
        </>
    );
};

export default OpenStrategicRequestScreen;
