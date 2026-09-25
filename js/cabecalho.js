/*========================================================
Projeto : Acompanhamento de Serviços
Arquivo : cabecalho.js

Responsável pelas informações do cabeçalho:
    - Último Dado
    - Hora Atual
========================================================*/


/*========================================================
Atualiza informações do cabeçalho
========================================================*/

function atualizarCabecalho(dados) {

    /*------------------------------------------------------
    Último dado disponível

    Posteriormente poderá vir dos metadados publicados pelo
    Atualizador.
    ------------------------------------------------------*/

    const elProcessamento =
        document.getElementById(
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

    const elRelogio = document.getElementById("relogioAtual");

    if (!elRelogio) {
        return;
    }

    /*
        Aqui utilizamos a função formatarDataHora()
        definida em utils.js.

        Ela aceita tanto:
            - objetos Date;
            - strings de data vindas do JSON.

        Como o relógio envia new Date(), funciona
        normalmente.

        E, principalmente, não sobrescrevemos mais
        a função global usada pela tabela.
    */

    elRelogio.textContent =
        formatarDataHora(
            new Date()
        );

}

/*========================================================
Atualiza horário da última atualização da página
========================================================*/

function atualizarDataAtualizacaoPagina() {

    const elAtualizacao = document.getElementById("dtAtualizacaoPagina");

    if (!elAtualizacao) {
        return;
    }

    elAtualizacao.textContent =
        formatarDataHora(new Date() );
}