/*========================================================
Projeto: Acompanhamento de Serviços
Arquivo: main.js

Responsável por:
- Inicialização da aplicação
- Carregamento e polling do JSON
- Aplicação dos filtros dinâmicos
- Atualização da tabela e dos KPIs
========================================================*/


/* =======================================================
   1. VARIÁVEIS GLOBAIS
======================================================= */
let dadosDashboard = null;
let linhasDocumentos = [];
let atualizando = false;


/* =======================================================
   2. INICIALIZAÇÃO DA APLICAÇÃO
======================================================= */

/*
    IMPORTANTE:
    Os controles do menu de filtros são inicializados ANTES
    de tentar carregar os dados. Dessa forma, mesmo que o JSON
    ainda não exista, o botão "Filtros" funciona normalmente.
*/
document.addEventListener("DOMContentLoaded", () => {
    // Configura eventos do menu de filtros com lista vazia inicial
    inicializarFiltros([]);

    // Inicia o fluxo de carregamento dos dados
    iniciarDashboard();
});


/* =======================================================
   3. FLUXO PRINCIPAL DO DASHBOARD
======================================================= */

/**
 * Orquestra o carregamento inicial dos dados e inicializa os componentes da tela.
 */
async function iniciarDashboard() {
    iniciarRelogio();

    try {
        dadosDashboard = await carregarDados();

        // 1. Atualiza elementos do cabeçalho
        atualizarCabecalho(dadosDashboard);

        // 2. Extrai e normaliza os registros da tabela
        linhasDocumentos = extrairLinhas(dadosDashboard).map(normalizarLinha);

        // 3. Reconstrói as listas dos filtros dinâmicos com os dados recebidos
        inicializarFiltros(linhasDocumentos);

        // 4. Executa a primeira renderização dos dados na tela
        atualizarDashboard();

        // 5. Configura a atualização automática (polling) a cada 60 segundos
        setInterval(buscarNovosDados, 60000);

    } catch (erro) {
        console.error("Erro na inicialização do Dashboard:", erro);
    }
}


/* =======================================================
   4. EXTRAÇÃO E TRATAMENTO DE DADOS
======================================================= */

/**
 * Extrai a lista de registros do objeto JSON recebido,
 * testando as possíveis chaves retornadas pela API/Python.
 */
function extrairLinhas(dados) {
    const possibilidades = [
        dados?.Tabela,
        dados?.tabela,
        dados?.documentos,
        dados?.V_DOCUMENTO,
        dados?.dados
    ];

    for (const valor of possibilidades) {
        if (Array.isArray(valor)) {
            return valor;
        }
    }

    console.warn("Nenhuma tabela de documentos encontrada no JSON.");
    return [];
}


/* =======================================================
   5. ATUALIZAÇÃO AUTOMÁTICA (POLLING)
======================================================= */

/**
 * Busca novos dados no servidor sem recarregar a página e atualiza a interface.
 */
async function buscarNovosDados() {
    if (atualizando) return;
    atualizando = true;

    try {
        const novosDados = await carregarDados();
        dadosDashboard = novosDados;

        atualizarCabecalho(dadosDashboard);

        linhasDocumentos = extrairLinhas(novosDados).map(normalizarLinha);

        // Recria apenas as opções dos filtros dinâmicos (os eventos já foram registrados)
        atualizarOpcoesFiltrosDinamicos(linhasDocumentos);

        atualizarDashboard();

    } catch (erro) {
        console.error("Erro ao buscar novos dados:", erro);
    } finally {
        atualizando = false;
    }
}


/* =======================================================
   6. ATUALIZAÇÃO DA INTERFACE (DOM)
======================================================= */

/**
 * Aplica os filtros ativos e atualiza Tabela, KPIs e Títulos.
 */
function atualizarDashboard() {
    if (!dadosDashboard) return;

    const linhasFiltradas = filtrarLinhas(linhasDocumentos);

    atualizarTabela(linhasFiltradas);
    atualizarKPIs(linhasFiltradas, linhasDocumentos.length);
}

/**
 * Reconstrói apenas as opções dinâmicas dos filtros (Regionais e Centros de Trabalho).
 */
function atualizarOpcoesFiltrosDinamicos(linhas) {
    construirRegionais(linhas);
    construirCentrosTrabalho(linhas);
    atualizarIndicadorFiltros();
}