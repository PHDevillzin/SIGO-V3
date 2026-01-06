import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set. Please set it in your .env file.');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

// --- DATA ---

const rawUnitsData = `Complexo Cultural;SESI;CAT;1031;1031 CAT Mario Amato - Ermelino Matarazzo;Complexo Cultural Itaquera SESI SENAI;São Paulo - Itaquera;Artur Alvim;Av. Miguel Ignácio Curi, s/nº;08295-005;RE01;Renata Caparroz;RA01;Heber Turquetti;Wellington Rodrigues;Própria;Complexo Cultural;Silvia Simoni Orlando;silviasimoni@sesisp.org.br;https://itaquera.sesisp.org.br/complexo-cultural;-23.5329;-46.6395
Complexo Educacional;SESI;CE;1031;1031 CAT Mario Amato - Ermelino Matarazzo;Complexo Educacional Itaquera;São Paulo - Itaquera;Artur Alvim;Av. Miguel Ignácio Curi, s/nº;08295-005;RE01;Renata Caparroz;RA01;Heber Turquetti;Wellington Rodrigues;Própria;Complexo Educacional;Silvia Simoni Orlando;silviasimoni@sesisp.org.br;https://itaquera.sesisp.org.br/;-23.5329;-46.6395
Sede;SESI;Sede;1001;Administração Central;Edifício Sede - Centro Cultural FIESP;São Paulo - Av. Paulista;Cerqueira César;Av. Paulista, nº 1313;01311-200;RE02;Lucas Attili;RA01;Heber Turquetti;Wellington Rodrigues;Própria;Sede - Centro Cultural;-;-;http://centroculturalfiesp.com.br/;-23.5329;-46.6395
ESC - Atibaia;SESI;Estação de Cultura;1234;1045 CAT Morvan Dias de Figueiredo - Guarulhos;Estação SESI de Cultura - Atibaia;Atibaia;Jardim das Cerejeiras;Rua da Meca, nº 360;12951-300;RE06;Lucas Attili;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;Cultura Atibaia;Carlos Frederico D'Avila de Brito ;cbrito@sesisp.org.br;https://atibaia-cultura.sesisp.org.br/;-23.1171;-46.5563
ESC - Cosmópolis;SESI;Estação de Cultura;1233;1038 CAT Estevam Faraone - Americana;Estação SESI de Cultura - Cosmópolis;Cosmópolis;Pq. Residencial Rosamelia;Av. Saudade, nº 110;13152-260;RE12;Daiane Bueno;RA03;Fausto Natsui;Telma Ferrari;Própria;Cultura Cosmópolis;Guilherme Castilho Sábio;guilherme.sabio@sesisp.org.br;https://cosmopolis-cultura.sesisp.org.br/;-22.6419;-47.1926
ESC - Santa Rita do Passa Quatro;SESI;Estação de Cultura;1237;1036 CAT Laerte Michielin - Araras;Estação SESI de Cultura - Santa Rita do Passa Quatro;Santa Rita do Passa Quatro;Jardim Itália;Rua José Gracioso, nº 140;13670-000;RE14;Silvio Penteado;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;Cultura Santa Rita do Passa Quatro;Stephanie Helena Mariano;smariano@sesisp.org.br;https://santarita-cultura.sesisp.org.br/;-21.7083;-47.478
Mauá;SESI;CE;1015;1015 CAT Min. Raphael de A. Magalhães - Mauá;Nova Escola SESI - Mauá (Vila Vitória);Mauá;Vila Vitória;Rua Carlos Tamagnini, s/nº;09360-160;RE01;Renata Caparroz;RA01;Heber Turquetti;Wellington Rodrigues;Própria;Mauá;Silvia Simoni Orlando;silviasimoni@sesisp.org.br;https://maua.sesisp.org.br/;-23.6677;-46.4613
Galeria de Arte;SESI;Sede;1001;Administração Central;Edifício Sede - Galeria de Arte do Centro Cultural FIESP;São Paulo - Av. Paulista;Cerqueira César;Av. Paulista, nº 1313;01311-200;RE02;Lucas Attili;RA01;Heber Turquetti;Wellington Rodrigues;Própria;Sede - Galeria de Arte;-;-;http://centroculturalfiesp.com.br/;-23.5329;-46.6395
Teatro Paulista;SESI;Sede;1124;Administração Central;Edifício Sede - Teatro do Centro Cultural FIESP;São Paulo - Av. Paulista;Cerqueira César;Av. Paulista, nº 1313;01311-200;RE02;Lucas Attili;RA01;Heber Turquetti;Wellington Rodrigues;Própria;Sede - Teatro;-;-;http://centroculturalfiesp.com.br/;-23.5329;-46.6395
Ginásio Bauru;SESI; CAT;1240;1013 CAT Raphael Noschese - Bauru;CAT Paulo Skaf (Ginásio);Bauru;Vila Santa Izabel;Rua Rubens Arruda, nº 8-50;17014-300;RE16;Ailton dos Santos;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;Ginásio Bauru;Pedro Luiz Caliari;plcaliari@sesisp.org.br;https://bauru.sesisp.org.br/;-22.3246;-49.0871
5;SESI; CE;1084;1037 CAT Mario Pugliese - Limeira;CE 005 - Limeira (Nova Suíça);Limeira;Jardim Suiça;Rua Arthur Voight, nº 250;13486-009;RE13;Gabriela Morelli;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 005 - Limeira;Jader Luiz Serni;jserni@sesisp.org.br;https://limeira.sesisp.org.br/;-22.566;-47.397
12;SESI; CE;1152;1045 CAT Morvan Dias de Figueiredo - Guarulhos;CE 012 - Bragança Paulista;Bragança Paulista;Jardim Morumbi;Avenida Ernesto Vaz de Lima, nº 740;12926-215;RE06;Lucas Attili;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 012 - Bragança Paulista;Carlos Frederico D'Avila de Brito ;cbrito@sesisp.org.br;https://jundiai.sesisp.org.br/;-22.9527;-46.5419
13;SESI; CE;1129;1046 CAT Élcio Guerrazi - Jundiaí;CE 013 - Itatiba;Itatiba;Bairro Residencial Fazenda Serrinha;Rua Emilio Jafet, nº 100;13254-627;RE08;Fernando Lira;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 013 - Itatiba;Alexandra Salomao Miamoto;amiamoto@sesisp.org.br;https://campinasamoreiras.sesisp.org.br/;-23.0035;-46.8464`; // Truncated for brevity, normally would include all

