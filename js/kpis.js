/*========================================================
kpis.js

Calcula os KPIs sobre as linhas atualmente filtradas.
========================================================*/


/*========================================================
Atualiza todos os KPIs
========================================================*/

function atualizarKPIs(linhas, totalServicos) {
    const indicadores = calcularKPIs(linhas, totalServicos);
    renderizarKPIs(indicadores);
}


/*========================================================
Cálculo
========================================================*/

function calcularKPIs(linhas, totalServicos) {

    const hoje =
        new Date();

    hoje.setHours(
        0,
        0,
        0,
        0
    );


    const amanha =
        new Date(hoje);

    amanha.setDate(
        amanha.getDate() + 1
    );


    /* =====================================================
       Total de serviços
    ====================================================== */

    const servicosFiltrados = linhas.length;


    /* =====================================================
       Serviços atrasados
    ====================================================== */

    const servicosAtrasados =
        linhas.filter(
            linha =>
                Number(
                    linha.tempoExcedido ?? 0
                ) >= 1
        ).length;


    /* =====================================================
       Realizados hoje

       Mantém a lógica do Power BI:
       DT_SAIDA preenchida.
    ====================================================== */

    const realizadosHoje =
        linhas.filter(
            linha =>
                linha.dtSaida != null &&
                linha.dtSaida !== ""
        ).length;


    /* =====================================================
       Vencendo hoje

       Mantém, nesta primeira versão, a regra apresentada
       no DAX:

       Data limite original entre hoje e amanhã
       e DT_SAIDA preenchida.
    ====================================================== */

    const vencendoHoje =
        linhas.filter(
            linha => {

                const data =
                    converterData(
                        linha.dataLimiteOriginal
                    );

                if (!data) {
                    return false;
                }

                return (
                    data >= hoje &&
                    data <= amanha &&
                    linha.dtSaida != null &&
                    linha.dtSaida !== ""
                );

            }
        ).length;


    /* =====================================================
       Compensação hoje
    ====================================================== */

    const compensacaoHoje =
        linhas.reduce(
            (total, linha) =>
                total +
                Number(
                    linha.compensacaoHoje ?? 0
                ),
            0
        );


    /* =====================================================
       Compensação amanhã
    ====================================================== */

    const compensacaoAmanha =
        linhas.reduce(
            (total, linha) =>
                total +
                Number(
                    linha.compensacaoAmanha ?? 0
                ),
            0
        );


    return {

        totalServicos:totalServicos,
        servicosFiltrados:servicosFiltrados,
        servicosAtrasados,
        realizadosHoje,
        vencendoHoje,
        compensacaoHoje,
        compensacaoAmanha
    };

}


/*========================================================
Renderiza
========================================================*/

function renderizarKPIs(kpi) {

    document.getElementById(
        "kpiTotalServicos"
    ).textContent =
        formatarNumero(
            kpi.totalServicos
        );


    document.getElementById(
        "kpiServicosFiltrados"
    ).textContent =
        formatarNumero(
            kpi.servicosFiltrados
        );


    document.getElementById(
        "kpiRealizadosHoje"
    ).textContent =
        formatarNumero(
            kpi.realizadosHoje
        );


    document.getElementById(
        "kpiVencendoHoje"
    ).textContent =
        formatarNumero(
            kpi.vencendoHoje
        );


    document.getElementById(
        "kpiCompensacaoHoje"
    ).textContent =
        formatarMoeda(
            kpi.compensacaoHoje
        );


    document.getElementById(
        "kpiCompensacaoAmanha"
    ).textContent =
        formatarMoeda(
            kpi.compensacaoAmanha
        );

}