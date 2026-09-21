/*========================================================
Projeto : Lista UC SIMO x ANEEL
Arquivo : main.js

Responsável por:
    - controlar a pesquisa
    - consultar índices
    - localizar arquivos de dados
    - carregar registros
    - preencher a tabela
========================================================*/


/*========================================================
CONFIGURAÇÕES
========================================================*/

/*
 * Os dados estão no diretório "dados/" do repositório.
 *
 * Se o index.html estiver dentro da pasta "site/" publicada
 * como uma subpasta, provavelmente será necessário usar:
 *
 *     "../dados"
 *
 * Caso o index.html esteja na raiz do repositório:
 *
 *     "dados"
 *
 * Por enquanto deixamos "dados".
 */
const DATA_BASE_URL = "dados";


/*
 * Quantidade de caracteres utilizada pelo Atualizador para
 * separar os índices.
 *
 * Exemplo:
 *
 *     123456 -> índice 12
 *     987654 -> índice 98
 */
const PREFIXO_INDICE = 2;


/*
 * Limite de resultados exibidos.
 *
 * Mantemos inicialmente um valor alto, pois a pesquisa é
 * exata e normalmente deverá retornar poucos registros.
 */
const LIMITE_RESULTADOS = 1000;


/*========================================================
ESTADO DA PÁGINA
========================================================*/

/*
 * Guarda os resultados atualmente exibidos.
 */
let resultadosAtuais = [];


/*
 * Cache dos índices já carregados.
 *
 * Isso evita baixar novamente o mesmo índice se o usuário
 * realizar várias pesquisas com o mesmo prefixo.
 *
 * Exemplo:
 *
 *     "simo_12" -> índice carregado
 *     "aneel_00" -> índice carregado
 */
const cacheIndices = new Map();


/*
 * Cache dos arquivos de dados já carregados.
 *
 * Se o usuário pesquisar duas UCs que estejam no mesmo
 * arquivo, o arquivo não será baixado duas vezes.
 */
const cacheDados = new Map();


/*========================================================
INICIALIZAÇÃO
========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    iniciarAplicacao
);


/*
 * Inicializa os componentes da página.
 */
function iniciarAplicacao() {

    console.log(
        "Lista UC SIMO x ANEEL iniciada."
    );


    /*
     * Inicia o relógio do cabeçalho.
     */
    iniciarRelogio();


    /*
     * Configura o botão de pesquisa.
     */
    const botaoPesquisar =
        document.getElementById(
            "btnPesquisar"
        );


    if (botaoPesquisar) {

        botaoPesquisar.addEventListener(
            "click",
            executarPesquisa
        );

    }


    /*
     * Permite pesquisar pressionando ENTER dentro
     * de qualquer um dos campos.
     */
    const inputSimo =
        document.getElementById(
            "inputUcSimo"
        );


    const inputAneel =
        document.getElementById(
            "inputUcAneel"
        );


    if (inputSimo) {

        inputSimo.addEventListener(
            "keydown",
            tratarTeclaEnter
        );

    }


    if (inputAneel) {

        inputAneel.addEventListener(
            "keydown",
            tratarTeclaEnter
        );

    }


    /*
     * Limpa tabela inicial.
     */
    limparResultados();


    /*
     * Futuramente carregaremos aqui o arquivo de metadados
     * para preencher "Último Dado".
     *
     * Por enquanto deixamos o cabeçalho como "--".
     */
}


/*========================================================
ENTER NOS CAMPOS
========================================================*/

function tratarTeclaEnter(evento) {

    if (evento.key === "Enter") {

        evento.preventDefault();

        executarPesquisa();
    }
}


/*========================================================
EXECUTA PESQUISA
========================================================*/

