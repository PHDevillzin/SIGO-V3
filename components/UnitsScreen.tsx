
import React, { useState, useMemo } from 'react';
import { Unit } from '../types';
import { 
    MagnifyingGlassIcon, 
    FilterIcon, 
    EyeIcon, 
    PencilIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    SparklesIcon,
    CheckCircleIcon,
    InformationCircleIcon
} from './Icons';
import UnitDetailsModal from './UnitDetailsModal';
import AdvancedFilters, { AdvancedFiltersState } from './AdvancedFilters';

const rawData = `Complexo Cultural;SESI;CAT;1031;1031 CAT Mario Amato - Ermelino Matarazzo;Complexo Cultural Itaquera SESI SENAI;São Paulo - Itaquera;Artur Alvim;Av. Miguel Ignácio Curi, s/nº;08295-005;RE01;Renata Caparroz;RA01;Heber Turquetti;Wellington Rodrigues;Própria;Complexo Cultural;Silvia Simoni Orlando;silviasimoni@sesisp.org.br;https://itaquera.sesisp.org.br/complexo-cultural;-23.5329;-46.6395
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
13;SESI; CE;1129;1046 CAT Élcio Guerrazi - Jundiaí;CE 013 - Itatiba;Itatiba;Bairro Residencial Fazenda Serrinha;Rua Emilio Jafet, nº 100;13254-627;RE08;Fernando Lira;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 013 - Itatiba;Alexandra Salomao Miamoto;amiamoto@sesisp.org.br;https://campinasamoreiras.sesisp.org.br/;-23.0035;-46.8464
21;SESI; CE;1136;1046 CAT Élcio Guerrazi - Jundiaí;CE 021 - Jundiaí;Jundiaí;Jardim Tarumã;Rua José Dias, nº 700;13216-479;RE08;Fernando Lira;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 021 - Jundiaí;Alexandra Salomao Miamoto;amiamoto@sesisp.org.br;https://jundiai.sesisp.org.br/;-23.1852;-46.8974
23;SESI; CE;1002;1002 CAT José Ermírio de M. Filho - Votorantim;CE 023 - Votorantim;Votorantim;Parque Morumbi;Avenida Cláudio Pinto do Nascimento, nº 140;18110-380;RE09;Rafael Capelo;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 023 - Votorantim;Julio Cesar de Souza Martins;jmartins@sesisp.org.br;https://votorantim.sesisp.org.br/;-23.5446;-47.4388
24;SESI; CE;1004;1004 CAT Wilson Sampaio - Tatuí;CE 024 - Tatuí;Tatuí;Vila Laurindo;Avenida São Carlos, nº 900;18271-380;RE10;Arthur Rodrigues;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 024 - Tatuí;Daniela Rodrigues Righelo Fernandes;dfernandes@sesisp.org.br;https://tatui.sesisp.org.br/;-23.3487;-47.8461
25;SESI; CE;1115;1203 CAT Francisco da Silva Villela - Araçatuba;CE 025 - Andradina;Andradina;Vila Peliciari;Rua Engenheiro Sylvio Seiji Shimizu, nº 1085;16901-040;RE20;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;CE 025 - Andradina;Ataliba Mendonça Junior;amendonca@sesisp.org.br;https://aracatuba.sesisp.org.br/home;-20.8948;-51.3786
26;SESI; CE;1014;1014 CAT Ruy Martins Altenfelder Silva - Jaú;CE 026 - Jaú (Sueli Algueiro);Jaú;Jardim Pedro Ometto;Avenida João Lourenço Pires de Campos, nº 600;17212-591;RE15;João Paulo Marcomini;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 026 - Jaú;Alexandre Minghin;aminghin@sesisp.org.br;https://jau.sesisp.org.br/;-22.2936;-48.5592
31;SESI; CE;1005;1005 CAT Carlos Eduardo M. Ferreira - Itu;CE 031 - Itu;Itu;Centro;Rua José Bruni, nº 201;13304-080;RE09;Rafael Capelo;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 031 - Itu;Julio Cesar de Souza Martins;jmartins@sesisp.org.br;https://itu.sesisp.org.br/;-23.2544;-47.2927
32;SESI; CE;1035;1031 CAT Mario Amato - Ermelino Matarazzo;CE 032 - Belenzinho;São Paulo - Belenzinho;Brás;Rua Catumbi, nº 318;03021-000;RE01;Renata Caparroz;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CE 032 - Belenzinho;Silvia Simoni Orlando;silviasimoni@sesisp.org.br;https://catumbi.sesisp.org.br/;-23.5329;-46.6395
36;SESI; CE;1212;1031 CAT Mario Amato - Ermelino Matarazzo;CE 036 -  Santana;São Paulo - Santana;Bairro Vila Bianca;Rua Vasco Cinquini, nº 68;02022-130;RE01;Renata Caparroz;RA01;Heber Turquetti;Wellington Rodrigues;Terceiro;CE 036 -  Santana;Silvia Simoni Orlando;silviasimoni@sesisp.org.br;https://catumbi.sesisp.org.br/;-23.5329;-46.6395
74;SESI; CE;1169;1031 CAT Mario Amato - Ermelino Matarazzo;CE 074 - Ermelino Matarazzo;São Paulo - Ermelino Matarazzo;Ermelino Matarazzo;Rua Caiçara do Rio do Vento, nº 252;03817-000;RE01;Renata Caparroz;RA01;Heber Turquetti;Wellington Rodrigues;Terceiro;CE 074 - Ermelino Matarazzo;Silvia Simoni Orlando;silviasimoni@sesisp.org.br;https://catumbi.sesisp.org.br/;-23.5329;-46.6395
77;SESI; CE;1180;1044 CAT Luis Eulalio de B. V. Filho - Osasco;CE 077 - Carapicuíba;Carapicuíba;Vila Gustavo Correia;Avenida Francisco Pgnatari, nº 530;06310-390;RE03;Thiago Romano;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CE 077 - Carapicuíba;Marcel Miri dos Santos;marcel.miri@sesisp.org.br;https://osasco.sesisp.org.br/;-23.5235;-46.8407
79;SESI; CE;1015;1015 CAT Min. Raphael de A. Magalhães - Mauá;CE 079 - Mauá (Jd. Zaíra);Mauá;Jardim Zaira;Avenida Presidente Castelo Branco, nº 237;09320-590;RE01;Renata Caparroz;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CE 079 - Mauá;Silvia Simoni Orlando;silviasimoni@sesisp.org.br;https://maua.sesisp.org.br/;-23.6677;-46.4613
80;SESI; CE;1157;1015 CAT Min. Raphael de A. Magalhães - Mauá;CE 080 - Ribeirão Pires;Ribeirão Pires;Aliança;Avenida Coronel Oliveira Lima, nº 3345;09404-100;RE01;Renata Caparroz;RA01;Heber Turquetti;Wellington Rodrigues;Terceiro;CE 080 - Ribeirão Pires;Silvia Simoni Orlando;silviasimoni@sesisp.org.br;https://maua.sesisp.org.br/;-23.7067;-46.4058
81;SESI; CE;1164;1164 CAT Max Feffer - Suzano;CE 081 - Suzano;Suzano;Parque Suzano;Avenida Senador Roberto Simonsen, nº 550;08673-270;RE06;Lucas Attili;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 081 - Suzano;Luís Claudio Marques;lcmarques@sesisp.org.br;https://suzano.sesisp.org.br/;-23.5448;-46.3112
83;SESI; CE;1027;1027 CAT José Felicio Castellano - Rio Claro;CE 083 - Rio Claro;Rio Claro;Jardim Floridiana;Avenida M-29, nº 441;13505-007;RE13;Gabriela Morelli;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 083 - Rio Claro;Jader Luiz Serni;jserni@sesisp.org.br;https://rioclaro.sesisp.org.br/;-22.3984;-47.5546
85;SESI; CE;1040;1040 CAT Mario Mantoni - Piracicaba;CE 085 - Piracicaba (Vila Industrial);Piracicaba;Vila Industrial;Avenida Luiz Ralf Benatti, nº 600;13412-248;RE13;Gabriela Morelli;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 085 - Piracicaba;Jader Luiz Serni;jserni@sesisp.org.br;https://piracicaba.sesisp.org.br/;-22.7338;-47.6476
87;SESI; CE;1042;1042 CAT Dr. Paulo de Castro Correia - Santos;CE 087 - Santos (Jd. Santa Maria);Santos;Santa Maria;Avenida Nossa Senhora de Fátima, nº 366;11085-200;RE05;Luan Souza;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 087 - Santos;Mário Sergio Alves Quaranta;mquaranta@sesisp.org.br;https://santos.sesisp.org.br/;-23.9535;-46.335
94;SESI; CE;1148;1012 CAT Theobaldo de Nigris - Santo André;CE 094 - Santo André (Vila Clarice);Santo André;Vila Clarice;Rua Campos do Jordão, nº 204;09250-750;RE04;Carlos Kawasaki;RA01;Heber Turquetti;Wellington Rodrigues;Terceiro;CE 094 - Santo André;Roberta Adriana Lemes Borrego Conte de Oliveira;rborrego@sesisp.org.br;https://santoandre.sesisp.org.br/;-23.6737;-46.5432
99;SESI; CE;1039;1039 CAT Américo Emílio Romi - Santa Bárbara d'Oeste;CE 099 - Sta Bárbara d'Oeste;Santa Bárbara d'Oeste;Vila Diva;Avenida Mário Dedini, nº 216;13453-050;RE12;Daiane Bueno;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 099 - Santa Bárbara d'Oeste;Guilherme Castilho Sábio;guilherme.sabio@sesisp.org.br;https://santabarbara.sesisp.org.br/;-22.7553;-47.4143
101;SESI; CE;1080;1038 CAT Estevam Faraone - Americana;CE 101 - Americana - Mendel Steinbruch;Americana;Parque Universitário;Rua Professor Luiz Forini, nº 100;13467-672;RE12;Daiane Bueno;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 101 - Americana;Guilherme Castilho Sábio;guilherme.sabio@sesisp.org.br;https://americana.sesisp.org.br/;-22.7374;-47.3331
108;SESI; CE;1110;1041 CAT Ernesto Pereira L. Filho - São Carlos;CE 108 - São Carlos - Fernando de Arruda Botelho;São Carlos;Bairro Jardim Itamarati;Rua Mauro Tomaze, nº 455;13568-790;RE15;João Paulo Marcomini;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 108 - São Carlos;Alexandre Minghin;aminghin@sesisp.org.br;https://saocarlos.sesisp.org.br/;-22.0174;-47.886
109;SESI; CE;1016;1016 CAT Osvaldo Pastore - Franca;CE 109 - Franca (Vila Scarabucci);Franca;Jardim Centenário;Avenida Santa Cruz, nº 2870;14403-600;RE18;Diogo Izidoro;RA05;Daniele Telli;Diego Travassos;Própria;CE 109 - Franca;Ricardo Alexandre Machado;ricardo.machado@sesisp.org.br;https://franca.sesisp.org.br/;-20.5352;-47.4039
110;SESI; CE;1077;1117 CAT Maria Ap. J. P.Menezes - Barretos;CE 110 - Bebedouro;Bebedouro;Parque Eldorado;Rua Nelson Domingos Madeira, nº 300;14706-141;RE19;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;CE 110 - Bebedouro;Silvia Helena Marchi;smarchi@sesisp.org.br;https://barretos.sesisp.org.br/;-20.9491;-48.4791
111;SESI; CE;1033;1032 CAT Gastão Vidigal - Vila Leopoldina;CE 111 - Ipiranga;São Paulo - Ipiranga;Ipiranga;Rua Bom Pastor, nº 654;04203-000;RE03;Thiago Romano;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CE 111 - Ipiranga;Marcel Miri dos Santos;marcel.miri@sesisp.org.br;https://catumbi.sesisp.org.br/;-23.5329;-46.6395
113;SESI; CE;1156;1007 CAT Nadir D. Figueiredo - Mogi das Cruzes;CE 113 - Mogi das Cruzes - Vila Industrial;Mogi das Cruzes;Vila Oliveira;Rua Coronel Cardoso de Siqueira, nº 3050;08770-010;RE06;Lucas Attili;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 113 - Mogi das Cruzes;Luís Claudio Marques;lcmarques@sesisp.org.br;https://mogidascruzes.sesisp.org.br/;-23.5208;-46.1854
114;SESI; CE;1057;1013 CAT Raphael Noschese - Bauru;CE 114 - Agudos;Agudos;Bairro Centenário Park;Rua Pedro Rudini, nº 180;17120-000;RE16;Ailton dos Santos;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 114 - Agudos;Pedro Luiz Caliari;plcaliari@sesisp.org.br;https://bauru.sesisp.org.br/home;-22.4694;-48.9863
123;SESI; CE;1003;1003 CAT Sen. José Ermírio de Moraes - Sorocaba;CE 123 - Sorocaba - Mangal;Sorocaba;Mangal;Rua Duque de Caxias, nº 494;18040-350;RE09;Rafael Capelo;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 123 - Sorocaba;Julio Cesar de Souza Martins;jmartins@sesisp.org.br;https://sorocaba.sesisp.org.br/;-23.4969;-47.4451
124;SESI; CE;1019;1019 CAT Benedito M. da Silva - Itapetininga;CE 124 - Itapetininga;Itapetininga;Vila Rio Branco;Avenida Padre Antonio Brunetti, nº 1360;18208-080;RE10;Arthur Rodrigues;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 124 - Itapetininga;Daniela Rodrigues Righelo Fernandes;dfernandes@sesisp.org.br;https://itapetininga.sesisp.org.br/;-23.5886;-48.0483
125;SESI; CE;1088;1005 CAT Carlos Eduardo M. Ferreira - Itu;CE 125 - Salto;Salto;Panorama;Rua Isarael, nº 100;13322-424;RE09;Rafael Capelo;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 125 - Salto;Julio Cesar de Souza Martins;jmartins@sesisp.org.br;https://itu.sesisp.org.br/;-23.1996;-47.2931
136;SESI; CE;1055;1182 CAT Ministro Dilson Funaro - Birigui;CE 136 - Penápolis;Penápolis;Desmembramento Pindora;Avenida Antonio Rodrigues Boucinha, nº 100;16300-000;RE20;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;CE 136 - Penápolis;Ataliba Mendonça Junior;amendonca@sesisp.org.br;https://birigui.sesisp.org.br/;-21.4148;-50.0769
138;SESI; CE;1138;1199 CAT Carlos C.A.Amorim - Presidente Epitácio;CE 138 - Santo Anastácio;Santo Anastácio;Jardim Vitória Régia;Rua Tucanos, nº 01;19360-000;RE21;Waldemar Ramos;RA05;Daniele Telli;Diego Travassos;Própria;CE 138 - Santo Anastácio;Sidnei Caio da Silva Junqueira;scsjunqueira@sesisp.org.br;https://presidenteepitacio.sesisp.org.br/;-21.9747;-51.6527
143;SESI; CE;1069;1014 CAT Ruy Martins Altenfelder Silva - Jaú;CE 143 - Bariri;Bariri;Polo Industrial;Avenida Perimetral Prefeito Domingos Antonio, nº 450;17250-000;RE15;João Paulo Marcomini;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 143 - Bariri;Alexandre Minghin;aminghin@sesisp.org.br;https://jau.sesisp.org.br/;-22.073;-48.7438
144;SESI; CE;1022;1022 CAT Manoel da Costa Santos - Ourinhos;CE 144 - Ourinhos;Ourinhos;Bairro das Crianças;Rua Professora Maria José Ferreira, nº 100;19910-075;RE17;Waldemar Ramos;RA05;Daniele Telli;Diego Travassos;Própria;CE 144 - Ourinhos;Luciana Reguera Ventola Nabarro;lventola@sesisp.org.br;https://ourinhos.sesisp.org.br/;-22.9797;-49.8697
146;SESI; CE;1029;1029 CAT Azor Silveira Leite - Matão;CE 146 - Matão;Matão;Jardim Paraíso III;Avenida Marlene David dos Santos, nº 940;15991-360;RE15;João Paulo Marcomini;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 146 - Matão;Ana Paula Correa de Moraes;ana.correa@sesisp.org.br;https://matao.sesisp.org.br/;-21.6025;-48.364
148;SESI; CE;1182;1182 CAT Ministro Dilson Funaro - Birigui;CE 148 - Birigui;Birigui;Jardim Pinheiros;Avenida José Agostinho Rossi, nº 620;16203-059;RE20;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;CE 148 - Birigui;Ataliba Mendonça Junior;amendonca@sesisp.org.br;https://birigui.sesisp.org.br/;-21.291;-50.3432
156;SESI; CE;1191;1043 CAT Ministro R. Della Manna - Mogi Guaçu;CE 156 - São João da Boa Vista;São João da Boa Vista;Jardim Itália;Estrada Vicinal Para João Batista Merlin, nº 681;13872-551;RE14;Silvio Penteado;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 156 - São João da Boa Vista;Stephanie Helena Mariano;smariano@sesisp.org.br;https://mogiguacu.sesisp.org.br/;-21.9707;-46.7944
160;SESI; CE;1023;1023 CAT Karan Simão Racy - Jacareí;CE 160 - Jacareí;Jacareí;São João;Rua Antônio Ferreira Rizzini, nº 600;12322-120;RE06;Lucas Attili;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 160 - Jacareí;Carlos Frederico D'Avila de Brito ;cbrito@sesisp.org.br;https://jacarei.sesisp.org.br/;-23.2983;-45.9658
162;SESI; CE;1099;1026 CAT Octávio Mendes Filho - Cruzeiro;CE 162 - Lorena;Lorena;Centro;Avenida Doutor Epitácio Santiago, n°1000;12600-530;RE07;Bruno Lopes;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 162 - Lorena;Flávio de Faria Alvim;falvim@sesisp.org.br;https://cruzeiro.sesisp.org.br/;-22.7334;-45.1197
165;SESI; CE;1097;1040 CAT Mario Mantoni - Piracicaba;CE 165 - Piracicaba;Piracicaba;Loteamento Ipanema;Rua Maria Isabel da Silva Mattos, nº 700;13402-303;RE13;Gabriela Morelli;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 165 - Piracicaba;Jader Luiz Serni;jserni@sesisp.org.br;https://piracicaba.sesisp.org.br/;-22.7338;-47.6476
166;SESI; CE;1012;1012 CAT Theobaldo de Nigris - Santo André;CE 166 - Santo André - Santa Terezinha;Santo André;Santa Terezinha;Praça Dr. Armando Arruda Pereira, nº 100;09210-550;RE04;Carlos Kawasaki;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CE 166 - Santo André;Roberta Adriana Lemes Borrego Conte de Oliveira;rborrego@sesisp.org.br;https://santoandre.sesisp.org.br/;-23.6737;-46.5432
176;SESI; CE;1043;1043 CAT Ministro R. Della Manna - Mogi Guaçu;CE 176 - Mogi Guaçu;Mogi Guaçu;Parque Zaniboni III;Rua Eduardo Figueiredo, nº 300;13848-090;RE14;Silvio Penteado;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 176 - Mogi Guaçu;Stephanie Helena Mariano;smariano@sesisp.org.br;https://mogiguacu.sesisp.org.br/;-22.3675;-46.9428
182;SESI; CE;1010;1010 CAT Ozires Silva - São José dos Campos;CE 182 - São José dos Campos;São José dos Campos;Bosque Eucalíptos;Avenida Cidade Jardim, nº 4389;12232-000;RE06;Lucas Attili;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 182 - São José dos Campos;Carlos Frederico D'Avila de Brito ;cbrito@sesisp.org.br;https://saojosedoscampos.sesisp.org.br/;-23.1896;-45.8841
185;SESI; CE;1117;1117 CAT Maria Ap. J. P.Menezes - Barretos;CE 185 - Barretos - Maria Aparecida Junqueira Pamplona de Menezes;Barretos;Los Angeles;Rua Dr. Roberto Cardoso Alves, nº 800;14787-400;RE19;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;CE 185 - Barretos;Silvia Helena Marchi;smarchi@sesisp.org.br;https://barretos.sesisp.org.br/;-20.5531;-48.5698
192;SESI; CE;1145;1003 CAT Sen. José Ermírio de Moraes - Sorocaba;CE 192 - Alumínio;Alumínio;Vila Industrial;Rua Reginaldo Aparecido Pereira, nº 101;18125-000;RE09;Rafael Capelo;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 192 - Alumínio;Julio Cesar de Souza Martins;jmartins@sesisp.org.br;https://sorocaba.sesisp.org.br/home;-23.5306;-47.2546
205;SESI; CE;1078;1041 CAT Ernesto Pereira L. Filho - São Carlos;CE 205 - Descalvado;Descalvado;Novo Jardim Belém;Rua Manoel Ferreira Gaio, nº 1452;13690-000;RE15;João Paulo Marcomini;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 205 - Descalvado;Alexandre Minghin;aminghin@sesisp.org.br;https://saocarlos.sesisp.org.br/;-21.9002;-47.6181
206;SESI; CE;1091;1009 CAT Jorge Duprat Figueiredo - São José do Rio Preto;CE 206 - Catanduva;Catanduva;Polo Industrial e Industrial Giordano Mestrinelli;Rua Ipiranga, nº 1025;15803-215;RE19;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;CE 206 - Catanduva;Silvia Helena Marchi;smarchi@sesisp.org.br;https://riopreto.sesisp.org.br/;-21.1314;-48.977
207;SESI; CE;1127;1018 CAT Luiz Dumont Villares - Taubaté;CE 207 - Caçapava (Maria Elmira);Caçapava;Parque Residencial Maria Elmira;Avenida Monsenhor Theodomiro Lobo, nº 300;12285-050;RE07;Bruno Lopes;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 207 - Caçapava;Flávio de Faria Alvim;falvim@sesisp.org.br;https://saojosedoscampos.sesisp.org.br/;-23.0992;-45.7076
208;SESI; CE;1118;1036 CAT Laerte Michielin - Araras;CE 208 - Leme - Fernando Arraes de Almeida;Leme;Vila São João Leme;Avenida Joaquim Lopes Aguila, nº 1745;13614-086;RE14;Silvio Penteado;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 208 - Leme;Stephanie Helena Mariano;smariano@sesisp.org.br;https://araras.sesisp.org.br/;-22.1809;-47.3841
210;SESI; CE;1100;1043 CAT Ministro R. Della Manna - Mogi Guaçu;CE 210 - Itapira;Itapira;Bairro Vila Penha do Rio do Peixe;Rua Paulo Afonso Pereira Ulbricht, nº 162;13971-023;RE14;Silvio Penteado;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 210 - Itapira;Stephanie Helena Mariano;smariano@sesisp.org.br;https://mogiguacu.sesisp.org.br/;-22.4357;-46.8224
221;SESI; CE;1146;1012 CAT Theobaldo de Nigris - Santo André;CE 221 - Santo André (Pq. Jaçatuba);Santo André;Parque Jacatuba;Rua Itatinga, nº 170;09290-490;RE04;Carlos Kawasaki;RA01;Heber Turquetti;Wellington Rodrigues;Terceiro;CE 221 - Santo André;Roberta Adriana Lemes Borrego Conte de Oliveira;rborrego@sesisp.org.br;https://santoandre.sesisp.org.br/;-23.6737;-46.5432
222;SESI; CE;1011;1012 CAT Theobaldo de Nigris - Santo André;CE 222 - São Caetano do Sul;São Caetano do Sul;Boa Vista;Rua Santo André, nº 810;09572-000;RE04;Carlos Kawasaki;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CE 222 - São Caetano do Sul;Roberta Adriana Lemes Borrego Conte de Oliveira;rborrego@sesisp.org.br;https://santoandre.sesisp.org.br/;-23.6229;-46.5548
227;SESI; CE;1154;1029 CAT Azor Silveira Leite - Matão;CE 227 - Monte Alto;Monte Alto;Jardim Bela Vista;Rua Paschoale Di Madeo, nº 301;15910-000;RE15;João Paulo Marcomini;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 227 - Monte Alto;Ana Paula Correa de Moraes;ana.correa@sesisp.org.br;https://matao.sesisp.org.br/;-21.2655;-48.4971
228;SESI; CE;1024;1024 CAT Salvador Firace - Botucatu;CE 228 - Botucatu;Botucatu;Conjunto Habitacional Engenheiro Francisco;Rua Dr. Nelson Cariola, nº 60;18605-725;RE16;Ailton dos Santos;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 228 - Botucatu;Pedro Luiz Caliari;plcaliari@sesisp.org.br;https://botucatu.sesisp.org.br/;-22.8837;-48.4437
235;SESI; CE;1098;1016 CAT Osvaldo Pastore - Franca;CE 235 - Batatais;Batatais;Bairro Riachuelo;Avenida Moacir Dias de Morais, nº 680;14300-000;RE18;Diogo Izidoro;RA05;Daniele Telli;Diego Travassos;Própria;CE 235 - Batatais;Ricardo Alexandre Machado;ricardo.machado@sesisp.org.br;https://franca.sesisp.org.br/;-20.8929;-47.5921
237;SESI; CE;1104;1182 CAT Ministro Dilson Funaro - Birigui;CE 237 - Guararapes;Guararapes;Jardim Satélite II;Rua Guido Poleto, nº 10;16700-000;RE20;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;CE 237 - Guararapes;Ataliba Mendonça Junior;amendonca@sesisp.org.br;https://birigui.sesisp.org.br/;-21.2544;-50.6453
240;SESI; CE;1162;1164 CAT Max Feffer - Suzano;CE 240 - Ferraz de Vasconcelos;Ferraz de Vasconcelos;Jd. Juliana;Rua Francisco Antonio Zeller, nº 20;08502-410;RE06;Lucas Attili;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 240 - Ferraz de Vasconcelos;Luís Claudio Marques;lcmarques@sesisp.org.br;https://suzano.sesisp.org.br/;-23.5411;-46.371
241;SESI; CE;1021;1021 CAT Nelson Abbud João - Sertãozinho;CE 241 - Sertãozinho;Sertãozinho;Cohab Maurilio Biagi;Rua José Rodrigues Godinho, nº 100;14177-320;RE18;Diogo Izidoro;RA05;Daniele Telli;Diego Travassos;Própria;CE 241 - Sertãozinho;Ricardo Alexandre Machado;ricardo.machado@sesisp.org.br;https://sertaozinho.sesisp.org.br/;-21.1316;-47.9875
242;SESI; CE;1177;1048 CAT Professora Maria Braz - Campinas I;CE 242 - Vinhedo - Gustavo Infanger Vicentim;Vinhedo;Jardim Nova Canudos;Avenida Ana Lombardi Gasparini, nº 1155;13280-364;RE11;Virmondes Ferreira;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 242 - Vinhedo;André Luis Martins da Silva;asilva@sesisp.org.br;https://campinasamoreiras.sesisp.org.br/;-23.0302;-46.9833
255;SESI; CE;1076;1036 CAT Laerte Michielin - Araras;CE 255 - Santa Rita do Passa Quatro - Salomão Esper;Santa Rita do Passa Quatro;Jardim Itália;Rua José Barbatana, nº 303;13670-000;RE14;Silvio Penteado;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 255 - Santa Rita do Passa Quatro;Stephanie Helena Mariano;smariano@sesisp.org.br;https://saocarlos.sesisp.org.br/;-21.7083;-47.478
259;SESI; CE;1064;1020 CAT José Villela de A. Jr. - Ribeirão Preto;CE 259 - Ribeirão Preto (Planalto Verde);Ribeirão Preto;Planalto Verde;R. Maria Godi Bim, nº 505;14056-050;RE18;Diogo Izidoro;RA05;Daniele Telli;Diego Travassos;Própria;CE 259 - Ribeirão Preto;Ricardo Alexandre Machado;ricardo.machado@sesisp.org.br;https://ribeiraopreto.sesisp.org.br/;-21.1699;-47.8099
260;SESI; CE;1185;1022 CAT Manoel da Costa Santos - Ourinhos;CE 260 - Santa Cruz do Rio Pardo - Hercilio Lorenzetti;Santa Cruz do Rio Pardo;Bosque Lorenzetti;Avenida Prof. Antonieta da Rocha Sundfled Rosso, nº 100;18900-000;RE17;Waldemar Ramos;RA05;Daniele Telli;Diego Travassos;Própria;CE 260 - Santa Cruz do Rio Pardo;Luciana Reguera Ventola Nabarro;lventola@sesisp.org.br;https://ourinhos.sesisp.org.br/;-22.8988;-49.6354
263;SESI; CE;1070;1014 CAT Ruy Martins Altenfelder Silva - Jaú;CE 263 - Barra Bonita;Barra Bonita;Bairro Sonho Nosso V;Rua Evandro Cesar Paschoal, nº 110;17340-000;RE15;João Paulo Marcomini;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 263 - Barra Bonita;Alexandre Minghin;aminghin@sesisp.org.br;https://botucatu.sesisp.org.br/;-22.4909;-48.5583
265;SESI; CE;1142;1012 CAT Theobaldo de Nigris - Santo André;CE 265 - Santo André (Jd. Ana Maria);Santo André;Jardim Santo Alberto;Rua Balaclava, nº 95;09260-440;RE04;Carlos Kawasaki;RA01;Heber Turquetti;Wellington Rodrigues;Terceiro;CE 265 - Santo André;Roberta Adriana Lemes Borrego Conte de Oliveira;rborrego@sesisp.org.br;https://santoandre.sesisp.org.br/;-23.6737;-46.5432
267;SESI; CE;1054;1008 CAT Lázaro Ramos Novaes - Marília;CE 267 - Garça;Garça;Distrito Industrial;Rua Carlos Ferrari, nº 2040;17400-000;RE17;Waldemar Ramos;RA05;Daniele Telli;Diego Travassos;Própria;CE 267 - Garça;Luciana Reguera Ventola Nabarro;lventola@sesisp.org.br;https://marilia.sesisp.org.br/;-22.2125;-49.6546
268;SESI; CE;1199;1199 CAT Carlos C.A.Amorim - Presidente Epitácio;CE 268 - Presidente Epitácio;Presidente Epitácio;Vila Recreio;Avenida Domingos Ferreira de Medeiros, nº 2-113;19470-000;RE21;Waldemar Ramos;RA05;Daniele Telli;Diego Travassos;Própria;CE 268 - Presidente Epitácio;Sidnei Caio da Silva Junqueira;scsjunqueira@sesisp.org.br;https://presidenteepitacio.sesisp.org.br/;-21.7651;-52.1111
272;SESI; CE;1089;1014 CAT Ruy Martins Altenfelder Silva - Jaú;CE 272 - Igaraçu do Tietê;Igaraçu do Tietê;Jardim São José;Rua Justino de Lucci, nº 234;17350-000;RE15;João Paulo Marcomini;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 272 - Igaraçu do Tietê;Alexandre Minghin;aminghin@sesisp.org.br;https://botucatu.sesisp.org.br/;-22.5163;-48.5594
280;SESI; CE;1086;1022 CAT Manoel da Costa Santos - Ourinhos;CE 280 - Assis;Assis;Vila Cambuí;Rua Antonio Zuardi, nº 1715;19804-040;RE17;Waldemar Ramos;RA05;Daniele Telli;Diego Travassos;Própria;CE 280 - Assis;Luciana Reguera Ventola Nabarro;lventola@sesisp.org.br;https://ourinhos.sesisp.org.br/;-22.66;-50.4183
283;SESI; CE;1111;1006 CAT Belmiro Jesus - Presidente Prudente;CE 283 - Osvaldo Cruz;Osvaldo Cruz;Centro;Rua Waldemar de Oliveira, nº 1000;17700-000;RE21;Waldemar Ramos;RA05;Daniele Telli;Diego Travassos;Própria;CE 283 - Osvaldo Cruz;Sidnei Caio da Silva Junqueira;scsjunqueira@sesisp.org.br;https://prudente.sesisp.org.br/;-21.7968;-50.8793
284;SESI; CE;1006;1006 CAT Belmiro Jesus - Presidente Prudente;CE 284 - Presidente Prudente (Pq. Furquim);Presidente Prudente;Parque Furquim;Avenida Ibraim Nobre, nº 585;19030-260;RE21;Waldemar Ramos;RA05;Daniele Telli;Diego Travassos;Própria;CE 284 - Presidente Prudente;Sidnei Caio da Silva Junqueira;scsjunqueira@sesisp.org.br;https://prudente.sesisp.org.br/;-22.1207;-51.3925
296;SESI; CE;1013;1013 CAT Raphael Noschese - Bauru;CE 296 - Bauru (no CAT);Bauru;Vila Santa Izabel;Rua Rubens Arruda, nº 8-50;17014-300;RE16;Ailton dos Santos;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 296 - Bauru;Pedro Luiz Caliari;plcaliari@sesisp.org.br;https://bauru.sesisp.org.br/;-22.3246;-49.0871
298;SESI; CE;1020;1020 CAT José Villela de A. Jr. - Ribeirão Preto;CE 298 - Ribeirão Preto (Castelo Branco);Ribeirão Preto;Lagoinha;Rua Dom Luis do Amaral Mousinho, nº 3465;14090-280;RE18;Diogo Izidoro;RA05;Daniele Telli;Diego Travassos;Própria;CE 298 - Ribeirão Preto;Ricardo Alexandre Machado;ricardo.machado@sesisp.org.br;https://ribeiraopreto.sesisp.org.br/;-21.1699;-47.8099
299;SESI; CE;1190;1048 CAT Professora Maria Braz - Campinas I;CE 299 - Valinhos - Prof. Walter Vicioni Gonçalves;Valinhos;Jardim São Paulo;Rodovia Flávio de Carvalho, nº 2.807;13273-000;RE11;Virmondes Ferreira;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 299 - Valinhos;André Luis Martins da Silva;asilva@sesisp.org.br;https://campinasamoreiras.sesisp.org.br/;-22.9698;-46.9974
300;SESI; CE;1121;1024 CAT Salvador Firace - Botucatu;CE 300 - Avaré - Israel Dias Novaes;Avaré;Jardim Botânico;Avenida Governador Mario Covas, nº 600;18705-851;RE16;Ailton dos Santos;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 300 - Avaré;Pedro Luiz Caliari;plcaliari@sesisp.org.br;https://botucatu.sesisp.org.br/;-23.1067;-48.9251
303;SESI; CE;1036;1036 CAT Laerte Michielin - Araras;CE 303 - Araras;Araras;Heitor Villa Lobos;Avenida Melvin Jones, nº 2.600;13607-055;RE14;Silvio Penteado;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 303 - Araras;Stephanie Helena Mariano;smariano@sesisp.org.br;https://araras.sesisp.org.br/;-22.3572;-47.3842
308;SESI; CE;1008;1008 CAT Lázaro Ramos Novaes - Marília;CE 308 - Marília;Marília;Nova Marília;Avenida João Ramalho, nº 1306;17520-240;RE17;Waldemar Ramos;RA05;Daniele Telli;Diego Travassos;Própria;CE 308 - Marília;Luciana Reguera Ventola Nabarro;lventola@sesisp.org.br;https://marilia.sesisp.org.br/;-22.2171;-49.9501
316;SESI; CE;1133;1046 CAT Élcio Guerrazi - Jundiaí;CE 316 - Campo Limpo Paulista;Campo Limpo Paulista;Pau Arcado;Estrada da Bragantina, nº 2197;13234-649;RE08;Fernando Lira;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 316 - Campo Limpo Paulista;Alexandra Salomao Miamoto;amiamoto@sesisp.org.br;https://jundiai.sesisp.org.br/;-23.2078;-46.7889
317;SESI; CE;1153;1029 CAT Azor Silveira Leite - Matão;CE 317 - Jaboticabal;Jaboticabal;Colina Verde;Rua Sebastião Morgatto, nº 151;14887-388;RE15;João Paulo Marcomini;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 317 - Jaboticabal;Ana Paula Correa de Moraes;ana.correa@sesisp.org.br;https://matao.sesisp.org.br/;-21.252;-48.3252
323;SESI; CE;1116;1203 CAT Francisco da Silva Villela - Araçatuba;CE 323 - Mirandópolis;Mirandópolis;Santa Lina;Rua Joaquim Caetano da Silva, nº 1601;16800-000;RE20;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;CE 323 - Mirandópolis;Ataliba Mendonça Junior;amendonca@sesisp.org.br;https://aracatuba.sesisp.org.br/;-21.1313;-51.1035
332;SESI; CE;1143;1004 CAT Wilson Sampaio - Tatuí;CE 332 - Boituva;Boituva;Pau D'alho;Rua José Edson Machado de Oliveira, nº 105;18550-000;RE10;Arthur Rodrigues;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 332 - Boituva;Daniela Rodrigues Righelo Fernandes;dfernandes@sesisp.org.br;https://tatui.sesisp.org.br/;-23.2855;-47.6786
334;SESI; CE;1079;1036 CAT Laerte Michielin - Araras;CE 334 - Porto Ferreira;Porto Ferreira;Residencial Jose Gomes;Rua Antonio Thomaz Pereira, nº 700;13660-000;RE14;Silvio Penteado;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 334 - Porto Ferreira;Stephanie Helena Mariano;smariano@sesisp.org.br;https://saocarlos.sesisp.org.br/;-21.8498;-47.487
337;SESI; CE;1090;1014 CAT Ruy Martins Altenfelder Silva - Jaú;CE 337 - Pederneiras;Pederneiras;Bairro Bruno;Avenida Bernardino Flora Furlan, nº 1677;17280-000;RE15;João Paulo Marcomini;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 337 - Pederneiras;Alexandre Minghin;aminghin@sesisp.org.br;https://jau.sesisp.org.br/;-22.3511;-48.7781
338;SESI; CE;1072;1009 CAT Jorge Duprat Figueiredo - São José do Rio Preto;CE 338 - São José do Rio Preto - Yolanda C. Bassitt;São José do Rio Preto;Jardim Conceição;Avenida Abilio Appoloni, nº 500;15030-800;RE19;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;CE 338 - São José do Rio Preto;Silvia Helena Marchi;smarchi@sesisp.org.br;https://riopreto.sesisp.org.br/;-20.8113;-49.3758
339;SESI; CE;1028;1028 CAT Wilton Lupo - Araraquara;CE 339 - Araraquara (Vila Xavier);Araraquara;Jardim Floridiana;Avenida Octaviano Arruda Campos, nº 686;14810-901;RE15;João Paulo Marcomini;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 339 - Araraquara;Ana Paula Correa de Moraes;ana.correa@sesisp.org.br;https://araraquara.sesisp.org.br/;-21.7845;-48.178
341;SESI; CE;1189;1189 CAT Fuad Assef Maluf - Sumaré;CE 341 - Sumaré;Sumaré;Jardim Nova Veneza;Rua Amazonas, nº 99;13177-060;RE12;Daiane Bueno;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 341 - Sumaré;Guilherme Castilho Sábio;guilherme.sabio@sesisp.org.br;https://sumare.sesisp.org.br/;-22.8204;-47.2728
342;SESI; CE;1062;1020 CAT José Villela de A. Jr. - Ribeirão Preto;CE 342 - Jardinópolis;Jardinópolis;Bom Jesus;Rua Sônia Tavares dos Santos, nº 342;14680-000;RE18;Diogo Izidoro;RA05;Daniele Telli;Diego Travassos;Própria;CE 342 - Jardinópolis;Ricardo Alexandre Machado;ricardo.machado@sesisp.org.br;https://ribeiraopreto.sesisp.org.br/;-21.0176;-47.7606
346;SESI; CE;1059;1020 CAT José Villela de A. Jr. - Ribeirão Preto;CE 346 - Ribeirão Preto (Vila Recreio);Ribeirão Preto;Vila Recreio;R. Tapajós, nº 2714;14060-590;RE18;Diogo Izidoro;RA05;Daniele Telli;Diego Travassos;Terceiro;CE 346 - Ribeirão Preto;Ricardo Alexandre Machado;ricardo.machado@sesisp.org.br;https://ribeiraopreto.sesisp.org.br/;-21.1699;-47.8099
348;SESI; CE;1139;1006 CAT Belmiro Jesus - Presidente Prudente;CE 348 - Álvares Machado;Álvares Machado;Jardim Bela Vista;Avenida Alfredo Marcondes, nº 1099;19160-000;RE21;Waldemar Ramos;RA05;Daniele Telli;Diego Travassos;Própria;CE 348 - Álvares Machado;Sidnei Caio da Silva Junqueira;scsjunqueira@sesisp.org.br;https://prudente.sesisp.org.br/;-22.0764;-51.4722
349;SESI; CE;1203;1203 CAT Francisco da Silva Villela - Araçatuba;CE 349 - Araçatuba (Jd. Presidente);Araçatuba;Jardim Presidente;Rua Dr. Álvaro Afonso do Nascimento, nº 300;16072-530;RE20;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;CE 349 - Araçatuba;Ataliba Mendonça Junior;amendonca@sesisp.org.br;https://aracatuba.sesisp.org.br/;-21.2076;-50.4401
355;SESI; CE;1137;1046 CAT Élcio Guerrazi - Jundiaí;CE 355 - Jundiaí - Luiz Latorre;Jundiaí;Vila Bandeirantes;Avenida Doroty Nano Martinasso, nº 151;13214-012;RE08;Fernando Lira;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 355 - Jundiaí;Alexandra Salomao Miamoto;amiamoto@sesisp.org.br;https://jundiai.sesisp.org.br/;-23.1852;-46.8974
356;SESI; CE;1159;1046 CAT Élcio Guerrazi - Jundiaí;CE 356 - Amparo;Amparo;Jardim Camandocaia;Rua Alemanha, s/nº;13905-110;RE08;Fernando Lira;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 356 - Amparo;Alexandra Salomao Miamoto;amiamoto@sesisp.org.br;https://jundiai.sesisp.org.br/home;-22.7088;-46.772
357;SESI; CE;1107;1043 CAT Ministro R. Della Manna - Mogi Guaçu;CE 357 - Mococa - Pedro Sukadolnik;Mococa;Mococa;Rua Hermenegildo Picoli Neto, nº 50;13736-334;RE14;Silvio Penteado;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 357 - Mococa;Stephanie Helena Mariano;smariano@sesisp.org.br;https://mogiguacu.sesisp.org.br/;-21.4647;-47.0024
358;SESI; CE;1209;1013 CAT Raphael Noschese - Bauru;CE 358 - Bauru (Duda) - Gerson Trevizani;Bauru;Vila Triagem;Rua Professora Zenita Alcântara Nogueira, nº 1-67;17030-032;RE16;Ailton dos Santos;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 358 - Bauru;Pedro Luiz Caliari;plcaliari@sesisp.org.br;https://bauru.sesisp.org.br/;-22.3246;-49.0871
362;SESI; CE;1066;1020 CAT José Villela de A. Jr. - Ribeirão Preto;CE 362 - Ribeirão Preto (Vila Carvalho);Ribeirão Preto;Vila Carvalho;Buenos Aires, nº 159;14075-320;RE18;Diogo Izidoro;RA05;Daniele Telli;Diego Travassos;Própria;CE 362 - Ribeirão Preto;Ricardo Alexandre Machado;ricardo.machado@sesisp.org.br;https://ribeiraopreto.sesisp.org.br/;-21.1699;-47.8099
368;SESI; CE;1140;1006 CAT Belmiro Jesus - Presidente Prudente;CE 368 - Regente Feijó;Regente Feijó;Vila Nova;Rua José Gomes, nº 1101;19570-000;RE21;Waldemar Ramos;RA05;Daniele Telli;Diego Travassos;Própria;CE 368 - Regente Feijó;Sidnei Caio da Silva Junqueira;scsjunqueira@sesisp.org.br;https://prudente.sesisp.org.br/;-22.2181;-51.3055
370;SESI; CE;1095;1043 CAT Ministro R. Della Manna - Mogi Guaçu;CE 370 - Tambaú - Joelmir Beting;Tambaú;Tambaú;Rua Bela Vista, nº 100;13710-000;RE14;Silvio Penteado;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 370 - Tambaú;Stephanie Helena Mariano;smariano@sesisp.org.br;https://mogiguacu.sesisp.org.br/;-21.7029;-47.2703
379;SESI; CE;1173;1031 CAT Mario Amato - Ermelino Matarazzo;CE 379 - Vila Carrão;São Paulo - Vila Carrão;Vila Carrão;Avenida Guilherme Giorgi, nº 200;03422-001;RE01;Renata Caparroz;RA01;Heber Turquetti;Wellington Rodrigues;Terceiro;CE 379 - Vila Carrão;Silvia Simoni Orlando;silviasimoni@sesisp.org.br;https://catumbi.sesisp.org.br/;-23.5329;-46.6395
380;SESI; CE;1085;1008 CAT Lázaro Ramos Novaes - Marília;CE 380 - Paraguaçu Paulista - Carlos Arruda Garms;Paraguaçu Paulista;Vila Athaíde;Rua Prefeito José Deliberador, nº 300;19700-000;RE17;Waldemar Ramos;RA05;Daniele Telli;Diego Travassos;Própria;CE 380 - Paraguaçu Paulista;Luciana Reguera Ventola Nabarro;lventola@sesisp.org.br;https://marilia.sesisp.org.br/;-22.4114;-50.5732
381;SESI; CE;1071;1009 CAT Jorge Duprat Figueiredo - São José do Rio Preto;CE 381 - José Bonifácio;José Bonifácio;Jardim Alcy Sansone;Rua Antonio Seron, nº 500;15200-000;RE19;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;CE 381 - José Bonifácio;Silvia Helena Marchi;smarchi@sesisp.org.br;https://riopreto.sesisp.org.br/;-21.0551;-49.6892
387;SESI; CE;1101;1018 CAT Luiz Dumont Villares - Taubaté;CE 387 - Pindamonhangaba - Paulo Skaf;Pindamonhangaba;Campo Grande;Avenida Antenor da Silva Andrade, nº 183;12412-751;RE07;Bruno Lopes;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 387 - Pindamonhangaba;Flávio de Faria Alvim;falvim@sesisp.org.br;https://taubate.sesisp.org.br/;-22.9246;-45.4613
390;SESI; CE;1093;1036 CAT Laerte Michielin - Araras;CE 390 - Pirassununga;Pirassununga;Vila Guilhermina;Avenida Tenente Olympio Guiguer, nº 2455;13634-214;RE14;Silvio Penteado;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 390 - Pirassununga;Stephanie Helena Mariano;smariano@sesisp.org.br;https://araras.sesisp.org.br/;-21.996;-47.4257
397;SESI; CE;1184;1015 CAT Min. Raphael de A. Magalhães - Mauá;CE 397 - Mauá (Jd. Adelina);Mauá;Jardim Adelina;Rua Salvador Rico, nº 55;09330-309;RE01;Renata Caparroz;RA01;Heber Turquetti;Wellington Rodrigues;Terceiro;CE 397 - Mauá;Silvia Simoni Orlando;silviasimoni@sesisp.org.br;https://maua.sesisp.org.br/;-23.6677;-46.4613
399;SESI; CE;1087;1019 CAT Benedito M. da Silva - Itapetininga;CE 399 - Itapeva;Itapeva;Parque Industrial;Avenida Kazumi Yoshimura, nº 430;18410-480;RE10;Arthur Rodrigues;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 399 - Itapeva;Daniela Rodrigues Righelo Fernandes;dfernandes@sesisp.org.br;https://itapetininga.sesisp.org.br/;-23.9788;-48.8764
400;SESI; CE;1056;1003 CAT Sen. José Ermírio de Moraes - Sorocaba;CE 400 - São Roque - Gumercindo de Góes;São Roque;Jardim Boa Vista;Rua Nelson Vernalha, nº 200;18132-250;RE09;Rafael Capelo;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 400 - São Roque;Julio Cesar de Souza Martins;jmartins@sesisp.org.br;https://sorocaba.sesisp.org.br/;-23.5226;-47.1357
401;SESI; CE;1026;1026 CAT Octávio Mendes Filho - Cruzeiro;CE 401 - Cruzeiro;Cruzeiro;Vila Ana Rosa Novaes;Rua Durvalino de Castro, nº 501;12705-210;RE07;Bruno Lopes;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 401 - Cruzeiro;Flávio de Faria Alvim;falvim@sesisp.org.br;https://cruzeiro.sesisp.org.br/;-22.5728;-44.969
402;SESI; CE;1034;1032 CAT Gastão Vidigal - Vila Leopoldina;CE 402 - Vila das Mercês;São Paulo - Vila das Mercês;Vila Nossa Senhora das Mercês;Rua Julio Felipe Guedes, nº 138;04174-040;RE03;Thiago Romano;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CE 402 - Vila das Mercês;Marcel Miri dos Santos;marcel.miri@sesisp.org.br;https://catumbi.sesisp.org.br/;-23.5329;-46.6395
403;SESI; CE;1048;1048 CAT Professora Maria Braz - Campinas I;CE 403 - Campinas (Parque Itália);Campinas;Centro;Avenida das Amoreiras, nº 450;13036-225;RE11;Virmondes Ferreira;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 403 - Campinas I;André Luis Martins da Silva;asilva@sesisp.org.br;https://campinasamoreiras.sesisp.org.br/;-22.9053;-47.0659
405;SESI; CE;1092;1009 CAT Jorge Duprat Figueiredo - São José do Rio Preto;CE 405 - Fernandópolis;Fernandópolis;Conj. Habitacional Emilio Mininel;Rua Leoncio da Silva, nº 503;15600-000;RE19;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;CE 405 - Fernandópolis;Silvia Helena Marchi;smarchi@sesisp.org.br;https://riopreto.sesisp.org.br/;-20.2806;-50.2471
406;SESI; CE;1183;1015 CAT Min. Raphael de A. Magalhães - Mauá;CE 406 - Mauá (Jardim Itapark);Mauá;Jardim Itapark Velho;Rua Zina Batani Bernardi, nº 800;09351-440;RE01;Renata Caparroz;RA01;Heber Turquetti;Wellington Rodrigues;Terceiro;CE 406 - Mauá;Silvia Simoni Orlando;silviasimoni@sesisp.org.br;https://maua.sesisp.org.br/;-23.6677;-46.4613
407;SESI; CE;1041;1041 CAT Ernesto Pereira L. Filho - São Carlos;CE 407 - São Carlos (Vila Izabel);São Carlos;Vila Izabel;Rua Cel. José Augusto de Oliveira Salles, nº 1325;13570-900;RE15;João Paulo Marcomini;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 407 - São Carlos;Alexandre Minghin;aminghin@sesisp.org.br;https://saocarlos.sesisp.org.br/;-22.0174;-47.886
408;SESI; CE;1037;1037 CAT Mario Pugliese - Limeira;CE 408 - Limeira (Alto da Boa Vista);Limeira;Alto da Boa Vista;Avenida  Major José Levy Sobrinho, nº 2415;13486-190;RE13;Gabriela Morelli;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 408 - Limeira;Jader Luiz Serni;jserni@sesisp.org.br;https://limeira.sesisp.org.br/;-22.566;-47.397
409;SESI; CE;1046;1046 CAT Élcio Guerrazi - Jundiaí;CE 409 - Jundiaí (Jardim Brasil);Jundiaí;Jardim Brasil;Avenida Antônio Segre, nº 695;13201-843;RE08;Fernando Lira;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 409 - Jundiaí;Alexandra Salomao Miamoto;amiamoto@sesisp.org.br;https://jundiai.sesisp.org.br/;-23.1852;-46.8974
410;SESI; CE;1009;1009 CAT Jorge Duprat Figueiredo - São José do Rio Preto;CE 410 - São José do Rio Preto (Vila Elvira);São José do Rio Preto;Vila Elvira;Avenida Duque de Caxias, nº 4656;15060-000;RE19;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;CE 410 - São José do Rio Preto;Silvia Helena Marchi;smarchi@sesisp.org.br;https://riopreto.sesisp.org.br/;-20.8113;-49.3758
411;SESI; CE;1018;1018 CAT Luiz Dumont Villares - Taubaté;CE 411 - Taubaté;Taubaté;Estiva;Rua Voluntário Benedito Sérgio, nº 710;12050-470;RE07;Bruno Lopes;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 411 - Taubaté;Flávio de Faria Alvim;falvim@sesisp.org.br;https://taubate.sesisp.org.br/;-23.0104;-45.5593
412;SESI; CE;1176;1042 CAT Dr. Paulo de Castro Correia - Santos;CE 412 - Santos (Jd. Rádio Clube);Santos;Jardim Rádio Clube;Rua Professor Nelson Spíndola Lobato, nº 222;11088-330;RE05;Luan Souza;RA02;Alexandra Frasson;Júlio Cezar Martins;Terceiro;CE 412 - Santos;Mário Sergio Alves Quaranta;mquaranta@sesisp.org.br;https://santos.sesisp.org.br/;-23.9535;-46.335
413;SESI; CE;1007;1007 CAT Nadir D. Figueiredo - Mogi das Cruzes;CE 413 - Mogi das Cruzes (Brás Cubas);Mogi das Cruzes;Brás Cubas;Rua Valmet, nº 171;08740-640;RE06;Lucas Attili;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 413 - Mogi das Cruzes;Luís Claudio Marques;lcmarques@sesisp.org.br;https://mogidascruzes.sesisp.org.br/;-23.5208;-46.1854
414;SESI; CE;1032;1032 CAT Gastão Vidigal - Vila Leopoldina;CE 414 - Vila Leopoldina;São Paulo - Vila Leopoldina;Vila Leopoldina;Rua Carlos Weber, nº 835;05303-902;RE03;Thiago Romano;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CE 414 - Vila Leopoldina;Marcel Miri dos Santos;marcel.miri@sesisp.org.br;https://leopoldina.sp.senai.br/;-23.5329;-46.6395
415;SESI; CE;1031;1031 CAT Mario Amato - Ermelino Matarazzo;CE 415 - Cidade A. E. Carvalho;São Paulo - A. E. Carvalho;Parque das Paineiras;Rua Deodato Saraiva da Silva, nº 110;03694-090;RE01;Renata Caparroz;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CE 415 - Cidade A. E. Carvalho;Silvia Simoni Orlando;silviasimoni@sesisp.org.br;https://aecarvalho.sesisp.org.br/;-23.5329;-46.6395
416;SESI; CE;1017;1017 CAT Albano Franco - São Bernardo do Campo;CE 416 - São Bernardo do Campo;São Bernardo do Campo;Assunção;Rua Suécia, nº 900;09861-610;RE04;Carlos Kawasaki;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CE 416 - São Bernardo do Campo;Roberta Adriana Lemes Borrego Conte de Oliveira;rborrego@sesisp.org.br;https://saobernardo.sesisp.org.br/;-23.6914;-46.5646
417;SESI; CE;1044;1044 CAT Luis Eulalio de B. V. Filho - Osasco;CE 417 - Osasco;Osasco;I.A.P.I.;Rua Calixto Barbieri, nº 23/83;06233-210;RE03;Thiago Romano;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CE 417 - Osasco;Marcel Miri dos Santos;marcel.miri@sesisp.org.br;https://osasco.sesisp.org.br/;-23.5324;-46.7916
420;SESI; CE;1047;1047 CAT Antonio E. de Moraes - Indaiatuba;CE 420 - Indaiatuba;Indaiatuba;Jardim Califórnia;Avenida Francisco de Paula Leite, nº 2701;13344-700;RE11;Virmondes Ferreira;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 420 - Indaiatuba;André Luis Martins da Silva;asilva@sesisp.org.br;https://indaiatuba.sesisp.org.br/;-23.0816;-47.2101
421;SESI; CE;1049;1049 CAT Joá Penteado - Campinas II;CE 421 - Campinas (Bacuri);Campinas;Bacuri;Avenida Ary Rodriguez, nº 200;13052-550;RE11;Virmondes Ferreira;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 421 - Campinas II;André Luis Martins da Silva;asilva@sesisp.org.br;https://campinasamoreiras.sesisp.org.br/;-22.9053;-47.0659
422;SESI; CE;1038;1038 CAT Estevam Faraone - Americana;CE 422 - Americana (Machadinho);Americana;Machadinho;Avenida Bandeirantes, nº 1000;13478-700;RE12;Daiane Bueno;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 422 - Americana;Guilherme Castilho Sábio;guilherme.sabio@sesisp.org.br;https://americana.sesisp.org.br/;-22.7374;-47.3331
423;SESI; CE;1135;1006 CAT Belmiro Jesus - Presidente Prudente;CE 423 - Presidente Prudente - Antonio Scalon;Presidente Prudente;Jardim Vila Real;Rua Alfa Boscoli, nº 381;19063-410;RE21;Waldemar Ramos;RA05;Daniele Telli;Diego Travassos;Própria;CE 423 - Presidente Prudente;Sidnei Caio da Silva Junqueira;scsjunqueira@sesisp.org.br;https://prudente.sesisp.org.br/;-22.1207;-51.3925
424;SESI; CE;1030;1030 CAT Décio de Paula L. Novaes - Cubatão;CE 424 - Cubatão - Ribemont Lopes de Farias;Cubatão;Parque São Luiz;Av. Comendador Francisco Bernardo, nº 261;11533-360;RE05;Luan Souza;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 424 - Cubatão;Mário Sergio Alves Quaranta;mquaranta@sesisp.org.br;https://cubatao.sesisp.org.br/;-23.8911;-46.424
426;SESI; CE;1025;1025 CAT José Roberto M.Teixeira - Diadema;CE 426 - Diadema (Taboão);Diadema;Taboão;Avenida Paranapanema, nº 1500;09930-450;RE04;Carlos Kawasaki;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CE 426 - Diadema;Roberta Adriana Lemes Borrego Conte de Oliveira;rborrego@sesisp.org.br;https://diadema.sesisp.org.br/;-23.6813;-46.6205
427;SESI; CE;1045;1045 CAT Morvan Dias de Figueiredo - Guarulhos;CE 427 - Guarulhos (Jardim Adriana);Guarulhos;Jardim Adriana;Rua Benedicto Caetano da Cruz, nº 100;07135-151;RE06;Lucas Attili;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 427 - Guarulhos;Carlos Frederico D'Avila de Brito ;cbrito@sesisp.org.br;https://guarulhos.sesisp.org.br/;-23.4538;-46.5333
428;SESI; CE;1106;1004 CAT Wilson Sampaio - Tatuí;CE 428 - Cerquilho - José Pilon;Cerquilho;Loteamento Residencial São Francisco;Rua Antonio Modanez, nº 111;18520-000;RE10;Arthur Rodrigues;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 428 - Cerquilho;Daniela Rodrigues Righelo Fernandes;dfernandes@sesisp.org.br;https://tatui.sesisp.org.br/;-23.1665;-47.7459
429;SESI; CE;1108;1040 CAT Mario Mantoni - Piracicaba;CE 429 - Brotas - Carlos Eduardo Moreira Ferreira;Brotas;Centro;Rua João Malagutti, nº 35;17380-000;RE13;Gabriela Morelli;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 429 - Brotas;Jader Luiz Serni;jserni@sesisp.org.br;https://jau.sesisp.org.br/;-22.2795;-48.1251
432;SESI; CE;1211;1211 CAT Olavo Egydio Setúbal - Cotia;CE 432 - Cotia;Cotia;Jardim Passargada I - Moinho Velho;Rua Mesopotamia, nº 300;06712-100;RE03;Thiago Romano;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CE 432 - Cotia;Marcel Miri dos Santos;marcel.miri@sesisp.org.br;https://cotia.sesisp.org.br/;-23.6022;-46.919
433;SESI; CE;1213;1213 CAT José C. A.Nadalini - Santana de Parnaíba;CE 433 - Santana de Parnaíba;Santana de Parnaíba;Cidade São Pedro;Rua Conselheiro Ramalho, nº 264;06535-175;RE08;Fernando Lira;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 433 - Santana de Parnaíba;Alexandra Salomao Miamoto;amiamoto@sesisp.org.br;https://santanadeparnaiba.sesisp.org.br/;-23.4439;-46.9178
434;SESI; CE;1214;1031 CAT Mario Amato - Ermelino Matarazzo;CE 434 - Tatuapé;São Paulo - Tatuapé;Bairro Vila Gomes Cardim;Rua Serra de Bragança, nº 990;03318-000;RE01;Renata Caparroz;RA01;Heber Turquetti;Wellington Rodrigues;Terceiro;CE 434 - Tatuapé;Silvia Simoni Orlando;silviasimoni@sesisp.org.br;https://catumbi.sesisp.org.br/;-23.5329;-46.6395
435;SESI; CE;1215;1009 CAT Jorge Duprat Figueiredo - São José do Rio Preto;CE 435 - Votuporanga;Votuporanga;Bairro Patrimonio Novo;Rua São Paulo, nº 1820;15501-065;RE19;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;CE 435 - Votuporanga;Silvia Helena Marchi;smarchi@sesisp.org.br;https://riopreto.sesisp.org.br/;-20.4237;-49.9781
436;SESI; CE;1216;1039 CAT Américo Emílio Romi - Santa Bárbara d'Oeste;CE 436 - Nova Odessa - Chalil Zabani;Nova Odessa;Jardim das Palmeiras I;Rua dos Jacarandás, nº 100;13460-000;RE12;Daiane Bueno;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 436 - Nova Odessa;Guilherme Castilho Sábio;guilherme.sabio@sesisp.org.br;https://santabarbara.sesisp.org.br/;-22.7832;-47.2941
437;SESI; CE;1218;1189 CAT Fuad Assef Maluf - Sumaré;CE 437 - Hortolândia;Hortolândia;Bairro Vila São Francisco;Rua Antonia Mancini Pinelli, nº 755;13184-213;RE12;Daiane Bueno;RA03;Fausto Natsui;Telma Ferrari;Própria;CE 437 - Hortolândia;Guilherme Castilho Sábio;guilherme.sabio@sesisp.org.br;https://sumare.sesisp.org.br/;-22.8529;-47.2143
438;SESI; CE;1219;1213 CAT José C. A.Nadalini - Santana de Parnaíba;CE 438 - Cajamar;Cajamar;Portal dos Ipês II;Rua das Camélias, nº 75;07750-000;RE08;Fernando Lira;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 438 - Cajamar;Alexandra Salomao Miamoto;amiamoto@sesisp.org.br;https://santanadeparnaiba.sesisp.org.br/;-23.355;-46.8781
439;SESI; CE;1220;1013 CAT Raphael Noschese - Bauru;CE 439 - Lençóis Paulista - Alberto Trecenti;Lençóis Paulista;Urbano;Avenida Prefeito Jacomo Nicolau Paccola, nº 1829;18685-505;RE16;Ailton dos Santos;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 439 - Lençóis Paulista;Pedro Luiz Caliari;plcaliari@sesisp.org.br;https://bauru.sesisp.org.br/;-22.6027;-48.8037
440;SESI; CE;1238;1044 CAT Luis Eulalio de B. V. Filho - Osasco;CE 440 - Jandira - Fabio Starace Fonseca;Jandira;Jardim Mase;Avenida Emílio Guerra, s/nº;06604-200;RE03;Thiago Romano;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CE 440 - Jandira;Marcel Miri dos Santos;marcel.miri@sesisp.org.br;https://osasco.sesisp.org.br/;-23.5275;-46.9023
441;SESI; CE;1239;1042 CAT Dr. Paulo de Castro Correia - Santos;CE 441 - Registro;Registro;Agrocha;Estrada Vicinal do Bairro Agrocha, s/nº;11900-000;RE05;Luan Souza;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CE 441 - Registro;Mário Sergio Alves Quaranta;mquaranta@sesisp.org.br;https://santos.sesisp.org.br/;-24.4979;-47.8449
442;SESI; CE;1235;1037 CAT Mario Pugliese - Limeira;CE 442 - Limeira - João e Belinha Ometto;Limeira;Área Rural de Limeira;Área Rural, nº 9327, km 3075;13.489-899;RE13;Gabriela Morelli;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CE 442 - Limeira;Jader Luiz Serni;jserni@sesisp.org.br;https://limeira.sesisp.org.br/;-22.566;-47.397
8001;SESI; CAT;1042;1042 CAT Dr. Paulo de Castro Correia - Santos;CAT Santos (Jardim Santa Maria) - Dr. Paulo de Castro Correia;Santos;Santa Maria;Avenida Nossa Senhora de Fátima, nº 366;11085-200;RE05;Luan Souza;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CAT Santos;Mário Sergio Alves Quaranta;mquaranta@sesisp.org.br;https://santos.sesisp.org.br/;-23.9535;-46.335
8002;SESI; CAT;1048;1048 CAT Professora Maria Braz - Campinas I;CAT Campinas I (Parque Itália) - Professora Maria Braz;Campinas;Centro;Avenida das Amoreiras, nº 450;13036-225;RE11;Virmondes Ferreira;RA03;Fausto Natsui;Telma Ferrari;Própria;CAT Campinas I;André Luis Martins da Silva;asilva@sesisp.org.br;https://campinasamoreiras.sesisp.org.br/;-22.9053;-47.0659
8003;SESI; CAT;1003;1003 CAT Sen. José Ermírio de Moraes - Sorocaba;CAT Sorocaba (Mangal) - Senador José Ermírio de Moraes;Sorocaba;Mangal;Rua Duque de Caxias, nº 494;18040-350;RE09;Rafael Capelo;RA03;Fausto Natsui;Telma Ferrari;Própria;CAT Sorocaba;Julio Cesar de Souza Martins;jmartins@sesisp.org.br;https://sorocaba.sesisp.org.br/;-23.4969;-47.4451
8004;SESI; CAT;1018;1018 CAT Luiz Dumont Villares - Taubaté;CAT Taubaté (Estiva) - Luiz Dumont Villares;Taubaté;Estiva;Rua Voluntário Benedito Sérgio, nº 710;12050-470;RE07;Bruno Lopes;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CAT Taubaté;Flávio de Faria Alvim;falvim@sesisp.org.br;https://taubate.sesisp.org.br/;-23.0104;-45.5593
8005;SESI; CAT;1020;1020 CAT José Villela de A. Jr. - Ribeirão Preto;CAT Ribeirão Preto (Castelo Branco) - José Villela de Andrade Júnior;Ribeirão Preto;Lagoinha;Rua Dom Luis do Amaral Mousinho, nº 3465;14090-280;RE18;Diogo Izidoro;RA05;Daniele Telli;Diego Travassos;Própria;CAT Ribeirão Preto;Ricardo Alexandre Machado;ricardo.machado@sesisp.org.br;https://ribeiraopreto.sesisp.org.br/;-21.1699;-47.8099
8006;SESI; CAT;1041;1041 CAT Ernesto Pereira L. Filho - São Carlos;CAT São Carlos (Vila Izabel) - Ernesto Pereira Lopes Filho;São Carlos;Vila Izabel;Rua Cel. José Augusto de Oliveira Salles, nº 1325;13570-900;RE15;João Paulo Marcomini;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CAT São Carlos;Alexandre Minghin;aminghin@sesisp.org.br;https://saocarlos.sesisp.org.br/;-22.0174;-47.886
8007;SESI; CAT;1046;1046 CAT Élcio Guerrazi - Jundiaí;CAT Jundiaí (Jardim Brasil) - Élcio Guerrazi;Jundiaí;Jardim Brasil;Avenida Antônio Segre, nº 695;13201-843;RE08;Fernando Lira;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CAT Jundiaí;Alexandra Salomao Miamoto;amiamoto@sesisp.org.br;https://jundiai.sesisp.org.br/;-23.1852;-46.8974
8008;SESI; CAT;1012;1012 CAT Theobaldo de Nigris - Santo André;CAT Santo André (Santa Terezinha) - Theobaldo de Nigris;Santo André;Santa Terezinha;Praça Dr. Armando Arruda Pereira, nº 100;09210-550;RE04;Carlos Kawasaki;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CAT Santo André;Roberta Adriana Lemes Borrego Conte de Oliveira;rborrego@sesisp.org.br;https://santoandre.sesisp.org.br/;-23.6737;-46.5432
8009;SESI; CAT;1013;1013 CAT Raphael Noschese - Bauru;CAT Bauru (Altos da Cidade) - Raphael Noschese;Bauru;Vila Santa Izabel;Rua Rubens Arruda, nº 8-50;17014-300;RE16;Ailton dos Santos;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CAT Bauru;Pedro Luiz Caliari;plcaliari@sesisp.org.br;https://bauru.sesisp.org.br/;-22.3246;-49.0871
8010;SESI; CAT;1028;1028 CAT Wilton Lupo - Araraquara;CAT Araraquara (Loteamento Jardim Floridiana) - Wilton Lupo;Araraquara;Jardim Floridiana;Avenida Octaviano Arruda Campos, nº 686;14810-901;RE15;João Paulo Marcomini;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CAT Araraquara;Ana Paula Correa de Moraes;ana.correa@sesisp.org.br;https://araraquara.sesisp.org.br/;-21.7845;-48.178
8011;SESI; CAT;1006;1006 CAT Belmiro Jesus - Presidente Prudente;CAT Presidente Prudente (Parque Furquim) - Belmiro Jesus;Presidente Prudente;Parque Furquim;Avenida Ibraim Nobre, nº 585;19030-260;RE21;Waldemar Ramos;RA05;Daniele Telli;Diego Travassos;Própria;CAT Presidente Prudente;Sidnei Caio da Silva Junqueira;scsjunqueira@sesisp.org.br;https://prudente.sesisp.org.br/;-22.1207;-51.3925
8012;SESI; CAT;1007;1007 CAT Nadir D. Figueiredo - Mogi das Cruzes;CAT Mogi das Cruzes (Brás Cubas) - Nadir Dias de Figueiredo;Mogi das Cruzes;Brás Cubas;Rua Valmet, nº 171;08740-640;RE06;Lucas Attili;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CAT Mogi das Cruzes;Luís Claudio Marques;lcmarques@sesisp.org.br;https://mogidascruzes.sesisp.org.br/;-23.5208;-46.1854
8013;SESI; CAT;1203;1203 CAT Francisco da Silva Villela - Araçatuba;CAT Araçatuba (Jardim Presidente) - Francisco da Silva Villela;Araçatuba;Jardim Presidente;Rua Dr. Álvaro Afonso do Nascimento, nº 300;16072-530;RE20;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;CAT Araçatuba;Ataliba Mendonça Junior;amendonca@sesisp.org.br;https://aracatuba.sesisp.org.br/;-21.2076;-50.4401
8014;SESI; CAT;1009;1009 CAT Jorge Duprat Figueiredo - São José do Rio Preto;CAT São José do Rio Preto (Vila Elvira) - Jorge Duprat Figueiredo;São José do Rio Preto;Vila Elvira;Avenida Duque de Caxias, nº 4656;15061-001;RE19;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;CAT São José do Rio Preto;Silvia Helena Marchi;smarchi@sesisp.org.br;https://riopreto.sesisp.org.br/;-20.8113;-49.3758
8015;SESI; CAT;1008;1008 CAT Lázaro Ramos Novaes - Marília;CAT Marília (Jardim Conquista) - Lázaro Ramos Novaes;Marília;Nova Marília;Avenida João Ramalho, nº 1306;17520-240;RE17;Waldemar Ramos;RA05;Daniele Telli;Diego Travassos;Própria;CAT Marília;Luciana Reguera Ventola Nabarro;lventola@sesisp.org.br;https://marilia.sesisp.org.br/;-22.2171;-49.9501
8016;SESI; CAT;1044;1044 CAT Luis Eulalio de B. V. Filho - Osasco;CAT Osasco (Jardim Piratininga) - Luis Eulalio de Bueno Vidigal Filho;Osasco;I.A.P.I.;Rua Calixto Barbieri, nº 23/83;06233-210;RE03;Thiago Romano;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CAT Osasco;Marcel Miri dos Santos;marcel.miri@sesisp.org.br;https://osasco.sesisp.org.br/;-23.5324;-46.7916
8017;SESI; CAT;1027;1027 CAT José Felicio Castellano - Rio Claro;CAT Rio Claro (Jardim Floridiana) - José Felicio Castellano;Rio Claro;Jardim Floridiana;Avenida M-29, nº 441;13505-007;RE13;Gabriela Morelli;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CAT Rio Claro;Jader Luiz Serni;jserni@sesisp.org.br;https://rioclaro.sesisp.org.br/;-22.3984;-47.5546
8018;SESI; CAT;1037;1037 CAT Mario Pugliese - Limeira;CAT Limeira (Alto da Boa Vista) - Mario Pugliese;Limeira;Alto da Boa Vista;Avenida  Major José Levy Sobrinho, nº 2415;13486-190;RE13;Gabriela Morelli;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CAT Limeira;Jader Luiz Serni;jserni@sesisp.org.br;https://limeira.sesisp.org.br/;-22.566;-47.397
8019;SESI; CAT;1040;1040 CAT Mario Mantoni - Piracicaba;CAT Piracicaba (Vila Industrial) - Mario Mantoni;Piracicaba;Vila Industrial;Avenida Luiz Ralf Benatti, nº 600;13412-248;RE13;Gabriela Morelli;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CAT Piracicaba;Jader Luiz Serni;jserni@sesisp.org.br;https://piracicaba.sesisp.org.br/;-22.7338;-47.6476
8020;SESI; CAT;1047;1047 CAT Antonio E. de Moraes - Indaiatuba;CAT Indaiatuba (Jardim California) - Antonio Ermírio de Moraes;Indaiatuba;Jardim Califórnia;Avenida Francisco de Paula Leite, nº 2701;13344-700;RE11;Virmondes Ferreira;RA03;Fausto Natsui;Telma Ferrari;Própria;CAT Indaiatuba;André Luis Martins da Silva;asilva@sesisp.org.br;https://indaiatuba.sesisp.org.br/;-23.0816;-47.2101
8021;SESI; CAT;1039;1039 CAT Américo Emílio Romi - Santa Bárbara d'Oeste;CAT Santa Bárbara d'Oeste (Vila Diva) - Américo Emílio Romi;Santa Bárbara d'Oeste;Vila Diva;Avenida Mário Dedini, nº 216;13453-050;RE12;Daiane Bueno;RA03;Fausto Natsui;Telma Ferrari;Própria;CAT Santa Bárbara d'Oeste;Guilherme Castilho Sábio;guilherme.sabio@sesisp.org.br;https://santabarbara.sesisp.org.br/;-22.7553;-47.4143
8022;SESI; CAT;1043;1043 CAT Ministro R. Della Manna - Mogi Guaçu;CAT Mogi Guaçu (Parque Zaniboni III) - Ministro Roberto Della Manna;Mogi Guaçu;Parque Zaniboni III;Rua Eduardo Figueiredo, nº 300;13848-090;RE14;Silvio Penteado;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CAT Mogi Guaçu;Stephanie Helena Mariano;smariano@sesisp.org.br;https://mogiguacu.sesisp.org.br/;-22.3675;-46.9428
8023;SESI; CAT;1005;1005 CAT Carlos Eduardo M. Ferreira - Itu;CAT Itu (São Luiz) - Carlos Eduardo Moreira Ferreira;Itu;Centro;Rua José Bruni, nº 201;13304-080;RE09;Rafael Capelo;RA03;Fausto Natsui;Telma Ferrari;Própria;CAT Itu;Julio Cesar de Souza Martins;jmartins@sesisp.org.br;https://itu.sesisp.org.br/;-23.2544;-47.2927
8024;SESI; CAT;1016;1016 CAT Osvaldo Pastore - Franca;CAT Franca (Jardim Centenário) - Osvaldo Pastore;Franca;Jardim Centenário;Avenida Santa Cruz, nº 2870;14403-600;RE18;Diogo Izidoro;RA05;Daniele Telli;Diego Travassos;Própria;CAT Franca;Ricardo Alexandre Machado;ricardo.machado@sesisp.org.br;https://franca.sesisp.org.br/;-20.5352;-47.4039
8025;SESI; CAT;1021;1021 CAT Nelson Abbud João - Sertãozinho;CAT Sertãozinho (Cohab Maurílio Biagi) - Nelson Abbud João;Sertãozinho;Cohab Maurilio Biagi;Rua José Rodrigues Godinho, nº 100;14177-320;RE18;Diogo Izidoro;RA05;Daniele Telli;Diego Travassos;Própria;CAT Sertãozinho;Ricardo Alexandre Machado;ricardo.machado@sesisp.org.br;https://sertaozinho.sesisp.org.br/;-21.1316;-47.9875
8026;SESI; CAT;1010;1010 CAT Ozires Silva - São José dos Campos;CAT São José dos Campos (Bosque dos Eucalíptos) - Ozires Silva;São José dos Campos;Bosque Eucalíptos;Avenida Cidade Jardim, nº 4389;12232-000;RE06;Lucas Attili;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CAT São José dos Campos;Carlos Frederico D'Avila de Brito ;cbrito@sesisp.org.br;https://saojosedoscampos.sesisp.org.br/;-23.1896;-45.8841
8028;SESI; CAT;1017;1017 CAT Albano Franco - São Bernardo do Campo;CAT São Bernardo do Campo (Assunção) - Albano Franco;São Bernardo do Campo;Assunção;Rua Suécia, nº 900;09861-610;RE04;Carlos Kawasaki;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CAT São Bernardo do Campo;Roberta Adriana Lemes Borrego Conte de Oliveira;rborrego@sesisp.org.br;https://saobernardo.sesisp.org.br/;-23.6914;-46.5646
8029;SESI; CAT;1015;1015 CAT Min. Raphael de A. Magalhães - Mauá;CAT Mauá (Jardim Zaira) - Ministro Raphael de Almeida Magalhães;Mauá;Jardim Zaira;Avenida Presidente Castelo Branco, nº 237;09320-590;RE01;Renata Caparroz;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CAT Mauá;Silvia Simoni Orlando;silviasimoni@sesisp.org.br;https://maua.sesisp.org.br/;-23.6677;-46.4613
8030;SESI; CAT;1024;1024 CAT Salvador Firace - Botucatu;CAT Botucatu (Conj. Hab. Eng. Francisco) - Salvador Firace;Botucatu;Conjunto Habitacional Engenheiro Francisco;Rua Dr. Nelson Cariola, nº 60;18605-725;RE16;Ailton dos Santos;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CAT Botucatu;Pedro Luiz Caliari;plcaliari@sesisp.org.br;https://botucatu.sesisp.org.br/;-22.8837;-48.4437
8031;SESI; CAT;1014;1014 CAT Ruy Martins Altenfelder Silva - Jaú;CAT Jaú (Jardim Pedro Ometto) - Ruy Martins Altenfelder Silva;Jaú;Jardim Pedro Ometto;Avenida João Lourenço Pires de Campos, nº 600;17212-591;RE15;João Paulo Marcomini;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CAT Jaú;Alexandre Minghin;aminghin@sesisp.org.br;https://jau.sesisp.org.br/;-22.2936;-48.5592
8032;SESI; CAT;1045;1045 CAT Morvan Dias de Figueiredo - Guarulhos;CAT Guarulhos (Jardim Adriana) - Morvan Dias de Figueiredo;Guarulhos;Jardim Adriana;Rua Benedicto Caetano da Cruz, nº 100;07135-151;RE06;Lucas Attili;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CAT Guarulhos;Carlos Frederico D'Avila de Brito ;cbrito@sesisp.org.br;https://guarulhos.sp.senai.br/;-23.4538;-46.5333
8033;SESI; CAT;1023;1023 CAT Karan Simão Racy - Jacareí;CAT Jacareí (Jd. Elza Maria) - Karan Simão Racy;Jacareí;São João;Rua Antônio Ferreira Rizzini, nº 600;12322-120;RE06;Lucas Attili;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CAT Jacareí;Carlos Frederico D'Avila de Brito ;cbrito@sesisp.org.br;https://jacarei.sesisp.org.br/;-23.2983;-45.9658
8034;SESI; CAT;1182;1182 CAT Ministro Dilson Funaro - Birigui;CAT Birigüi (Jardim Pinheiros) - Ministro Dilson Funaro;Birigui;Jardim Pinheiros;Avenida José Agostinho Rossi, nº 620;16203-059;RE20;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;CAT Birigui;Ataliba Mendonça Junior;amendonca@sesisp.org.br;https://birigui.sesisp.org.br/;-21.291;-50.3432
8035;SESI; CAT;1031;1031 CAT Mario Amato - Ermelino Matarazzo;CAT Ermelino Matarazzo - Mario Amato;São Paulo - Ermelino Matarazzo;Parque das Paineiras;Rua Deodato Saraiva da Silva, nº 110;03694-090;RE01;Renata Caparroz;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CAT Ermelino Matarazzo;Silvia Simoni Orlando;silviasimoni@sesisp.org.br;https://catumbi.sesisp.org.br/;-23.5329;-46.6395
8039;SESI; CAT;1032;1032 CAT Gastão Vidigal - Vila Leopoldina;CAT Vila Leopoldina - Gastão Vidgal;São Paulo - Vila Leopoldina;Vila Leopoldina;Rua Carlos Weber, nº 835;05303-902;RE03;Thiago Romano;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CAT Vila Leopoldina;Marcel Miri dos Santos;marcel.miri@sesisp.org.br;https://leopoldina.sesisp.org.br/;-23.5329;-46.6395
8040;SESI; CAT;1029;1029 CAT Azor Silveira Leite - Matão;CAT Matão (Jardim Paraíso III) - Azor Silveira Leite;Matão;Jardim Paraíso III;Avenida Marlene David dos Santos, nº 940;15991-360;RE15;João Paulo Marcomini;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CAT Matão;Ana Paula Correa de Moraes;ana.correa@sesisp.org.br;https://matao.sesisp.org.br/;-21.6025;-48.364
8041;SESI; CAT;1022;1022 CAT Manoel da Costa Santos - Ourinhos;CAT Ourinhos (Das Crianças) - Manoel da Costa Santos;Ourinhos;Bairro das Crianças;Rua Professora Maria José Ferreira, nº 100;19910-075;RE17;Waldemar Ramos;RA05;Daniele Telli;Diego Travassos;Própria;CAT Ourinhos;Luciana Reguera Ventola Nabarro;lventola@sesisp.org.br;https://ourinhos.sesisp.org.br/;-22.9797;-49.8697
8042;SESI; CAT;1036;1036 CAT Laerte Michielin - Araras;CAT Araras (Heitor Villa Lobos) - Laerte Michielin;Araras;Heitor Villa Lobos;Avenida Melvin Jones, nº 2.600;13607-055;RE14;Silvio Penteado;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;CAT Araras;Stephanie Helena Mariano;smariano@sesisp.org.br;https://araras.sesisp.org.br/;-22.3572;-47.3842
8043;SESI; CAT;1038;1038 CAT Estevam Faraone - Americana;CAT Americana (Machadinho) - Estevam Faraone;Americana;Machadinho;Avenida Bandeirantes, nº 1000;13478-700;RE12;Daiane Bueno;RA03;Fausto Natsui;Telma Ferrari;Própria;CAT Americana;Guilherme Castilho Sábio;guilherme.sabio@sesisp.org.br;https://americana.sesisp.org.br/;-22.7374;-47.3331
8044;SESI; CAT;1025;1025 CAT José Roberto M.Teixeira - Diadema;CAT Diadema (Taboão) - José Roberto Magalhães Teixeira;Diadema;Taboão;Avenida Paranapanema, nº 1500;09930-450;RE04;Carlos Kawasaki;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CAT Diadema;Roberta Adriana Lemes Borrego Conte de Oliveira;rborrego@sesisp.org.br;https://diadema.sesisp.org.br/;-23.6813;-46.6205
8045;SESI; CAT;1019;1019 CAT Benedito M. da Silva - Itapetininga;CAT Itapetininga (Vila Rio Branco) - Benedito Marques da Silva;Itapetininga;Vila Rio Branco;Avenida Padre Antonio Brunetti, nº 1360;18208-080;RE10;Arthur Rodrigues;RA03;Fausto Natsui;Telma Ferrari;Própria;CAT Itapetininga;Daniela Rodrigues Righelo Fernandes;dfernandes@sesisp.org.br;https://itapetininga.sesisp.org.br/;-23.5886;-48.0483
8046;SESI; CAT;1030;1030 CAT Décio de Paula L. Novaes - Cubatão;CAT Cubatão (Parque São Luis) - Décio de Paula Leite Novaes;Cubatão;Parque São Luiz;Av. Comendador Francisco Bernardo, nº 261;11533-360;RE05;Luan Souza;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CAT Cubatão;Mário Sergio Alves Quaranta;mquaranta@sesisp.org.br;https://cubatao.sesisp.org.br/;-23.8911;-46.424
8047;SESI; CAT;1049;1049 CAT Joá Penteado - Campinas II;CAT Campinas II (Bacuri) - Joá Penteado;Campinas;Bacuri;Avenida Ary Rodriguez, nº 200;13052-550;RE11;Virmondes Ferreira;RA03;Fausto Natsui;Telma Ferrari;Própria;CAT Campinas II;André Luis Martins da Silva;asilva@sesisp.org.br;https://campinassantosdumont.sesisp.org.br/;-22.9053;-47.0659
8048;SESI; CAT;1002;1002 CAT José Ermírio de M. Filho - Votorantim;CAT Votorantim (Parque Morumbi) - José Ermírio de Moraes Filho;Votorantim;Parque Morumbi;Avenida Cláudio Pinto do Nascimento, nº 140;18110-380;RE09;Rafael Capelo;RA03;Fausto Natsui;Telma Ferrari;Própria;CAT Votorantim;Julio Cesar de Souza Martins;jmartins@sesisp.org.br;https://votorantim.sesisp.org.br/;-23.5446;-47.4388
8049;SESI; CAT;1026;1026 CAT Octávio Mendes Filho - Cruzeiro;CAT Cruzeiro (Vila Ana Rosa Novaes) - Octávio Mendes Filho;Cruzeiro;Vila Ana Rosa Novaes;Rua Durvalino de Castro, nº 501;12705-210;RE07;Bruno Lopes;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CAT Cruzeiro;Flávio de Faria Alvim;falvim@sesisp.org.br;https://cruzeiro.sesisp.org.br/;-22.5728;-44.969
8050;SESI; CAT;1004;1004 CAT Wilson Sampaio - Tatuí;CAT Tatuí (Vila Doutor Laurindo) - Wilson Sampaio;Tatuí;Vila Laurindo;Avenida São Carlos, nº 900;18271-380;RE10;Arthur Rodrigues;RA03;Fausto Natsui;Telma Ferrari;Própria;CAT Tatuí;Daniela Rodrigues Righelo Fernandes;dfernandes@sesisp.org.br;https://tatui.sesisp.org.br/;-23.3487;-47.8461
8052;SESI; CAT;1164;1164 CAT Max Feffer - Suzano;CAT Suzano (Jardim Imperador) - Max Feffer;Suzano;Parque Suzano;Avenida Senador Roberto Simonsen, nº 550;08673-270;RE06;Lucas Attili;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CAT Suzano;Luís Claudio Marques;lcmarques@sesisp.org.br;https://suzano.sesisp.org.br/;-23.5448;-46.3112
8053;SESI; CAT;1213;1213 CAT José C. A.Nadalini - Santana de Parnaíba;CAT Santana de Parnaíba (Cidade São Pedro) - José Carlos Andrade Nadalini;Santana de Parnaíba;Cidade São Pedro;Rua Conselheiro Ramalho, nº 264;06535-175;RE08;Fernando Lira;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;CAT Santana de Parnaíba;Alexandra Salomao Miamoto;amiamoto@sesisp.org.br;https://santanadeparnaiba.sesisp.org.br/;-23.4439;-46.8974
8054;SESI; CAT;1211;1211 CAT Olavo Egydio Setúbal - Cotia;CAT Cotia (Moinho Velho) - Olavo Egydio Setúbal;Cotia;Jardim Passargada I - Moinho Velho;Rua Mesopotamia, nº 300;06712-100;RE03;Thiago Romano;RA01;Heber Turquetti;Wellington Rodrigues;Própria;CAT Cotia;Marcel Miri dos Santos;marcel.miri@sesisp.org.br;https://cotia.sesisp.org.br/;-23.6022;-46.919
8056;SESI; CAT;1189;1189 CAT Fuad Assef Maluf - Sumaré;CAT Sumaré (Nova Veneza) - Fuad Assef Maluf;Sumaré;Jardim Nova Veneza;Rua Amazonas, nº 99;13177-060;RE12;Daiane Bueno;RA03;Fausto Natsui;Telma Ferrari;Própria;CAT Sumaré;Guilherme Castilho Sábio;guilherme.sabio@sesisp.org.br;https://sumare.sesisp.org.br/;-22.8204;-47.2728
8057;SESI; CAT;1199;1199 CAT Carlos C.A.Amorim - Presidente Epitácio;CAT Presidente Epitácio (Vila Recreio) - Carlos Cardoso A. Amorim;Presidente Epitácio;Vila Recreio;Avenida Domingos Ferreira de Medeiros, nº 2-113;19470-000;RE21;Waldemar Ramos;RA05;Daniele Telli;Diego Travassos;Própria;CAT Presidente Epitácio;Sidnei Caio da Silva Junqueira;scsjunqueira@sesisp.org.br;https://presidenteepitacio.sesisp.org.br/;-21.7651;-52.1111
8060;SESI; CAT;1117;1117 CAT Maria Ap. J. P.Menezes - Barretos;CAT Barretos (Los Angeles) - Maria Ap. Junqueira P. de Menezes;Barretos;Los Angeles;Rua Dr. Roberto Cardoso Alves, nº 800;14787-400;RE19;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;CAT Barretos;Silvia Helena Marchi;smarchi@sesisp.org.br;https://barretos.sesisp.org.br/;-20.5531;-48.5698
8058;SESI;Faculdade;1231;1032 CAT Gastão Vidigal - Vila Leopoldina;Faculdade SESI-SP de Educação (Fasesp);São Paulo - Vila Leopoldina;Vila Leopoldina;Rua Carlos Weber nº 835;05303-902;RE03;Thiago Romano;RA01;Heber Turquetti;Wellington Rodrigues;Própria;Faculdade (Fasesp);Marcel Miri dos Santos;marcel.miri@sesisp.org.br;https://www.faculdadesesi.edu.br/;-23.5329;-46.6395
750;SENAI;Alugado Caixa;2001;-;Edifício 750 - Alugado para a Caixa Econômica Federal;São Paulo - Av. Paulista;Bela Vista;Av. Paulista, nº 750;01310-100;RE02;Lucas Attili;RA01;Heber Turquetti;Wellington Rodrigues;Própria;Edifício 750;-;;-;-23.5329;-46.6395
Jaú;SENAI;CFP;2066;-;Nova Escola SENAI - Jaú - Edward Savio;Jaú ;Jardim Netinho Prado;Rua Lions Clube x Rua Santa Mônica, s/nº;17208-086;RE15;João Paulo Marcomini;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;7.90 Jaú;-;;https://jau.sp.senai.br/;-22.2936;-48.5592
Boituva;SENAI;CFP;2001;-;Nova Escola SENAI - Boituva;Boituva;Recanto das Primaveras I;R. Maria da Conceição Pacheco Machado, s/n;18552-256;RE10;Arthur Rodrigues;RA03;Fausto Natsui;Telma Ferrari;Própria;Boituva;-;;-;-23.2890;-47.6521
Mairinque;SENAI;CFP;2074;-;Nova Escola SENAI - Mairinque;Mairinque;Vila Sorocabana;Rua Francisco Merguizo, s/n;18121-042;RE09;Rafael Capelo;RA03;Fausto Natsui;Telma Ferrari;Própria;4.99 Mairinque;-;;-;-23.5387;-47.1815
Galpão;SENAI;Galpão;;-;Galpão;São Paulo - Água Funda;Vila Água Funda;R. Alexandre Aliperti, 340;04156-110;RE04;Carlos Kawasaki;RA01;Heber Turquetti;Wellington Rodrigues;Terceiro;Galpão;-;;;;
1.01;SENAI;CFP;2002;-;1.01 Brás - Roberto Simonsen;São Paulo - Brás;Brás;Rua Monsenhor Andrade, nº 298;03008-000;RE03;Thiago Romano;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.01 Brás;-;;https://bras.sp.senai.br/;-23.5329;-46.6395
1.02;SENAI;CFP;2003;-;1.02 Vila Alpina - Humberto Reis Costa;São Paulo - Vila Alpina;Vila Alpina;Rua Aracati Mirim, nº 115;03227-160;RE02;Lucas Attili;RA01;Heber Turquetti;Wellington Rodrigues;Terceiro;1.02 Vila Alpina;-;;https://vilaalpina.sp.senai.br/;-23.5329;-46.6395
1.03;SENAI;CFP;2004;-;1.03 Mooca - Morvan Figueiredo;São Paulo - Mooca;Mooca;Rua do Oratório, nº 215;03117-000;RE02;Lucas Attili;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.03 Mooca;-;;https://mooca.sp.senai.br/;-23.5329;-46.6395
1.05;SENAI;CFP;2006;-;1.05 Barra Funda - Horácio Augusto da Silveira;São Paulo - Barra Funda;Barra Funda;Rua Tagipuru, nº 242;01156-000;RE02;Lucas Attili;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.05 Barra Funda;-;;https://alimentos.sp.senai.br/;-23.5329;-46.6395
1.06;SENAI;CFP;2007;-;1.06 Vila Leopoldina - Mariano Ferraz;São Paulo - Vila Leopoldina;Vila Leopoldina;Rua Jaguaré Mirim, nº 71;05311-020;RE03;Thiago Romano;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.06 Vila Leopoldina;-;;https://leopoldina.sp.senai.br/;-23.5329;-46.6395
1.07;SENAI;CFP;2005;-;1.07 Brás (Têxtil) - Francisco Matarazzo;São Paulo - Brás;Brás;Rua Correia de Andrade, nº 232;03008-020;RE03;Thiago Romano;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.07 Brás;-;;https://textil.sp.senai.br/;-23.5329;-46.6395
1.08;SENAI;CFP;2008;-;1.08 Ipiranga (Refrigeração) - Oscar Rodrigues Alves;São Paulo - Ipiranga;Ipiranga;Rua 1822, nº 76;04216-000;RE02;Lucas Attili;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.08 Ipiranga;-;;https://refrigeracao.sp.senai.br/;-23.5329;-46.6395
1.09;SENAI;CFP;2009;-;1.09 Vila Mariana - Anchieta;São Paulo - Vila Mariana;Vila Mariana;Rua Gandavo, nº 550;04023-001;RE02;Lucas Attili;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.09 Vila Mariana;-;;https://eletronica.sp.senai.br/;-23.5329;-46.6395
1.10;SENAI;CFP;2103;-;1.10 Bom Retiro - Celso Charuri;São Paulo - Bom Retiro;Bom Retiro;Rua Anhaia, nº 1321;01130-000;RE02;Lucas Attili;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.10 Bom Retiro;-;;https://biotecnologia.sp.senai.br/;-23.5329;-46.6395
1.11;SENAI;CFP;2011;-;1.11 Tatuapé (Construção Civil) - Orlando Laviero Ferraiuolo;São Paulo - Tatuapé;Tatuapé;Rua Teixeira de Mello, nº 106;03067-000;RE02;Lucas Attili;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.11 Tatuapé;-;;https://construcaocivil.sp.senai.br/;-23.5329;-46.6395
1.12;SENAI;CFP;2012;-;1.12 Santo Amaro - Ary Torres;São Paulo - Santo Amaro;Santo Amaro;Rua Amador Bueno, nº 504;04752-000;RE02;Lucas Attili;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.12 Santo Amaro;-;;https://santoamaro.sp.senai.br/;-23.5329;-46.6395
1.13;SENAI;CFP;2013;-;1.13 Ipiranga (Automobilística) - Conde José Vicente Azevedo;São Paulo - Ipiranga;Ipiranga;Rua Moreira de Godói, nº 226;04266-060;RE02;Lucas Attili;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.13 Ipiranga;-;;https://automobilistica.sp.senai.br/;-23.5329;-46.6395
1.14;SENAI;CFP;2014;-;1.14 Mooca (Gráfica) - Theobaldo De Nigris;São Paulo - Mooca;Mooca;Rua Bresser, nº 2315;03162-030;RE02;Lucas Attili;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.14 Mooca;-;;https://grafica.sp.senai.br/;-23.5329;-46.6395
1.15;SENAI;CFP;2015;-;1.15 Santo Amaro (Suíço-Brasileira) - Paulo Ernesto Tolle;São Paulo - Santo Amaro;Santo Amaro;Rua Bento Branco de Andrade Filho, nº 379;04757-000;RE02;Lucas Attili;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.15 Santo Amaro;-;;https://suicobrasileira.sp.senai.br/;-23.5329;-46.6395
1.16;SENAI;CFP;2060;-;1.16 São Bernardo do Campo - Mario Amato;São Bernardo do Campo;Assunção;Avenida José Odorizzi, nº 1555;09861-000;RE04;Carlos Kawasaki;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.16 São Bernardo do Campo;-;;https://meioambiente.sp.senai.br/;-23.6914;-46.5646
1.17;SENAI;CFP;2051;-;1.17 Mogi das Cruzes - Nami Jafet;Mogi das Cruzes;Centro;Rua Dom Antonio Cândido de Alvarenga, nº 353;08780-070;RE06;Lucas Attili;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;1.17 Mogi das Cruzes;-;;https://mogidascruzes.sp.senai.br/;-23.5208;-46.1854
1.18;SENAI;CFP;2028;-;1.18 Santo André - A. Jacob Lafer;Santo André;Ipiranguinha;Avenida Santos Dumont, nº 300;09015-320;RE04;Carlos Kawasaki;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.18 Santo André;-;;https://santoandre.sp.senai.br/;-23.6737;-46.5432
1.19;SENAI;CFP;2064;-;1.19 Osasco - Nadir Dias de Figueiredo;Osasco;Presidente Altino;Rua Ari Barroso, nº 305;06216-901;RE03;Thiago Romano;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.19 Osasco;-;;https://metalurgia.sp.senai.br/;-23.5324;-46.7916
1.20;SENAI;CFP;2059;-;1.20 São Bernardo do Campo (Tamandaré + Volkswagen) - Almirante Tamandaré;São Bernardo do Campo;Baeta Neves;Avenida Pereira Barreto, nº 456;09751-000;RE04;Carlos Kawasaki;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.20 São Bernardo do Campo;-;;https://sbc.sp.senai.br/;-23.6914;-46.5646
1.21;SENAI;CFP;2027;-;1.21 Cambuci - Carlos Pasquale;São Paulo - Cambuci;Cambuci;Rua Muniz de Souza, nº 3;01534-000;RE02;Lucas Attili;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.21 Cambuci;-;;https://cambuci.sp.senai.br/;-23.5329;-46.6395
1.22;SENAI;CFP;2046;-;1.22 Guarulhos - Hermenegildo Campos de Almeida;Guarulhos;Jardim Paraventi;Avenida Dr. Renato de Andrade Maia, nº 601;07114-000;RE07;Bruno Lopes;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;1.22 Guarulhos;-;;https://guarulhos.sp.senai.br/;-23.4538;-46.5333
1.23;SENAI;CFP;2026;-;1.23 São Caetano do Sul (Mecatrônica) - Armando de Arruda Pereira;São Caetano do Sul;Boa Vista;Rua Santo André, nº 680;09.572-000;RE04;Carlos Kawasaki;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.23 São Caetano do Sul;-;;https://mecatronica.sp.senai.br/;-23.6229;-46.5548
1.24;SENAI;CFP;2044;-;1.24 Suzano - Luis Eulálio de Bueno Vidigal Filho;Suzano;Cidade Edson;Rua Ignácio Garcia, nº 321;08665-120;RE06;Lucas Attili;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;1.24 Suzano;-;;https://suzano.sp.senai.br/;-23.5448;-46.3112
1.25;SENAI;CFP;2054;-;1.25 Diadema - Manuel Garcia Filho;Diadema;Jardim Canhema;Rua Guatemala, nº 19;09941-140;RE04;Carlos Kawasaki;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.25 Diadema;-;;https://diadema.sp.senai.br/;-23.6813;-46.6205
1.26;SENAI;CFP;2016;-;1.26 Tatuapé (Manutenção Industrial) - Frederico Jacob;São Paulo - Tatuapé;Tatuapé;Rua São Jorge, nº 634;03087-000;RE02;Lucas Attili;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.26 Tatuapé;-;;https://manutencao.sp.senai.br/;-23.5329;-46.6395
1.27;SENAI;CFP;2058;-;1.27 Jandira - Profº. Vicente Amato;Jandira;Centro;Rua Elton Silva, nº 905;06600-025;RE03;Thiago Romano;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.27 Jandira;-;;https://jandira.sp.senai.br/;-23.5275;-46.9023
1.28;SENAI;CFP;2105;-;1.28 Guarulhos - Celso Charuri;Guarulhos;Jardim Presidente Dutra;Avenida Carmela Dutra, nº 380;07170-150;RE07;Bruno Lopes;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;1.28 Guarulhos;-;;https://guarulhosdutra.sp.senai.br/;-23.4538;-46.5333
1.32;SENAI;CFP;2081;-;1.32 Santa Cecília (Informática);São Paulo - Santa Cecília;Santa Cecília;Alameda Barão de Limeira, nº 539;01202-902;RE02;Lucas Attili;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.32 Santa Cecília;-;;;;
1.34;SENAI;CFP;2088;-;1.34 São Caetano do Sul - Paulo Antonio Skaf;São Caetano do Sul;Centro;R. Niterói, nº 180 ;09510-200;RE04;Carlos Kawasaki;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.34 São Caetano do Sul;-;;https://mecatronica.sp.senai.br/;-23.6229;-46.5548
1.35;SENAI;CFP;2087;-;1.35 Santana de Parnaíba - Suzana Dias;Santana de Parnaíba;Jardim do Luar;Estrada Tenente Marques, nº 5300;06529-0001;RE08;Fernando Lira;RA02;Alexandra Frasson;Júlio Cezar Martins;Terceiro;1.35 Santana de Parnaíba;-;;https://santanadeparnaiba.sp.senai.br/;-23.4439;-46.9178
1.36;SENAI;CFP;2091;-;1.36 Barueri - José Ephim Mindlin;Barueri;Centro;Alameda Wagih Salles Nemer, nº 124;06401-134;RE03;Thiago Romano;RA01;Heber Turquetti;Wellington Rodrigues;Terceiro;1.36 Barueri;-;;https://barueri.sp.senai.br/;-23.5057;-46.879
1.38;SENAI;CFP;2108;-;1.38 Cotia - Ricardo Lerner;Cotia;Vila Santo Antonio;Rua Direita, nº 955;06708-280;RE03;Thiago Romano;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.38 Cotia;-;;https://cotia.sp.senai.br/;-23.6022;-46.919
1.41;SENAI;CFP;2109;-;1.41 CPTM - Engº James C. Stewart;São Paulo - Vila Anastácio;Vila Anastácio;Av. Raimundo Pereira de Magalhães, 1000;05092-040;RE02;Lucas Attili;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.41 CPTM;-;;https://sp.senai.br/unidade/ferrovia/;-23.5118;-46.7138
1.43;SENAI;CFP;2110;-;1.43 Volkswagen;São Bernardo do Campo;Demarchi;Rodovia Anchieta, km 23,5;09823-901;RE04;Carlos Kawasaki;RA01;Heber Turquetti;Wellington Rodrigues;Terceiro;1.43 Volkswagen;-;;https://sbc.sp.senai.br/;-23.6914;-46.5646
1.44;SENAI;CFP;2076;-;1.44 São Bernardo do Campo (Mercedes Benz);São Bernardo do Campo;Vila Paulicéia;Avenida Alfred Jurzykowski, nº 562;09680-100;RE04;Carlos Kawasaki;RA01;Heber Turquetti;Wellington Rodrigues;Terceiro;1.44 São Bernardo do Campo;-;;https://mercedesbenz.sp.senai.br/;-23.6914;-46.5646
1.50;SENAI;EAD;2112;-;1.50 Brás - Educação Online;São Paulo - Brás;Brás;Rua Correia de Andrade, nº 232;03008-020;RE03;Thiago Romano;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.50 Brás (EAD);-;;;;
1.63;SENAI;CFP;2017;-;1.63 Pirituba - Jorge Mahfuz;São Paulo - Pirituba;Pirituba;Rua Jerônimo Telles Júnior, nº 125;05154-010;RE02;Lucas Attili;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.63 Pirituba;-;;https://pirituba.sp.senai.br/;-23.5329;-46.6395
1.64;SENAI;CFP;2034;-;1.64 Mauá - Jairo Candido;Mauá;Vila Bocaína;Rua Luis Lacava, nº 202;09310-080;RE04;Carlos Kawasaki;RA01;Heber Turquetti;Wellington Rodrigues;Própria;1.64 Mauá;-;;https://maua.sp.senai.br/;-23.6677;-46.4613
2.01;SENAI;CFP;2061;-;2.01 Santos - Antonio Souza Noschese;Santos;Bairro Vila Matias;Avenida Senador Feijó, nº 421;11015-505;RE05;Luan Souza;RA02;Alexandra Frasson;Júlio Cezar Martins;Terceiro;2.01 Santos;-;;https://santos.sp.senai.br/;-23.9535;-46.335
2.02;SENAI;CFP;2036;-;2.02 Cubatão - Hessel Horácio Cherkassky;Cubatão;Centro;Praça da Bíblia, nº 1;11510-300;RE05;Luan Souza;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;2.02 Cubatão;-;;https://cubatao.sp.senai.br/;-23.8911;-46.424
2.60;SENAI;CFP;2111;-;2.60 Registro;Registro;Agrochá;Avenida Saburo Kameyama, nº 1005;11900-000;RE05;Luan Souza;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;2.60 Registro;-;;https://registro.sp.senai.br/;-24.4979;-47.8449
3.01;SENAI;CFP;2035;-;3.01 Taubaté - Felix Guisard;Taubaté;Independência;Avenida Independência, nº 846;12031-001;RE07;Bruno Lopes;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;3.01 Taubaté;-;;https://taubate.sp.senai.br/;-23.0104;-45.5593
3.02;SENAI;CFP;2022;-;3.02 São José dos Campos - Santos Dumont;São José dos Campos;Santana;Rua Pedro Rachid, nº 304;12221-180;RE07;Bruno Lopes;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;3.02 São José dos Campos;-;;https://saojosedoscampos.sp.senai.br/;-23.1896;-45.8841
3.03;SENAI;CFP;2031;-;3.03 Jacareí - Luiz Simon;Jacareí;Jardim América;Rua Antônio Fogaça de Almeida, nº 355;12322-030;RE07;Bruno Lopes;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;3.03 Jacareí;-;;https://jacarei.sp.senai.br/;-23.2983;-45.9658
3.60;SENAI;CFP;2056;-;3.60 Pindamonhangaba - Geraldo Alckmin;Pindamonhangaba;Loteamento Eduardo da Silva Neto;Avenida Abel Correia Guimarães, nº 971;12422-441;RE07;Bruno Lopes;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;3.60 Pindamonhangaba;-;;https://pindamonhangaba.sp.senai.br/;-22.9246;-45.4613
3.90;SENAI;CFP;2071;-;3.90 Cruzeiro;Cruzeiro;Jardim São José;Rua São Tomás, nº 01;12703-290;RE07;Bruno Lopes;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;3.90 Cruzeiro;-;;https://cruzeiro.sp.senai.br/;-22.5728;-44.969
4.01;SENAI;CFP;2029;-;4.01 Itu - Italo Bologna;Itu;Centro;Avenida Goiás, nº 139;13301-370;RE09;Rafael Capelo;RA03;Fausto Natsui;Telma Ferrari;Própria;4.01 Itu;-;;https://itu.sp.senai.br/;-23.2544;-47.2927
4.02;SENAI;CFP;2019;-;4.02 Sorocaba - Gaspar Ricardo Junior;Sorocaba;Santa Rosália;Praça Roberto Mange, nº 30;18090-110;RE09;Rafael Capelo;RA03;Fausto Natsui;Telma Ferrari;Própria;4.02 Sorocaba;-;;https://sorocaba.sp.senai.br/;-23.4969;-47.4451
4.03;SENAI;CFP;2084;-;4.03 Alumínio - Antônio Ermírio de Moraes;Alumínio;Vila Santa Luzia;Avenida Antonio de Castro Figuerôa, nº 60;18125-000;RE09;Rafael Capelo;RA03;Fausto Natsui;Telma Ferrari;Própria;4.03 Alumínio;-;;https://aluminio.sp.senai.br/;-23.5306;-47.2546
4.04;SENAI;CFP;2106;-;4.04 Sorocaba - Luiz Pagliato;Sorocaba;Jardim Santa Cecília;Avenida Itavuvu, nº 6515;18078-005;RE09;Rafael Capelo;RA03;Fausto Natsui;Telma Ferrari;Própria;4.04 Sorocaba;-;;https://sorocabaitavuvu.sp.senai.br/;-23.4969;-47.4451
4.99;SENAI; CT;2074;-;4.99 Mairinque;Mairinque;Jardim Cruzeiro;Avenida Dr. José Maria Witacker, nº 735;18120-000;RE09;Rafael Capelo;RA03;Fausto Natsui;Telma Ferrari;Terceiro;4.99 Mairinque;-;;https://mairinque.sp.senai.br/;-23.5398;-47.185
5.01;SENAI;CFP;2040;-;5.01 Campinas - Roberto Mange;Campinas;São Bernardo;Rua Pastor Cícero Canuto de Lima, nº 71;13036-210;RE11;Virmondes Ferreira;RA03;Fausto Natsui;Telma Ferrari;Própria;5.01 Campinas;-;;https://campinas.sp.senai.br/;-22.9053;-47.0659
5.02;SENAI;CFP;2021;-;5.02 Jundiaí - Conde Alexandre Siciliano;Jundiaí;Anhangabau;Rua Engenheiro Roberto Mange, nº 95;13208-200;RE08;Fernando Lira;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;5.02 Jundiaí;-;;https://jundiai.sp.senai.br/;-23.1852;-46.8974
5.03;SENAI;CFP;2041;-;5.03 Piracicaba - Mario Dedini;Piracicaba;Centro;Rua Dom Pedro II, nº 1474;13419-210;RE13;Gabriela Morelli;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;5.03 Piracicaba;-;;https://piracicabacentro.sp.senai.br/;-22.7338;-47.6476
5.05;SENAI;CFP;2047;-;5.05 Limeira - Luiz Varga;Limeira;Jardim Mercedes;Rua Professor Antonio Queiroz, nº 72;13480-251;RE13;Gabriela Morelli;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;5.05 Limeira;-;;https://limeira.sp.senai.br/;-22.566;-47.397
5.06;SENAI;CFP;2053;-;5.06 Rio Claro - Manoel José Ferreira;Rio Claro;Jardim Primavera;Avenida 46, nº 661;13504-050;RE13;Gabriela Morelli;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;5.06 Rio Claro;-;;https://rioclaro.sp.senai.br/;-22.3984;-47.5546
5.07;SENAI;CFP;2049;-;5.07 Americana - Profº João Baptista Salles da Silva;Americana;Parque residencial Nardini;Avenida Brasil Sul, nº 2801;13468-390;RE12;Daiane Bueno;RA03;Fausto Natsui;Telma Ferrari;Própria;5.07 Americana;-;;https://americana.sp.senai.br/;-22.7374;-47.3331
5.08;SENAI;CFP;2023;-;5.08 Itatiba - Luiz Scavone;Itatiba;Vila Prudente de Moraes;Rua Alfredo Massaretti, nº 191;13251-360;RE08;Fernando Lira;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;5.08 Itatiba;-;;https://itatiba.sp.senai.br/;-23.0035;-46.8464
5.09;SENAI;CFP;2043;-;5.09 Campinas - Prof. Dr. Euryclides de Jesus Zerbini;Campinas;Ponte Preta;Avenida da Saudade, nº 125;13041-670;RE11;Virmondes Ferreira;RA03;Fausto Natsui;Telma Ferrari;Própria;5.09 Campinas;-;;https://campinaszerbini.sp.senai.br/;-22.9053;-47.0659
5.10;SENAI;CFP;2039;-;5.10 Piracicaba (Vila Rezende) - Mario Henrique Simonsen;Piracicaba;Jardim Primavera;Av. Mal. Castelo Branco, nº 1000;13412-010;RE13;Gabriela Morelli;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;5.10 Piracicaba;-;;https://piracicabavila.sp.senai.br/;-22.7338;-47.6476
5.12;SENAI;CFP;2086;-;5.12 Sumaré - Celso Charuri;Sumaré;Jardim São Carlos;Avenida Rebouças, nº 3965;13170-023;RE12;Daiane Bueno;RA03;Fausto Natsui;Telma Ferrari;Própria;5.12 Sumaré;-;;https://sumare.sp.senai.br/;-22.8204;-47.2728
5.13;SENAI;CFP;2090;-;5.13 Jaguariúna;Jaguariúna;Centro;Rua Anesia Venturi Zani, nº 62;13911-014;RE11;Virmondes Ferreira;RA03;Fausto Natsui;Telma Ferrari;Terceiro;5.13 Jaguariúna;-;;https://jaguariuna.sp.senai.br/;-22.7037;-46.9851
5.14;SENAI;CFP;2050;-;5.14 Santa Bárbara d'Oeste - Alvares Romi;Santa Bárbara d'Oeste;Bairro Cidade Industrial;Rua Vereador Sérgio Leopoldino Alves, nº 500;13456-166;RE12;Daiane Bueno;RA03;Fausto Natsui;Telma Ferrari;Própria;5.14 Santa Bárbara d'Oeste;-;;https://santabarbara.sp.senai.br/;-22.7553;-47.4143
5.61;SENAI;CFP;2057;-;5.61 Rafard - Celso Charuri;Rafard;Centro;Avenida Dr. José Soares de Faria, nº 422;13370-000;RE13;Gabriela Morelli;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;5.61 Rafard;-;;https://rafard.sp.senai.br/;-23.0105;-47.5318
5.62;SENAI;CFP;2075;-;5.62 Indaiatuba - Comendador Santoro Mirone;Indaiatuba;Pimenta;Rua SENAI, nº 129;13347-680;RE11;Virmondes Ferreira;RA03;Fausto Natsui;Telma Ferrari;Própria;5.62 Indaiatuba;-;;https://indaiatuba.sp.senai.br/;-23.0816;-47.2101
5.63;SENAI;CFP;2032;-;5.63 Mogi Guaçu;Mogi Guaçu;Jardim Ipê II;Rua Cambé, nº 140;13846-080;RE14;Silvio Penteado;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;5.63 Mogi Guaçu;-;;https://mogiguacu.sp.senai.br/;-22.3675;-46.9428
5.64;SENAI;CFP;2042;-;5.64 Valinhos;Valinhos;Vila Santo Antonio;Rua Arthur Fernandes Querido, nº 55;13270-530;RE11;Virmondes Ferreira;RA03;Fausto Natsui;Telma Ferrari;Própria;5.64 Valinhos;-;;https://valinhos.sp.senai.br/;-22.9698;-46.9974
5.68;SENAI;CFP;2024;-;5.68 Campo Limpo Paulista - Alfried Krupp;Campo Limpo Paulista;Jardim América;Avenida Adherbal da Costa Moreira, nº 456;13231-190;RE08;Fernando Lira;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;5.68 Campo Limpo Paulista;-;;https://campolimpopaulista.sp.senai.br/;-23.2078;-46.7889
5.69;SENAI;CFP;2038;-;5.69 Paulínia - Ricardo Figueiredo Terra;Paulínia;Alto de Pinheiros;Av. Engenheiro Roberto Mange, nº 710;13145-324;RE12;Daiane Bueno;RA03;Fausto Natsui;Telma Ferrari;Própria;5.69 Paulínia;-;;https://paulinia.sp.senai.br/;-22.7542;-47.1488
5.90;SENAI;CFP;2070;-;5.90 Araras - Ivan Fabio Zurita;Araras;Jardim das Flores;Avenida Ignácio Zurita Neto, nº 1025;16607-207;RE14;Silvio Penteado;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;5.90 Araras;-;;https://araras.sp.senai.br/;-22.3572;-47.3842
5.91;SENAI;CFP;2068;-;5.91 Bragança Paulista;Bragança Paulista;Jardim Morumbi;Avenida Ernesto Vaz de Lima, nº 570;12926-215;RE07;Bruno Lopes;RA02;Alexandra Frasson;Júlio Cezar Martins;Própria;5.91 Bragança Paulista;-;;https://bragancapaulista.sp.senai.br/;-22.9527;-46.5419
5.92;SENAI; CT;2085;-;5.92 São João da Boa Vista;São João da Boa Vista;Perpétuo Socorro;Avenida Brasilia, nº 1021;13870-971;RE14;Silvio Penteado;RA04;Jéssica de Oliveira;Danilo Bazogli;Terceiro;5.92 São João da Boa Vista;-;;https://saojoaodaboavista.sp.senai.br/;-21.9707;-46.7944
5.94;SENAI;CFP;2104;-;5.94 Iracemápolis - João Guilherme Sabino Ometto;Iracemápolis;Distrito Industrial;Rua Camilo Ferrari, n] 765;13495-000;RE13;Gabriela Morelli;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;5.94 Iracemápolis;-;;https://iracemapolis.sp.senai.br/;-22.5832;-47.523
6.01;SENAI;CFP;2020;-;6.01 São Carlos - Antonio A. Lobbe;São Carlos;Vila Prado;Rua Cândido Padim, nº 25;13574-320;RE15;João Paulo Marcomini;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;6.01 São Carlos;-;;https://saocarlos.sp.senai.br/;-22.0174;-47.886
6.02;SENAI;CFP;2055;-;6.02 Ribeirão Preto - Engº Octavio Marcondes Ferraz;Ribeirão Preto;Campos Elíseos;Rua Capitão Salomão, nº 1813;14085-430;RE18;Diogo Izidoro;RA05;Daniele Telli;Diego Travassos;Própria;6.02 Ribeirão Preto;-;;https://ribeiraopreto.sp.senai.br/;-21.1699;-47.8099
6.03;SENAI;CFP;2025;-;6.03 Araraquara - Henrique Lupo;Araraquara;Quitandinha;Rua Hugo Negrini, nº 60;14800-030;RE15;João Paulo Marcomini;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;6.03 Araraquara;-;;https://araraquara.sp.senai.br/;-21.7845;-48.178
6.04;SENAI;CFP;2037;-;6.04 Franca - Marcio Bagueira Leal;Franca;Jardim Petraglia;Avenida Presidente Vargas, nº 2500;14402-000;RE18;Diogo Izidoro;RA05;Daniele Telli;Diego Travassos;Própria;6.04 Franca;-;;https://calcados.sp.senai.br/;-20.5352;-47.4039
6.61;SENAI;CFP;2067;-;6.61 Sertãozinho - Ettore Zanini;Sertãozinho;Conj. Hab. Dr. Walter Antonio de P. Becker;Avenida Fioravante Magro, nº 230;14177-340;RE18;Diogo Izidoro;RA05;Daniele Telli;Diego Travassos;Própria;6.61 Sertãozinho;-;;https://sertaozinho.sp.senai.br/;-21.1316;-47.9875
6.62;SENAI;CFP;2069;-;6.62 Matão - Oscar Lúcio Baldan;Matão;Jardim Buscardi;Aveinda Ibitinga, nº 621;15991-205;RE15;João Paulo Marcomini;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;6.62 Matão;-;;https://matao.sp.senai.br/;-21.6025;-48.364
7.01;SENAI;CFP;2062;-;7.01 Bauru - João Martins Coube;Bauru;Centro;Rua Virgílio Malta, nº 11/22;17015-220;RE16;Ailton dos Santos;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;7.01 Bauru;-;;https://bauru.sp.senai.br/;-22.3246;-49.0871
7.90;SENAI; CT;2066;-;7.90 Jaú;Jaú;Jardim Regina;Rua Capitão José Ribeiro, nº 294;17207-061;RE15;João Paulo Marcomini;RA04;Jéssica de Oliveira;Danilo Bazogli;Terceiro;7.90 Jaú;-;;https://jau.sp.senai.br/;-22.2936;-48.5592
7.91;SENAI;CFP;2063;-;7.91 Botucatu - Luiz Massa;Botucatu;Jardim Reflorenda;Avenida Doutor Jaime de Almeida Pinto, nº 1332;18605-318;RE16;Ailton dos Santos;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;7.91 Botucatu;-;;https://botucatu.sp.senai.br/;-22.8837;-48.4437
7.92;SENAI;CFP;2045;-;7.92 Lençóis Paulista;Lençóis Paulista;Jardim das Nações;Rua Aristeu Rodrigues Sampaio, nº 271;18685-730;RE16;Ailton dos Santos;RA04;Jéssica de Oliveira;Danilo Bazogli;Própria;7.92 Lençóis Paulista;-;;https://lencoispaulista.sp.senai.br/;-22.6027;-48.8037
7.94;SENAI; CT;2092;-;7.94 Ourinhos;Ourinhos;Vila São Luiz;Rua Vitório Christoni, nº 1500;19911-200;RE17;Waldemar Ramos;RA05;Daniele Telli;Diego Travassos;Própria;7.94 Ourinhos;-;;https://ourinhos.sp.senai.br/;-22.9797;-49.8697
8.01;SENAI;CFP;2030;-;8.01 São José do Rio Preto - Antonio Devisate;São José do Rio Preto;Vila São José;Rua Antonio de Godoy, nº 5405;15090-250;RE19;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;8.01 São José do Rio Preto;-;;https://saojosedoriopreto.sp.senai.br/;-20.8113;-49.3758
8.50;SENAI;CFP;2077;-;8.50 Votuporanga;Votuporanga;Jardim Santos Dumont;Rua Olga Loti Camargo, nº 3500;15501-280;RE19;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;8.50 Votuporanga;-;;https://votuporanga.sp.senai.br/;-20.4237;-49.9781
8.90;SENAI; CT;2096;-;8.90 Mirassol;Mirassol;Centro;Rua Campos Sales, nº 1998;15130-000;RE19;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Terceiro;8.90 Mirassol;-;;https://mirassol.sp.senai.br/;-20.8169;-49.5206
9.01;SENAI;CFP;2048;-;9.01 Araçatuba - Duque de Caxias;Araçatuba;Aviação;Rua Bartolomeu de Gusmão, nº 150;16055-550;RE20;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;9.01 Araçatuba;-;;https://aracatuba.sp.senai.br/;-21.2076;-50.4401
9.14;SENAI;CFP;2052;-;9.14 Presidente Prudente - Santo Paschoal Crepaldi;Presidente Prudente;Jardim Marupiara;Rua Roberto Mange, nº 151;19060-030;RE21;Waldemar Ramos;RA05;Daniele Telli;Diego Travassos;Própria;9.14 Presidente Prudente;-;;https://presidenteprudente.sp.senai.br/;-22.1207;-51.3925
9.27;SENAI;CFP;2033;-;9.27 Marília - Jose Polizotto;Marília;Centro;Avenida Sampaio Vidal, nº 1079;17500-022;RE17;Waldemar Ramos;RA05;Daniele Telli;Diego Travassos;Própria;9.27 Marília;-;;https://marilia.sp.senai.br/;-22.2171;-49.9501
9.28;SENAI;CFP;2093;-;9.28 Pompéia - Shunji Nishimura;Pompéia;Bairro Distrito Industrial;Avenida Fundação Shunji Nishimura, nº 605;17580-000;RE17;Waldemar Ramos;RA05;Daniele Telli;Diego Travassos;Terceiro;9.28 Pompéia;-;;https://pompeia.sp.senai.br/;-22.107;-50.176
9.90;SENAI;CFP;2073;-;9.90 Birigui - Avak Bedouian;Birigui;Vila Trancoso;Avenida João Cernach, nº 2180;16203-004;RE20;Josimar dos Santos;RA05;Daniele Telli;Diego Travassos;Própria;9.90 Birigui;-;;https://birigui.sp.senai.br/;-21.291;-50.3432`;

