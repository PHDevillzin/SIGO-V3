require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper to parse dates (DD/MM/YYYY or DD/MM/YYYY HH:MM)
function parseDate(dateStr) {
    if (!dateStr || dateStr === 'N/A') return null;
    
    // Check if it matches typical ISO format just in case
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) return dateStr;

    try {
        const [datePart, timePart] = dateStr.split(' ');
        const [day, month, year] = datePart.split('/');
        
        let date = new Date(`${year}-${month}-${day}`);
        
        if (timePart) {
            const [hours, minutes] = timePart.split(':');
            date.setHours(parseInt(hours, 10));
            date.setMinutes(parseInt(minutes, 10));
        }

        if (isNaN(date.getTime())) return null;
        return date;
    } catch (e) {
        console.warn(`Failed to parse date: ${dateStr}`);
        return null;
    }
}

// Data Sources
const profilesData = [
    { id: '1', name: 'Administração do Sistema', permissions: ['all'] },
    { id: '2', name: 'Alta Administração Senai', permissions: ['home', 'solicitacoes', 'aprovacao'] },
    { id: '3', name: 'Solicitação Unidade', permissions: ['home', 'solicitacoes', 'nova_unidade'] },
    { id: '4', name: 'Gestor GSO', permissions: ['home', 'solicitacoes'] },
    { id: '5', name: 'Diretoria Corporativa', permissions: ['home', 'solicitacoes', 'aprovacao'] },
    { id: '6', name: 'Gerência de Infraestrutura e Suprimento', permissions: ['home', 'solicitacoes', 'nova_estrategica', 'nova_sede'] },
    { id: '7', name: 'Gestor Local', permissions: ['home', 'solicitacoes', 'aprovacao'] },
    { id: '8', name: 'Gerência de Infraestrutura e Suprimento - Aprovador', permissions: ['home', 'solicitacoes', 'aprovacao'] },
    { id: '9', name: 'Gerência Sênior de Tecnologia da Informação', permissions: ['home', 'solicitacoes', 'nova_sede'] },
    { id: '10', name: 'Gerência Sênior de Tecnologia da Informação - Aprovador', permissions: ['home', 'solicitacoes', 'aprovacao'] },
    { id: '11', name: 'Gerência de Saúde e Segurança', permissions: ['home', 'solicitacoes', 'nova_estrategica', 'nova_sede'] },
    { id: '12', name: 'Gerência de Educação', permissions: ['home', 'solicitacoes', 'nova_estrategica', 'nova_sede'] },
    { id: '13', name: 'Gerência de Educação - Aprovador', permissions: ['home', 'solicitacoes', 'aprovacao'] },
];

const tipologiasData = [
  { id: 1, titulo: 'Ambientes CQV', descricao: 'Adequações, construções...', dataInclusao: '10/11/2025 16:21', criadoPor: 'RAPHAEL SUAVE BOR...', status: true },
  { id: 2, titulo: 'Climatização / exaustão', descricao: 'Projetos, instalações ou ...', dataInclusao: '10/11/2025 16:21', criadoPor: 'RAPHAEL SUAVE BOR...', status: true },
  { id: 3, titulo: 'Bloco anexo', descricao: 'Intervenções voltadas à ...', dataInclusao: '10/11/2025 16:21', criadoPor: 'RAPHAEL SUAVE BOR...', status: true },
  { id: 4, titulo: 'Reforma', descricao: 'reforma', dataInclusao: '05/11/2025 15:06', criadoPor: 'JULIA ANDRADE SILVA', status: false },
];

const tipoLocaisData = [
  { id: 1, descricao: 'Faculdade', dataInclusao: '10/11/2025 16:21', criadoPor: 'RAPHAEL SUAVE BOR...', status: true },
  { id: 2, descricao: 'CAT', dataInclusao: '10/11/2025 16:21', criadoPor: 'RAPHAEL SUAVE BOR...', status: true },
  { id: 3, descricao: 'CE', dataInclusao: '10/11/2025 16:21', criadoPor: 'RAPHAEL SUAVE BOR...', status: true },
  { id: 4, descricao: 'Sede', dataInclusao: '05/11/2025 15:06', criadoPor: 'JULIA ANDRADE SILVA', status: false },
];

