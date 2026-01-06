-- Enable UUID extension if needed, though we seem to use integer IDs mostly
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: access_profiles
CREATE TABLE IF NOT EXISTS access_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    permissions TEXT[]
);

-- Table: units
CREATE TABLE IF NOT EXISTS units (
    id SERIAL PRIMARY KEY,
    codigo_unidade TEXT,
    entidade TEXT,
    tipo TEXT,
    centro TEXT,
    cat TEXT,
    unidade TEXT,
    cidade TEXT,
    bairro TEXT,
    endereco TEXT,
    cep TEXT,
    re TEXT,
    responsavel_re TEXT,
    ra TEXT,
    responsavel_ra TEXT,
    responsavel_rar TEXT,
    tipo_de_unidade TEXT,
    unidade_resumida TEXT,
    gerente_regional TEXT,
    email_gr TEXT,
    site TEXT,
    latitude TEXT,
    longitude TEXT
);

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY, -- Using Serial to auto-increment, even if we seed with specific IDs initially
    nif TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    unidade TEXT,
    profile TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_edited_by TEXT,
    last_edited_at TIMESTAMP WITH TIME ZONE,
    sigo_profiles TEXT[], -- Storing as Array of Text
    linked_units TEXT[], -- Storing as Array of Text
    registration_date TEXT -- Keeping as text to match current format dd/mm/yyyy or similar, but TIMESTAMP is better ideally. adhering to interface for now.
);

-- Table: requests
CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    criticality TEXT,
    unit TEXT,
    description TEXT,
    status TEXT,
    current_location TEXT,
    expected_start_date TEXT,
    has_info BOOLEAN,
    expected_value TEXT,
    executing_unit TEXT,
    prazo INTEGER,
    categoria_investimento TEXT,
    entidade TEXT,
    ordem TEXT,
    tipologia TEXT,
    situacao_projeto TEXT,
    situacao_obra TEXT,
    inicio_obra TEXT,
    saldo_obra_prazo INTEGER,
    saldo_obra_valor TEXT,
    gestor_local TEXT
);

-- Table: tipologias
CREATE TABLE IF NOT EXISTS tipologias (
    id SERIAL PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_inclusao TEXT,
    criado_por TEXT,
    status BOOLEAN DEFAULT TRUE
);

-- Table: tipo_locais
CREATE TABLE IF NOT EXISTS tipo_locais (
    id SERIAL PRIMARY KEY,
    descricao TEXT NOT NULL,
    data_inclusao TEXT,
    criado_por TEXT,
    status BOOLEAN DEFAULT TRUE
);
