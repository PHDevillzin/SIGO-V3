export const MENUS = [
    {
        name: 'Home',
        items: [
            { id: 'home', label: 'Home', backendKeys: ['Home'] }
        ]
    },
    {
        name: 'Menu Solicitações',
        items: [
            { id: 'solicitacoes', label: 'Solicitações gerais', backendKeys: ['Menu Solicitações:Gerais', 'Menu Solicitações:Gerais (PDF)', 'Menu Solicitações:Gerais (PDF + Ciência)', 'Menu Solicitações:Gerais (PDF)'] },
            { id: 'solicitacoes_reclassificacao', label: 'Solicitações para reclassificação', backendKeys: ['Menu Solicitações:Reclassificação'] },
            { id: 'aprovacao', label: 'Solicitações para aprovação', backendKeys: ['Menu Solicitações:Aprovação'] },
            { id: 'manutencao', label: 'Manutenção', backendKeys: ['Menu Solicitações:Manutenção'] }
        ]
    },
    {
        name: 'Abrir Solicitações',
        items: [
            { id: 'nova_estrategica', label: 'Abrir Estratégica', backendKeys: ['Abrir Solicitações:Estratégica'] },
            { id: 'nova_sede', label: 'Abrir Sede', backendKeys: ['Abrir Solicitações:Sede'] },
            { id: 'nova_unidade', label: 'Abrir Unidade', backendKeys: ['Abrir Solicitações:Unidade'] }
        ]
    },
    {
        name: 'Gerenciamento',
        items: [
            { id: 'planejamento', label: 'Planejamento', backendKeys: ['Gerenciamento:Planejamento'] },
            { id: 'plurianual', label: 'Plurianual', backendKeys: ['Gerenciamento:Plurianual'] }
        ]
    },
    {
        name: 'Configurações',
        items: [
            { id: 'gestao_acesso', label: 'Gestão acesso', backendKeys: ['Configurações:Gestão de acesso'] },
            { id: 'perfil_acesso', label: 'Perfil acesso', backendKeys: ['Configurações:Perfil Acesso'] },
            { id: 'gerenciador_arquivos', label: 'Arquivos', backendKeys: ['Configurações:Arquivos'] },
            { id: 'painel_criticidade', label: 'Criticidade', backendKeys: ['Configurações:Criticidade'] },
            { id: 'avisos_globais', label: 'Gerenciamento de avisos', backendKeys: ['Configurações:Gerenciamento de Avisos'] },
            { id: 'notificacoes_requisitos', label: 'Notificações e requisitos', backendKeys: ['Configurações:Notificações'] },
            { id: 'cadastro_periodos', label: 'Período Solicitação', backendKeys: ['Configurações:Periodo de solicitação'] },
            { id: 'cadastro_tipo_local', label: 'Tipo local', backendKeys: ['Configurações:Tipolocal'] },
            { id: 'tipologias', label: 'Tipologia', backendKeys: ['Configurações:Tipologia'] },
            { id: 'cadastro_unidades', label: 'Unidades', backendKeys: ['Configurações:Unidades'] }
        ]
    }
];