async function executarPesquisa() {

    const inputSimo =
        document.getElementById(
            "inputUcSimo"
        );


    const inputAneel =
        document.getElementById(
            "inputUcAneel"
        );


    const codigoSimo =
        inputSimo
            ?.value
            .trim();


    const codigoAneel =
        inputAneel
            ?.value
            .trim();


    /*
     * ------------------------------------------------------
     * Nenhum campo preenchido
     * ------------------------------------------------------
     */

    if (!codigoSimo && !codigoAneel) {

        mostrarMensagem(
            "Informe um código UC-SIMO ou UC-ANEEL.",
            "aviso"
        );

        limparResultados();

        return;
    }


    /*
     * ------------------------------------------------------
     * Os dois campos preenchidos
     * ------------------------------------------------------
     *
     * Para manter a regra simples nesta primeira versão,
     * damos preferência ao UC-SIMO.
     *
     * Posteriormente podemos decidir se queremos:
     *
     *     - bloquear os dois campos;
     *     - pesquisar pelos dois;
     *     - ou informar ao usuário qual será utilizado.
     * ------------------------------------------------------
     */

    let tipo;
    let codigo;


    if (codigoSimo) {

        tipo = "simo";
        codigo = codigoSimo;

    } else {

        tipo = "aneel";
        codigo = codigoAneel;

    }


    /*
     * ------------------------------------------------------
     * Validação básica
     * ------------------------------------------------------
     */

    if (!/^\d+$/.test(codigo)) {

        mostrarMensagem(
            "Digite somente números no código informado.",
            "erro"
        );

        limparResultados();

        return;
    }


    /*
     * ------------------------------------------------------
     * Inicia estado visual
     * ------------------------------------------------------
     */

    mostrarMensagem(
        "Pesquisando...",
        "carregando"
    );


    const botaoPesquisar =
        document.getElementById(
            "btnPesquisar"
        );


    if (botaoPesquisar) {

        botaoPesquisar.disabled = true;

    }


    limparResultados();


    try {

        /*
         * Executa a busca.
         */
        const resultados =
            await pesquisarCodigo(
                tipo,
                codigo
            );


        resultadosAtuais =
            resultados;


        /*
         * Exibe os resultados.
         */

        preencherTabela(
            resultados
        );


        /*
         * Mensagem final.
         */

        if (resultados.length === 0) {

            mostrarMensagem(
                `Nenhum registro encontrado para ${tipo.toUpperCase()} ${codigo}.`,
                "aviso"
            );

        } else {

            mostrarMensagem(
                `${formatarNumero(resultados.length)} registro(s) encontrado(s).`,
                "sucesso"
            );

        }

    } catch (erro) {

        console.error(
            "Erro na pesquisa:",
            erro
        );


        mostrarMensagem(
            "Não foi possível realizar a pesquisa. Verifique sua conexão e tente novamente.",
            "erro"
        );

    } finally {

        if (botaoPesquisar) {

            botaoPesquisar.disabled = false;

        }

    }
}


/*========================================================
PESQUISA PELO CÓDIGO
========================================================*/

async function pesquisarCodigo(
    tipo,
    codigo
) {

    /*
     * ------------------------------------------------------
     * Descobre o prefixo
     * ------------------------------------------------------
     */

    const prefixo =
        obterPrefixo(
            codigo
        );


    /*
     * ------------------------------------------------------
     * Define nome do índice
     * ------------------------------------------------------
     */

    const nomeIndice =
        `${tipo}_${prefixo}.json.gz`;


    /*
     * ------------------------------------------------------
     * Carrega índice
     * ------------------------------------------------------
     */

    const indice =
        await carregarIndice(
            nomeIndice
        );


    /*
     * ------------------------------------------------------
     * Procura o código exato
     * ------------------------------------------------------
     *
     * O índice terá linhas como:
     *
     *     {"codigo":"1234","arquivo":"dados_0001.json.gz"}
     *
     * ou, caso a mesma UC esteja em mais de uma parte:
     *
     *     {"codigo":"1234","arquivo":"dados_0001.json.gz"}
     *     {"codigo":"1234","arquivo":"dados_0007.json.gz"}
     *
     * ------------------------------------------------------
     */

    const arquivosEncontrados =
        obterArquivosDoIndice(
            indice,
            codigo
        );


    /*
     * Nenhuma ocorrência no índice.
     */

    if (arquivosEncontrados.length === 0) {

        return [];

    }


    /*
     * ------------------------------------------------------
     * Remove possíveis duplicações
     * ------------------------------------------------------
     */

    const arquivosUnicos =
        [
            ...new Set(
                arquivosEncontrados
            )
        ];


    /*
     * ------------------------------------------------------
     * Carrega as partes necessárias
     * ------------------------------------------------------
     */

    const todosResultados = [];


    for (const arquivo of arquivosUnicos) {

        const registros =
            await carregarDados(
                arquivo
            );


        /*
         * --------------------------------------------------
         * Faz a conferência final.
         *
         * O índice indica o arquivo candidato, mas fazemos
         * a comparação exata novamente nos dados.
         * --------------------------------------------------
         */

        for (const registro of registros) {

            const valor =
                normalizarCodigo(
                    tipo === "simo"
                        ? registro["UC-SIMO"]
                        : registro["UC-ANEEL"]
                );


            if (valor === codigo) {

                todosResultados.push(
                    registro
                );


                /*
                 * Evita que uma pesquisa acidentalmente
                 * produza uma quantidade excessiva de
                 * resultados.
                 */

                if (
                    todosResultados.length
                    >= LIMITE_RESULTADOS
                ) {

                    return todosResultados;

                }

            }

        }

    }


    return todosResultados;
}


/*========================================================
OBTÉM PREFIXO
========================================================*/

