import React, { useState, useEffect } from 'react';
import type { Request } from '../types';
import { XMarkIcon } from './Icons';

interface MaintenanceEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: Request | null;
    onSave: (updatedRequest: Request) => void;
}

const MaintenanceEditModal: React.FC<MaintenanceEditModalProps> = ({ isOpen, onClose, request, onSave }) => {
    const [observacao, setObservacao] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (request) {
            setObservacao(request.observacao || '');
        }
    }, [request]);

    if (!isOpen || !request) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/requests', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: request.id,
                    observacao
                })
            });

            if (response.ok) {
                const updated = await response.json();
                onSave(updated);
                onClose();
            } else {
                alert('Erro ao salvar observação');
            }
        } catch (error) {
            console.error('Error saving observation:', error);
            alert('Erro de conexão');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-[#0B1A4E]">Editar Solicitação de Manutenção</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="bg-gray-100 p-2 rounded-md border border-gray-200 text-sm text-gray-700 font-medium">
                        Você está editando 1 demanda.
                    </div>

                    {/* Read-only Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tipologia <span className="text-red-500">*</span></label>
                            <div className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-500 cursor-not-allowed">
                                {request.tipologia || 'Ambientes tecnológicos'}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Categoria de investimento</label>
                            <div className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-500 cursor-not-allowed">
                                {request.categoriaInvestimento || 'Manutenção'}
                            </div>
                        </div>
                    </div>

                    {/* Projeto Section */}
                    <div>
                        <h3 className="text-lg font-bold text-[#0B1A4E] mb-4">Projeto</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Início projeto</label>
                                <div className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-400 text-sm cursor-not-allowed h-10 flex items-center">
                                    {request.expectedStartDate || 'dd/mm/aaaa'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Prazo projeto(meses)</label>
                                <div className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-400 text-sm cursor-not-allowed h-10"></div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Valor projeto</label>
                                <div className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-400 text-sm cursor-not-allowed h-10"></div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Término projeto</label>
                                <div className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-400 text-sm cursor-not-allowed h-10 flex items-center">
                                    dd/mm/aaaa
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Obra Section */}
                    <div>
                        <h3 className="text-lg font-bold text-[#0B1A4E] mb-4">Obra</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Início obra</label>
                                <div className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-400 text-sm cursor-not-allowed h-10 flex items-center">
                                    {request.inicioObra ? new Date(request.inicioObra).toLocaleDateString() : 'dd/mm/aaaa'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Prazo obra(meses)</label>
                                <div className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-500 text-sm cursor-not-allowed h-10 flex items-center">{request.prazo || ''}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Valor obra</label>
                                <div className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-500 text-sm cursor-not-allowed h-10 flex items-center">{request.expectedValue || ''}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Término obra</label>
                                <div className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-400 text-sm cursor-not-allowed h-10 flex items-center">
                                    dd/mm/aaaa
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Observacao Section */}
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1">Observação</label>
                        <textarea
                            rows={6}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                            value={observacao}
                            onChange={(e) => setObservacao(e.target.value)}
                        />
                        <div className="text-right text-xs text-gray-400 mt-1">{observacao.length}/3000</div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end items-center p-6 border-t space-x-4">
                    <button onClick={onClose} className="text-[#0B1A4E] font-semibold hover:underline flex items-center">
                        <span className="mr-1">×</span> Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-[#0EA5E9] text-white font-bold py-2 px-6 rounded-md hover:bg-sky-600 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceEditModal;
