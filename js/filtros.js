/*========================================================
filtros.js

Responsável por:

- Abrir/fechar o painel lateral
- Construir listas dinâmicas
- Controlar filtros
- Informar filtros ativos
- Solicitar atualização do dashboard
========================================================*/


/*========================================================
Estado atual dos filtros
========================================================*/

const estadoFiltros = {

    regionais: new Set(),

    tiposServico: new Set(
        [
            "CN",
            "CT",
            "MI",
            "NT",
            "RE"
        ]
    ),

    uc: "",

    os: "",

    tipoCentroTrabalho: "TODOS",

    centrosTrabalho: new Set(),

    status: "TODOS"

};


/*========================================================
Controle para não registrar eventos mais de uma vez
========================================================*/

/*
    O main.js pode chamar inicializarFiltros() mais de uma vez:

    - primeira vez, antes de carregar o JSON;
    - depois, quando os dados forem carregados;
    - posteriormente, quando novos dados forem buscados.

    Os eventos, porém, devem ser registrados somente uma vez.
*/

let eventosFiltrosConfigurados = false;


/*========================================================
Abre o menu
========================================================*/

function abrirMenuFiltros() {

    document
        .getElementById("painelFiltros")
        .classList.add("aberto");

    document
        .getElementById("overlayFiltros")
        .classList.add("aberto");

}


/*========================================================
Fecha o menu
========================================================*/

function fecharMenuFiltros() {

    document
        .getElementById("painelFiltros")
        .classList.remove("aberto");

    document
        .getElementById("overlayFiltros")
        .classList.remove("aberto");

}


/*========================================================
Inicializa filtros
========================================================*/

/*
    "linhas" recebe os dados quando eles estiverem disponíveis.

    Quando o dashboard é aberto antes do JSON existir,
    o main.js chama:

        inicializarFiltros([])

    Assim conseguimos configurar os eventos do menu
    mesmo sem dados.
*/

function inicializarFiltros(
    linhas = []
) {

    construirRegionais(
        linhas
    );

    construirCentrosTrabalho(
        linhas
    );


    /*
        Os eventos são configurados somente uma vez.
    */

    if (
        !eventosFiltrosConfigurados
    ) {

        configurarEventosFiltros();

        eventosFiltrosConfigurados =
            true;

    }


    atualizarIndicadorFiltros();

}


/*========================================================
Regionais
========================================================*/

function construirRegionais(
    linhas
) {

    const valores =
        obterValoresUnicos(
            linhas,
            linha => linha.regional
        );

    const container =
        document.getElementById(
            "listaRegionais"
        );

    /*
       Segurança:
       caso o elemento ainda não exista no HTML,
       simplesmente não tenta manipulá-lo.
    */

    if (!container) {
        return;
    }

    container.innerHTML = "";


    valores.forEach(
        valor => {

            const div =
                document.createElement(
                    "label"
                );

            div.className =
                "item-filtro";

            div.innerHTML = `
                <input
                    type="checkbox"
                    class="check-regional"
                    value="${escaparHtml(valor)}"
                    checked
                >
                <span>${escaparHtml(valor)}</span>
            `;

            container.appendChild(
                div
            );

        }
    );


    estadoFiltros.regionais =
        new Set(
            valores
        );


    sincronizarCheckTodasRegionais();

}


/*========================================================
Centros de trabalho
========================================================*/

function construirCentrosTrabalho(
    linhas
) {

    const valores =
        obterValoresUnicos(
            linhas,
            linha => linha.centroTrabalho
        );

    const container =
        document.getElementById(
            "listaCentrosTrabalho"
        );

    /*
       Segurança:
       caso o elemento não exista, não tenta manipulá-lo.
    */

    if (!container) {
        return;
    }

    container.innerHTML = "";


    valores.forEach(
        valor => {

            const div =
                document.createElement(
                    "label"
                );

            div.className =
                "item-filtro";

            div.innerHTML = `
                <input
                    type="checkbox"
                    class="check-centro"
                    value="${escaparHtml(valor)}"
                    checked
                >
                <span>${escaparHtml(valor)}</span>
            `;

            container.appendChild(
                div
            );

        }
    );


    estadoFiltros.centrosTrabalho =
        new Set(
            valores
        );


    sincronizarCheckTodosCentros();

}


/*========================================================
Obtém valores únicos
========================================================*/