function obterPrefixo(
    codigo
) {

    /*
     * Precisamos de dois caracteres para reproduzir
     * exatamente a lógica do Python.
     */

    let prefixo =
        codigo.substring(
            0,
            PREFIXO_INDICE
        );


    /*
     * Código com menos de dois caracteres.
     */

    if (
        prefixo.length
        < PREFIXO_INDICE
    ) {

        prefixo =
            prefixo.padStart(
                PREFIXO_INDICE,
                "0"
            );

    }


    /*
     * Como estamos tratando códigos numéricos,
     * o prefixo esperado será normalmente 00-99.
     */

    if (
        !/^\d{2}$/.test(prefixo)
    ) {

        return "__";

    }


    return prefixo;
}


/*========================================================
CARREGA ÍNDICE
========================================================*/

async function carregarIndice(
    nomeArquivo
) {

    /*
     * ------------------------------------------------------
     * Verifica cache
     * ------------------------------------------------------
     */

    if (
        cacheIndices.has(
            nomeArquivo
        )
    ) {

        return cacheIndices.get(
            nomeArquivo
        );

    }


    /*
     * ------------------------------------------------------
     * Monta URL
     * ------------------------------------------------------
     */

    const url =
        `${DATA_BASE_URL}/indices/${nomeArquivo}`;


    /*
     * ------------------------------------------------------
     * Download
     * ------------------------------------------------------
     */

    const resposta =
        await fetch(
            url,
            {
                cache: "no-cache"
            }
        );


    if (!resposta.ok) {

        /*
         * 404 significa que aquele prefixo não existe.
         * Isso não é necessariamente um erro.
         */

        if (
            resposta.status === 404
        ) {

            cacheIndices.set(
                nomeArquivo,
                []
            );

            return [];

        }


        throw new Error(
            `Erro ao carregar índice ${nomeArquivo}: HTTP ${resposta.status}`
        );

    }


    /*
     * ------------------------------------------------------
     * Descompacta GZIP
     * ------------------------------------------------------
     */

    const texto =
        await descompactarGzip(
            resposta
        );


    /*
     * ------------------------------------------------------
     * Converte JSON Lines
     * ------------------------------------------------------
     */

    const indice =
        [];


    const linhas =
        texto.split(
            "\n"
        );


    for (const linha of linhas) {

        const linhaLimpa =
            linha.trim();


        if (!linhaLimpa) {

            continue;

        }


        try {

            indice.push(
                JSON.parse(
                    linhaLimpa
                )
            );

        } catch (erro) {

            console.error(
                "Linha inválida no índice:",
                linhaLimpa,
                erro
            );

        }

    }


    /*
     * ------------------------------------------------------
     * Salva cache
     * ------------------------------------------------------
     */

    cacheIndices.set(
        nomeArquivo,
        indice
    );


    return indice;
}


/*========================================================
OBTÉM ARQUIVOS DO ÍNDICE
========================================================*/

function obterArquivosDoIndice(
    indice,
    codigo
) {

    const arquivos = [];


    for (
        const item
        of indice
    ) {

        if (!item) {

            continue;

        }


        const codigoIndice =
            normalizarCodigo(
                item.codigo
            );


        if (
            codigoIndice === codigo
            &&
            item.arquivo
        ) {

            arquivos.push(
                item.arquivo
            );

        }

    }


    return arquivos;
}


/*========================================================
CARREGA ARQUIVO DE DADOS
========================================================*/

async function carregarDados(
    nomeArquivo
) {

    /*
     * ------------------------------------------------------
     * Cache
     * ------------------------------------------------------
     */

    if (
        cacheDados.has(
            nomeArquivo
        )
    ) {

        return cacheDados.get(
            nomeArquivo
        );

    }


    /*
     * ------------------------------------------------------
     * URL
     * ------------------------------------------------------
     */

    const url =
        `${DATA_BASE_URL}/partes/${nomeArquivo}`;


    /*
     * ------------------------------------------------------
     * Download
     * ------------------------------------------------------
 */

    const resposta =
        await fetch(
            url,
            {
                cache: "no-cache"
            }
        );


    if (!resposta.ok) {

        throw new Error(
            `Erro ao carregar ${nomeArquivo}: HTTP ${resposta.status}`
        );

    }


    /*
     * ------------------------------------------------------
     * Descompacta
     * ------------------------------------------------------
     */

    const texto =
        await descompactarGzip(
            resposta
        );


    /*
     * ------------------------------------------------------
     * Converte JSON
     * ------------------------------------------------------
     *
     * Os arquivos de dados foram gerados com:
     *
     *     orient="records"
     *
     * portanto teremos:
     *
     *     [
     *         {...},
     *         {...}
     *     ]
     * ------------------------------------------------------
     */

    let dados;


    try {

        dados =
            JSON.parse(
                texto
            );

    } catch (erro) {

        throw new Error(
            `Arquivo ${nomeArquivo} não contém JSON válido.`
        );

    }


    /*
     * ------------------------------------------------------
     * Cache
     * ------------------------------------------------------
     */

    cacheDados.set(
        nomeArquivo,
        dados
    );


    return dados;
}


