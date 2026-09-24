/*========================================================
Projeto: Acompanhamento de Serviços
Arquivo: tabela.js

Responsável por:
- Renderização e manipulação da tabela de serviços
- Formatação das células (datas, moeda, tempo excedido)
- Atualização do contador de registros no título
========================================================*/


/* =======================================================
   1. ATUALIZAÇÃO DA TABELA
======================================================= */

/**
 * Renderiza todas as linhas recebidas na tabela de serviços.
 * @param {Array} linhas - Lista de objetos contendo os serviços/documentos.
 */
function atualizarTabela(linhas) {
    const tbody = document.getElementById("tbodyServicos");
    tbody.innerHTML = "";

    if (!linhas || linhas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="13" class="sem-registros">
                    Nenhum serviço encontrado.
                </td>
            </tr>
        `;
        return;
    }

    linhas.forEach(inserirLinhaTabela);
}


/* =======================================================
   2. INSERÇÃO E MONTAGEM DAS LINHAS
======================================================= */

/**
 * Cria e insere uma nova linha (tr) na tabela com os dados formatados.
 * @param {Object} linha - Objeto contendo os dados de um serviço individual.
 */
function inserirLinhaTabela(linha) {
    const tempo = Number(linha.tempoExcedido ?? 0);
    const classeTempo = tempo > 0 ? "tempo-excedido" : "";

    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${escaparHtml(linha.nrDocumentoSimo ?? "-")}</td>
        <td>${escaparHtml(linha.nrDocumentoSap ?? "-")}</td>
        <td>${escaparHtml(linha.uc ?? "-")}</td>
        <td>${escaparHtml(linha.agencia ?? "-")}</td>
        <td>${escaparHtml(linha.servico ?? "-")}</td>
        <td>${escaparHtml(linha.centroTrabalho ?? "-")}</td>
        <td>${escaparHtml(linha.tipoCentroTrabalho ?? "-")}</td>
        <td>${formatarDataHora(linha.dataAbertura)}</td>
        <td>${formatarDataHora(linha.dataLimite)}</td>
        <td>${formatarDataHora(linha.dataConclusao)}</td>
        <td class="${classeTempo}">${formatarNumero(linha.tempoExcedido)}</td>
        <td class="valor-compensacao">${formatarMoeda(linha.compensacaoHoje)}</td>
        <td class="valor-compensacao">${formatarMoeda(linha.compensacaoAmanha)}</td>
    `;

    document.getElementById("tbodyServicos").appendChild(tr);
}


/* =======================================================
   3. TÍTULO E CONTADORES
======================================================= */

/**
 * Atualiza o texto do título da tabela exibindo a quantidade total de registros.
 * @param {number} quantidade - Número de registros da lista filtrada.
 */
function atualizarTituloTabela(quantidade) {
    const titulo = document.getElementById("tituloTabela");

    if (titulo) {
        titulo.textContent = `Serviços (${formatarNumero(quantidade)})`;
    }
}