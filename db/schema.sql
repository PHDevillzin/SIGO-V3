-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nif VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    unidade VARCHAR(255),
    profile VARCHAR(100),
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    last_edited_by VARCHAR(255),
    sigo_profiles TEXT[], -- Array of strings
    linked_units TEXT[], -- Array of strings
    registration_date TIMESTAMP,
    password VARCHAR(255) -- Hash in production, plain for prototype if verified
);

-- User Access table (Links User, Unit, Profile)
CREATE TABLE IF NOT EXISTS user_access (
    id SERIAL PRIMARY KEY,
    user_nif VARCHAR(20) REFERENCES users(nif),
    unit_id INTEGER REFERENCES units(id),
    profile_id VARCHAR(50) REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Access Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    permissions TEXT[] -- Array of permission strings
);

-- Units table
CREATE TABLE IF NOT EXISTS units (
    id SERIAL PRIMARY KEY,
    codigo_unidade VARCHAR(50),
    entidade VARCHAR(50),
    tipo VARCHAR(50),
    centro VARCHAR(255),
    cat VARCHAR(255),
    unidade VARCHAR(255),
    cidade VARCHAR(255),
    bairro VARCHAR(255),
    endereco VARCHAR(500),
    cep VARCHAR(20),
    re VARCHAR(50),
    responsavel_re VARCHAR(255),
    ra VARCHAR(50),
    responsavel_ra VARCHAR(255),
    responsavel_rar VARCHAR(255),
    tipo_de_unidade VARCHAR(100),
    unidade_resumida VARCHAR(255),
    gerente_regional VARCHAR(255),
    email_gr VARCHAR(255),
    site VARCHAR(500),
    latitude VARCHAR(50),
    longitude VARCHAR(50)
);

-- Tipologias table
CREATE TABLE IF NOT EXISTS tipologias (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_inclusao TIMESTAMP,
    criado_por VARCHAR(255),
    status BOOLEAN DEFAULT TRUE
);

-- Tipo Locais table
CREATE TABLE IF NOT EXISTS tipo_locais (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    data_inclusao TIMESTAMP,
    criado_por VARCHAR(255),
    status BOOLEAN DEFAULT TRUE
);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    criticality VARCHAR(50),
    unit VARCHAR(255),
    description TEXT,
    status VARCHAR(100),
    current_location VARCHAR(255),
    gestor_local VARCHAR(255),
    expected_start_date DATE,
    has_info BOOLEAN,
    expected_value VARCHAR(100),
    executing_unit VARCHAR(100),
    prazo INTEGER,
    categoria_investimento VARCHAR(100),
    entidade VARCHAR(50),
    ordem VARCHAR(100),
    situacao_projeto VARCHAR(100),
    situacao_obra VARCHAR(100),
    inicio_obra DATE,
    saldo_obra_prazo INTEGER,
    saldo_obra_valor VARCHAR(100),
    tipologia VARCHAR(255),
    -- New Fields for Request Registration
    solicitante VARCHAR(255),
    gerencia VARCHAR(255),
    objetivo TEXT,
    expectativa_resultados TEXT,
    justificativa TEXT,
    resumo_servicos TEXT,
    aumento TEXT[], -- Array
    necessidades TEXT[], -- Array
    servicos_necessarios TEXT[], -- Array
    servicos_especificos TEXT[], -- Array
    area_intervencao VARCHAR(100),
    data_utilizacao DATE,
    possui_projeto VARCHAR(50),
    possui_laudo VARCHAR(50),
    tem_autorizacao VARCHAR(50),
    realizou_consulta VARCHAR(50),
    houve_notificacao VARCHAR(50),
    referencia VARCHAR(255),
    area_responsavel VARCHAR(255),
    areas_envolvidas TEXT,
    programa_necessidades TEXT,
    instalacoes_sesi_senai TEXT,
    local_obra VARCHAR(255),
    atividade VARCHAR(255),
    local_nome VARCHAR(255),
    problemas_nao_atendida VARCHAR(255),
    prazo_acao VARCHAR(50),
    probabilidade_evolucao VARCHAR(50),
    observacao TEXT
);