function obterValoresUnicos(
    linhas,
    funcao
) {

    const valores =
        new Set();


    linhas.forEach(
        linha => {

            const valor =
                funcao(linha);


            if (
                valor !== null &&
                valor !== undefined &&
                String(valor).trim() !== ""
            ) {

                valores.add(
                    String(valor).trim()
                );

            }

        }
    );


    return Array.from(
        valores
    ).sort(
        (a, b) =>
            a.localeCompare(
                b,
                "pt-BR",
                {
                    numeric: true
                }
            )
    );

}


/*========================================================
Configuração dos eventos
========================================================*/

function configurarEventosFiltros() {

    /* -----------------------------------------------------
       Abrir
    ----------------------------------------------------- */

    /*
       Aceita os dois nomes utilizados nas versões do HTML:

       btnAbrirFiltros
       btnFiltros
    */

    const botaoAbrir =
        document.getElementById(
            "btnAbrirFiltros"
        ) ||
        document.getElementById(
            "btnFiltros"
        );


    if (botaoAbrir) {

        botaoAbrir.addEventListener(
            "click",
            abrirMenuFiltros
        );


        botaoAbrir.addEventListener(
            "keydown",
            evento => {

                if (
                    evento.key === "Enter" ||
                    evento.key === " "
                ) {

                    evento.preventDefault();

                    abrirMenuFiltros();

                }

            }
        );

    }


    /* -----------------------------------------------------
       Fechar
    ----------------------------------------------------- */

    const botaoFechar =
        document.getElementById(
            "btnFecharFiltros"
        );

    if (botaoFechar) {

        botaoFechar.addEventListener(
            "click",
            fecharMenuFiltros
        );

    }


    /* -----------------------------------------------------
       Overlay
    ----------------------------------------------------- */

    const overlay =
        document.getElementById(
            "overlayFiltros"
        );

    if (overlay) {

        overlay.addEventListener(
            "click",
            fecharMenuFiltros
        );

    }


    /* -----------------------------------------------------
       ESC fecha o menu
       ----------------------------------------------------- */

    document.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key === "Escape"
            ) {

                fecharMenuFiltros();

            }

        }
    );


    /* -----------------------------------------------------
       Regional
       ----------------------------------------------------- */

    const regionalTodas =
        document.getElementById(
            "regionalTodas"
        );

    if (regionalTodas) {

        regionalTodas.addEventListener(
            "change",
            evento => {

                const checks =
                    document.querySelectorAll(
                        ".check-regional"
                    );


                checks.forEach(
                    cb =>
                        cb.checked =
                            evento.target.checked
                );


                estadoFiltros.regionais =
                    evento.target.checked
                        ? new Set(
                            Array.from(checks)
                                .map(
                                    cb => cb.value
                                )
                        )
                        : new Set();


                sincronizarCheckTodasRegionais();

                aplicarFiltros();

            }
        );

    }


    /* -----------------------------------------------------
       Tipo de serviço - Todos
       ----------------------------------------------------- */

    const tipoServicoTodos =
        document.getElementById(
            "tipoServicoTodos"
        );

    if (tipoServicoTodos) {

        tipoServicoTodos.addEventListener(
            "change",
            evento => {

                const checks =
                    document.querySelectorAll(
                        ".check-tipo-servico"
                    );


                checks.forEach(
                    cb =>
                        cb.checked =
                            evento.target.checked
                );


                estadoFiltros.tiposServico =
                    evento.target.checked
                        ? new Set(
                            Array.from(checks)
                                .map(
                                    cb => cb.value
                                )
                        )
                        : new Set();


                sincronizarCheckTodosTipos();

                aplicarFiltros();

            }
        );

    }


    /* -----------------------------------------------------
       Tipo de serviço - individuais
       ----------------------------------------------------- */

    document
        .querySelectorAll(
            ".check-tipo-servico"
        )
        .forEach(
            cb => {

                cb.addEventListener(
                    "change",
                    atualizarTiposServico
                );

            }
        );


    /* -----------------------------------------------------
       Tipo centro
       ----------------------------------------------------- */

    document
        .querySelectorAll(
            "input[name='tipoCentro']"
        )
        .forEach(
            radio => {

                radio.addEventListener(
                    "change",
                    evento => {

                        estadoFiltros
                            .tipoCentroTrabalho =
                                evento.target.value;


                        aplicarFiltros();

                    }
                );

            }
        );


    /* -----------------------------------------------------
       Centro de trabalho - Todos
       ----------------------------------------------------- */

    const centroTodos =
        document.getElementById(
            "centroTodos"
        );

    if (centroTodos) {

        centroTodos.addEventListener(
            "change",
            evento => {

                const checks =
                    document.querySelectorAll(
                        ".check-centro"
                    );


                checks.forEach(
                    cb =>
                        cb.checked =
                            evento.target.checked
                );


                estadoFiltros.centrosTrabalho =
                    evento.target.checked
                        ? new Set(
                            Array.from(checks)
                                .map(
                                    cb => cb.value
                                )
                        )
                        : new Set();


                sincronizarCheckTodosCentros();

                aplicarFiltros();

            }
        );

    }


    /* -----------------------------------------------------
       Status
       ----------------------------------------------------- */

    document
        .querySelectorAll(
            "input[name='statusServico']"
        )
        .forEach(
            radio => {

                radio.addEventListener(
                    "change",
                    evento => {

                        estadoFiltros.status =
                            evento.target.value;


                        aplicarFiltros();

                    }
                );

            }
        );


    /* -----------------------------------------------------
       UC
       ----------------------------------------------------- */

    const filtroUC =
        document.getElementById(
            "filtroUC"
        );

    if (filtroUC) {

        filtroUC.addEventListener(
            "input",
            evento => {

                estadoFiltros.uc =
                    evento.target.value
                        .trim()
                        .toUpperCase();


                aplicarFiltros();

            }
        );

    }


    /* -----------------------------------------------------
       OS
       ----------------------------------------------------- */

    const filtroOS =
        document.getElementById(
            "filtroOS"
        );

    if (filtroOS) {

        filtroOS.addEventListener(
            "input",
            evento => {

                estadoFiltros.os =
                    evento.target.value
                        .trim()
                        .toUpperCase();


                aplicarFiltros();

            }
        );

    }


    /* -----------------------------------------------------
       Limpar
       ----------------------------------------------------- */

    const btnLimpar =
        document.getElementById(
            "btnLimparFiltros"
        );

    if (btnLimpar) {

        btnLimpar.addEventListener(
            "click",
            limparFiltros
        );

    }


    /* -----------------------------------------------------
       Aplicar
       ----------------------------------------------------- */

    const btnAplicar =
        document.getElementById(
            "btnAplicarFiltros"
        );

    if (btnAplicar) {

        btnAplicar.addEventListener(
            "click",
            () => {

                aplicarFiltros();

                fecharMenuFiltros();

            }
        );

    }


    /* -----------------------------------------------------
       Checkboxes dinâmicos - Regionais
       ----------------------------------------------------- */

    const listaRegionais =
        document.getElementById(
            "listaRegionais"
        );

    if (listaRegionais) {

        listaRegionais.addEventListener(
            "change",
            evento => {

                if (
                    !evento.target.classList.contains(
                        "check-regional"
                    )
                ) {

                    return;

                }


                atualizarRegionais();

            }
        );

    }


    /* -----------------------------------------------------
       Checkboxes dinâmicos - Centros
       ----------------------------------------------------- */

    const listaCentrosTrabalho =
        document.getElementById(
            "listaCentrosTrabalho"
        );

    if (listaCentrosTrabalho) {

        listaCentrosTrabalho.addEventListener(
            "change",
            evento => {

                if (
                    !evento.target.classList.contains(
                        "check-centro"
                    )
                ) {

                    return;

                }


                atualizarCentrosTrabalho();

            }
        );

    }

}


