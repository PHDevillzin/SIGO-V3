
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
  userPermissions: string[];
  selectedProfile: string;
  isApproverStrategic?: boolean;
  isApproverSede?: boolean;
  isRequesterStrategic?: boolean;
  isRequesterSede?: boolean;
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

const HomeScreen: React.FC<HomeScreenProps> = ({ 
    setCurrentView, 
    userPermissions, 
    selectedProfile, 
    isApproverStrategic, 
    isApproverSede, 
    isRequesterStrategic, 
    isRequesterSede 
}) => {
    
    // Helper to check permission (Copied from Sidebar.tsx)
    const hasPermission = (permissionKey: string) => {
        // BLOCK: "Gestor (GSO)" cannot see Reclassification (Explicit Restriction)
        if (selectedProfile === 'Gestor (GSO)' && permissionKey === 'solicitacoes_reclassificacao') {
            return false;
        }

        // 1. Check for Admin wildcard
        if (userPermissions.includes('*') || userPermissions.includes('all')) return true;

        // Rules for 'Gestor Local' and 'Unidade Solicitante'
        const isRestrictedProfile = ['Gestor Local', 'Unidade Solicitante'].includes(selectedProfile);

        // Rule 1: Approval Screen
        if (permissionKey === 'aprovacao') {
            if (isApproverStrategic || isApproverSede) return true;
            if (isRestrictedProfile) return false;
        }

        // Rule 2: Open Request Screens 
        const hasGranularRequesterFlags = isRequesterStrategic || isRequesterSede;

        if (hasGranularRequesterFlags) {
            if (permissionKey === 'nova_estrategica') return !!isRequesterStrategic;
            if (permissionKey === 'nova_sede') return !!isRequesterSede;
        } else {
             if (permissionKey === 'nova_estrategica' && isRequesterStrategic) return true;
             if (permissionKey === 'nova_sede' && isRequesterSede) return true;
        }

        if (isRestrictedProfile) {
            if (permissionKey === 'nova_estrategica' || permissionKey === 'nova_sede') return false; 
            if (permissionKey === 'nova_unidade') return true; 
        }

        const permissionMap: Record<string, string[]> = {
          'home': ['Home'],
          'solicitacoes': ['Menu Solicitações:Gerais', 'Menu Solicitações:Gerais (PDF)', 'Menu Solicitações:Gerais (PDF + Ciência)'],
          'solicitacoes_reclassificacao': ['Menu Solicitações:Reclassificação'],
          'aprovacao': ['Menu Solicitações:Aprovação'],
          'manutencao': ['Menu Solicitações:Manutenção'],
          'nova_estrategica': ['Abrir Solicitações:Estratégica'],
          'nova_sede': ['Abrir Solicitações:Sede'],
          'nova_unidade': ['Abrir Solicitações:Unidade'],
          'gerenciamento': ['Gerenciamento:Planejamento', 'Gerenciamento:Plurianual'],
          'planejamento': ['Gerenciamento:Planejamento'],
          'plurianual': ['Gerenciamento:Plurianual'],
          'configuracoes': ['Configurações:Gestão de acesso', 'Configurações:Unidades'],
          'gestao_acesso': ['Configurações:Gestão de acesso'],
          'perfil_acesso': ['Configurações:Perfil Acesso'],
          'gerenciador_arquivos': ['Configurações:Arquivos'],
          'painel_criticidade': ['Configurações:Criticidade'],
          'avisos_globais': ['Configurações:Gerenciamento de Avisos'],
          'notificacoes_requisitos': ['Configurações:Notificações'],
          'cadastro_periodos': ['Configurações:Periodo de solicitação'],
          'cadastro_tipo_local': ['Configurações:Tipolocal'],
          'tipologias': ['Configurações:Tipologia'],
          'cadastro_unidades': ['Configurações:Unidades'],
          'politica_investimento': ['Configurações:PoliticaInvestimento'] // Assuming permission exists or defaults
        };

        const requiredPermissions = permissionMap[permissionKey];

        if (requiredPermissions) {
          return requiredPermissions.some(p => userPermissions.includes(p));
        }

        // Fallback checks
        if (permissionKey === 'politica_investimento') return true; // Default visible if not restricted

        return userPermissions.includes(permissionKey);
    };

    const actions = [
        {
            title: 'Nova Solicitação Sede',
            description: 'Crie uma nova solicitação de demanda para a Sede',
            buttonText: 'Abrir Solicitação Sede',
            buttonColor: 'blue',
            icon: PlusIcon,
            buttonIcon: PlusIcon,
            view: 'nova_sede',
            permission: 'nova_sede'
        },
        {
            title: 'Nova Solicitação Estratégica',
            description: 'Crie uma nova solicitação de demanda estratégica',
            buttonText: 'Abrir Solicitação Estratégica',
            buttonColor: 'blue',
            icon: PlusIcon,
            buttonIcon: PlusIcon,
            view: 'nova_estrategica',
            permission: 'nova_estrategica'
        },
        {
            title: 'Solicitações',
            description: 'Visualize e acompanhe suas solicitações',
            buttonText: 'Ver Solicitações',
            buttonColor: 'gray',
            icon: ListIcon,
            buttonIcon: EyeIcon,
            view: 'solicitacoes',
            permission: 'solicitacoes'
        },
        {
            title: 'Solicitações para Reclassificação',
            description: 'Reclassifique as demandas e envie para o planejamento',
            buttonText: 'Ver para Reclassificar',
            buttonColor: 'green',
            icon: CheckCircleIcon,
            buttonIcon: CheckCircleIcon,
            view: 'solicitacoes_reclassificacao',
            permission: 'solicitacoes_reclassificacao'
        },
        {
            title: 'Solicitações para Ciência',
            description: 'Visualize solicitações para conhecimento',
            buttonText: 'Ver para Ciência',
            buttonColor: 'gray',
            icon: InformationCircleIcon,
            buttonIcon: InformationCircleIcon,
            view: 'ciencia',
            permission: 'solicitacoes' // Reusing general view permission or map to specific
        },
        {
            title: 'Solicitações para Aprovação',
            description: 'Analise e aprove solicitações pendentes',
            buttonText: 'Ver para Aprovação',
            buttonColor: 'green',
            icon: CheckCircleIcon,
            buttonIcon: CheckCircleIcon,
            view: 'aprovacao',
            permission: 'aprovacao'
        },
         {
            title: 'Tipologias',
            description: 'Gerencie as tipologias do sistema',
            buttonText: 'Ver Tipologias',
            buttonColor: 'gray',
            icon: InformationCircleIcon,
            buttonIcon: InformationCircleIcon,
            view: 'tipologias',
            permission: 'tipologias'
        },
         {
            title: 'Planejamento',
            description: 'Visualize e acompanhe o planejamento consolidado',
            buttonText: 'Ver Planejamento',
            buttonColor: 'gray',
            icon: ShareIcon,
            buttonIcon: EyeIcon,
            view: 'planejamento',
            permission: 'planejamento'
        },
         {
            title: 'Plurianual',
            description: 'Visualize e acompanhe o planejamento plurianual',
            buttonText: 'Ver Plurianual',
            buttonColor: 'gray',
            icon: ClipboardDocumentListIcon,
            buttonIcon: EyeIcon,
            view: 'plurianual',
            permission: 'plurianual'
        },
        {
            title: 'Política de Investimento',
            description: 'Visualize a política de investimento',
            buttonText: 'Ver Política',
            buttonColor: 'gray',
            icon: BanknotesIcon,
            buttonIcon: EyeIcon,
            view: 'politica_investimento',
            permission: 'politica_investimento'
        }
    ];

    const visibleActions = actions.filter(action => hasPermission(action.permission));

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-3">
                <HomeIcon className="w-6 h-6 text-gray-600" />
                <h1 className="text-xl font-bold text-gray-800">Bem-vindo ao Sistema SESI / SENAI</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleActions.map((action, index) => (
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
