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
Normaliza uma linha do V_DOCUMENTO

Aqui concentramos o "de-para" entre SQL e interface.

Quando fecharmos o SQL final, poderemos reduzir essa função
para um único nome por campo.
========================================================*/

function normalizarLinha(linha) {

    const dtSaida =
        obterCampo(
            linha,
            [
                "DT_SAIDA",
                "Data Saída"
            ]
        );

    const statusBruto =
        obterCampo(
            linha,
            [
                "Status_atendimento",
                "STATUS_ATENDIMENTO"
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

    return {

        original: linha,

        nrDocumentoSimo:
            obterCampo(
                linha,
                [
                    "NR_DOCUMENTO_SIMO",
                    "NR_DOCUMENTO_SIM0",
                    "NR_DOCUMENTO"
                ]
            ),

        nrDocumentoSap:
            obterCampo(
                linha,
                [
                    "NR_DOCUMENTO_SAP",
                    "NR_OS_SAP",
                    "NR_DOCUMENTO_SAP"
                ]
            ),

        uc:
            obterCampo(
                linha,
                [
                    "NR_UNIDADE_CONSUMIDORA",
                    "UC"
                ]
            ),

        agencia:
            obterCampo(
                linha,
                [
                    "NM_REGIONAL"
                ]
            ),

        regional:
            obterCampo(
                linha,
                [
                    "NM_REGIONAL"
                ]
            ),

        nrDocumentoSap:
            obterCampo(
                linha,
                [
                    "NR_PROTOCOLO_CLIENTE"
                ]
            ),

        tpServico:
            String(
                obterCampo(
                    linha,
                    [
                        "TP_SERVICO"
                    ],
                    ""
                ) || ""
            )
            .trim()
            .toUpperCase(),

        servico:
            obterCampo(
                linha,
                [
                    "NM_SERVICO",
                    "SG_SERVICO"
                ]
            ),

        centroTrabalho:
            obterCampo(
                linha,
                [
                    "CD_CENTRO_TRABALHO",
                    "CENTRO_TRABALHO"
                ]
            ),

        tipoCentroTrabalho:
            obterCampo(
                linha,
                [
                    "TP_CENTRO_TRABALHO",
                    "TIPO_CENTRO_TRABALHO"
                ]
            ),

        dataAbertura:
            obterCampo(
                linha,
                [
                    "DT_ABERTURA"
                ]
            ),

        dataLimite:
            obterCampo(
                linha,
                [
                    "Data Limite",
                    "DATA_LIMITE"
                ]
            ),

        dataLimiteOriginal:
            obterCampo(
                linha,
                [
                    "DT_LIMITE_EXECUCAO_SERVICO"
                ]
            ),

        dataConclusao:
            obterCampo(
                linha,
                [
                    "DT_CONCLUSAO",
                    "DT_SAIDA"
                ]
            ),

        dtSaida,

        tempoExcedido:
            obterCampo(
                linha,
                [
                    "Tempo Excedido",
                    "TEMPO_EXCEDIDO"
                ],
                0
            ),

        compensacaoHoje:
            obterCampo(
                linha,
                [
                    "Compensação Hoje",
                    "COMPENSACAO_HOJE"
                ],
                0
            ),

        compensacaoAmanha:
            obterCampo(
                linha,
                [
                    "Compensação Amanhã",
                    "COMPENSACAO_AMANHA"
                ],
                0
            ),

        status

    };

}