/*========================================================
tabela.js

Responsável pela tabela de serviços.
========================================================*/


/*========================================================
Atualiza tabela
========================================================*/

function atualizarTabela(linhas) {

    const tbody =
        document.getElementById(
            "tbodyServicos"
        );

    tbody.innerHTML = "";


    if (
        !linhas ||
        linhas.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="13"
                    class="sem-registros"
                >
                    Nenhum serviço encontrado.
                </td>
            </tr>
        `;

        return;

    }


    linhas.forEach(
        inserirLinhaTabela
    );

}


/*========================================================
Insere uma linha
========================================================*/

function inserirLinhaTabela(linha) {

    const tempo =
        Number(
            linha.tempoExcedido ?? 0
        );

    const classeTempo =
        tempo > 0
            ? "tempo-excedido"
            : "";


    const tr =
        document.createElement("tr");


    tr.innerHTML = `

        <td>
            ${escaparHtml(
                linha.nrDocumentoSimo ?? "-"
            )}
        </td>

        <td>
            ${escaparHtml(
                linha.nrDocumentoSap ?? "-"
            )}
        </td>

        <td>
            ${escaparHtml(
                linha.uc ?? "-"
            )}
        </td>

        <td>
            ${escaparHtml(
                linha.agencia ?? "-"
            )}
        </td>

        <td>
            ${escaparHtml(
                linha.servico ?? "-"
            )}
        </td>

        <td>
            ${escaparHtml(
                linha.centroTrabalho ?? "-"
            )}
        </td>

        <td>
            ${escaparHtml(
                linha.tipoCentroTrabalho ?? "-"
            )}
        </td>

        <td>
            ${formatarDataHora(
                linha.dataAbertura
            )}
        </td>

        <td>
            ${formatarDataHora(
                linha.dataLimite
            )}
        </td>

        <td>
            ${formatarDataHora(
                linha.dataConclusao
            )}
        </td>

        <td class="${classeTempo}">
            ${formatarNumero(
                linha.tempoExcedido
            )}
        </td>

        <td class="valor-compensacao">
            ${formatarMoeda(
                linha.compensacaoHoje
            )}
        </td>

        <td class="valor-compensacao">
            ${formatarMoeda(
                linha.compensacaoAmanha
            )}
        </td>

    `;


    document
        .getElementById("tbodyServicos")
        .appendChild(tr);

}


/*========================================================
Título
========================================================*/

function atualizarTituloTabela(
    quantidade
) {

    const titulo =
        document.getElementById(
            "tituloTabela"
        );

    titulo.textContent =
        `Serviços (${formatarNumero(quantidade)})`;

}