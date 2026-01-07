import React, { useMemo } from 'react';
import Header from './Header';
import SummaryCard from './SummaryCard';
import RequestsTable from './RequestsTable';
import { 
    ListIcon, 
    ClipboardDocumentListIcon, 
    BuildingOfficeIcon, 
    WrenchScrewdriverIcon, 
    Squares2x2Icon,
    CalculatorIcon 
} from './Icons';
import type { Request } from '../types';

interface ApprovalRequestsScreenProps {
    setCurrentView: (view: string) => void;
    requests: Request[];
    setRequests: React.Dispatch<React.SetStateAction<Request[]>>;
    selectedProfile: string;
    userName?: string;
}

const ApprovalRequestsScreen: React.FC<ApprovalRequestsScreenProps> = ({ 
    setCurrentView, 
    requests, 
    setRequests,
    selectedProfile,
    userName
}) => {
    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

    const summaryData = useMemo(() => {
        const formatValue = (val: number) => 
            `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        const parseValue = (valStr: string) => {
            if (!valStr) return 0;
            const clean = valStr.replace(/[^\d,-]/g, '').replace(',', '.');
            return parseFloat(clean) || 0;
        };

        const calcTotal = (reqs: Request[]) => reqs.reduce((acc, r) => acc + parseValue(r.expectedValue), 0);
        const calcCount = (reqs: Request[]) => reqs.length;

        const novaUnidade = requests.filter(r => r.tipologia === 'Nova Unidade' || r.categoriaInvestimento === 'Nova Unidade');
        const intervencao = requests.filter(r => r.categoriaInvestimento === 'Intervenção Estratégica' || r.tipologia === 'Intervenção Estratégica');
        const reforma = requests.filter(r => r.categoriaInvestimento === 'Reforma Operacional' || r.tipologia === 'Reforma Operacional');
        const baixaComplex = requests.filter(r => r.categoriaInvestimento === 'Baixa Complexidade');
        const manutencao = requests.filter(r => r.categoriaInvestimento === 'Manutenção');
        
        const totalVal = calcTotal(requests);
        const totalCount = calcCount(requests);

        return [
            { 
                title: 'Nova Unidade', 
                count: calcCount(novaUnidade), 
                value: formatValue(calcTotal(novaUnidade)), 
                icon: Squares2x2Icon, 
                color: 'text-green-600 border-green-600',
                onClick: () => setSelectedCategory(prev => prev === 'Nova Unidade' ? null : 'Nova Unidade')
            },
            { 
                title: 'Intervenção Estratégica', 
                count: calcCount(intervencao), 
                value: formatValue(calcTotal(intervencao)), 
                icon: ListIcon, 
                color: 'text-purple-600 border-purple-600',
                onClick: () => setSelectedCategory(prev => prev === 'Intervenção Estratégica' ? null : 'Intervenção Estratégica')
            },
            { 
                title: 'Reforma Operacional', 
                count: calcCount(reforma), 
                value: formatValue(calcTotal(reforma)), 
                icon: ClipboardDocumentListIcon, 
                color: 'text-sky-500 border-sky-500',
                onClick: () => setSelectedCategory(prev => prev === 'Reforma Operacional' ? null : 'Reforma Operacional')
            },
            { 
                title: 'Baixa Complexidade', 
                count: calcCount(baixaComplex), 
                value: formatValue(calcTotal(baixaComplex)), 
                icon: BuildingOfficeIcon, 
                color: 'text-blue-400 border-blue-400',
                onClick: () => setSelectedCategory(prev => prev === 'Baixa Complexidade' ? null : 'Baixa Complexidade')
            },
            { 
                title: 'Manutenção', 
                count: calcCount(manutencao), 
                value: formatValue(calcTotal(manutencao)), 
                icon: WrenchScrewdriverIcon, 
                color: 'text-gray-500 border-gray-500',
                onClick: () => setSelectedCategory(prev => prev === 'Manutenção' ? null : 'Manutenção')
            },
            { 
                title: 'Total Geral', 
                count: totalCount, 
                value: formatValue(totalVal), 
                icon: CalculatorIcon, 
                color: 'text-yellow-500 border-yellow-500',
                onClick: () => setSelectedCategory(null) // Reset filter
            },
        ];
    }, [requests]);

    const filteredRequests = useMemo(() => {
        if (!selectedCategory) return requests;
        return requests.filter(r => 
            r.tipologia === selectedCategory || 
            r.categoriaInvestimento === selectedCategory
        );
    }, [requests, selectedCategory]);

    return (
        <div className="space-y-6">
            <Header 
                title="Solicitações para Aprovação" 
                selectedProfile={selectedProfile} 
                setCurrentView={setCurrentView}
            />

            {/* Custom summary cards for Approval Screen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
               {summaryData.map((data, index) => (
                    <div 
                        key={index} 
                        onClick={data.onClick}
                        className={`cursor-pointer transition-all ${
                            (selectedCategory === data.title) || (data.title === 'Total Geral' && selectedCategory === null)
                                ? 'ring-2 ring-offset-2 ring-blue-500 transform scale-105' 
                                : 'hover:bg-gray-50'
                        }`}
                    >
                        <SummaryCard {...data} />
                    </div>
               ))}
            </div>

            <RequestsTable 
                selectedProfile={selectedProfile}
                currentView="aprovacao" 
                requests={filteredRequests}
                setRequests={setRequests}
                userName={userName}
            />
        </div>
    );
};

export default ApprovalRequestsScreen;
