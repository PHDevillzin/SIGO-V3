
import React, { useState } from 'react';
import { PaperAirplaneIcon, XMarkIcon } from './Icons';
import OrientationModal from './OrientationModal';
import AlertModal from './AlertModal';
import { Request, Criticality, AccessProfile, User } from '../types';

interface OpenSedeRequestScreenProps {
    onClose: () => void;
    onSave?: (request: Request) => void;
    userCategory: string;
    currentUser: User;
    profiles: AccessProfile[];
}

const OpenSedeRequestScreen: React.FC<OpenSedeRequestScreenProps> = ({ onClose, onSave, userCategory, currentUser, profiles }) => {
    const [showOrientation, setShowOrientation] = useState(true);
    const [alertMessage, setAlertMessage] = useState('');
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    // Determine Solicitante (Entity) restriction
    // Normalized category to Capital Case or Title Case to match Select options if needed
    // Select options: SESI, SENAI, Corporativo
    let normalizedCategory = userCategory;
    if (userCategory === 'CORPORATIVO') normalizedCategory = 'Corporativo';
    
    // Lock if SESI, SENAI, or Corporativo
    const isEntityRestricted = ['SESI', 'SENAI', 'Corporativo'].includes(normalizedCategory);
    const defaultSolicitante = isEntityRestricted ? normalizedCategory : '';

    // Determine default Gerencia based on user profiles (excluding Admin)
    const getInitialGerencia = () => {
        const userProfileIds = currentUser?.sigoProfiles || [];
        const validProfiles = profiles
            .filter(p => userProfileIds.includes(p.id))
            .filter(p => p.name !== 'Administrador do sistema' && p.name !== 'Administração do sistema');

        return validProfiles.length > 0 ? validProfiles[0].name : '';
    };

    const [formData, setFormData] = useState({
        solicitante: defaultSolicitante,
        gerencia: getInitialGerencia(),
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
        arquivoPlantaBaixa: '',
        arquivoFotos: '',
        arquivoProjeto: '',
        arquivoLaudo: '',
        arquivoAutorizacao: '',
        arquivoConsulta: '',
        arquivoNotificacao: '',

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
            // Format date helpers if needed, but API handles ISO string or YYYY-MM-DD usually if PG.
            // Screen uses YYYY-MM-DD from input type="date". PG accepts this.

            const payload = {
                ...formData,
                // Defaults for Sede Request
                criticality: Criticality.MEDIA,
                unit: 'Sede',
                description: formData.titulo, // Map titulo to description for core field
                status: 'Solicitação criada', // Initial status
                currentLocation: 'Administração do Sistema', // Initial location
                gestorLocal: 'Administrador', // Or current user?
                expectedStartDate: formData.inicioExecucao,
                hasInfo: true,
                expectedValue: formData.valorExecucao,
                executingUnit: 'Sede',
                prazo: parseInt(formData.prazoExecucao) || 0,
                categoriaInvestimento: 'Baixa Complexidade', // Default
                entidade: formData.solicitante || 'Corporativo', // Map solicitante to entidade
                ordem: `SS-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`, // Generate or let DB handle? DB doesn't generate yet. Keep random for now.
                tipologia: '',
                situacaoProjeto: 'A Iniciar',
                situacaoObra: 'Não Iniciada',
                inicioObra: null,
                saldoObraPrazo: 0,
                saldoObraValor: 'R$ 0,00',
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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Falha ao criar solicitação');
            }

            const savedRequest = await response.json();

            if (onSave) {
                onSave(savedRequest);
            }

            onClose(); // Close on success

        } catch (error) {
            console.error("Error creating request:", error);
            setAlertMessage("Erro ao criar solicitação. Tente novamente.");
            setIsAlertOpen(true);
        }
    };

    // Helper for rendering radio group
    const renderRadioGroup = (label: string, name: string, required: boolean = true) => (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
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

    return (
        <>
            {showOrientation && <OrientationModal type="Sede" onConfirm={() => setShowOrientation(false)} />}
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
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Solicitante <span className="text-red-500">*</span></label>
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
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Gerência <span className="text-red-500">*</span></label>
                            <div className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-600">
                                {formData.gerencia}
                            </div>
                        </div>

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

                    {/* Section 2: Checkboxes */}
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
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Selecione as necessidades da sede após execução da demanda: <span className="text-red-500">*</span></label>
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

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Selecione se algum dos serviços listados serão necessários à realização da demanda: <span className="text-red-500">*</span></label>
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

                    {/* Section 4: File Uploads */}
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

                    {/* Section 5: Yes/No Questions */}
                    <div className="space-y-6 pt-4">
                        <div className="space-y-4">
                            {renderRadioGroup('A demanda possui algum projeto de construção elaborado ou contratado pela Sede?', 'possuiProjeto')}
                            {formData.possuiProjeto === 'Sim' && renderFileUpload('Enviar arquivo do projeto:', '.pdf, .doc, .docx', 'arquivoProjeto')}
                        </div>

                        <div className="space-y-4">
                            {renderRadioGroup('A demanda possui algum laudo, relatório técnico ou documento complementar elaborado ou contratado pela Sede?', 'possuiLaudo')}
                            {formData.possuiLaudo === 'Sim' && renderFileUpload('Enviar arquivo do laudo:', '.pdf, .doc, .docx', 'arquivoLaudo')}
                        </div>

                        <div className="space-y-4">
                            {renderRadioGroup('A Sede tem autorização da Prefeitura para realizar a demanda?', 'temAutorizacao')}
                            {formData.temAutorizacao === 'Sim' && renderFileUpload('Enviar arquivo de autorização:', '.pdf, .doc, .docx', 'arquivoAutorizacao')}
                        </div>

                        <div className="space-y-4">
                            {renderRadioGroup('A Sede realizou consulta à Prefeitura quanto ao tempo médio de aprovação do processo?', 'realizouConsulta')}
                            {formData.realizouConsulta === 'Sim' && renderFileUpload('Enviar documento da consulta:', '.pdf, .doc, .docx', 'arquivoConsulta')}
                        </div>

                        <div className="space-y-4">
                            {renderRadioGroup('Houve notificação a algum órgão público sobre a realização da demanda?', 'houveNotificacao')}
                            {formData.houveNotificacao === 'Sim' && renderFileUpload('Enviar notificação:', '.pdf, .doc, .docx', 'arquivoNotificacao')}
                        </div>
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
