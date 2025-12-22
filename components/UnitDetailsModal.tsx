
import React, { useState, useEffect } from 'react';
import { Unit } from '../types';
import { XMarkIcon, PaperAirplaneIcon } from './Icons';

interface UnitDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    unit: Unit | null;
    mode: 'view' | 'edit' | 'create';
    onSave: (unit: any) => void;
}

const UnitDetailsModal: React.FC<UnitDetailsModalProps> = ({ isOpen, onClose, unit, mode, onSave }) => {
    const [formData, setFormData] = useState<Partial<Unit>>({});

    useEffect(() => {
        if (unit && mode !== 'create') {
            setFormData(unit);
        } else {
            setFormData({
                codigoUnidade: '',
                entidade: 'SESI',
                tipo: '',
                centro: '',
                cat: '',
                unidade: '',
                cidade: '',
                bairro: '',
                endereco: '',
                cep: '',
                re: '',
                responsavelRE: '',
                ra: '',
                responsavelRA: '',
                responsavelRAR: '',
                tipoDeUnidade: '',
                unidadeResumida: '',
                gerenteRegional: ''
            });
        }
    }, [unit, mode, isOpen]);

    if (!isOpen) return null;

    const isReadOnly = mode === 'view';
    const title = mode === 'create' ? 'Cadastrar Unidade' : mode === 'edit' ? 'Editar Unidade' : 'Detalhes da Unidade';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const inputClass = `w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${isReadOnly ? 'bg-gray-100 text-gray-700' : 'bg-white text-gray-900'}`;
    const labelClass = "block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wider";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-lg">
                    <h2 className="text-xl font-bold text-[#0B1A4E]">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} id="unit-form" className="p-8 overflow-y-auto space-y-8 bg-white">
                    
                    {/* Identification Section */}
                    <div>
                        <h3 className="text-sm font-bold text-sky-600 mb-4 border-b border-sky-100 pb-1">Identificação e Estrutura</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className={labelClass}>Código Unidade</label>
                                <input type="text" name="codigoUnidade" value={formData.codigoUnidade} onChange={handleChange} readOnly={isReadOnly} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Entidade</label>
                                <select name="entidade" value={formData.entidade} onChange={handleChange} disabled={isReadOnly} className={inputClass}>
                                    <option value="SESI">SESI</option>
                                    <option value="SENAI">SENAI</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Tipo local</label>
                                <select 
                                    name="tipo" 
                                    value={formData.tipo} 
                                    onChange={handleChange} 
                                    disabled={isReadOnly} 
                                    className={inputClass}
                                >
                                    <option value="">Selecione...</option>
                                    <option value="CAT – Qualidade de Vida">CAT – Qualidade de Vida</option>
                                    <option value="CAT – Suporte ao Negócio">CAT – Suporte ao Negócio</option>
                                    <option value="Escola">Escola</option>
                                    <option value="Estação de Cultura">Estação de Cultura</option>
                                    <option value="Sede">Sede</option>
                                    <option value="Sede – Galeria">Sede – Galeria</option>
                                    <option value="Sede – Teatro">Sede – Teatro</option>
                                    <option value="CAT">CAT</option>
                                    <option value="CE">CE</option>
                                    <option value="CFP">CFP</option>
                                    <option value="Alugado caixa">Alugado caixa</option>
                                    <option value="CT">CT</option>
                                    <option value="EAD">EAD</option>
                                    <option value="Faculdade">Faculdade</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Centro</label>
                                <input type="text" name="centro" value={formData.centro} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                            </div>
                            <div className="lg:col-span-2">
                                <label className={labelClass}>CAT</label>
                                <input type="text" name="cat" value={formData.cat} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                            </div>
                            <div className="lg:col-span-2">
                                <label className={labelClass}>Nome Completo da Unidade</label>
                                <input type="text" name="unidade" value={formData.unidade} onChange={handleChange} readOnly={isReadOnly} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Unidade Resumida</label>
                                <input type="text" name="unidadeResumida" value={formData.unidadeResumida} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Tipo de Unidade</label>
                                <input type="text" name="tipoDeUnidade" value={formData.tipoDeUnidade} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Location Section */}
                    <div>
                        <h3 className="text-sm font-bold text-sky-600 mb-4 border-b border-sky-100 pb-1">Localização</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className={labelClass}>Cidade</label>
                                <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Bairro</label>
                                <input type="text" name="bairro" value={formData.bairro} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                            </div>
                            <div className="lg:col-span-1">
                                <label className={labelClass}>CEP</label>
                                <input type="text" name="cep" value={formData.cep} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                            </div>
                            <div className="lg:col-span-2">
                                <label className={labelClass}>Endereço Completo</label>
                                <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Responsibility Section */}
                    <div>
                        <h3 className="text-sm font-bold text-sky-600 mb-4 border-b border-sky-100 pb-1">Responsáveis e Gestão</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className={labelClass}>RE</label>
                                <input type="text" name="re" value={formData.re} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Responsável RE</label>
                                <input type="text" name="responsavelRE" value={formData.responsavelRE} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>RA</label>
                                <input type="text" name="ra" value={formData.ra} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Responsável RA</label>
                                <input type="text" name="responsavelRA" value={formData.responsavelRA} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Responsável RAR</label>
                                <input type="text" name="responsavelRAR" value={formData.responsavelRAR} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Gerente Regional</label>
                                <input type="text" name="gerenteRegional" value={formData.gerenteRegional} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer Buttons */}
                <div className="p-6 border-t bg-gray-50 flex justify-end items-center space-x-3 rounded-b-lg">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 text-gray-600 hover:text-gray-800 font-bold text-sm transition-colors"
                    >
                        {isReadOnly ? 'FECHAR' : 'CANCELAR'}
                    </button>
                    {!isReadOnly && (
                        <button 
                            type="submit"
                            form="unit-form"
                            className="bg-[#0EA5E9] text-white px-8 py-2 rounded-md font-bold hover:bg-sky-600 transition-all flex items-center space-x-2 shadow-lg shadow-sky-100"
                        >
                            <PaperAirplaneIcon className="w-4 h-4 -rotate-45" />
                            <span>SALVAR DADOS</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UnitDetailsModal;
