/*========================================================
Projeto : Lista UC SIMO x ANEEL
Arquivo : cabecalho.js

Responsável pelas informações do cabeçalho:
    - Último Dado
    - Hora Atual
========================================================*/


/*========================================================
Formata data e hora
========================================================*/

function formatarDataHora(data) {

    if (!(data instanceof Date) || isNaN(data)) {
        return "--";
    }

    const dia = String(
        data.getDate()
    ).padStart(2, "0");

    const mes = String(
        data.getMonth() + 1
    ).padStart(2, "0");

    const ano = data.getFullYear();

    const hora = String(
        data.getHours()
    ).padStart(2, "0");

    const minuto = String(
        data.getMinutes()
    ).padStart(2, "0");

    const segundo = String(
        data.getSeconds()
    ).padStart(2, "0");

    return (
        `${dia}/${mes}/${ano} ` +
        `${hora}:${minuto}:${segundo}`
    );
}


/*========================================================
Atualiza informações do cabeçalho
========================================================*/

function atualizarCabecalho(dados) {

    /*------------------------------------------------------
    Último dado disponível

    Posteriormente virá dos metadados publicados pelo
    Atualizador.
    ------------------------------------------------------*/

    const elProcessamento = document.getElementById(
        "dtProcessamento"
    );

    if (elProcessamento) {

        elProcessamento.textContent =
            dados?.ultimaAtualizacao ?? "--";
    }
}


/*========================================================
Inicia relógio
========================================================*/

function iniciarRelogio() {

    atualizarRelogio();

    setInterval(
        atualizarRelogio,
        1000
    );
}


/*========================================================
Atualiza relógio
========================================================*/

function atualizarRelogio() {

    const elRelogio = document.getElementById(
        "relogioAtual"
    );

    if (!elRelogio) {
        return;
    }

    elRelogio.textContent =
        formatarDataHora(
            new Date()
        );
}