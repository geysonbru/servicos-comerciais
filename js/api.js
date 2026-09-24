/*========================================================
api.js

Responsável por carregar e descompactar o JSON.
========================================================*/

async function carregarDados() {

    const url =
        "dados/dados.json.gz?t=" +
        Date.now();

    const resposta =
        await fetch(url);

    if (!resposta.ok) {

        throw new Error(
            `Erro ao carregar dados. Status: ${resposta.status}`
        );

    }

    // -----------------------------------------------------
    // Descompacta GZIP em memória.
    // -----------------------------------------------------

    const ds =
        new DecompressionStream("gzip");

    const fluxo =
        resposta.body.pipeThrough(ds);

    const texto =
        await new Response(fluxo).text();

    return JSON.parse(texto);
}