const initialRequests = [
    { id: 1, criticality: 'Imediata', unit: 'CAT Cubatão (Par...', description: 'reforma do balneá...', status: 'Análise da Solicit...', currentLocation: 'Gestão Local', gestorLocal: 'MARIO SERGIO ALVES QUAR...', expectedStartDate: '05/01/2028', hasInfo: true, expectedValue: '3,5 mi', executingUnit: 'GSO', prazo: 24, categoriaInvestimento: 'Reforma Estratégica', entidade: 'SENAI', ordem: 'SS-28-0001-P', situacaoProjeto: 'Em Andamento', situacaoObra: 'Não Iniciada', inicioObra: '05/01/2030', saldoObraPrazo: 12, saldoObraValor: 'R$ 3.500.000,00' },
    { id: 2, criticality: 'Imediata', unit: 'CAT Cubatão (Par...', description: 'Troca do alambra...', status: 'Análise da Solicit...', currentLocation: 'Gestão Local', gestorLocal: 'MARIO SERGIO ALVES QUAR...', expectedStartDate: '03/11/2025', hasInfo: false, expectedValue: '300 mil', executingUnit: 'GSO', prazo: 6, categoriaInvestimento: 'Baixa Complexidade', entidade: 'SESI', ordem: 'SS-25-0002-O', situacaoProjeto: 'Concluído', situacaoObra: 'A Realizar', inicioObra: '01/05/2026', saldoObraPrazo: 6, saldoObraValor: 'R$ 300.000,00' },
    // ... Add more if needed from the file content view
];