// Placeholders for larger datasets to be injected
const usersData = [
    { id: "25", nif: "SS0000002", name: "Ana Beatriz Costa", email: "ana.costa@sesisenaisp.org.br", unidade: "SESI - Campinas", profile: "Unidade", createdBy: "Daniel", createdAt: "10/01/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "26", nif: "SN0000004", name: "Bruno Alves", email: "bruno.alves@sesisenaisp.org.br", unidade: "", profile: "Sede", createdBy: "Paulo H. R. Silva", createdAt: "12/02/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "27", nif: "SS0000003", name: "Carlos Eduardo Lima", email: "carlos.lima@sesisenaisp.org.br", unidade: "SESI - Jundiaí", profile: "Gestor de unidade", createdBy: "Rafael", createdAt: "05/03/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "28", nif: "SN0000005", name: "Daniela Ferreira", email: "daniela.ferreira@sesisenaisp.org.br", unidade: "SESI - Jundiaí", profile: "Unidade", createdBy: "Teste", createdAt: "18/04/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "29", nif: "SS0000004", name: "Fernando Almeida", email: "fernando.almeida@sesisenaisp.org.br", unidade: "", profile: "Sede", createdBy: "Paulo H. R. Silva", createdAt: "22/07/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "30", nif: "SN0000006", name: "Fernanda Gonçalves", email: "fernanda.goncalves@sesisenaisp.org.br", unidade: "SENAI - Osasco", profile: "Gestor de unidade", createdBy: "Daniel", createdAt: "14/05/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "31", nif: "SS0000005", name: "Gustavo Ribeiro", email: "gustavo.ribeiro@sesisenaisp.org.br", unidade: "SESI - Piracicaba", profile: "Unidade", createdBy: "Teste", createdAt: "30/06/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "32", nif: "SN0000007", name: "Helena Souza", email: "helena.souza@sesisenaisp.org.br", unidade: "", profile: "Sede", createdBy: "Paulo H. R. Silva", createdAt: "09/08/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "33", nif: "SS0000001", name: "Paulo H. R. Silva", email: "paulo.ribeiro.3@sesisenaisp.org.br", unidade: "", profile: "Gerência de Facilities", createdBy: "Sistema", createdAt: "01/01/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "34", nif: "SN0000001", name: "Daniel", email: "daniel@sesisenaisp.org.br", unidade: "", profile: "Sede", createdBy: "Sistema", createdAt: "01/01/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "35", nif: "SN0000002", name: "Rafael", email: "rafael@sesisenaisp.org.br", unidade: "SENAI - SP - Brás", profile: "Gestor de unidade", createdBy: "Sistema", createdAt: "01/01/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "36", nif: "SN0000003", name: "Teste", email: "teste@sesisenaisp.org.br", unidade: "SENAI - SP - Mooca", profile: "Unidade", createdBy: "Sistema", createdAt: "01/01/2023", updatedAt: "2025-12-16 12:14:35.831+00" },
    { id: "37", nif: "SN0000008", name: "Ana Silva", email: "ana.silva@sesisenaisp.org.br", unidade: "", profile: "Sede", createdBy: "Paulo H. R. Silva", createdAt: "26/12/2025", updatedAt: "2025-12-26 18:23:14.53+00" }
];
/* REQUESTS_DATA_PLACEHOLDER */
const requestsData = [
    { id: 1, criticality: 'Imediata', unit: 'CAT Cubatão (Par...', description: 'reforma do balneá...', status: 'Análise da Solicit...', currentLocation: 'Gestão Local', gestorLocal: 'MARIO SERGIO ALVES QUAR...', expectedStartDate: '05/01/2028', hasInfo: true, expectedValue: '3,5 mi', executingUnit: 'GSO', prazo: 24, categoriaInvestimento: 'Reforma Estratégica', entidade: 'SENAI', ordem: 'SS-28-0001-P', situacaoProjeto: 'Em Andamento', situacaoObra: 'Não Iniciada', inicioObra: '05/01/2030', saldoObraPrazo: 12, saldoObraValor: 'R$ 3.500.000,00' },
    { id: 2, criticality: 'Imediata', unit: 'CAT Cubatão (Par...', description: 'Troca do alambra...', status: 'Análise da Solicit...', currentLocation: 'Gestão Local', gestorLocal: 'MARIO SERGIO ALVES QUAR...', expectedStartDate: '03/11/2025', hasInfo: false, expectedValue: '300 mil', executingUnit: 'GSO', prazo: 6, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SESI', ordem: 'SS-25-0002-O', situacaoProjeto: 'Concluído', situacaoObra: 'A Realizar', inicioObra: '01/05/2026', saldoObraPrazo: 6, saldoObraValor: 'R$ 300.000,00' },
    { id: 3, criticality: 'Crítica', unit: '9.14 Presidente P...', description: 'Construção de ba...', status: 'Recusada', currentLocation: 'Gestão Local', gestorLocal: 'SHERMAN WILLIAN MUKOYAMA', expectedStartDate: '03/11/2025', hasInfo: false, expectedValue: '250 mil', executingUnit: 'GSO', prazo: 6, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SESI', ordem: 'SS-25-0003-O', situacaoProjeto: 'N/A', situacaoObra: 'A Realizar', inicioObra: '01/06/2026', saldoObraPrazo: 5, saldoObraValor: 'R$ 250.000,00' },
    { id: 4, criticality: 'Crítica', unit: 'Sede', description: 'Reforma do servidor', status: 'Análise da Solicit...', currentLocation: 'Diretoria Corporat...', gestorLocal: '-', expectedStartDate: '05/01/2026', hasInfo: false, expectedValue: '50 mi', executingUnit: 'GSO', prazo: 36, categoriaInvestimento: 'Nova Unidade', entidade: 'SENAI', ordem: 'SS-26-0004-P', situacaoProjeto: 'A Iniciar', situacaoObra: 'Não Iniciada', inicioObra: '01/01/2029', saldoObraPrazo: 24, saldoObraValor: 'R$ 50.000.000,00' },
    { id: 5, criticality: 'Crítica', unit: '1.35 Santana de ...', description: 'Ampliação bloco A', status: 'Análise da Solicit...', currentLocation: 'Gestão Área Fim', gestorLocal: 'RAPHAEL SUAVE BORGES', expectedStartDate: '03/11/2026', hasInfo: true, expectedValue: '350 mil', executingUnit: 'Unidade', prazo: 8, categoriaInvestimento: 'Reforma Operacional', entidade: 'SENAI', ordem: 'SS-26-0005-O', situacaoProjeto: 'Em Revisão', situacaoObra: 'Aguardando', inicioObra: '10/10/2027', saldoObraPrazo: 8, saldoObraValor: 'R$ 350.000,00' },
    { id: 6, criticality: 'Crítica', unit: 'Nova Escola SESI...', description: 'teste', status: 'Análise da Solicit...', currentLocation: 'Gestão Área Fim', gestorLocal: '-', expectedStartDate: '05/11/2026', hasInfo: true, expectedValue: '425 mil', executingUnit: 'Unidade', prazo: 10, categoriaInvestimento: 'Reforma Operacional', entidade: 'SESI', ordem: 'SS-26-0006-O', situacaoProjeto: 'Concluído', situacaoObra: 'Em Licitação', inicioObra: '01/02/2027', saldoObraPrazo: 10, saldoObraValor: 'R$ 425.000,00' },
    { id: 7, criticality: 'Crítica', unit: 'CE 087 - Santos (...', description: 'Reforma de cozinha', status: 'Análise da Solicit...', currentLocation: 'Gestão Local', gestorLocal: 'MARIO SERGIO ALVES QUAR...', expectedStartDate: '04/11/2025', hasInfo: false, expectedValue: '200 mil', executingUnit: 'GSO', prazo: 4, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-25-0007-P', situacaoProjeto: 'N/A', situacaoObra: 'A Realizar', inicioObra: '15/01/2026', saldoObraPrazo: 4, saldoObraValor: 'R$ 200.000,00' },
    { id: 8, criticality: 'Mínima', unit: '1.01 Brás - Ro...', description: 'ciencia senai ...', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: 'José Silva', expectedStartDate: '05/11/2025', hasInfo: false, expectedValue: '250 mil', executingUnit: 'Unidade', prazo: 5, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-25-0008-P', situacaoProjeto: 'N/A', situacaoObra: 'A Realizar', inicioObra: '20/01/2026', saldoObraPrazo: 5, saldoObraValor: 'R$ 250.000,00' },
    { id: 9, criticality: 'Mínima', unit: 'CAT Santos (J...', description: '11350310 - ci...', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: 'Maria Oliveira', expectedStartDate: '05/11/2025', hasInfo: false, expectedValue: '220 mil', executingUnit: 'GSO', prazo: 4, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-25-0009-P', situacaoProjeto: 'N/A', situacaoObra: 'A Realizar', inicioObra: '01/03/2026', saldoObraPrazo: 4, saldoObraValor: 'R$ 220.000,00' },
    { id: 10, criticality: 'Mínima', unit: '1.01 Brás - Ro...', description: '02101251- tes...', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: 'Carlos Souza', expectedStartDate: '05/11/2025', hasInfo: false, expectedValue: '250 mil', executingUnit: 'GSO', prazo: 5, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-25-0010-P', situacaoProjeto: 'N/A', situacaoObra: 'A Realizar', inicioObra: '10/02/2026', saldoObraPrazo: 5, saldoObraValor: 'R$ 250.000,00' },
    { id: 11, criticality: 'Mínima', unit: 'CAT Santos (J...', description: 'ciÊncia 03100...', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: 'Ana Santos', expectedStartDate: '06/11/2025', hasInfo: false, expectedValue: '500 mil', executingUnit: 'GSO', prazo: 12, categoriaInvestimento: 'Reforma Operacional', entidade: 'SENAI', ordem: 'SS-25-0011-O', situacaoProjeto: 'Em Andamento', situacaoObra: 'Não Iniciada', inicioObra: '01/06/2026', saldoObraPrazo: 12, saldoObraValor: 'R$ 500.000,00' },
    { id: 12, criticality: 'Mínima', unit: 'CAT Santos (J...', description: 'teste gso', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: 'Pedro Lima', expectedStartDate: '06/11/2025', hasInfo: false, expectedValue: '200 mil', executingUnit: 'GSO', prazo: 3, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-25-0012-P', situacaoProjeto: 'N/A', situacaoObra: 'A Realizar', inicioObra: '15/03/2026', saldoObraPrazo: 3, saldoObraValor: 'R$ 200.000,00' },
    { id: 13, criticality: 'Mínima', unit: 'CAT Ribeirão ...', description: 'Instalação de ...', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: 'Fernanda Costa', expectedStartDate: '06/11/2025', hasInfo: false, expectedValue: '250 mil', executingUnit: 'GSO', prazo: 5, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-25-0013-O', situacaoProjeto: 'N/A', situacaoObra: 'A Realizar', inicioObra: '20/04/2026', saldoObraPrazo: 5, saldoObraValor: 'R$ 250.000,00' },
    { id: 14, criticality: 'Mínima', unit: '1.01 Brás - Ro...', description: '02101306 - ci...', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: 'Lucas Pereira', expectedStartDate: '04/11/2027', hasInfo: true, expectedValue: '200 mil', executingUnit: 'GSO', prazo: 4, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-27-0014-P', situacaoProjeto: 'N/A', situacaoObra: 'A Realizar', inicioObra: '01/02/2028', saldoObraPrazo: 4, saldoObraValor: 'R$ 200.000,00' },
    { id: 15, criticality: 'Crítica', unit: 'Sede', description: 'Nova Demanda ...', status: 'Em Aprovação', currentLocation: 'Diretoria', gestorLocal: '-', expectedStartDate: '10/12/2025', hasInfo: false, expectedValue: '150 mil', executingUnit: 'Sede', prazo: 3, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SESI', ordem: 'SS-25-0015-P', situacaoProjeto: 'Concluído', situacaoObra: 'A Realizar', inicioObra: '01/01/2026', saldoObraPrazo: 3, saldoObraValor: 'R$ 150.000,00' },
    { id: 16, criticality: 'Imediata', unit: 'CAT Tatuapé', description: 'Reforma Urgente', status: 'Planejamento', currentLocation: 'GSO', gestorLocal: 'Roberto Almeida', expectedStartDate: '01/02/2026', hasInfo: false, expectedValue: '1.2 mi', executingUnit: 'GSO', prazo: 18, categoriaInvestimento: 'Reforma Estratégica', entidade: 'SENAI', ordem: 'SS-26-0016-P', situacaoProjeto: 'Em Andamento', situacaoObra: 'Não Iniciada', inicioObra: '01/08/2027', saldoObraPrazo: 18, saldoObraValor: 'R$ 1.200.000,00' },
    { id: 17, criticality: 'Média', unit: 'Escola SENAI', description: 'Upgrade de Lab...', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: 'Juliana Rocha', expectedStartDate: '08/08/2026', hasInfo: false, expectedValue: '750 mil', executingUnit: 'Unidade', prazo: 12, categoriaInvestimento: 'Reforma Operacional', entidade: 'SENAI', ordem: 'SS-26-0017-O', situacaoProjeto: 'Em Revisão', situacaoObra: 'Aguardando', inicioObra: '10/10/2027', saldoObraPrazo: 12, saldoObraValor: 'R$ 750.000,00' },
    { id: 18, criticality: 'Mínima', unit: 'CAT Osasco', description: 'Manutenção Rot...', status: 'Concluído', currentLocation: 'Unidade', gestorLocal: 'Ricardo Gomes', expectedStartDate: '03/03/2024', hasInfo: false, expectedValue: '50 mil', executingUnit: 'Unidade', prazo: 2, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-24-0018-P', situacaoProjeto: 'Concluído', situacaoObra: 'Concluída', inicioObra: '01/05/2024', saldoObraPrazo: 0, saldoObraValor: 'R$ 0,00' },
    { id: 19, criticality: 'Crítica', unit: 'Sede', description: 'Expansão de ...', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: '-', expectedStartDate: '09/09/2027', hasInfo: false, expectedValue: '2.5 mi', executingUnit: 'GSO', prazo: 24, categoriaInvestimento: 'Reforma Estratégica', entidade: 'SESI', ordem: 'SS-27-0019-P', situacaoProjeto: 'A Iniciar', situacaoObra: 'Não Iniciada', inicioObra: '01/01/2029', saldoObraPrazo: 24, saldoObraValor: 'R$ 2.500.000,00' },
    { id: 20, criticality: 'Média', unit: 'CAT Campinas', description: 'Reforma de Fachada', status: 'Em Execução', currentLocation: 'Unidade', gestorLocal: 'Camila Martins', expectedStartDate: '07/06/2025', hasInfo: false, expectedValue: '400 mil', executingUnit: 'Unidade', prazo: 9, categoriaInvestimento: 'Reforma Operacional', entidade: 'SENAI', ordem: 'SS-25-0020-O', situacaoProjeto: 'Concluído', situacaoObra: 'Em Execução', inicioObra: '10/03/2026', saldoObraPrazo: 6, saldoObraValor: 'R$ 200.000,00' },
    { id: 21, criticality: 'Mínima', unit: '1.01 Brás - Ro...', description: 'Pintura Interna', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: 'Felipe Barbosa', expectedStartDate: '11/11/2025', hasInfo: false, expectedValue: '90 mil', executingUnit: 'GSO', prazo: 3, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SENAI', ordem: 'SS-25-0021-P', situacaoProjeto: 'N/A', situacaoObra: 'A Realizar', inicioObra: '20/01/2026', saldoObraPrazo: 3, saldoObraValor: 'R$ 90.000,00' },
    { id: 22, criticality: 'Média', unit: 'Oficina Central', description: 'Manutenção Preventiva Tornos', status: 'Análise da Sol...', currentLocation: 'GSO', gestorLocal: 'Gustavo Dias', expectedStartDate: '15/01/2026', hasInfo: false, expectedValue: '80 mil', executingUnit: 'Unidade', prazo: 3, categoriaInvestimento: 'Manutenção', entidade: 'SENAI', ordem: 'SS-26-0022-M', tipologia: 'Tipologia B', situacaoProjeto: 'N/A', situacaoObra: 'N/A', inicioObra: 'N/A', saldoObraPrazo: 0, saldoObraValor: 'N/A' },
];
// Read Units from component file
const unitsFilePath = path.join(__dirname, '../components/UnitsScreen.tsx');
let unitsData = [];
try {
    const unitsFileContent = fs.readFileSync(unitsFilePath, 'utf8');
    const match = unitsFileContent.match(/const rawData = `([\s\S]*?)`;/);
    if (match && match[1]) {
            unitsData = match[1].trim().split('\n').map((line, index) => {
            const cols = line.split(';');
            return {
                id: index + 1,
                codigoUnidade: cols[0]?.trim() || '',
                entidade: (cols[1]?.trim() === 'SESI' || cols[1]?.trim() === 'SENAI') ? cols[1].trim() : 'SESI',
                tipo: cols[2]?.trim() || '',
                centro: cols[3]?.trim() || '',
                cat: cols[4]?.trim() || '',
                unidade: cols[5]?.trim() || '',
                cidade: cols[6]?.trim() || '',
                bairro: cols[7]?.trim() || '',
                endereco: cols[8]?.trim() || '',
                cep: cols[9]?.trim() || '',
                re: cols[10]?.trim() || '',
                responsavelRE: cols[11]?.trim() || '',
                ra: cols[12]?.trim() || '',
                responsavelRA: cols[13]?.trim() || '',
                responsavelRAR: cols[14]?.trim() || '',
                tipoDeUnidade: cols[15]?.trim() || '',
                unidadeResumida: cols[16]?.trim() || '',
                gerenteRegional: cols[17]?.trim() || '',
                emailGR: cols[18]?.trim() || '',
                site: cols[19]?.trim() || '',
                latitude: cols[20]?.trim() || '',
                longitude: cols[21]?.trim() || '',
            };
        });
    }
} catch (error) {
    console.error('Error reading UnitsScreen.tsx:', error);
}

async function seed() {
    const client = await pool.connect();
    
    // Execute Schema
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        console.log('Applying Schema...');
        await client.query(schemaSql);
    } catch (e) {
        console.error('Error applying schema:', e);
        throw e;
    }
    try {
        await client.query('BEGIN');

        console.log('Seeding Profiles...');
        for (const profile of profilesData) {
             await client.query(`
                INSERT INTO profiles (id, name, permissions)
                VALUES ($1, $2, $3)
                ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, permissions = EXCLUDED.permissions;
            `, [profile.id, profile.name, profile.permissions]);
        }

        console.log('Seeding Tipologias...');
        for (const tipo of tipologiasData) {
            await client.query(`
                INSERT INTO tipologias (titulo, descricao, data_inclusao, criado_por, status)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (id) DO NOTHING; -- Assuming ID is serial and we might want to let it auto-inc or matched by content. For now conflict on ID if explicitly set in INSERT (not here) won't work without overriding system value. 
                -- Actually, for initial seed we usually let Postgres handle IDs or force them. 
                -- Let's just reset the sequence later.
            `, [tipo.titulo, tipo.descricao, parseDate(tipo.dataInclusao), tipo.criadoPor, tipo.status]);
        }

        console.log('Seeding Tipo Locais...');
        for (const local of tipoLocaisData) {
             await client.query(`
                INSERT INTO tipo_locais (descricao, data_inclusao, criado_por, status)
                VALUES ($1, $2, $3, $4)
                 ON CONFLICT (id) DO NOTHING;
            `, [local.descricao, parseDate(local.dataInclusao), local.criadoPor, local.status]);
        }

        console.log('Seeding Users...');
        for (const user of usersData) {
            await client.query(`
                INSERT INTO users (nif, name, email, unidade, profile, created_by, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (nif) DO NOTHING;
            `, [user.nif, user.name, user.email, user.unidade, user.profile, user.createdBy, parseDate(user.createdAt), parseDate(user.updatedAt)]);
        }
        
        console.log('Seeding Requests...');
        for (const req of requestsData) {
            await client.query(`
                INSERT INTO requests (
                    id, criticality, unit, description, status, current_location, 
                    gestor_local, expected_start_date, has_info, expected_value, 
                    executing_unit, prazo, categoria_investimento, entidade, 
                    ordem, situacao_projeto, situacao_obra, inicio_obra, 
                    saldo_obra_prazo, saldo_obra_valor, tipologia
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
                 ON CONFLICT (id) DO NOTHING;
            `, [
                req.id, // $1
                req.criticality, // $2
                req.unit, // $3
                req.description, // $4
                req.status, // $5
                req.currentLocation, // $6
                req.gestorLocal, // $7
                parseDate(req.expectedStartDate), // $8
                req.hasInfo, // $9
                req.expectedValue, // $10
                req.executingUnit, // $11
                req.prazo, // $12
                req.categoriaInvestimento, // $13
                req.entidade, // $14
                req.ordem, // $15
                req.situacaoProjeto, // $16
                req.situacaoObra, // $17
                parseDate(req.inicioObra), // $18
                req.saldoObraPrazo, // $19
                req.saldoObraValor, // $20
                req.tipologia || null // $21
            ]);
        }
        
        console.log(`Seeding ${unitsData.length} Units...`);
        for (const unit of unitsData) {
            await client.query(`
                INSERT INTO units (
                    id, codigo_unidade, entidade, tipo, centro, cat, unidade, cidade, 
                    bairro, endereco, cep, re, responsavel_re, ra, responsavel_ra, 
                    responsavel_rar, tipo_de_unidade, unidade_resumida, gerente_regional, 
                    email_gr, site, latitude, longitude
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
                ON CONFLICT (id) DO NOTHING;
            `, [
                unit.id, unit.codigoUnidade, unit.entidade, unit.tipo, unit.centro, unit.cat,
                unit.unidade, unit.cidade, unit.bairro, unit.endereco, unit.cep,
                unit.re, unit.responsavelRE, unit.ra, unit.responsavelRA,
                unit.responsavelRAR, unit.tipoDeUnidade, unit.unidadeResumida,
                unit.gerenteRegional, unit.emailGR, unit.site, unit.latitude, unit.longitude
            ]);
        }

        // Reset sequences to avoid ID collisions for future inserts
        await client.query(`SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));`);
        await client.query(`SELECT setval('units_id_seq', (SELECT MAX(id) FROM units));`);
        await client.query(`SELECT setval('requests_id_seq', (SELECT MAX(id) FROM requests));`);
        await client.query(`SELECT setval('tipologias_id_seq', (SELECT MAX(id) FROM tipologias));`);
        await client.query(`SELECT setval('tipo_locais_id_seq', (SELECT MAX(id) FROM tipo_locais));`);

        await client.query('COMMIT');
        console.log('Seeding completed successfully.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error during seeding:', e);
    } finally {
        client.release();
        pool.end();
    }
}

seed();
