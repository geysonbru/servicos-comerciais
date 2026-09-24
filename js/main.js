/*========================================================
Projeto: Acompanhamento de Serviços
Arquivo: main.js

Responsável por:
- Inicialização
- Carregamento do JSON
- Atualização automática
- Aplicação dos filtros
- Atualização de tabela e KPIs
========================================================*/


/*----------------------------------------------------------------
                         VARIÁVEIS GLOBAIS
----------------------------------------------------------------*/

let dadosDashboard = null;

let linhasDocumentos = [];

let atualizando = false;


/*----------------------------------------------------------------
                         INICIALIZAÇÃO
----------------------------------------------------------------*/

/*
    IMPORTANTE:

    Os controles do menu de filtros são inicializados
    ANTES de tentar carregar os dados.

    Dessa forma, mesmo que o JSON ainda não exista,
    o botão "Filtros" continua funcionando e podemos
    testar o menu lateral normalmente.
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* ---------------------------------------------
           Inicializa a interface dos filtros.

           Ainda não temos dados, então passamos uma
           lista vazia.

           Isso é suficiente para configurar os eventos
           de abertura/fechamento do menu.
        --------------------------------------------- */

        inicializarFiltros([]);


        /* ---------------------------------------------
           Agora inicia o carregamento dos dados.
        --------------------------------------------- */

        iniciarDashboard();

    }
);


/*----------------------------------------------------------------
                         DASHBOARD
----------------------------------------------------------------*/

async function iniciarDashboard() {

    iniciarRelogio();

    try {

        dadosDashboard =
            await carregarDados();


        /* -----------------------------------------------------
           Cabeçalho
        ----------------------------------------------------- */

        atualizarCabecalho(
            dadosDashboard
        );


        /* -----------------------------------------------------
           Extrai as linhas da tabela
        ----------------------------------------------------- */

        linhasDocumentos =
            extrairLinhas(
                dadosDashboard
            );


        /* -----------------------------------------------------
           Normalização
        ----------------------------------------------------- */

        linhasDocumentos =
            linhasDocumentos.map(
                normalizarLinha
            );


        /* -----------------------------------------------------
           Filtros

           Aqui os eventos NÃO serão registrados novamente.

           A função apenas reconstruirá as listas
           dinâmicas com os dados recebidos.
        ----------------------------------------------------- */

        inicializarFiltros(
            linhasDocumentos
        );


        /* -----------------------------------------------------
           Primeira atualização
        ----------------------------------------------------- */

        atualizarDashboard();


        /* -----------------------------------------------------
           Atualização automática

           Mantém a mesma ideia do Tempo Real Web:
           60 segundos.
        ----------------------------------------------------- */

        setInterval(
            buscarNovosDados,
            60000
        );

    }

    catch (erro) {

        console.error(
            "Erro na inicialização do Dashboard:",
            erro
        );

    }

}


/*----------------------------------------------------------------
                     EXTRAÇÃO DOS DADOS
----------------------------------------------------------------*/

/*
    O nome final da coleção ainda depende do Python.

    Por isso esta função aceita inicialmente:

        tabela
        documentos
        V_DOCUMENTO
        dados
*/

function extrairLinhas(dados) {

    const possibilidades = [

        dados?.tabela,

        dados?.documentos,

        dados?.V_DOCUMENTO,

        dados?.dados

    ];


    for (
        const valor
        of possibilidades
    ) {

        if (
            Array.isArray(valor)
        ) {

            return valor;

        }

    }


    console.warn(
        "Nenhuma tabela de documentos encontrada no JSON."
    );


    return [];

}


/*----------------------------------------------------------------
                  BUSCA NOVOS DADOS
----------------------------------------------------------------*/

async function buscarNovosDados() {

    if (atualizando) {
        return;
    }

    atualizando = true;


    try {

        const novosDados =
            await carregarDados();


        dadosDashboard =
            novosDados;


        atualizarCabecalho(
            dadosDashboard
        );


        linhasDocumentos =
            extrairLinhas(
                novosDados
            )
            .map(
                normalizarLinha
            );


        /*
           Recria apenas as opções dos filtros dinâmicos.
           Os eventos já foram configurados na inicialização.
        */

        atualizarOpcoesFiltrosDinamicos(
            linhasDocumentos
        );


        atualizarDashboard();

    }

    catch (erro) {

        console.error(
            "Erro ao buscar novos dados:",
            erro
        );

    }

    finally {

        atualizando = false;

    }

}


/*----------------------------------------------------------------
             ATUALIZAÇÃO DA INTERFACE
----------------------------------------------------------------*/

function atualizarDashboard() {

    if (!dadosDashboard) {
        return;
    }


    const linhasFiltradas =
        filtrarLinhas(
            linhasDocumentos
        );


    atualizarTabela(
        linhasFiltradas
    );


    atualizarKPIs(
        linhasFiltradas
    );


    atualizarTituloTabela(
        linhasFiltradas.length
    );

}


/*----------------------------------------------------------------
      Atualiza somente listas dinâmicas
----------------------------------------------------------------*/

function atualizarOpcoesFiltrosDinamicos(
    linhas
) {

    /*
       Nesta primeira versão simplesmente reconstruímos
       as listas.

       Depois podemos preservar seleções existentes
       com mais granularidade.
    */

    construirRegionais(
        linhas
    );


    construirCentrosTrabalho(
        linhas
    );


    atualizarIndicadorFiltros();

}