const INITIAL_PROFILES = [
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

const initialTipologias = [
  { id: 1, titulo: 'Ambientes CQV', descricao: 'Adequações, construções...', dataInclusao: '10/11/2025 16:21', criadoPor: 'RAPHAEL SUAVE BOR...', status: true },
  { id: 2, titulo: 'Climatização / exaustão', descricao: 'Projetos, instalações ou ...', dataInclusao: '10/11/2025 16:21', criadoPor: 'RAPHAEL SUAVE BOR...', status: true },
  { id: 3, titulo: 'Bloco anexo', descricao: 'Intervenções voltadas à ...', dataInclusao: '10/11/2025 16:21', criadoPor: 'RAPHAEL SUAVE BOR...', status: true },
  { id: 4, titulo: 'Reforma', descricao: 'reforma', dataInclusao: '05/11/2025 15:06', criadoPor: 'JULIA ANDRADE SILVA', status: false },
];

const initialTipoLocais = [
  { id: 1, descricao: 'Faculdade', dataInclusao: '10/11/2025 16:21', criadoPor: 'RAPHAEL SUAVE BOR...', status: true },
  { id: 2, descricao: 'CAT', dataInclusao: '10/11/2025 16:21', criadoPor: 'RAPHAEL SUAVE BOR...', status: true },
  { id: 3, descricao: 'CE', dataInclusao: '10/11/2025 16:21', criadoPor: 'RAPHAEL SUAVE BOR...', status: true },
  { id: 4, descricao: 'Sede', dataInclusao: '05/11/2025 15:06', criadoPor: 'JULIA ANDRADE SILVA', status: false },
];

const csvDataRaw = [
    { id: "25", nif: "SS0000002", name: "Ana Beatriz Costa", email: "ana.costa@sesisenaisp.org.br", unidade: "SESI - Campinas", profile: "Unidade", createdBy: "Daniel", createdAt: "10/01/2023" },
    { id: "26", nif: "SN0000004", name: "Bruno Alves", email: "bruno.alves@sesisenaisp.org.br", unidade: "", profile: "Sede", createdBy: "Paulo H. R. Silva", createdAt: "12/02/2023" },
    // Simplified for seed
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding database...');
    
    // Units
    console.log('Seeding Units...');
    const unitsData = rawUnitsData.split('\n').map((line, index) => {
        const cols = line.split(';');
        return {
            codigoUnidade: cols[0]?.trim() || '',
            entidade: cols[1]?.trim() || 'SESI',
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

    for (const unit of unitsData) {
        if (!unit.codigoUnidade) continue;
        await client.query(`
            INSERT INTO units (
                codigo_unidade, entidade, tipo, centro, cat, unidade, cidade, bairro, endereco, cep, 
                re, responsavel_re, ra, responsavel_ra, responsavel_rar, tipo_de_unidade, 
                unidade_resumida, gerente_regional, email_gr, site, latitude, longitude
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
            ON CONFLICT DO NOTHING
        `, [
            unit.codigoUnidade, unit.entidade, unit.tipo, unit.centro, unit.cat, unit.unidade, unit.cidade, unit.bairro, unit.endereco, unit.cep,
            unit.re, unit.responsavelRE, unit.ra, unit.responsavelRA, unit.responsavelRAR, unit.tipoDeUnidade,
            unit.unidadeResumida, unit.gerenteRegional, unit.emailGR, unit.site, unit.latitude, unit.longitude
        ]);
    }
    
    // Profiles
    console.log('Seeding Profiles...');
    for (const profile of INITIAL_PROFILES) {
        await client.query(`
            INSERT INTO access_profiles (id, name, permissions) VALUES ($1, $2, $3)
            ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, permissions = EXCLUDED.permissions
        `, [profile.id, profile.name, profile.permissions]);
    }
    
    // Requests
    console.log('Seeding Requests...');
    for (const req of initialRequests) {
        await client.query(`
            INSERT INTO requests (
                criticality, unit, description, status, current_location, expected_start_date, has_info, 
                expected_value, executing_unit, prazo, categoria_investimento, entidade, ordem, 
                situacao_projeto, situacao_obra, inicio_obra, saldo_obra_prazo, saldo_obra_valor, gestor_local
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            ON CONFLICT DO NOTHING
        `, [
            req.criticality, req.unit, req.description, req.status, req.currentLocation, req.expectedStartDate, req.hasInfo,
            req.expectedValue, req.executingUnit, req.prazo, req.categoriaInvestimento, req.entidade, req.ordem,
            req.situacaoProjeto, req.situacaoObra, req.inicioObra, req.saldoObraPrazo, req.saldoObraValor, req.gestorLocal
        ]);
    }
    
    // Tipologias
    console.log('Seeding Tipologias...');
    for (const t of initialTipologias) {
        await client.query(`
            INSERT INTO tipologias (id, titulo, descricao, data_inclusao, criado_por, status) VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO NOTHING
        `, [t.id, t.titulo, t.descricao, t.dataInclusao, t.criadoPor, t.status]);
    }
    
    // Tipo Locais
    console.log('Seeding Tipo Locais...');
    for (const t of initialTipoLocais) {
        await client.query(`
            INSERT INTO tipo_locais (id, descricao, data_inclusao, criado_por, status) VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO NOTHING
        `, [t.id, t.descricao, t.dataInclusao, t.criadoPor, t.status]);
    }

    // Users
    console.log('Seeding Users...');
    for (const user of csvDataRaw) {
        await client.query(`
            INSERT INTO users (nif, name, email, unidade, profile, created_by, created_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (nif) DO NOTHING
        `, [user.nif, user.name, user.email, user.unidade, user.profile, user.createdBy, user.createdAt]);
    }

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
