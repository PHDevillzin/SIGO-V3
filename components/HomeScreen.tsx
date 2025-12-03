
import React from 'react';
import { 
    HomeIcon, 
    PlusIcon, 
    ListIcon, 
    CheckCircleIcon, 
    InformationCircleIcon, 
    ShareIcon, 
    ClipboardDocumentListIcon,
    EyeIcon,
    UserIcon,
    BanknotesIcon
} from './Icons';

interface HomeScreenProps {
  setCurrentView: (view: string) => void;
}

interface ActionCardProps {
    title: string;
    description: string;
    buttonText: string;
    buttonColor: 'blue' | 'green' | 'gray';
    icon: React.ElementType;
    buttonIcon: React.ElementType;
    onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, buttonText, buttonColor, icon: Icon, buttonIcon: ButtonIcon, onClick }) => {
    const getButtonStyles = () => {
        switch (buttonColor) {
            case 'blue': return 'bg-[#0EA5E9] hover:bg-sky-600 text-white';
            case 'green': return 'bg-[#4ADE80] hover:bg-green-500 text-white';
            case 'gray': return 'bg-[#E5E7EB] hover:bg-gray-300 text-gray-700';
            default: return 'bg-sky-500 hover:bg-sky-600 text-white';
        }
    };
    
    return (
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center h-full">
            <div className="w-16 h-16 rounded-full bg-[#0EA5E9] flex items-center justify-center mb-4 shadow-sm">
                <Icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 mb-6 flex-grow">{description}</p>
            <button 
                onClick={onClick}
                className={`w-full py-2.5 px-4 rounded-md font-semibold transition-colors flex items-center justify-center space-x-2 ${getButtonStyles()}`}
            >
               <ButtonIcon className="w-5 h-5" />
               <span>{buttonText}</span>
            </button>
        </div>
    );
};

const HomeScreen: React.FC<HomeScreenProps> = ({ setCurrentView }) => {
    
    const actions = [
        {
            title: 'Nova Solicitação Sede',
            description: 'Crie uma nova solicitação de demanda para a Sede',
            buttonText: 'Abrir Solicitação Sede',
            buttonColor: 'blue',
            icon: PlusIcon,
            buttonIcon: PlusIcon,
            view: 'nova_sede'
        },
        {
            title: 'Nova Solicitação',
            description: 'Crie uma nova solicitação de demanda',
            buttonText: 'Abrir Solicitação Estratégica',
            buttonColor: 'blue',
            icon: PlusIcon,
            buttonIcon: PlusIcon,
            view: 'nova_estrategica'
        },
        {
            title: 'Solicitações',
            description: 'Visualize e acompanhe suas solicitações',
            buttonText: 'Ver Solicitações',
            buttonColor: 'gray',
            icon: ListIcon,
            buttonIcon: EyeIcon,
            view: 'solicitacoes'
        },
        {
            title: 'Solicitações para Reclassificação',
            description: 'Reclassifique as demandas e envie para o planejamento',
            buttonText: 'Ver para Reclassificar',
            buttonColor: 'green',
            icon: CheckCircleIcon,
            buttonIcon: CheckCircleIcon,
            view: 'solicitacoes_reclassificacao'
        },
        {
            title: 'Solicitações para Ciência',
            description: 'Visualize solicitações para conhecimento',
            buttonText: 'Ver para Ciência',
            buttonColor: 'gray',
            icon: InformationCircleIcon,
            buttonIcon: InformationCircleIcon,
            view: 'ciencia'
        },
        {
            title: 'Solicitações para Aprovação',
            description: 'Analise e aprove solicitações pendentes',
            buttonText: 'Ver para Aprovação',
            buttonColor: 'green',
            icon: CheckCircleIcon,
            buttonIcon: CheckCircleIcon,
            view: 'aprovacao'
        },
         {
            title: 'Tipologias',
            description: 'Gerencie as tipologias do sistema',
            buttonText: 'Ver Tipologias',
            buttonColor: 'gray',
            icon: InformationCircleIcon,
            buttonIcon: InformationCircleIcon,
            view: 'tipologias'
        },
         {
            title: 'Planejamento',
            description: 'Visualize e acompanhe o planejamento consolidado',
            buttonText: 'Ver Planejamento',
            buttonColor: 'gray',
            icon: ShareIcon,
            buttonIcon: EyeIcon,
            view: 'planejamento'
        },
         {
            title: 'Plurianual',
            description: 'Visualize e acompanhe o planejamento plurianual',
            buttonText: 'Ver Plurianual',
            buttonColor: 'gray',
            icon: ClipboardDocumentListIcon,
            buttonIcon: EyeIcon,
            view: 'plurianual'
        },
        {
            title: 'Política de Investimento',
            description: 'Visualize a política de investimento',
            buttonText: 'Ver Política',
            buttonColor: 'gray',
            icon: BanknotesIcon,
            buttonIcon: EyeIcon,
            view: 'politica_investimento'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-3">
                <HomeIcon className="w-6 h-6 text-gray-600" />
                <h1 className="text-xl font-bold text-gray-800">Bem-vindo ao Sistema SESI / SENAI</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {actions.map((action, index) => (
                    <ActionCard 
                        key={index}
                        title={action.title}
                        description={action.description}
                        buttonText={action.buttonText}
                        buttonColor={action.buttonColor as any}
                        icon={action.icon}
                        buttonIcon={action.buttonIcon}
                        onClick={() => setCurrentView(action.view)}
                    />
                ))}

                {/* Profile Card */}
                <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                    <UserIcon className="w-16 h-16 text-[#0EA5E9] mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-1">Perfil Atual</h3>
                    <p className="text-gray-800 font-medium mb-1">Solicitante Área Fim</p>
                    <p className="text-gray-300 text-sm font-light">Administração do Sistema</p>
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;
