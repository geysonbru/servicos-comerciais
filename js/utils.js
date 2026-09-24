/*========================================================
utils.js

Funções reutilizáveis.
========================================================*/


/*========================================================
Número inteiro
========================================================*/

function formatarNumero(valor) {

    if (valor == null || valor === "") {
        return "-";
    }

    return Number(valor)
        .toLocaleString("pt-BR");

}


/*========================================================
Número decimal
========================================================*/

function formatarDecimal(valor, casas = 2) {

    if (valor == null || valor === "") {
        return "-";
    }

    return Number(valor)
        .toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: casas,
                maximumFractionDigits: casas
            }
        );

}


/*========================================================
Moeda
========================================================*/

function formatarMoeda(valor) {

    if (valor == null || valor === "") {
        return "-";
    }

    return Number(valor)
        .toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


/*========================================================
Data
========================================================*/

function converterData(valor) {

    if (!valor) {
        return null;
    }

    if (valor instanceof Date) {
        return valor;
    }

    let texto =
        String(valor);

    // Oracle/Python pode entregar:
    // 2026-09-21 14:30:00
    //
    // O JavaScript aceita melhor:
    // 2026-09-21T14:30:00

    texto =
        texto.replace(" ", "T");

    const data =
        new Date(texto);

    if (Number.isNaN(data.getTime())) {
        return null;
    }

    return data;

}


/*========================================================
Data + hora
========================================================*/

function formatarDataHora(valor) {

    const data =
        converterData(valor);

    if (!data) {
        return "-";
    }

    return data
        .toLocaleString("pt-BR")
        .replace(",", "");

}


/*========================================================
Data somente
========================================================*/

function formatarData(valor) {

    const data =
        converterData(valor);

    if (!data) {
        return "-";
    }

    return data
        .toLocaleDateString("pt-BR");

}


/*========================================================
Hora
========================================================*/

function formatarHora(data) {

    const valor =
        converterData(data);

    if (!valor) {
        return "-";
    }

    return valor.toLocaleTimeString(
        "pt-BR",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );

}


/*========================================================
Escapa HTML

Evita que texto vindo do JSON seja interpretado como HTML.
========================================================*/

function escaparHtml(valor) {

    if (valor == null) {
        return "";
    }

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/*========================================================
Obtém primeiro campo disponível

Permite que o frontend suporte temporariamente diferentes
nomes até fecharmos definitivamente os aliases do SQL.
========================================================*/

function obterCampo(
    linha,
    nomes,
    padrao = null
) {

    for (const nome of nomes) {

        if (
            linha &&
            linha[nome] !== undefined &&
            linha[nome] !== null &&
            linha[nome] !== ""
        ) {

            return linha[nome];

        }

    }

    return padrao;

}



/*========================================================
Normaliza uma linha

Converte os nomes utilizados pelo JSON publicado pelo Python
para os nomes internos utilizados pelo JavaScript.

O Python atualmente publica a tabela usando os nomes:

    Nr. Doc. SIMO
    Nr. Doc. SAP
    UC
    Agência
    Serviço
    Centro Trabalho
    Tipo Centro de Trabalho
    Data Abertura
    Data Limite Exec.
    Data Conclusão
    Tempo Excedido
    Compensação Hoje
    Compensação Amanhã

Também mantemos alguns nomes técnicos como compatibilidade.
========================================================*/

function normalizarLinha(linha) {

    /*--------------------------------------------------------
    Data de saída / conclusão

    Neste momento o JSON publicado não contém DT_SAIDA.
    Para o frontend, a Data Conclusão representa a conclusão
    do serviço.
    --------------------------------------------------------*/

    const dtSaida =
        obterCampo(
            linha,
            [
                "DT_SAIDA",
                "Data Saída",
                "DT_CONCLUSAO",
                "Data Conclusão"
            ]
        );


    /*--------------------------------------------------------
    Status

    Mantemos a possibilidade de utilizar um status explícito
    no futuro.

    Quando ele não existir, inferimos pelo preenchimento da
    Data de Conclusão.
    --------------------------------------------------------*/

    const statusBruto =
        obterCampo(
            linha,
            [
                "Status_atendimento",
                "STATUS_ATENDIMENTO",
                "Status"
            ]
        );


    let status =
        statusBruto;


    if (!status) {

        status =
            dtSaida
                ? "Concluido"
                : "Não concluido";

    }


    /*--------------------------------------------------------
    Retorna a estrutura normalizada.
    --------------------------------------------------------*/

    return {

        /*----------------------------------------------------
        Mantemos a linha original para eventuais usos futuros.
        ----------------------------------------------------*/
        original:
            linha,


        /*----------------------------------------------------
        Nr. Doc. SIMO
        ----------------------------------------------------*/
        nrDocumentoSimo:
            obterCampo(
                linha,
                [
                    "Nr. Doc. SIMO",
                    "NR_DOCUMENTO_SIMO",
                    "NR_DOCUMENTO_SIM0",
                    "NR_DOCUMENTO"
                ]
            ),


        /*----------------------------------------------------
        Nr. Doc. SAP
        ----------------------------------------------------*/
        nrDocumentoSap:
            obterCampo(
                linha,
                [
                    "Nr. Doc. SAP",
                    "NR_PROTOCOLO_CLIENTE",
                    "NR_DOCUMENTO_SAP",
                    "NR_OS_SAP"
                ]
            ),


        /*----------------------------------------------------
        Unidade Consumidora
        ----------------------------------------------------*/
        uc:
            obterCampo(
                linha,
                [
                    "UC",
                    "NR_UNIDADE_CONSUMIDORA"
                ]
            ),


        /*----------------------------------------------------
        Agência
        ----------------------------------------------------*/
        agencia:
            obterCampo(
                linha,
                [
                    "Agência",
                    "NM_REGIONAL"
                ]
            ),


        /*----------------------------------------------------
        Regional

        Por enquanto utilizamos a mesma origem de Agência,
        pois essa é a informação publicada no JSON atual.
        ----------------------------------------------------*/
        regional:
            obterCampo(
                linha,
                [
                    "Agência",
                    "NM_REGIONAL"
                ]
            ),


        /*----------------------------------------------------
        Tipo de Serviço

        O JSON atual não publica uma coluna específica
        TP_SERVICO.

        Mantemos os nomes técnicos caso essa coluna seja
        acrescentada futuramente.
        ----------------------------------------------------*/
        tpServico:
            String(
                obterCampo(
                    linha,
                    [
                        "TP_SERVICO",
                        "Tipo Serviço"
                    ],
                    ""
                ) || ""
            )
                .trim()
                .toUpperCase(),


        /*----------------------------------------------------
        Serviço
        ----------------------------------------------------*/
        servico:
            obterCampo(
                linha,
                [
                    "Serviço",
                    "NM_SERVICO",
                    "SG_SERVICO"
                ]
            ),


        /*----------------------------------------------------
        Centro de Trabalho
        ----------------------------------------------------*/
        centroTrabalho:
            obterCampo(
                linha,
                [
                    "Centro Trabalho",
                    "CD_CENTRO_TRABALHO",
                    "CENTRO_TRABALHO"
                ]
            ),


        /*----------------------------------------------------
        Tipo Centro de Trabalho
        ----------------------------------------------------*/
        tipoCentroTrabalho:
            obterCampo(
                linha,
                [
                    "Tipo Centro de Trabalho",
                    "TP_CENTRO_TRABALHO",
                    "TIPO_CENTRO_TRABALHO"
                ]
            ),


        /*----------------------------------------------------
        Data de Abertura
        ----------------------------------------------------*/
        dataAbertura:
            obterCampo(
                linha,
                [
                    "Data Abertura",
                    "DT_ABERTURA"
                ]
            ),


        /*----------------------------------------------------
        Data Limite
        ----------------------------------------------------*/
        dataLimite:
            obterCampo(
                linha,
                [
                    "Data Limite Exec.",
                    "Data Limite",
                    "DT_LIMITE_EXECUCAO_SERVICO",
                    "DATA_LIMITE"
                ]
            ),


        /*----------------------------------------------------
        Data Limite original
        ----------------------------------------------------*/
        dataLimiteOriginal:
            obterCampo(
                linha,
                [
                    "Data Limite Exec.",
                    "DT_LIMITE_EXECUCAO_SERVICO"
                ]
            ),


        /*----------------------------------------------------
        Data de Conclusão
        ----------------------------------------------------*/
        dataConclusao:
            obterCampo(
                linha,
                [
                    "Data Conclusão",
                    "DT_CONCLUSAO",
                    "DT_SAIDA"
                ]
            ),


        /*----------------------------------------------------
        Data de saída
        ----------------------------------------------------*/
        dtSaida,


        /*----------------------------------------------------
        Tempo Excedido
        ----------------------------------------------------*/
        tempoExcedido:
            obterCampo(
                linha,
                [
                    "Tempo Excedido",
                    "TEMPO_EXCEDIDO"
                ],
                0
            ),


        /*----------------------------------------------------
        Compensação Hoje
        ----------------------------------------------------*/
        compensacaoHoje:
            obterCampo(
                linha,
                [
                    "Compensação Hoje",
                    "COMPENSACAO_HOJE"
                ],
                0
            ),


        /*----------------------------------------------------
        Compensação Amanhã
        ----------------------------------------------------*/
        compensacaoAmanha:
            obterCampo(
                linha,
                [
                    "Compensação Amanhã",
                    "COMPENSACAO_AMANHA"
                ],
                0
            ),


        /*----------------------------------------------------
        Status
        ----------------------------------------------------*/
        status

    };

}