/*========================================================
Tipos de serviço
========================================================*/

function atualizarTiposServico() {

    const checks =
        document.querySelectorAll(
            ".check-tipo-servico"
        );


    estadoFiltros.tiposServico =
        new Set(
            Array.from(checks)
                .filter(
                    cb => cb.checked
                )
                .map(
                    cb => cb.value
                )
        );


    sincronizarCheckTodosTipos();

    aplicarFiltros();

}


/*========================================================
Regionais
========================================================*/

function atualizarRegionais() {

    const checks =
        document.querySelectorAll(
            ".check-regional"
        );


    estadoFiltros.regionais =
        new Set(
            Array.from(checks)
                .filter(
                    cb => cb.checked
                )
                .map(
                    cb => cb.value
                )
        );


    sincronizarCheckTodasRegionais();

    aplicarFiltros();

}


/*========================================================
Centros de trabalho
========================================================*/

function atualizarCentrosTrabalho() {

    const checks =
        document.querySelectorAll(
            ".check-centro"
        );


    estadoFiltros.centrosTrabalho =
        new Set(
            Array.from(checks)
                .filter(
                    cb => cb.checked
                )
                .map(
                    cb => cb.value
                )
        );


    sincronizarCheckTodosCentros();

    aplicarFiltros();

}


/*========================================================
Sincronização "Todas" - regionais
========================================================*/