/*========================================================
DESCOMPACTA GZIP
========================================================*/

async function descompactarGzip(
    resposta
) {

    /*
     * Verifica se o navegador possui DecompressionStream.
     */

    if (
        typeof DecompressionStream
        === "undefined"
    ) {

        throw new Error(
            "Este navegador não oferece suporte à descompactação GZIP."
        );

    }


    /*
     * Conecta o corpo da resposta ao descompressor.
     */

    const stream =
        resposta.body.pipeThrough(
            new DecompressionStream(
                "gzip"
            )
        );


    /*
     * Lê o conteúdo descompactado como texto UTF-8.
     */

    return await new Response(
        stream
    ).text();
}


/*========================================================
NORMALIZA CÓDIGO
========================================================*/

function normalizarCodigo(
    valor
) {

    if (
        valor === null
        ||
        valor === undefined
    ) {

        return null;

    }


    /*
     * Remove eventual representação "1234.0".
     */

    if (
        typeof valor === "number"
    ) {

        if (
            Number.isInteger(
                valor
            )
        ) {

            return String(
                valor
            );

        }

    }


    let codigo =
        String(
            valor
        ).trim();


    if (
        codigo.endsWith(
            ".0"
        )
    ) {

        const parteNumerica =
            codigo.substring(
                0,
                codigo.length - 2
            );


        if (
            /^\d+$/.test(
                parteNumerica
            )
        ) {

            codigo =
                parteNumerica;

        }

    }


    return codigo;
}


/*========================================================
PREENCHE TABELA
========================================================*/

function preencherTabela(
    resultados
) {

    const tbody =
        document.getElementById(
            "tbodyResultado"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = "";


    /*
     * ------------------------------------------------------
     * Nenhum resultado
     * ------------------------------------------------------
     */

    if (
        !resultados
        ||
        resultados.length === 0
    ) {

        return;

    }


    /*
     * ------------------------------------------------------
     * Cria linhas
     * ------------------------------------------------------
     */

    const fragmento =
        document.createDocumentFragment();


    for (
        const registro
        of resultados
    ) {

        const linha =
            document.createElement(
                "tr"
            );


        adicionarCelula(
            linha,
            registro["UC-SIMO"]
        );


        adicionarCelula(
            linha,
            registro["UC-ANEEL"]
        );


        adicionarCelula(
            linha,
            registro["Município"]
        );


        adicionarCelula(
            linha,
            registro["Bairro"]
        );


        adicionarCelula(
            linha,
            registro["Conjunto"]
        );


        adicionarCelula(
            linha,
            registro["SE"]
        );


        adicionarCelula(
            linha,
            registro["Alimentador"]
        );


        fragmento.appendChild(
            linha
        );

    }


    tbody.appendChild(
        fragmento
    );


    /*
     * Atualiza contador.
     */

    atualizarContadorResultados(
        resultados.length
    );
}


/*========================================================
ADICIONA CÉLULA
========================================================*/

function adicionarCelula(
    linha,
    valor
) {

    const celula =
        document.createElement(
            "td"
        );


    if (
        valor === null
        ||
        valor === undefined
    ) {

        celula.textContent =
            "-";

    } else {

        celula.textContent =
            String(valor);

    }


    linha.appendChild(
        celula
    );
}


/*========================================================
LIMPA RESULTADOS
========================================================*/

function limparResultados() {

    const tbody =
        document.getElementById(
            "tbodyResultado"
        );


    if (tbody) {

        tbody.innerHTML = "";

    }


    atualizarContadorResultados(
        0
    );
}


/*========================================================
ATUALIZA CONTADOR
========================================================*/

function atualizarContadorResultados(
    quantidade
) {

    const contador =
        document.getElementById(
            "contadorResultados"
        );


    if (!contador) {

        return;

    }


    if (
        !quantidade
        ||
        quantidade <= 0
    ) {

        contador.textContent =
            "";

        return;

    }


    contador.textContent =
        `(${formatarNumero(quantidade)} encontrado(s))`;
}


/*========================================================
MENSAGENS
========================================================*/

function mostrarMensagem(
    mensagem,
    tipo = "normal"
) {

    const elemento =
        document.getElementById(
            "mensagemPesquisa"
        );


    if (!elemento) {

        return;

    }


    elemento.textContent =
        mensagem;


    elemento.dataset.tipo =
        tipo;
}


/*========================================================
FORMATA NÚMERO
========================================================*/

function formatarNumero(
    valor
) {

    if (
        valor === null
        ||
        valor === undefined
    ) {

        return "-";

    }


    return Number(
        valor
    ).toLocaleString(
        "pt-BR"
    );
}