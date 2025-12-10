
import React, { useState } from 'react';
import { DocumentTextIcon, ArrowDownTrayIcon, CheckCircleIcon, InformationCircleIcon } from './Icons';

interface InvestmentPolicyScreenProps {
  selectedProfile: string;
}

const InvestmentPolicyScreen: React.FC<InvestmentPolicyScreenProps> = ({ selectedProfile }) => {
  // State for policies list
  const [policies] = useState([
    { id: 1, name: 'Política de Investimento 2025.pdf', date: '10/01/2025', size: '2.4 MB' },
    { id: 2, name: 'Diretrizes de Infraestrutura v2.docx', date: '15/12/2024', size: '1.1 MB' },
  ]);

  // State for toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const handleDownload = (fileName: string) => {
      showToast(`Download iniciado: ${fileName}`, 'success');
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
            Faça o download dos documentos vigentes da política de investimento.
          </p>

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
                            <button 
                                onClick={() => handleDownload(policy.name)}
                                className="text-gray-400 hover:text-sky-600 p-2 rounded-full hover:bg-sky-50 transition-colors" 
                                title="Baixar arquivo"
                            >
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
    </>
  );
};

export default InvestmentPolicyScreen;
