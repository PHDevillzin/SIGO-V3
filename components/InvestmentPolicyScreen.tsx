
import React, { useState, useRef, useCallback } from 'react';
import { CloudArrowUpIcon, DocumentTextIcon, ArrowDownTrayIcon, TrashIcon, CheckCircleIcon, InformationCircleIcon } from './Icons';
import ConfirmationModal from './ConfirmationModal';

interface InvestmentPolicyScreenProps {
  selectedProfile: string;
}

const InvestmentPolicyScreen: React.FC<InvestmentPolicyScreenProps> = ({ selectedProfile }) => {
  const isGestor = selectedProfile === 'Gestor GSO';
  const [dragActive, setDragActive] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  
  // State for policies list
  const [policies, setPolicies] = useState([
    { id: 1, name: 'Política de Investimento 2025.pdf', date: '10/01/2025', size: '2.4 MB' },
    { id: 2, name: 'Diretrizes de Infraestrutura v2.docx', date: '15/12/2024', size: '1.1 MB' },
  ]);

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<number | null>(null);

  // State for toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileToUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const handleUpload = () => {
    if (fileToUpload) {
        // Here you would implement the actual upload logic
        alert(`Arquivo "${fileToUpload.name}" enviado com sucesso!`);
        setFileToUpload(null);
    }
  };

  const handleDeleteClick = (id: number) => {
    setPolicyToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (policyToDelete) {
      setPolicies(prev => prev.filter(p => p.id !== policyToDelete));
      showToast('Arquivo excluído com sucesso.', 'success');
    }
    setIsDeleteModalOpen(false);
    setPolicyToDelete(null);
  };

  const handleCancelDelete = () => {
    showToast('Ação cancelada.', 'info');
    setIsDeleteModalOpen(false);
    setPolicyToDelete(null);
  };

  return (
    <>
      {toast.isVisible && (
        <div
            className={`fixed top-6 left-6 flex items-center space-x-3 text-white py-3 px-5 rounded-lg shadow-xl z-[100] transition-transform duration-500 ease-in-out ${
                toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
            }`}
            role="alert"
            aria-live="assertive"
        >
            {toast.type === 'success' ? <CheckCircleIcon className="w-6 h-6" /> : <InformationCircleIcon className="w-6 h-6" />}
            <p className="font-semibold">{toast.message}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Política de Investimento</h1>
          <p className="text-gray-500 mb-6">
            {isGestor 
              ? 'Gerencie os documentos da política de investimento. Você pode fazer upload de novas versões ou baixar as existentes.' 
              : 'Faça o download dos documentos vigentes da política de investimento.'}
          </p>

          {isGestor && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Upload de Nova Política</h2>
              <form 
                className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 transition-colors ${dragActive ? 'border-sky-500 bg-sky-50' : 'border-gray-300 hover:bg-gray-100'}`}
                onDragEnter={handleDrag} 
                onDragLeave={handleDrag} 
                onDragOver={handleDrag} 
                onDrop={handleDrop}
                onClick={onButtonClick}
              >
                <input 
                  ref={inputRef}
                  type="file" 
                  className="hidden" 
                  onChange={handleChange} 
                  accept=".pdf,.doc,.docx"
                />
                
                {!fileToUpload ? (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Clique para enviar</span> ou arraste e solte</p>
                    <p className="text-xs text-gray-500">PDF, DOC ou DOCX (MAX. 10MB)</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 w-full px-4">
                      <DocumentTextIcon className="w-12 h-12 text-sky-500 mb-3" />
                      <p className="text-sm font-medium text-gray-900 mb-1">{fileToUpload.name}</p>
                      <p className="text-xs text-gray-500 mb-4">{(fileToUpload.size / 1024 / 1024).toFixed(2)} MB</p>
                      <div className="flex space-x-3" onClick={(e) => e.stopPropagation()}>
                          <button 
                              type="button"
                              onClick={() => setFileToUpload(null)}
                              className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 focus:outline-none flex items-center space-x-2"
                          >
                              <TrashIcon className="w-4 h-4" />
                              <span>Remover</span>
                          </button>
                          <button 
                              type="button"
                              onClick={handleUpload}
                              className="px-4 py-2 text-sm font-medium text-white bg-sky-500 rounded-md hover:bg-sky-600 focus:outline-none flex items-center space-x-2"
                          >
                              <CloudArrowUpIcon className="w-4 h-4" />
                              <span>Confirmar Upload</span>
                          </button>
                      </div>
                  </div>
                )}
              </form>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Documentos Disponíveis</h2>
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                  {policies.map(policy => (
                      <li key={policy.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-md">
                                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                  <p className="text-sm font-medium text-gray-900">{policy.name}</p>
                                  <div className="flex space-x-2 text-xs text-gray-500">
                                      <span>{policy.date}</span>
                                      <span>•</span>
                                      <span>{policy.size}</span>
                                  </div>
                              </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isGestor && (
                                <button 
                                    onClick={() => handleDeleteClick(policy.id)}
                                    className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                                    title="Excluir arquivo"
                                >
                                    <TrashIcon className="w-6 h-6" />
                                </button>
                            )}
                            <button className="text-gray-400 hover:text-sky-600 p-2 rounded-full hover:bg-sky-50 transition-colors" title="Baixar arquivo">
                                <ArrowDownTrayIcon className="w-6 h-6" />
                            </button>
                          </div>
                      </li>
                  ))}
                  {policies.length === 0 && (
                      <li className="p-6 text-center text-gray-500 text-sm">
                          Nenhum documento disponível no momento.
                      </li>
                  )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Arquivo"
        message="Deseja realmente excluir este arquivo?"
        confirmLabel="Sim"
        cancelLabel="Não"
      />
    </>
  );
};

export default InvestmentPolicyScreen;