function sincronizarCheckTodasRegionais() {

    const todas =
        document.getElementById(
            "regionalTodas"
        );


    const checks =
        document.querySelectorAll(
            ".check-regional"
        );


    if (!todas) {
        return;
    }


    todas.checked =
        checks.length > 0 &&
        Array.from(checks)
            .every(
                cb => cb.checked
            );

}


/*========================================================
Sincronização "Todos" - tipos
========================================================*/

function sincronizarCheckTodosTipos() {

    const todos =
        document.getElementById(
            "tipoServicoTodos"
        );


    const checks =
        document.querySelectorAll(
            ".check-tipo-servico"
        );


    if (!todos) {
        return;
    }


    todos.checked =
        checks.length > 0 &&
        Array.from(checks)
            .every(
                cb => cb.checked
            );

}


/*========================================================
Sincronização "Todos" - centro
========================================================*/

function sincronizarCheckTodosCentros() {

    const todos =
        document.getElementById(
            "centroTodos"
        );


    const checks =
        document.querySelectorAll(
            ".check-centro"
        );


    if (!todos) {
        return;
    }


    todos.checked =
        checks.length > 0 &&
        Array.from(checks)
            .every(
                cb => cb.checked
            );

}


/*========================================================
Limpa filtros
========================================================*/

function limparFiltros() {

    /* -----------------------------------------------------
       Regionais
    ----------------------------------------------------- */

    document
        .querySelectorAll(
            ".check-regional"
        )
        .forEach(
            cb =>
                cb.checked = true
        );


    estadoFiltros.regionais =
        new Set(
            Array.from(
                document.querySelectorAll(
                    ".check-regional"
                )
            )
            .map(
                cb => cb.value
            )
        );


    /* -----------------------------------------------------
       Tipos de serviço
    ----------------------------------------------------- */

    document
        .querySelectorAll(
            ".check-tipo-servico"
        )
        .forEach(
            cb =>
                cb.checked = true
        );


    estadoFiltros.tiposServico =
        new Set(
            [
                "CN",
                "CT",
                "MI",
                "NT",
                "RE"
            ]
        );


    /* -----------------------------------------------------
       UC
    ----------------------------------------------------- */

    const filtroUC =
        document.getElementById(
            "filtroUC"
        );

    if (filtroUC) {

        filtroUC.value = "";

    }

    estadoFiltros.uc = "";


    /* -----------------------------------------------------
       OS
    ----------------------------------------------------- */

    const filtroOS =
        document.getElementById(
            "filtroOS"
        );

    if (filtroOS) {

        filtroOS.value = "";

    }

    estadoFiltros.os = "";


    /* -----------------------------------------------------
       Tipo centro
    ----------------------------------------------------- */

    const radioTodosCentro =
        document.querySelector(
            "input[name='tipoCentro'][value='TODOS']"
        );

    if (radioTodosCentro) {

        radioTodosCentro.checked =
            true;

    }

    estadoFiltros.tipoCentroTrabalho =
        "TODOS";


    /* -----------------------------------------------------
       Centros
    ----------------------------------------------------- */

    document
        .querySelectorAll(
            ".check-centro"
        )
        .forEach(
            cb =>
                cb.checked = true
        );


    estadoFiltros.centrosTrabalho =
        new Set(
            Array.from(
                document.querySelectorAll(
                    ".check-centro"
                )
            )
            .map(
                cb => cb.value
            )
        );


    /* -----------------------------------------------------
       Status
    ----------------------------------------------------- */

    const radioTodosStatus =
        document.querySelector(
            "input[name='statusServico'][value='TODOS']"
        );

    if (radioTodosStatus) {

        radioTodosStatus.checked =
            true;

    }

    estadoFiltros.status =
        "TODOS";


    /* -----------------------------------------------------
       Sincronização
    ----------------------------------------------------- */

    sincronizarCheckTodasRegionais();

    sincronizarCheckTodosTipos();

    sincronizarCheckTodosCentros();


    /* -----------------------------------------------------
       Atualiza dashboard
    ----------------------------------------------------- */

    aplicarFiltros();

}


/*========================================================
Aplica os filtros atuais
========================================================*/

function aplicarFiltros() {

    atualizarIndicadorFiltros();


    if (
        typeof atualizarDashboard ===
        "function"
    ) {

        atualizarDashboard();

    }

}


/*========================================================
Indicador no card
========================================================*/

