
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
                gerenteRegional: '',
                emailGR: '',
                site: '',
                latitude: '',
                longitude: ''
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

    const inputClass = `w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`;
    const labelClass = "block text-xs font-bold text-gray-500 uppercase mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-[#0B1A4E]">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} id="unit-form" className="p-6 overflow-y-auto space-y-6 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Col 1 */}
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
                            <label className={labelClass}>Tipo</label>
                            <input type="text" name="tipo" value={formData.tipo} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Centro</label>
                            <input type="text" name="centro" value={formData.centro} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                        </div>

                        {/* Col 2 */}
                        <div className="lg:col-span-2">
                            <label className={labelClass}>CAT</label>
                            <input type="text" name="cat" value={formData.cat} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                        </div>
                        <div className="lg:col-span-2">
                            <label className={labelClass}>Unidade</label>
                            <input type="text" name="unidade" value={formData.unidade} onChange={handleChange} readOnly={isReadOnly} className={inputClass} required />
                        </div>

                        {/* Col 3 */}
                        <div>
                            <label className={labelClass}>Cidade</label>
                            <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Bairro</label>
                            <input type="text" name="bairro" value={formData.bairro} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                        </div>
                        <div className="lg:col-span-2">
                            <label className={labelClass}>Endereço</label>
                            <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                        </div>

                        {/* Col 4 */}
                        <div>
                            <label className={labelClass}>CEP</label>
                            <input type="text" name="cep" value={formData.cep} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                        </div>
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

                        {/* Col 5 */}
                        <div>
                            <label className={labelClass}>Responsável RA</label>
                            <input type="text" name="responsavelRA" value={formData.responsavelRA} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Responsável RAR</label>
                            <input type="text" name="responsavelRAR" value={formData.responsavelRAR} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Tipo de Unidade</label>
                            <input type="text" name="tipoDeUnidade" value={formData.tipoDeUnidade} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Unidade Resumida</label>
                            <input type="text" name="unidadeResumida" value={formData.unidadeResumida} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                        </div>

                        {/* Col 6 */}
                        <div>
                            <label className={labelClass}>Gerente Regional</label>
                            <input type="text" name="gerenteRegional" value={formData.gerenteRegional} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>E-mail GR</label>
                            <input type="email" name="emailGR" value={formData.emailGR} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                        </div>
                        <div className="lg:col-span-2">
                            <label className={labelClass}>Site</label>
                            <input type="text" name="site" value={formData.site} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                        </div>

                        {/* Col 7 */}
                        <div>
                            <label className={labelClass}>Latitude</label>
                            <input type="text" name="latitude" value={formData.latitude} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Longitude</label>
                            <input type="text" name="longitude" value={formData.longitude} onChange={handleChange} readOnly={isReadOnly} className={inputClass} />
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t bg-white flex justify-end items-center space-x-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold"
                    >
                        {isReadOnly ? 'Fechar' : 'Cancelar'}
                    </button>
                    {!isReadOnly && (
                        <button 
                            type="submit"
                            form="unit-form"
                            className="bg-[#0EA5E9] text-white px-6 py-2 rounded-md font-bold hover:bg-sky-600 transition-colors flex items-center space-x-2"
                        >
                            <PaperAirplaneIcon className="w-4 h-4 -rotate-45" />
                            <span>Salvar</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UnitDetailsModal;
