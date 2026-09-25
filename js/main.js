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
    ainda não exista ou ocorra erro de carregamento, o botão "Filtros"
    continua funcionando normalmente.
*/
document.addEventListener("DOMContentLoaded", () => {
    // Configura eventos do menu de filtros com lista vazia inicial
    inicializarFiltros([]);

    // Inicia o fluxo principal do dashboard
    iniciarDashboard();
});


/* =======================================================
   3. FLUXO PRINCIPAL DO DASHBOARD
======================================================= */

/**
 * Orquestra o carregamento inicial, inicialização do relógio,
 * normalização de dados e configuração do polling automático.
 */
async function iniciarDashboard() {
    // Exibe imediatamente o horário de carregamento da página
    atualizarDataAtualizacaoPagina();

    // Inicia o relógio em tempo real (1 em 1 segundo)
    iniciarRelogio();

    try {
        dadosDashboard = await carregarDados();

        // 1. Atualiza elementos do cabeçalho
        atualizarCabecalho(dadosDashboard);

        // 2. Extrai e normaliza os registros da tabela
        linhasDocumentos = extrairLinhas(dadosDashboard).map(normalizarLinha);

        // 3. Reconstrói as listas dos filtros dinâmicos com os dados recebidos
        inicializarFiltros(linhasDocumentos);

        // 4. Executa a primeira renderização na tela
        atualizarDashboard();

        // 5. Configura a atualização automática (polling) a cada 5 minutos
        const intervalo = 1000 * 60 * 5;
        setInterval(buscarNovosDados, intervalo);

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
    // Impede execuções concorrentes
    if (atualizando) return;
    atualizando = true;

    try {
        const novosDados = await carregarDados();
        dadosDashboard = novosDados;

        // Registra o horário do novo carregamento e atualiza cabeçalho
        atualizarDataAtualizacaoPagina();
        atualizarCabecalho(dadosDashboard);

        // Extrai e normaliza os novos registros
        linhasDocumentos = extrairLinhas(novosDados).map(normalizarLinha);

        // Atualiza filtros dinâmicos e a interface
        atualizarOpcoesFiltrosDinamicos(linhasDocumentos);
        atualizarDashboard();

    } catch (erro) {
        console.error("Erro ao buscar novos dados:", erro);
    } finally {
        // Libera a trava de atualização
        atualizando = false;
    }
}


/* =======================================================
   6. ATUALIZAÇÃO DA INTERFACE (DOM)
======================================================= */

/**
 * Aplica os filtros ativos e atualiza a Tabela e os KPIs.
 */
function atualizarDashboard() {
    if (!dadosDashboard) return;

    const linhasFiltradas = filtrarLinhas(linhasDocumentos);

    atualizarTabela(linhasFiltradas);
    atualizarKPIs(linhasFiltradas, linhasDocumentos.length);
}


/* =======================================================
   7. ATUALIZAÇÃO DOS FILTROS DINÂMICOS
======================================================= */

/**
 * Reconstrói apenas as opções dinâmicas dos filtros (Regionais e Centros de Trabalho).
 */
function atualizarOpcoesFiltrosDinamicos(linhas) {
    construirRegionais(linhas);
    construirCentrosTrabalho(linhas);
    atualizarIndicadorFiltros();
}