function atualizarIndicadorFiltros() {

    let quantidade = 0;


    /* -----------------------------------------------------
       Regional
    ----------------------------------------------------- */

    const regionais =
        document.querySelectorAll(
            ".check-regional"
        );


    if (
        regionais.length > 0 &&
        !Array.from(regionais)
            .every(
                cb => cb.checked
            )
    ) {

        quantidade++;

    }


    /* -----------------------------------------------------
       Tipo serviço
    ----------------------------------------------------- */

    const tipos =
        document.querySelectorAll(
            ".check-tipo-servico"
        );


    if (
        tipos.length > 0 &&
        !Array.from(tipos)
            .every(
                cb => cb.checked
            )
    ) {

        quantidade++;

    }


    /* -----------------------------------------------------
       UC
    ----------------------------------------------------- */

    if (estadoFiltros.uc) {

        quantidade++;

    }


    /* -----------------------------------------------------
       OS
    ----------------------------------------------------- */

    if (estadoFiltros.os) {

        quantidade++;

    }


    /* -----------------------------------------------------
       Tipo centro
    ----------------------------------------------------- */

    if (
        estadoFiltros.tipoCentroTrabalho !==
        "TODOS"
    ) {

        quantidade++;

    }


    /* -----------------------------------------------------
       Centro
    ----------------------------------------------------- */

    const centros =
        document.querySelectorAll(
            ".check-centro"
        );


    if (
        centros.length > 0 &&
        !Array.from(centros)
            .every(
                cb => cb.checked
            )
    ) {

        quantidade++;

    }


    /* -----------------------------------------------------
       Status
    ----------------------------------------------------- */

    if (
        estadoFiltros.status !==
        "TODOS"
    ) {

        quantidade++;

    }


    /* -----------------------------------------------------
       Exibe quantidade
    ----------------------------------------------------- */

    const indicador =
        document.getElementById(
            "quantidadeFiltros"
        );


    if (indicador) {

        indicador.textContent =
            quantidade;

    }

}


/*========================================================
Aplica os filtros às linhas
========================================================*/

function filtrarLinhas(
    linhas
) {

    return linhas.filter(
        linha => {

            /* ---------------------------------------------
               Regional
            --------------------------------------------- */

            if (
                estadoFiltros.regionais.size > 0 &&
                !estadoFiltros.regionais
                    .has(
                        linha.regional
                    )
            ) {

                return false;

            }


            /* ---------------------------------------------
               Tipo serviço
            --------------------------------------------- */

            if (
                estadoFiltros.tiposServico.size > 0 &&
                !estadoFiltros.tiposServico
                    .has(
                        linha.tpServico
                    )
            ) {

                return false;

            }


            /* ---------------------------------------------
               UC
            --------------------------------------------- */

            if (
                estadoFiltros.uc &&
                !String(
                    linha.uc ?? ""
                )
                .toUpperCase()
                .includes(
                    estadoFiltros.uc
                )
            ) {

                return false;

            }


            /* ---------------------------------------------
               OS
            --------------------------------------------- */

            if (
                estadoFiltros.os &&
                !String(
                    linha.nrDocumentoSimo ?? ""
                )
                .toUpperCase()
                .includes(
                    estadoFiltros.os
                )
            ) {

                return false;

            }


            /* ---------------------------------------------
               Tipo Centro
            --------------------------------------------- */

            if (
                estadoFiltros.tipoCentroTrabalho !==
                "TODOS"
            ) {

                let tipo =
                    String(
                        linha.tipoCentroTrabalho ?? ""
                    )
                    .trim()
                    .toUpperCase();


                /*
                   Padroniza a forma interna do valor.
                */

                if (
                    tipo === "EMPREITEIRA"
                ) {

                    tipo =
                        "EMPREITEIRA";

                }


                if (
                    tipo !==
                    estadoFiltros.tipoCentroTrabalho
                ) {

                    return false;

                }

            }


            /* ---------------------------------------------
               Centro de Trabalho
            --------------------------------------------- */

            if (
                estadoFiltros.centrosTrabalho.size > 0 &&
                !estadoFiltros.centrosTrabalho
                    .has(
                        String(
                            linha.centroTrabalho ?? ""
                        )
                    )
            ) {

                return false;

            }


            /* ---------------------------------------------
               Status
            --------------------------------------------- */

            if (
                estadoFiltros.status !==
                "TODOS"
            ) {

                const concluido =
                    Boolean(
                        linha.dtSaida
                    );


                if (
                    estadoFiltros.status ===
                    "CONCLUIDO" &&
                    !concluido
                ) {

                    return false;

                }


                if (
                    estadoFiltros.status ===
                    "NAO_CONCLUIDO" &&
                    concluido
                ) {

                    return false;

                }

            }


            return true;

        }
    );

}