export const initialUnits: Unit[] = rawData.split('\n').map((line, index) => {
    const cols = line.split(';');
    return {
        id: index + 1,
        codigoUnidade: cols[0]?.trim() || '',
        entidade: (cols[1]?.trim() as 'SESI' | 'SENAI') || 'SESI',
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

interface UnitsScreenProps {
    units: Unit[];
    setUnits: React.Dispatch<React.SetStateAction<Unit[]>>;
}

const UnitsScreen: React.FC<UnitsScreenProps> = ({ units, setUnits }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<AdvancedFiltersState | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
        message: '',
        type: 'success',
        isVisible: false
    });

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type, isVisible: true });
        setTimeout(() => {
            setToast(prev => ({ ...prev, isVisible: false }));
        }, 3000);
    };

    const filteredUnits = useMemo(() => {
        let result = units;
        
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(u => 
                u.unidade.toLowerCase().includes(lower) || 
                u.cidade.toLowerCase().includes(lower) || 
                u.codigoUnidade.toLowerCase().includes(lower) ||
                u.centro.toLowerCase().includes(lower)
            );
        }

        if (activeFilters) {
            if (activeFilters.entidades && activeFilters.entidades.length > 0) {
                result = result.filter(u => activeFilters.entidades?.includes(u.entidade));
            }
            if (activeFilters.unidades && activeFilters.unidades.length > 0) {
                result = result.filter(u => activeFilters.unidades?.includes(u.unidade));
            }
        }
        
        return result;
    }, [units, searchTerm, activeFilters]);

    const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);
    const paginatedUnits = filteredUnits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleOpenModal = (unit: Unit | null, mode: 'view' | 'edit' | 'create') => {
        setSelectedUnit(unit);
        setModalMode(mode);
        setIsModalOpen(true);
    };

    const handleSaveUnit = (unitData: any) => {
        if (modalMode === 'create') {
            const newUnit = { ...unitData, id: Date.now() };
            setUnits(prev => [newUnit, ...prev]);
            showToast("Unidade cadastrada com sucesso!", "success");
        } else {
            setUnits(prev => prev.map(u => u.id === unitData.id ? unitData : u));
            showToast("Dados atualizados com sucesso!", "success");
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Toast Notification */}
            <div 
              className={`fixed top-6 left-6 text-white py-3 px-5 rounded-lg shadow-xl z-[100] transition-transform duration-500 ease-in-out flex items-center space-x-3 ${toast.isVisible ? 'translate-x-0' : '-translate-x-[150%]'} ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
              role="alert"
            >
                {toast.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <InformationCircleIcon className="w-5 h-5" />}
                <p className="font-semibold">{toast.message}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Unidades</h1>
                <button 
                    onClick={() => handleOpenModal(null, 'create')}
                    className="bg-[#0B1A4E] text-white px-4 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-colors shadow-md"
                >
                    Cadastrar
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="relative flex-grow max-w-lg w-full">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Procurar por unidade, código, cidade ou centro..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={`flex items-center space-x-2 font-semibold py-2 px-4 rounded-md transition-all shadow-sm ${showAdvancedFilters ? 'bg-sky-600 text-white' : 'bg-sky-500 text-white hover:bg-sky-600'}`}
                    >
                        <FilterIcon className="w-5 h-5" />
                        <span>Filtros Avançados</span>
                    </button>
                </div>

                {showAdvancedFilters && (
                    <AdvancedFilters 
                        onFilter={(f) => {
                            setActiveFilters(f);
                            setCurrentPage(1);
                        }} 
                        activeFilters={activeFilters}
                        hideSituacao
                        hideTipologia
                    />
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-white uppercase bg-[#0B1A4E]">
                            <tr>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">Código Unidade</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">Entidade</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">Tipo</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">Centro</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">CAT</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">Unidade</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">Cidade</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">Responsável RE</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">RA</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">Responsável RA</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">Responsável RAR</th>
                                <th className="px-4 py-4 whitespace-nowrap font-bold tracking-wider">Tipo de Unidade</th>
                                <th className="px-4 py-4 text-center sticky right-0 bg-[#0B1A4E] font-bold tracking-wider z-10">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {paginatedUnits.map(unit => (
                                <tr key={unit.id} className="hover:bg-sky-50/30 transition-colors">
                                    <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">{unit.codigoUnidade}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.entidade}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.tipo}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.centro}</td>
                                    <td className="px-4 py-4 whitespace-nowrap truncate max-w-[200px]" title={unit.cat}>{unit.cat}</td>
                                    <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900 truncate max-w-[250px]" title={unit.unidade}>{unit.unidade}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.cidade}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.responsavelRE}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.ra}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.responsavelRA}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.responsavelRAR}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{unit.tipoDeUnidade}</td>
                                    <td className="px-4 py-4 text-center sticky right-0 bg-white/95 border-l shadow-[-4px_0_10px_rgba(0,0,0,0.05)] z-10">
                                        <div className="flex justify-center space-x-2">
                                            <button 
                                                onClick={() => handleOpenModal(unit, 'view')}
                                                className="p-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors shadow-sm focus:ring-2 focus:ring-sky-200"
                                                title="Visualizar Detalhes"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleOpenModal(unit, 'edit')}
                                                className="p-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors shadow-sm focus:ring-2 focus:ring-purple-200"
                                                title="Editar Registro"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUnits.length === 0 && (
                                <tr>
                                    <td colSpan={13} className="px-4 py-16 text-center text-gray-500 italic">
                                        <div className="flex flex-col items-center">
                                            <SparklesIcon className="w-12 h-12 text-gray-200 mb-2" />
                                            <span>Nenhuma unidade encontrada para os filtros aplicados.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
                    <div className="flex items-center space-x-4">
                         <div className="flex items-center space-x-2">
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="p-2 text-gray-400 hover:text-sky-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                            >
                                <ChevronLeftIcon className="w-6 h-6" />
                            </button>
                            <span className="min-w-[40px] h-10 flex items-center justify-center bg-sky-500 text-white font-bold rounded-md shadow-sm text-sm">
                                {currentPage}
                            </span>
                            <button 
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="p-2 text-gray-400 hover:text-sky-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                            >
                                <ChevronRightIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <span className="text-sm text-gray-600 font-medium">
                            Página {currentPage} de {totalPages || 1} ({filteredUnits.length} registros)
                        </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Itens por página:</label>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white"
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>
            </div>

            <UnitDetailsModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                unit={selectedUnit}
                mode={modalMode}
                onSave={handleSaveUnit}
            />
        </div>
    );
};

export default UnitsScreen;
