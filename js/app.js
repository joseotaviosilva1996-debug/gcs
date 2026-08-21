/* =========================================================
   GEP — GESTÃO ECONÔMICA DA PECUÁRIA
   V2
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // ELEMENTOS
    // =====================================================

    const loginPage = document.getElementById("loginPage");
    const registerPage = document.getElementById("registerPage");
    const dashboardPage = document.getElementById("dashboardPage");
    const dashboardContent = document.querySelector(".dashboard-content");

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (!dashboardContent) return;


    // =====================================================
    // BANCO LOCAL
    // =====================================================

    const DB = {

        get(key) {
            try {
                return JSON.parse(localStorage.getItem(key)) || [];
            } catch {
                return [];
            }
        },

        set(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        },

        remove(key) {
            localStorage.removeItem(key);
        }

    };


    const KEY = {

        fazendas: "gepFazendas",
        lotes: "gepLotes",
        animais: "gepAnimais",
        pesagens: "gepPesagens",
        lancamentos: "gepLancamentos",
        compras: "gepCompras",
        vendas: "gepVendas"

    };


    // =====================================================
    // UTILITÁRIOS
    // =====================================================

    function novoId() {

        return Date.now() +
            Math.floor(Math.random() * 100000);

    }


    function moeda(valor) {

        return Number(valor || 0).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    function numero(valor, casas = 2) {

        return Number(valor || 0).toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: casas,
                maximumFractionDigits: casas
            }
        );

    }


    function dataBR(data) {

        if (!data) return "-";

        const partes = data.split("-");

        if (partes.length !== 3) return data;

        return `${partes[2]}/${partes[1]}/${partes[0]}`;

    }


    function hoje() {

        return new Date()
            .toISOString()
            .split("T")[0];

    }


    function escapar(valor) {

        return String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function usuarioAtual() {

        try {

            return JSON.parse(
                localStorage.getItem("gepUser")
            );

        } catch {

            return null;

        }

    }


    function campoNumerico(label, id, valor = "") {

        return `
            <div>
                <label>${label}</label>

                <input
                    type="number"
                    id="${id}"
                    value="${valor}"
                    min="0"
                    step="0.01"
                    required
                    style="width:100%;"
                >
            </div>
        `;

    }


    function cabecalho(titulo, descricao) {

        return `
            <header class="dashboard-header">

                <div>

                    <h1>${titulo}</h1>

                    <p>${descricao}</p>

                </div>

            </header>
        `;

    }


    function card(icone, titulo, valor, legenda) {

        return `
            <div class="card">

                <div class="card-icon">
                    ${icone}
                </div>

                <div>

                    <span>${titulo}</span>

                    <strong>${valor}</strong>

                    <small class="positive">
                        ${legenda}
                    </small>

                </div>

            </div>
        `;

    }


    // =====================================================
    // LOGIN
    // =====================================================

    if (loginForm) {

        loginForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const login =
                document.getElementById("loginUser").value.trim();

            const senha =
                document.getElementById("loginPassword").value;


            let usuario = usuarioAtual();


            if (!usuario &&
                login === "admin" &&
                senha === "1234"
            ) {

                usuario = {

                    name: "Administrador",
                    user: "admin",
                    email: "admin@gep.com",
                    password: "1234"

                };


                localStorage.setItem(
                    "gepUser",
                    JSON.stringify(usuario)
                );

            }


            if (
                usuario &&
                (
                    login === usuario.user ||
                    login === usuario.email
                ) &&
                senha === usuario.password
            ) {

                localStorage.setItem(
                    "gepLogged",
                    "true"
                );


                abrirSistema();

                return;

            }


            const msg =
                document.getElementById("loginMessage");


            if (msg) {

                msg.textContent =
                    "Usuário ou senha incorretos.";

                msg.className =
                    "message error";

            }

        });

    }


    // =====================================================
    // CADASTRO
    // =====================================================

    if (registerForm) {

        registerForm.addEventListener("submit", function (event) {

            event.preventDefault();


            const nome =
                document.getElementById("registerName").value.trim();

            const usuario =
                document.getElementById("registerUser").value.trim();

            const email =
                document.getElementById("registerEmail").value.trim();

            const senha =
                document.getElementById("registerPassword").value;

            const confirmar =
                document
                    .getElementById("registerPasswordConfirm")
                    .value;


            if (senha !== confirmar) {

                mostrarMensagem(
                    "registerMessage",
                    "As senhas não são iguais.",
                    "error"
                );

                return;

            }


            const novoUsuario = {

                name: nome,
                user: usuario,
                email: email,
                password: senha

            };


            localStorage.setItem(
                "gepUser",
                JSON.stringify(novoUsuario)
            );


            localStorage.setItem(
                "gepLogged",
                "true"
            );


            abrirSistema();

        });

    }


    // =====================================================
    // MENU
    // =====================================================

    const menuItems =
        document.querySelectorAll(".menu-item");


    menuItems.forEach(function (item) {

        item.addEventListener("click", function () {

            const nome =
                item.querySelector("span").textContent.trim();


            ativarMenu(nome);
            navegar(nome);

        });

    });


    function ativarMenu(nome) {

        menuItems.forEach(function (item) {

            const texto =
                item.querySelector("span").textContent.trim();


            item.classList.toggle(
                "active",
                texto === nome
            );

        });

    }


    function navegar(nome) {

        switch (nome) {

            case "Início":
                renderDashboard();
                break;

            case "Fazendas":
                renderFazendas();
                break;

            case "Lotes":
                renderLotes();
                break;

            case "Animais":
                renderAnimais();
                break;

            case "Pesagens":
                renderPesagens();
                break;

            case "Receitas e despesas":
                renderFinanceiro();
                break;

            case "Vendas":
                renderVendas();
                break;

            case "Resultados":
                renderResultados();
                break;

            case "Simulador":
                renderSimulador();
                break;

            case "Compra de animais":
                renderCompras();
                break;

            case "Taxa de lotação":
                renderLotacao();
                break;

            case "Relatórios":
                renderRelatorios();
                break;

            case "Configurações":
                renderConfiguracoes();
                break;

        }

    }


    window.gepNavegar = function (nome) {

        ativarMenu(nome);
        navegar(nome);

    };


    // =====================================================
    // SISTEMA
    // =====================================================

    function abrirSistema() {

        loginPage.classList.add("hidden");
        registerPage.classList.add("hidden");

        dashboardPage.classList.remove("hidden");

        atualizarUsuario();

        ativarMenu("Início");

        renderDashboard();

    }


    function atualizarUsuario() {

        const usuario =
            usuarioAtual();


        if (!usuario) return;


        const nome =
            document.getElementById("welcomeName");


        const dashboardUser =
            document.getElementById("dashboardUser");


        const avatar =
            document.getElementById("userAvatar");


        if (nome) {

            nome.innerHTML =
                `Olá, ${escapar(usuario.name)}! 👋`;

        }


        if (dashboardUser) {

            dashboardUser.textContent =
                usuario.name;

        }


        if (avatar) {

            avatar.textContent =
                usuario.name.charAt(0).toUpperCase();

        }

    }


    // =====================================================
    // DASHBOARD
    // =====================================================

    function renderDashboard() {

        atualizarUsuario();


        const fazendas =
            DB.get(KEY.fazendas);

        const lotes =
            DB.get(KEY.lotes);

        const animais =
            DB.get(KEY.animais);

        const pesagens =
            DB.get(KEY.pesagens);

        const lancamentos =
            DB.get(KEY.lancamentos);

        const vendas =
            DB.get(KEY.vendas);


        const totalAnimais =
            animais.length > 0

                ? animais.length

                : lotes.reduce(
                    (total, lote) =>
                        total +
                        Number(lote.quantidade || 0),
                    0
                );


        let pesoTotal = 0;


        if (animais.length) {

            pesoTotal =
                animais.reduce(
                    (total, animal) =>
                        total +
                        Number(
                            animal.pesoAtual ||
                            animal.pesoInicial ||
                            0
                        ),
                    0
                );

        } else {

            pesoTotal =
                lotes.reduce(
                    (total, lote) =>
                        total +
                        (
                            Number(lote.quantidade || 0) *
                            Number(lote.pesoMedio || 0)
                        ),
                    0
                );

        }


        const pesoMedio =
            totalAnimais > 0
                ? pesoTotal / totalAnimais
                : 0;


        // GMD
        let gmd = 0;


        const gmds = [];


        const grupos = {};


        pesagens.forEach(function (pesagem) {

            if (!grupos[pesagem.animalId]) {

                grupos[pesagem.animalId] = [];

            }

            grupos[pesagem.animalId].push(
                pesagem
            );

        });


        Object.values(grupos).forEach(function (lista) {

            lista.sort(
                (a, b) =>
                    a.data.localeCompare(b.data)
            );


            if (lista.length >= 2) {

                const primeira =
                    lista[0];

                const ultima =
                    lista[lista.length - 1];


                const dias =
                    Math.max(
                        1,
                        (
                            new Date(ultima.data) -
                            new Date(primeira.data)
                        ) /
                        86400000
                    );


                const ganho =
                    Number(ultima.peso) -
                    Number(primeira.peso);


                if (ganho > 0) {

                    gmds.push(
                        ganho / dias
                    );

                }

            }

        });


        if (gmds.length) {

            gmd =
                gmds.reduce(
                    (a, b) => a + b,
                    0
                ) /
                gmds.length;

        } else {

            gmd =
                totalAnimais > 0
                    ? lotes.reduce(
                        (total, lote) =>
                            total +
                            (
                                Number(lote.quantidade || 0) *
                                Number(lote.gmd || 0)
                            ),
                        0
                    ) / totalAnimais
                    : 0;

        }


        const receitas =
            lancamentos
                .filter(l => l.tipo === "receita")
                .reduce(
                    (s, l) =>
                        s + Number(l.valor || 0),
                    0
                );


        const despesas =
            lancamentos
                .filter(l => l.tipo === "despesa")
                .reduce(
                    (s, l) =>
                        s + Number(l.valor || 0),
                    0
                );


        const resultado =
            receitas - despesas;


        const valorVendas =
            vendas.reduce(
                (s, venda) =>
                    s + Number(venda.valorTotal || 0),
                0
            );


        dashboardContent.innerHTML = `

            <header class="dashboard-header">

                <div>

                    <h1 id="welcomeName">
                        Olá! 👋
                    </h1>

                    <p>
                        Aqui está o resumo da sua operação.
                    </p>

                </div>


                <div class="user-profile">

                    <div class="avatar" id="userAvatar">
                        U
                    </div>

                    <div>

                        <strong id="dashboardUser">
                            Usuário
                        </strong>

                        <small>
                            Administrador
                        </small>

                    </div>

                </div>

            </header>


            <section class="cards">

                ${card(
                    "🐂",
                    "Animais ativos",
                    numero(totalAnimais, 0),
                    `${lotes.length} lote(s)`
                )}


                ${card(
                    "⚖️",
                    "Peso médio",
                    `${numero(pesoMedio)} kg`,
                    `${fazendas.length} fazenda(s)`
                )}


                ${card(
                    "📈",
                    "GMD",
                    `${numero(gmd, 3)} kg/dia`,
                    "média da operação"
                )}


                ${card(
                    "💰",
                    "Resultado",
                    moeda(resultado),
                    `${moeda(valorVendas)} em vendas`
                )}

            </section>


            <section class="dashboard-card">

                <div class="section-header">

                    <div>

                        <h2>
                            Rendimento da operação
                        </h2>

                        <p>
                            Evolução dos últimos 6 meses
                        </p>

                    </div>

                </div>


                <div class="chart">

                    <div class="chart-y">

                        <span>60k</span>
                        <span>45k</span>
                        <span>30k</span>
                        <span>15k</span>
                        <span>0</span>

                    </div>


                    <div class="chart-area">

                        ${gerarGrafico()}

                    </div>

                </div>

            </section>


            <section class="bottom-grid">

                <div class="dashboard-card">

                    <div class="section-header">

                        <div>

                            <h2>
                                Resumo financeiro
                            </h2>

                            <p>
                                Acumulado
                            </p>

                        </div>

                    </div>


                    <div class="finance-row">

                        <span>
                            Receitas
                        </span>

                        <strong class="positive">
                            ${moeda(receitas)}
                        </strong>

                    </div>


                    <div class="finance-row">

                        <span>
                            Despesas
                        </span>

                        <strong class="negative">
                            ${moeda(despesas)}
                        </strong>

                    </div>


                    <div class="finance-total">

                        <span>
                            Resultado
                        </span>

                        <strong>
                            ${moeda(resultado)}
                        </strong>

                    </div>

                </div>


                <div class="dashboard-card">

                    <div class="section-header">

                        <div>

                            <h2>
                                Acesso rápido
                            </h2>

                            <p>
                                Principais ferramentas
                            </p>

                        </div>

                    </div>


                    <div class="quick-actions">

                        <button
                            onclick="gepNavegar('Fazendas')"
                        >
                            <span>🌾</span>
                            Fazenda
                        </button>

                        <button
                            onclick="gepNavegar('Lotes')"
                        >
                            <span>🐂</span>
                            Lote
                        </button>

                        <button
                            onclick="gepNavegar('Animais')"
                        >
                            <span>🐄</span>
                            Animal
                        </button>

                        <button
                            onclick="gepNavegar('Vendas')"
                        >
                            <span>💵</span>
                            Venda
                        </button>

                    </div>

                </div>

            </section>

        `;


        atualizarUsuario();

    }


    // =====================================================
    // GRÁFICO
    // =====================================================

    function gerarGrafico() {

        const lancamentos =
            DB.get(KEY.lancamentos);


        const dados = [];


        const hojeAtual =
            new Date();


        for (
            let i = 5;
            i >= 0;
            i--
        ) {

            const data =
                new Date(
                    hojeAtual.getFullYear(),
                    hojeAtual.getMonth() - i,
                    1
                );


            const chave =
                `${data.getFullYear()}-${String(
                    data.getMonth() + 1
                ).padStart(2, "0")}`;


            let valor = 0;


            lancamentos.forEach(
                lancamento => {

                    if (
                        String(
                            lancamento.data
                        ).startsWith(chave)
                    ) {

                        if (
                            lancamento.tipo ===
                            "receita"
                        ) {

                            valor +=
                                Number(
                                    lancamento.valor
                                );

                        } else {

                            valor -=
                                Number(
                                    lancamento.valor
                                );

                        }

                    }

                }
            );


            dados.push({

                mes:
                    data
                        .toLocaleDateString(
                            "pt-BR",
                            {
                                month: "short"
                            }
                        )
                        .replace(".", ""),

                valor

            });

        }


        const valores =
            dados.map(
                item =>
                    item.valor
            );


        const maior =
            Math.max(
                ...valores,
                1
            );


        const menor =
            Math.min(
                ...valores,
                0
            );


        const faixa =
            maior - menor ||
            1;


        const pontos =
            dados.map(
                function (item, index) {

                    const x =
                        (
                            index /
                            (dados.length - 1)
                        ) *
                        700;


                    const y =
                        230 -
                        (
                            (
                                item.valor -
                                menor
                            ) /
                            faixa
                        ) *
                        190;


                    return `${x},${y}`;

                }
            ).join(" ");


        return `

            <div class="grid-line"></div>
            <div class="grid-line"></div>
            <div class="grid-line"></div>
            <div class="grid-line"></div>
            <div class="grid-line"></div>


            <svg
                viewBox="0 0 700 260"
                preserveAspectRatio="none"
            >

                <polyline
                    points="${pontos}"
                />

            </svg>


            <div class="chart-months">

                ${
                    dados
                        .map(
                            item =>
                                `<span>${item.mes}</span>`
                        )
                        .join("")
                }

            </div>
        `;

    }


    // =====================================================
    // FAZENDAS
    // =====================================================

    function renderFazendas() {

        const fazendas =
            DB.get(KEY.fazendas);


        dashboardContent.innerHTML = `

            ${cabecalho(
                "🌾 Fazendas",
                "Cadastre e gerencie suas propriedades."
            )}


            <section class="dashboard-card">

                <div class="section-header">

                    <div>

                        <h2>
                            Minhas fazendas
                        </h2>

                        <p>
                            ${fazendas.length} cadastrada(s)
                        </p>

                    </div>


                    <button
                        class="btn-primary"
                        onclick="gepNovaFazenda()"
                    >
                        + Nova Fazenda
                    </button>

                </div>


                <div id="formFazenda"></div>


                <div
                    style="
                        margin-top:20px;
                        overflow:auto;
                    "
                >

                    <table
                        style="
                            width:100%;
                            min-width:700px;
                            border-collapse:collapse;
                        "
                    >

                        <thead>

                            <tr>

                                <th>Fazenda</th>
                                <th>Local</th>
                                <th>Área</th>
                                <th>Responsável</th>
                                <th>Ações</th>

                            </tr>

                        </thead>


                        <tbody>

                            ${
                                fazendas.length
                                ?

                                fazendas.map(
                                    f => `

                                        <tr>

                                            <td>
                                                ${escapar(f.nome)}
                                            </td>

                                            <td>
                                                ${escapar(f.local)}
                                            </td>

                                            <td>
                                                ${numero(f.area)} ha
                                            </td>

                                            <td>
                                                ${escapar(
                                                    f.responsavel
                                                )}
                                            </td>

                                            <td>

                                                <button
                                                    onclick="gepEditarFazenda(${f.id})"
                                                >
                                                    ✏️
                                                </button>

                                                <button
                                                    onclick="gepExcluirFazenda(${f.id})"
                                                >
                                                    🗑️
                                                </button>

                                            </td>

                                        </tr>

                                    `
                                ).join("")

                                :

                                `

                                    <tr>

                                        <td
                                            colspan="5"
                                            style="
                                                padding:50px;
                                                text-align:center;
                                            "
                                        >
                                            Nenhuma fazenda.
                                        </td>

                                    </tr>

                                `
                            }

                        </tbody>

                    </table>

                </div>

            </section>

        `;

    }


    function formularioFazenda(
        fazenda = null
    ) {

        const f =
            fazenda || {};


        return `

            <div
                style="
                    margin-top:20px;
                    padding:22px;
                    background:#f8fafc;
                    border-radius:12px;
                "
            >

                <h3>
                    ${
                        fazenda
                        ? "Editar Fazenda"
                        : "Nova Fazenda"
                    }
                </h3>


                <form
                    onsubmit="gepSalvarFazenda(event)"
                    style="margin-top:18px;"
                >

                    <input
                        type="hidden"
                        id="fazendaId"
                        value="${f.id || ""}"
                    >


                    <div
                        style="
                            display:grid;
                            grid-template-columns:
                                repeat(
                                    auto-fit,
                                    minmax(200px,1fr)
                                );
                            gap:15px;
                        "
                    >

                        <div>

                            <label>
                                Nome da fazenda
                            </label>

                            <input
                                id="fazendaNome"
                                value="${escapar(f.nome || "")}"
                                required
                                style="width:100%;"
                            >

                        </div>


                        <div>

                            <label>
                                Localização
                            </label>

                            <input
                                id="fazendaLocal"
                                value="${escapar(f.local || "")}"
                                required
                                style="width:100%;"
                            >

                        </div>


                        <div>

                            <label>
                                Área (ha)
                            </label>

                            <input
                                type="number"
                                id="fazendaArea"
                                value="${f.area || ""}"
                                required
                                style="width:100%;"
                            >

                        </div>


                        <div>

                            <label>
                                Responsável
                            </label>

                            <input
                                id="fazendaResponsavel"
                                value="${escapar(
                                    f.responsavel || ""
                                )}"
                                required
                                style="width:100%;"
                            >

                        </div>

                    </div>


                    <button
                        type="submit"
                        class="btn-primary"
                        style="
                            margin-top:20px;
                            border:0;
                        "
                    >
                        💾 Salvar
                    </button>

                </form>

            </div>
        `;

    }


    window.gepNovaFazenda =
        function () {

            document.getElementById(
                "formFazenda"
            ).innerHTML =
                formularioFazenda();

        };


    window.gepSalvarFazenda =
        function (event) {

            event.preventDefault();


            const fazendas =
                DB.get(KEY.fazendas);


            const idAtual =
                document.getElementById(
                    "fazendaId"
                ).value;


            const fazenda = {

                id:
                    idAtual
                    ? Number(idAtual)
                    : novoId(),

                nome:
                    document
                        .getElementById(
                            "fazendaNome"
                        )
                        .value.trim(),

                local:
                    document
                        .getElementById(
                            "fazendaLocal"
                        )
                        .value.trim(),

                area:
                    Number(
                        document
                            .getElementById(
                                "fazendaArea"
                            )
                            .value
                    ),

                responsavel:
                    document
                        .getElementById(
                            "fazendaResponsavel"
                        )
                        .value.trim()

            };


            if (idAtual) {

                const indice =
                    fazendas.findIndex(
                        f =>
                            f.id ===
                            fazenda.id
                    );


                if (indice >= 0) {

                    fazendas[indice] =
                        fazenda;

                }

            } else {

                fazendas.push(
                    fazenda
                );

            }


            DB.set(
                KEY.fazendas,
                fazendas
            );


            renderFazendas();

        };


    window.gepEditarFazenda =
        function (id) {

            const fazenda =
                DB.get(
                    KEY.fazendas
                ).find(
                    f => f.id === id
                );


            if (!fazenda) return;


            document.getElementById(
                "formFazenda"
            ).innerHTML =
                formularioFazenda(
                    fazenda
                );

        };


    window.gepExcluirFazenda =
        function (id) {

            if (
                !confirm(
                    "Excluir esta fazenda?"
                )
            ) return;


            DB.set(
                KEY.fazendas,
                DB.get(KEY.fazendas)
                    .filter(
                        f =>
                            f.id !== id
                    )
            );


            renderFazendas();

        };


    // =====================================================
    // LOTES
    // =====================================================

    function renderLotes() {

        const lotes =
            DB.get(KEY.lotes);

        const fazendas =
            DB.get(KEY.fazendas);


        dashboardContent.innerHTML = `

            ${cabecalho(
                "🐂 Lotes",
                "Gerencie os lotes da sua operação."
            )}


            <section class="dashboard-card">

                <div class="section-header">

                    <div>

                        <h2>
                            Lotes
                        </h2>

                        <p>
                            ${lotes.length} lote(s)
                        </p>

                    </div>


                    <button
                        class="btn-primary"
                        onclick="gepNovoLote()"
                    >
                        + Novo Lote
                    </button>

                </div>


                <div id="formLote"></div>


                <div
                    style="
                        margin-top:20px;
                        overflow:auto;
                    "
                >

                    <table
                        style="
                            width:100%;
                            min-width:900px;
                            border-collapse:collapse;
                        "
                    >

                        <thead>

                            <tr>

                                <th>Lote</th>
                                <th>Fazenda</th>
                                <th>Categoria</th>
                                <th>Animais</th>
                                <th>Peso</th>
                                <th>GMD</th>
                                <th>Ação</th>

                            </tr>

                        </thead>


                        <tbody>

                            ${
                                lotes.length

                                ?

                                lotes.map(
                                    l => {

                                        const fazenda =
                                            fazendas.find(
                                                f =>
                                                    f.id ===
                                                    l.fazendaId
                                            );


                                        return `

                                            <tr>

                                                <td>
                                                    ${escapar(
                                                        l.nome
                                                    )}
                                                </td>

                                                <td>
                                                    ${escapar(
                                                        fazenda?.nome ||
                                                        "-"
                                                    )}
                                                </td>

                                                <td>
                                                    ${escapar(
                                                        l.categoria
                                                    )}
                                                </td>

                                                <td>
                                                    ${numero(
                                                        l.quantidade,
                                                        0
                                                    )}
                                                </td>

                                                <td>
                                                    ${numero(
                                                        l.pesoMedio
                                                    )} kg
                                                </td>

                                                <td>
                                                    ${numero(
                                                        l.gmd,
                                                        3
                                                    )}
                                                </td>

                                                <td>

                                                    <button
                                                        onclick="gepEditarLote(${l.id})"
                                                    >
                                                        ✏️
                                                    </button>

                                                    <button
                                                        onclick="gepExcluirLote(${l.id})"
                                                    >
                                                        🗑️
                                                    </button>

                                                </td>

                                            </tr>

                                        `;

                                    }
                                ).join("")

                                :

                                `
                                    <tr>

                                        <td
                                            colspan="7"
                                            style="
                                                padding:50px;
                                                text-align:center;
                                            "
                                        >
                                            Nenhum lote.
                                        </td>

                                    </tr>
                                `
                            }

                        </tbody>

                    </table>

                </div>

            </section>
        `;

    }


    function formularioLote(
        lote = null
    ) {

        const l =
            lote || {};


        const fazendas =
            DB.get(KEY.fazendas);


        if (!fazendas.length) {

            return `
                <div
                    style="
                        margin-top:20px;
                        padding:20px;
                        background:#fff7ed;
                        border-radius:10px;
                    "
                >
                    Cadastre uma fazenda primeiro.
                </div>
            `;

        }


        return `

            <div
                style="
                    margin-top:20px;
                    padding:22px;
                    background:#f8fafc;
                    border-radius:12px;
                "
            >

                <h3>
                    ${lote ? "Editar lote" : "Novo lote"}
                </h3>


                <form
                    onsubmit="gepSalvarLote(event)"
                >

                    <input
                        type="hidden"
                        id="loteId"
                        value="${l.id || ""}"
                    >


                    <div
                        style="
                            display:grid;
                            grid-template-columns:
                                repeat(
                                    auto-fit,
                                    minmax(180px,1fr)
                                );
                            gap:15px;
                            margin-top:18px;
                        "
                    >

                        <div>

                            <label>
                                Fazenda
                            </label>

                            <select
                                id="loteFazenda"
                                required
                                style="width:100%;"
                            >

                                <option value="">
                                    Selecione
                                </option>

                                ${
                                    fazendas.map(
                                        f => `

                                            <option
                                                value="${f.id}"
                                                ${
                                                    Number(
                                                        l.fazendaId
                                                    ) ===
                                                    Number(
                                                        f.id
                                                    )
                                                        ? "selected"
                                                        : ""
                                                }
                                            >
                                                ${escapar(
                                                    f.nome
                                                )}
                                            </option>

                                        `
                                    ).join("")
                                }

                            </select>

                        </div>


                        <div>

                            <label>
                                Nome
                            </label>

                            <input
                                id="loteNome"
                                value="${escapar(
                                    l.nome || ""
                                )}"
                                required
                                style="width:100%;"
                            >

                        </div>


                        <div>

                            <label>
                                Categoria
                            </label>

                            <select
                                id="loteCategoria"
                                style="width:100%;"
                            >

                                ${
                                    [
                                        "Cria",
                                        "Recria",
                                        "Engorda",
                                        "Vacas",
                                        "Touros",
                                        "Misto"
                                    ]
                                    .map(
                                        categoria => `

                                            <option
                                                ${
                                                    l.categoria ===
                                                    categoria
                                                        ? "selected"
                                                        : ""
                                                }
                                            >
                                                ${categoria}
                                            </option>

                                        `
                                    )
                                    .join("")
                                }

                            </select>

                        </div>


                        ${campoNumerico(
                            "Quantidade",
                            "loteQuantidade",
                            l.quantidade || ""
                        )}


                        ${campoNumerico(
                            "Peso médio (kg)",
                            "lotePeso",
                            l.pesoMedio || ""
                        )}


                        ${campoNumerico(
                            "GMD (kg/dia)",
                            "loteGmd",
                            l.gmd || ""
                        )}

                    </div>


                    <button
                        type="submit"
                        class="btn-primary"
                        style="
                            margin-top:20px;
                            border:0;
                        "
                    >
                        💾 Salvar lote
                    </button>

                </form>

            </div>

        `;

    }


    window.gepNovoLote =
        function () {

            document.getElementById(
                "formLote"
            ).innerHTML =
                formularioLote();

        };


    window.gepSalvarLote =
        function (event) {

            event.preventDefault();


            const lotes =
                DB.get(KEY.lotes);


            const idAtual =
                document.getElementById(
                    "loteId"
                ).value;


            const lote = {

                id:
                    idAtual
                    ? Number(idAtual)
                    : novoId(),

                fazendaId:
                    Number(
                        document.getElementById(
                            "loteFazenda"
                        ).value
                    ),

                nome:
                    document.getElementById(
                        "loteNome"
                    ).value.trim(),

                categoria:
                    document.getElementById(
                        "loteCategoria"
                    ).value,

                quantidade:
                    Number(
                        document.getElementById(
                            "loteQuantidade"
                        ).value
                    ),

                pesoMedio:
                    Number(
                        document.getElementById(
                            "lotePeso"
                        ).value || 0
                    ),

                gmd:
                    Number(
                        document.getElementById(
                            "loteGmd"
                        ).value || 0
                    )

            };


            if (idAtual) {

                const indice =
                    lotes.findIndex(
                        l =>
                            l.id ===
                            lote.id
                    );


                if (indice >= 0) {

                    lotes[indice] =
                        lote;

                }

            } else {

                lotes.push(
                    lote
                );

            }


            DB.set(
                KEY.lotes,
                lotes
            );


            renderLotes();

        };


    window.gepEditarLote =
        function (id) {

            const lote =
                DB.get(
                    KEY.lotes
                ).find(
                    l =>
                        l.id === id
                );


            if (!lote) return;


            document.getElementById(
                "formLote"
            ).innerHTML =
                formularioLote(lote);

        };


    window.gepExcluirLote =
        function (id) {

            if (
                !confirm(
                    "Excluir este lote?"
                )
            ) return;


            DB.set(
                KEY.lotes,
                DB.get(KEY.lotes)
                    .filter(
                        l =>
                            l.id !== id
                    )
            );


            renderLotes();

        };


    // =====================================================
    // ANIMAIS
    // =====================================================

    function renderAnimais() {

        const animais =
            DB.get(KEY.animais);

        const lotes =
            DB.get(KEY.lotes);


        dashboardContent.innerHTML = `

            ${cabecalho(
                "🐄 Animais",
                "Cadastro individual e acompanhamento."
            )}


            <section class="dashboard-card">

                <div class="section-header">

                    <div>

                        <h2>
                            Animais
                        </h2>

                        <p>
                            ${animais.length} cadastrado(s)
                        </p>

                    </div>


                    <button
                        class="btn-primary"
                        onclick="gepNovoAnimal()"
                    >
                        + Novo animal
                    </button>

                </div>


                <div id="formAnimal"></div>


                <div
                    style="
                        margin-top:20px;
                        overflow:auto;
                    "
                >

                    <table
                        style="
                            width:100%;
                            min-width:1000px;
                            border-collapse:collapse;
                        "
                    >

                        <thead>

                            <tr>

                                <th>Brinco</th>
                                <th>Lote</th>
                                <th>Sexo</th>
                                <th>Raça</th>
                                <th>Nascimento</th>
                                <th>Peso atual</th>
                                <th>Ações</th>

                            </tr>

                        </thead>


                        <tbody>

                            ${
                                animais.length

                                ?

                                animais.map(
                                    animal => {

                                        const lote =
                                            lotes.find(
                                                l =>
                                                    l.id ===
                                                    animal.loteId
                                            );


                                        return `

                                            <tr>

                                                <td>
                                                    ${escapar(
                                                        animal.brinco
                                                    )}
                                                </td>

                                                <td>
                                                    ${escapar(
                                                        lote?.nome ||
                                                        "-"
                                                    )}
                                                </td>

                                                <td>
                                                    ${escapar(
                                                        animal.sexo
                                                    )}
                                                </td>

                                                <td>
                                                    ${escapar(
                                                        animal.raca
                                                    )}
                                                </td>

                                                <td>
                                                    ${dataBR(
                                                        animal.nascimento
                                                    )}
                                                </td>

                                                <td>
                                                    ${numero(
                                                        animal.pesoAtual ||
                                                        animal.pesoInicial ||
                                                        0
                                                    )} kg
                                                </td>

                                                <td>

                                                    <button
                                                        onclick="gepEditarAnimal(${animal.id})"
                                                    >
                                                        ✏️
                                                    </button>

                                                    <button
                                                        onclick="gepExcluirAnimal(${animal.id})"
                                                    >
                                                        🗑️
                                                    </button>

                                                </td>

                                            </tr>

                                        `;

                                    }
                                ).join("")

                                :

                                `
                                    <tr>
                                        <td
                                            colspan="7"
                                            style="
                                                padding:50px;
                                                text-align:center;
                                            "
                                        >
                                            Nenhum animal.
                                        </td>
                                    </tr>
                                `
                            }

                        </tbody>

                    </table>

                </div>

            </section>

        `;

    }


    function formularioAnimal(
        animal = null
    ) {

        const a =
            animal || {};


        const lotes =
            DB.get(KEY.lotes);


        if (!lotes.length) {

            return `
                <div
                    style="
                        margin-top:20px;
                        padding:20px;
                        background:#fff7ed;
                        border-radius:10px;
                    "
                >
                    Cadastre um lote primeiro.
                </div>
            `;

        }


        return `

            <div
                style="
                    margin-top:20px;
                    padding:22px;
                    background:#f8fafc;
                    border-radius:12px;
                "
            >

                <h3>
                    ${animal ? "Editar animal" : "Novo animal"}
                </h3>


                <form
                    onsubmit="gepSalvarAnimal(event)"
                >

                    <input
                        type="hidden"
                        id="animalId"
                        value="${a.id || ""}"
                    >


                    <div
                        style="
                            display:grid;
                            grid-template-columns:
                                repeat(
                                    auto-fit,
                                    minmax(180px,1fr)
                                );
                            gap:15px;
                            margin-top:18px;
                        "
                    >

                        <div>

                            <label>
                                Brinco
                            </label>

                            <input
                                id="animalBrinco"
                                value="${escapar(
                                    a.brinco || ""
                                )}"
                                required
                                style="width:100%;"
                            >

                        </div>


                        <div>

                            <label>
                                Lote
                            </label>

                            <select
                                id="animalLote"
                                required
                                style="width:100%;"
                            >

                                <option value="">
                                    Selecione
                                </option>

                                ${
                                    lotes.map(
                                        lote => `

                                        <option
                                            value="${lote.id}"
                                            ${
                                                Number(
                                                    a.loteId
                                                ) ===
                                                Number(
                                                    lote.id
                                                )
                                                    ? "selected"
                                                    : ""
                                            }
                                        >
                                            ${escapar(
                                                lote.nome
                                            )}
                                        </option>

                                    `
                                    ).join("")
                                }

                            </select>

                        </div>


                        <div>

                            <label>
                                Sexo
                            </label>

                            <select
                                id="animalSexo"
                                style="width:100%;"
                            >

                                <option
                                    ${
                                        a.sexo === "Fêmea"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Fêmea
                                </option>

                                <option
                                    ${
                                        a.sexo === "Macho"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Macho
                                </option>

                            </select>

                        </div>


                        <div>

                            <label>
                                Raça
                            </label>

                            <input
                                id="animalRaca"
                                value="${escapar(
                                    a.raca || ""
                                )}"
                                style="width:100%;"
                            >

                        </div>


                        <div>

                            <label>
                                Nascimento
                            </label>

                            <input
                                type="date"
                                id="animalNascimento"
                                value="${
                                    a.nascimento || ""
                                }"
                                style="width:100%;"
                            >

                        </div>


                        ${campoNumerico(
                            "Peso inicial (kg)",
                            "animalPesoInicial",
                            a.pesoInicial || ""
                        )}

                    </div>


                    <button
                        type="submit"
                        class="btn-primary"
                        style="
                            margin-top:20px;
                            border:0;
                        "
                    >
                        💾 Salvar animal
                    </button>

                </form>

            </div>

        `;

    }


    window.gepNovoAnimal =
        function () {

            document.getElementById(
                "formAnimal"
            ).innerHTML =
                formularioAnimal();

        };


    window.gepSalvarAnimal =
        function (event) {

            event.preventDefault();


            const animais =
                DB.get(KEY.animais);


            const idAtual =
                document.getElementById(
                    "animalId"
                ).value;


            const pesoInicial =
                Number(
                    document.getElementById(
                        "animalPesoInicial"
                    ).value || 0
                );


            const animal = {

                id:
                    idAtual
                    ? Number(idAtual)
                    : novoId(),

                brinco:
                    document.getElementById(
                        "animalBrinco"
                    ).value.trim(),

                loteId:
                    Number(
                        document.getElementById(
                            "animalLote"
                        ).value
                    ),

                sexo:
                    document.getElementById(
                        "animalSexo"
                    ).value,

                raca:
                    document.getElementById(
                        "animalRaca"
                    ).value.trim(),

                nascimento:
                    document.getElementById(
                        "animalNascimento"
                    ).value,

                pesoInicial:
                    pesoInicial,

                pesoAtual:
                    pesoInicial

            };


            if (idAtual) {

                const indice =
                    animais.findIndex(
                        a =>
                            a.id ===
                            animal.id
                    );


                if (indice >= 0) {

                    animais[indice] =
                        animal;

                }

            } else {

                animais.push(
                    animal
                );

            }


            DB.set(
                KEY.animais,
                animais
            );


            renderAnimais();

        };


    window.gepEditarAnimal =
        function (id) {

            const animal =
                DB.get(
                    KEY.animais
                ).find(
                    a =>
                        a.id === id
                );


            if (!animal) return;


            document.getElementById(
                "formAnimal"
            ).innerHTML =
                formularioAnimal(
                    animal
                );

        };


    window.gepExcluirAnimal =
        function (id) {

            if (
                !confirm(
                    "Excluir este animal?"
                )
            ) return;


            DB.set(
                KEY.animais,
                DB.get(KEY.animais)
                    .filter(
                        a =>
                            a.id !== id
                    )
            );


            DB.set(
                KEY.pesagens,
                DB.get(KEY.pesagens)
                    .filter(
                        p =>
                            p.animalId !== id
                    )
            );


            renderAnimais();

        };


    // =====================================================
    // PESAGENS
    // =====================================================

    function renderPesagens() {

        const animais =
            DB.get(KEY.animais);

        const pesagens =
            DB.get(KEY.pesagens);


        dashboardContent.innerHTML = `

            ${cabecalho(
                "⚖️ Pesagens",
                "Registre e acompanhe a evolução do peso."
            )}


            <section class="dashboard-card">

                ${
                    animais.length

                    ?

                    `

                    <h2>
                        Nova pesagem
                    </h2>


                    <form
                        onsubmit="gepSalvarPesagem(event)"
                        style="margin-top:20px;"
                    >

                        <div
                            style="
                                display:grid;
                                grid-template-columns:
                                    repeat(
                                        auto-fit,
                                        minmax(200px,1fr)
                                    );
                                gap:15px;
                            "
                        >

                            <div>

                                <label>
                                    Animal
                                </label>

                                <select
                                    id="pesagemAnimal"
                                    required
                                    style="width:100%;"
                                >

                                    <option value="">
                                        Selecione
                                    </option>

                                    ${
                                        animais.map(
                                            animal => `

                                                <option
                                                    value="${animal.id}"
                                                >
                                                    ${escapar(
                                                        animal.brinco
                                                    )}
                                                </option>

                                            `
                                        ).join("")
                                    }

                                </select>

                            </div>


                            <div>

                                <label>
                                    Data
                                </label>

                                <input
                                    type="date"
                                    id="pesagemData"
                                    value="${hoje()}"
                                    required
                                    style="width:100%;"
                                >

                            </div>


                            ${campoNumerico(
                                "Peso (kg)",
                                "pesagemPeso"
                            )}

                        </div>


                        <button
                            type="submit"
                            class="btn-primary"
                            style="
                                margin-top:20px;
                                border:0;
                            "
                        >
                            ⚖️ Registrar
                        </button>

                    </form>

                    `

                    :

                    `
                        <div
                            style="
                                padding:30px;
                                background:#fff7ed;
                                border-radius:10px;
                            "
                        >
                            Cadastre animais antes de lançar pesagens.
                        </div>
                    `
                }

            </section>


            <section class="dashboard-card">

                <h2>
                    Histórico
                </h2>


                <div
                    style="
                        margin-top:20px;
                        overflow:auto;
                    "
                >

                    <table
                        style="
                            width:100%;
                            min-width:900px;
                            border-collapse:collapse;
                        "
                    >

                        <thead>

                            <tr>

                                <th>Animal</th>
                                <th>Data</th>
                                <th>Peso</th>
                                <th>Anterior</th>
                                <th>Ganho</th>
                                <th>GMD</th>
                                <th>Ação</th>

                            </tr>

                        </thead>


                        <tbody>

                            ${
                                pesagens.length

                                ?

                                pesagens
                                    .slice()
                                    .sort(
                                        (a,b) =>
                                            b.data.localeCompare(
                                                a.data
                                            )
                                    )
                                    .map(
                                        p => {

                                            const animal =
                                                animais.find(
                                                    a =>
                                                        a.id ===
                                                        p.animalId
                                                );


                                            return `

                                                <tr>

                                                    <td>
                                                        ${escapar(
                                                            animal?.brinco ||
                                                            "-"
                                                        )}
                                                    </td>

                                                    <td>
                                                        ${dataBR(
                                                            p.data
                                                        )}
                                                    </td>

                                                    <td>
                                                        ${numero(
                                                            p.peso
                                                        )} kg
                                                    </td>

                                                    <td>
                                                        ${
                                                            p.pesoAnterior === null
                                                                ? "-"
                                                                : `${numero(
                                                                    p.pesoAnterior
                                                                )} kg`
                                                        }
                                                    </td>

                                                    <td>
                                                        ${
                                                            p.ganho === null
                                                                ? "-"
                                                                : `${numero(
                                                                    p.ganho
                                                                )} kg`
                                                        }
                                                    </td>

                                                    <td>
                                                        ${
                                                            p.gmd === null
                                                                ? "-"
                                                                : `${numero(
                                                                    p.gmd,
                                                                    3
                                                                )} kg/dia`
                                                        }
                                                    </td>

                                                    <td>

                                                        <button
                                                            onclick="gepExcluirPesagem(${p.id})"
                                                        >
                                                            🗑️
                                                        </button>

                                                    </td>

                                                </tr>

                                            `;

                                        }
                                    )
                                    .join("")

                                :

                                `
                                    <tr>

                                        <td
                                            colspan="7"
                                            style="
                                                padding:50px;
                                                text-align:center;
                                            "
                                        >
                                            Nenhuma pesagem registrada.
                                        </td>

                                    </tr>
                                `
                            }

                        </tbody>

                    </table>

                </div>

            </section>

        `;

    }


    window.gepSalvarPesagem =
        function (event) {

            event.preventDefault();


            const animalId =
                Number(
                    document.getElementById(
                        "pesagemAnimal"
                    ).value
                );


            const data =
                document.getElementById(
                    "pesagemData"
                ).value;


            const peso =
                Number(
                    document.getElementById(
                        "pesagemPeso"
                    ).value
                );


            const pesagens =
                DB.get(KEY.pesagens);


            const anteriores =
                pesagens
                    .filter(
                        p =>
                            p.animalId === animalId &&
                            p.data < data
                    )
                    .sort(
                        (a,b) =>
                            b.data.localeCompare(
                                a.data
                            )
                    );


            const anterior =
                anteriores[0] || null;


            let ganho = null;
            let gmd = null;


            if (anterior) {

                const dias =
                    Math.max(
                        1,
                        (
                            new Date(data) -
                            new Date(anterior.data)
                        ) /
                        86400000
                    );


                ganho =
                    peso -
                    Number(
                        anterior.peso
                    );


                gmd =
                    ganho /
                    dias;

            }


            pesagens.push({

                id:
                    novoId(),

                animalId:
                    animalId,

                data:
                    data,

                peso:
                    peso,

                pesoAnterior:
                    anterior
                        ? Number(
                            anterior.peso
                        )
                        : null,

                ganho:
                    ganho,

                gmd:
                    gmd

            });


            DB.set(
                KEY.pesagens,
                pesagens
            );


            const animais =
                DB.get(KEY.animais);


            const atualizados =
                animais.map(
                    animal => {

                        if (
                            animal.id ===
                            animalId
                        ) {

                            return {
                                ...animal,
                                pesoAtual: peso
                            };

                        }

                        return animal;

                    }
                );


            DB.set(
                KEY.animais,
                atualizados
            );


            renderPesagens();

        };


    window.gepExcluirPesagem =
        function (id) {

            if (
                !confirm(
                    "Excluir esta pesagem?"
                )
            ) return;


            DB.set(
                KEY.pesagens,
                DB.get(KEY.pesagens)
                    .filter(
                        p =>
                            p.id !== id
                    )
            );


            renderPesagens();

        };


    // =====================================================
    // FINANCEIRO
    // =====================================================

    function renderFinanceiro() {

        const lancamentos =
            DB.get(KEY.lancamentos);


        const receitas =
            lancamentos
                .filter(
                    l => l.tipo === "receita"
                )
                .reduce(
                    (s,l) =>
                        s + Number(l.valor || 0),
                    0
                );


        const despesas =
            lancamentos
                .filter(
                    l => l.tipo === "despesa"
                )
                .reduce(
                    (s,l) =>
                        s + Number(l.valor || 0),
                    0
                );


        dashboardContent.innerHTML = `

            ${cabecalho(
                "💰 Receitas e despesas",
                "Controle financeiro da operação."
            )}


            <section class="dashboard-card">

                <h2>
                    Novo lançamento
                </h2>


                <form
                    onsubmit="gepSalvarLancamento(event)"
                    style="margin-top:20px;"
                >

                    <div
                        style="
                            display:grid;
                            grid-template-columns:
                                repeat(
                                    auto-fit,
                                    minmax(180px,1fr)
                                );
                            gap:15px;
                        "
                    >

                        <div>

                            <label>
                                Tipo
                            </label>

                            <select
                                id="financeTipo"
                                style="width:100%;"
                            >

                                <option value="despesa">
                                    Despesa
                                </option>

                                <option value="receita">
                                    Receita
                                </option>

                            </select>

                        </div>


                        <div>

                            <label>
                                Data
                            </label>

                            <input
                                type="date"
                                id="financeData"
                                value="${hoje()}"
                                required
                                style="width:100%;"
                            >

                        </div>


                        <div>

                            <label>
                                Categoria
                            </label>

                            <select
                                id="financeCategoria"
                                style="width:100%;"
                            >

                                <option>
                                    Alimentação
                                </option>

                                <option>
                                    Medicamentos
                                </option>

                                <option>
                                    Mão de obra
                                </option>

                                <option>
                                    Combustível
                                </option>

                                <option>
                                    Compra de animais
                                </option>

                                <option>
                                    Venda de animais
                                </option>

                                <option>
                                    Outros
                                </option>

                            </select>

                        </div>


                        ${campoNumerico(
                            "Valor",
                            "financeValor"
                        )}

                    </div>


                    <div style="margin-top:15px;">

                        <label>
                            Descrição
                        </label>

                        <input
                            id="financeDescricao"
                            required
                            style="width:100%;"
                        >

                    </div>


                    <button
                        type="submit"
                        class="btn-primary"
                        style="
                            margin-top:20px;
                            border:0;
                        "
                    >
                        + Lançar
                    </button>

                </form>

            </section>


            <section class="cards">

                ${card(
                    "💚",
                    "Receitas",
                    moeda(receitas),
                    "acumulado"
                )}

                ${card(
                    "🔴",
                    "Despesas",
                    moeda(despesas),
                    "acumulado"
                )}

                ${card(
                    "📊",
                    "Resultado",
                    moeda(
                        receitas - despesas
                    ),
                    "saldo"
                )}

            </section>


            <section class="dashboard-card">

                <h2>
                    Lançamentos
                </h2>


                <div
                    style="
                        margin-top:20px;
                        overflow:auto;
                    "
                >

                    <table
                        style="
                            width:100%;
                            min-width:800px;
                            border-collapse:collapse;
                        "
                    >

                        <thead>

                            <tr>

                                <th>Data</th>
                                <th>Tipo</th>
                                <th>Descrição</th>
                                <th>Categoria</th>
                                <th>Valor</th>
                                <th>Ação</th>

                            </tr>

                        </thead>


                        <tbody>

                            ${
                                lancamentos.length

                                ?

                                lancamentos
                                    .slice()
                                    .sort(
                                        (a,b) =>
                                            b.data.localeCompare(
                                                a.data
                                            )
                                    )
                                    .map(
                                        l => `

                                        <tr>

                                            <td>
                                                ${dataBR(
                                                    l.data
                                                )}
                                            </td>

                                            <td>
                                                ${
                                                    l.tipo ===
                                                    "receita"
                                                        ? "🟢 Receita"
                                                        : "🔴 Despesa"
                                                }
                                            </td>

                                            <td>
                                                ${escapar(
                                                    l.descricao
                                                )}
                                            </td>

                                            <td>
                                                ${escapar(
                                                    l.categoria
                                                )}
                                            </td>

                                            <td>
                                                ${moeda(
                                                    l.valor
                                                )}
                                            </td>

                                            <td>

                                                <button
                                                    onclick="gepExcluirLancamento(${l.id})"
                                                >
                                                    🗑️
                                                </button>

                                            </td>

                                        </tr>

                                    `
                                    )
                                    .join("")

                                :

                                `

                                    <tr>

                                        <td
                                            colspan="6"
                                            style="
                                                padding:50px;
                                                text-align:center;
                                            "
                                        >
                                            Nenhum lançamento.
                                        </td>

                                    </tr>

                                `
                            }

                        </tbody>

                    </table>

                </div>

            </section>

        `;

    }


    window.gepSalvarLancamento =
        function (event) {

            event.preventDefault();


            const lancamentos =
                DB.get(
                    KEY.lancamentos
                );


            lancamentos.push({

                id:
                    novoId(),

                tipo:
                    document.getElementById(
                        "financeTipo"
                    ).value,

                data:
                    document.getElementById(
                        "financeData"
                    ).value,

                categoria:
                    document.getElementById(
                        "financeCategoria"
                    ).value,

                valor:
                    Number(
                        document.getElementById(
                            "financeValor"
                        ).value
                    ),

                descricao:
                    document.getElementById(
                        "financeDescricao"
                    ).value.trim()

            });


            DB.set(
                KEY.lancamentos,
                lancamentos
            );


            renderFinanceiro();

        };


    window.gepExcluirLancamento =
        function (id) {

            if (
                !confirm(
                    "Excluir este lançamento?"
                )
            ) return;


            DB.set(
                KEY.lancamentos,
                DB.get(
                    KEY.lancamentos
                ).filter(
                    l =>
                        l.id !== id
                )
            );


            renderFinanceiro();

        };


    // =====================================================
    // VENDA
    // =====================================================

    function renderVendas() {

        const vendas =
            DB.get(KEY.vendas);


        const fazendas =
            DB.get(KEY.fazendas);


        const animais =
            DB.get(KEY.animais);


        const lotes =
            DB.get(KEY.lotes);


        const totalVendas =
            vendas.reduce(
                (s,v) =>
                    s +
                    Number(v.valorTotal || 0),
                0
            );


        dashboardContent.innerHTML = `

            ${cabecalho(
                "💵 Vendas",
                "Registre as vendas e acompanhe o faturamento."
            )}


            <section class="dashboard-card">

                <h2>
                    Nova venda
                </h2>


                <form
                    onsubmit="gepSalvarVenda(event)"
                    style="margin-top:20px;"
                >

                    <div
                        style="
                            display:grid;
                            grid-template-columns:
                                repeat(
                                    auto-fit,
                                    minmax(180px,1fr)
                                );
                            gap:15px;
                        "
                    >

                        <div>

                            <label>
                                Data
                            </label>

                            <input
                                type="date"
                                id="vendaData"
                                value="${hoje()}"
                                required
                                style="width:100%;"
                            >

                        </div>


                        <div>

                            <label>
                                Fazenda
                            </label>

                            <select
                                id="vendaFazenda"
                                required
                                style="width:100%;"
                            >

                                <option value="">
                                    Selecione
                                </option>

                                ${
                                    fazendas.map(
                                        f => `

                                        <option
                                            value="${f.id}"
                                        >
                                            ${escapar(f.nome)}
                                        </option>

                                    `
                                    ).join("")
                                }

                            </select>

                        </div>


                        <div>

                            <label>
                                Lote
                            </label>

                            <select
                                id="vendaLote"
                                style="width:100%;"
                            >

                                <option value="">
                                    Venda geral
                                </option>

                                ${
                                    lotes.map(
                                        l => `

                                        <option
                                            value="${l.id}"
                                        >
                                            ${escapar(l.nome)}
                                        </option>

                                    `
                                    ).join("")
                                }

                            </select>

                        </div>


                        ${campoNumerico(
                            "Quantidade",
                            "vendaQuantidade"
                        )}


                        ${campoNumerico(
                            "Peso médio (kg)",
                            "vendaPesoMedio"
                        )}


                        ${campoNumerico(
                            "Valor total",
                            "vendaValor"
                        )}

                    </div>


                    <div style="margin-top:15px;">

                        <label>
                            Comprador / destino
                        </label>

                        <input
                            id="vendaComprador"
                            style="width:100%;"
                        >

                    </div>


                    <button
                        type="submit"
                        class="btn-primary"
                        style="
                            margin-top:20px;
                            border:0;
                        "
                    >
                        💵 Registrar venda
                    </button>

                </form>

            </section>


            <section class="cards">

                ${card(
                    "💵",
                    "Vendas",
                    moeda(totalVendas),
                    `${vendas.length} operação(ões)`
                )}

                ${card(
                    "🐄",
                    "Animais vendidos",
                    numero(
                        vendas.reduce(
                            (s,v) =>
                                s +
                                Number(v.quantidade || 0),
                            0
                        ),
                        0
                    ),
                    "total"
                )}

            </section>


            <section class="dashboard-card">

                <h2>
                    Histórico de vendas
                </h2>


                <div
                    style="
                        margin-top:20px;
                        overflow:auto;
                    "
                >

                    <table
                        style="
                            width:100%;
                            min-width:900px;
                            border-collapse:collapse;
                        "
                    >

                        <thead>

                            <tr>

                                <th>Data</th>
                                <th>Fazenda</th>
                                <th>Lote</th>
                                <th>Qtd.</th>
                                <th>Peso</th>
                                <th>Valor</th>
                                <th>Ação</th>

                            </tr>

                        </thead>


                        <tbody>

                            ${
                                vendas.length

                                ?

                                vendas
                                    .slice()
                                    .sort(
                                        (a,b) =>
                                            b.data.localeCompare(
                                                a.data
                                            )
                                    )
                                    .map(
                                        venda => {

                                            const fazenda =
                                                fazendas.find(
                                                    f =>
                                                        f.id ===
                                                        venda.fazendaId
                                                );


                                            const lote =
                                                lotes.find(
                                                    l =>
                                                        l.id ===
                                                        venda.loteId
                                                );


                                            return `

                                                <tr>

                                                    <td>
                                                        ${dataBR(
                                                            venda.data
                                                        )}
                                                    </td>

                                                    <td>
                                                        ${escapar(
                                                            fazenda?.nome ||
                                                            "-"
                                                        )}
                                                    </td>

                                                    <td>
                                                        ${escapar(
                                                            lote?.nome ||
                                                            "-"
                                                        )}
                                                    </td>

                                                    <td>
                                                        ${numero(
                                                            venda.quantidade,
                                                            0
                                                        )}
                                                    </td>

                                                    <td>
                                                        ${numero(
                                                            venda.pesoMedio
                                                        )} kg
                                                    </td>

                                                    <td>
                                                        ${moeda(
                                                            venda.valorTotal
                                                        )}
                                                    </td>

                                                    <td>

                                                        <button
                                                            onclick="gepExcluirVenda(${venda.id})"
                                                        >
                                                            🗑️
                                                        </button>

                                                    </td>

                                                </tr>

                                            `;

                                        }
                                    )
                                    .join("")

                                :

                                `

                                    <tr>

                                        <td
                                            colspan="7"
                                            style="
                                                padding:50px;
                                                text-align:center;
                                            "
                                        >
                                            Nenhuma venda.
                                        </td>

                                    </tr>

                                `
                            }

                        </tbody>

                    </table>

                </div>

            </section>

        `;

    }


    window.gepSalvarVenda =
        function (event) {

            event.preventDefault();


            const vendas =
                DB.get(KEY.vendas);


            const venda = {

                id:
                    novoId(),

                data:
                    document.getElementById(
                        "vendaData"
                    ).value,

                fazendaId:
                    Number(
                        document.getElementById(
                            "vendaFazenda"
                        ).value
                    ),

                loteId:
                    Number(
                        document.getElementById(
                            "vendaLote"
                        ).value
                    ) || null,

                quantidade:
                    Number(
                        document.getElementById(
                            "vendaQuantidade"
                        ).value
                    ),

                pesoMedio:
                    Number(
                        document.getElementById(
                            "vendaPesoMedio"
                        ).value
                    ),

                valorTotal:
                    Number(
                        document.getElementById(
                            "vendaValor"
                        ).value
                    ),

                comprador:
                    document.getElementById(
                        "vendaComprador"
                    ).value.trim()

            };


            vendas.push(venda);


            DB.set(
                KEY.vendas,
                vendas
            );


            // Gera receita automaticamente
            if (venda.valorTotal > 0) {

                const lancamentos =
                    DB.get(
                        KEY.lancamentos
                    );


                lancamentos.push({

                    id:
                        novoId(),

                    tipo:
                        "receita",

                    data:
                        venda.data,

                    categoria:
                        "Venda de animais",

                    descricao:
                        `Venda de ${
                            venda.quantidade
                        } animal(is)`,

                    valor:
                        venda.valorTotal

                });


                DB.set(
                    KEY.lancamentos,
                    lancamentos
                );

            }


            renderVendas();

        };


    window.gepExcluirVenda =
        function (id) {

            if (
                !confirm(
                    "Excluir esta venda?"
                )
            ) return;


            DB.set(
                KEY.vendas,
                DB.get(KEY.vendas)
                    .filter(
                        v =>
                            v.id !== id
                    )
            );


            renderVendas();

        };


    // =====================================================
    // COMPRAS
    // =====================================================

    function renderCompras() {

        const compras =
            DB.get(KEY.compras);


        const fazendas =
            DB.get(KEY.fazendas);


        dashboardContent.innerHTML = `

            ${cabecalho(
                "🐄 Compra de animais",
                "Registre as compras realizadas."
            )}


            <section class="dashboard-card">

                <form
                    onsubmit="gepSalvarCompra(event)"
                >

                    <div
                        style="
                            display:grid;
                            grid-template-columns:
                                repeat(
                                    auto-fit,
                                    minmax(180px,1fr)
                                );
                            gap:15px;
                        "
                    >

                        <div>

                            <label>
                                Data
                            </label>

                            <input
                                type="date"
                                id="compraData"
                                value="${hoje()}"
                                required
                                style="width:100%;"
                            >

                        </div>


                        <div>

                            <label>
                                Fazenda
                            </label>

                            <select
                                id="compraFazenda"
                                required
                                style="width:100%;"
                            >

                                <option value="">
                                    Selecione
                                </option>

                                ${
                                    fazendas.map(
                                        f => `

                                            <option
                                                value="${f.id}"
                                            >
                                                ${escapar(f.nome)}
                                            </option>

                                        `
                                    ).join("")
                                }

                            </select>

                        </div>


                        ${campoNumerico(
                            "Quantidade",
                            "compraQtd",
                            1
                        )}


                        ${campoNumerico(
                            "Peso médio",
                            "compraPeso",
                            350
                        )}


                        ${campoNumerico(
                            "Valor total",
                            "compraValor",
                            0
                        )}

                    </div>


                    <button
                        type="submit"
                        class="btn-primary"
                        style="
                            margin-top:20px;
                            border:0;
                        "
                    >
                        Registrar compra
                    </button>

                </form>

            </section>


            <section class="dashboard-card">

                <h2>
                    Histórico
                </h2>


                <div
                    style="
                        overflow:auto;
                        margin-top:20px;
                    "
                >

                    <table
                        style="
                            width:100%;
                            min-width:700px;
                            border-collapse:collapse;
                        "
                    >

                        <thead>

                            <tr>

                                <th>Data</th>
                                <th>Fazenda</th>
                                <th>Quantidade</th>
                                <th>Peso</th>
                                <th>Valor</th>
                                <th>Ação</th>

                            </tr>

                        </thead>


                        <tbody>

                            ${
                                compras.length
                                ?

                                compras.map(
                                    compra => {

                                        const fazenda =
                                            fazendas.find(
                                                f =>
                                                    f.id ===
                                                    compra.fazendaId
                                            );


                                        return `

                                            <tr>

                                                <td>
                                                    ${dataBR(
                                                        compra.data
                                                    )}
                                                </td>

                                                <td>
                                                    ${escapar(
                                                        fazenda?.nome ||
                                                        "-"
                                                    )}
                                                </td>

                                                <td>
                                                    ${numero(
                                                        compra.quantidade,
                                                        0
                                                    )}
                                                </td>

                                                <td>
                                                    ${numero(
                                                        compra.peso
                                                    )} kg
                                                </td>

                                                <td>
                                                    ${moeda(
                                                        compra.valor
                                                    )}
                                                </td>

                                                <td>

                                                    <button
                                                        onclick="gepExcluirCompra(${compra.id})"
                                                    >
                                                        🗑️
                                                    </button>

                                                </td>

                                            </tr>

                                        `;

                                    }
                                ).join("")

                                :

                                `

                                    <tr>

                                        <td
                                            colspan="6"
                                            style="
                                                padding:50px;
                                                text-align:center;
                                            "
                                        >
                                            Nenhuma compra.
                                        </td>

                                    </tr>

                                `
                            }

                        </tbody>

                    </table>

                </div>

            </section>

        `;

    }


    window.gepSalvarCompra =
        function (event) {

            event.preventDefault();


            const compras =
                DB.get(
                    KEY.compras
                );


            const compra = {

                id:
                    novoId(),

                data:
                    document.getElementById(
                        "compraData"
                    ).value,

                fazendaId:
                    Number(
                        document.getElementById(
                            "compraFazenda"
                        ).value
                    ),

                quantidade:
                    Number(
                        document.getElementById(
                            "compraQtd"
                        ).value
                    ),

                peso:
                    Number(
                        document.getElementById(
                            "compraPeso"
                        ).value
                    ),

                valor:
                    Number(
                        document.getElementById(
                            "compraValor"
                        ).value
                    )

            };


            compras.push(
                compra
            );


            DB.set(
                KEY.compras,
                compras
            );


            if (compra.valor > 0) {

                const lancamentos =
                    DB.get(
                        KEY.lancamentos
                    );


                lancamentos.push({

                    id:
                        novoId(),

                    tipo:
                        "despesa",

                    data:
                        compra.data,

                    categoria:
                        "Compra de animais",

                    descricao:
                        `Compra de ${
                            compra.quantidade
                        } animal(is)`,

                    valor:
                        compra.valor

                });


                DB.set(
                    KEY.lancamentos,
                    lancamentos
                );

            }


            renderCompras();

        };


    window.gepExcluirCompra =
        function (id) {

            if (
                !confirm(
                    "Excluir esta compra?"
                )
            ) return;


            DB.set(
                KEY.compras,
                DB.get(KEY.compras)
                    .filter(
                        c =>
                            c.id !== id
                    )
            );


            renderCompras();

        };


    // =====================================================
    // RESULTADOS
    // =====================================================

    function renderResultados() {

        const animais =
            DB.get(KEY.animais);

        const pesagens =
            DB.get(KEY.pesagens);

        const lancamentos =
            DB.get(KEY.lancamentos);

        const vendas =
            DB.get(KEY.vendas);


        const receitas =
            lancamentos
                .filter(
                    l =>
                        l.tipo ===
                        "receita"
                )
                .reduce(
                    (s,l) =>
                        s +
                        Number(
                            l.valor || 0
                        ),
                    0
                );


        const despesas =
            lancamentos
                .filter(
                    l =>
                        l.tipo ===
                        "despesa"
                )
                .reduce(
                    (s,l) =>
                        s +
                        Number(
                            l.valor || 0
                        ),
                    0
                );


        const resultado =
            receitas -
            despesas;


        const pesoTotal =
            animais.reduce(
                (s,a) =>
                    s +
                    Number(
                        a.pesoAtual ||
                        a.pesoInicial ||
                        0
                    ),
                0
            );


        const pesoMedio =
            animais.length
                ? pesoTotal / animais.length
                : 0;


        const totalVendido =
            vendas.reduce(
                (s,v) =>
                    s +
                    Number(
                        v.quantidade || 0
                    ),
                0
            );


        const kgVendido =
            vendas.reduce(
                (s,v) =>
                    s +
                    (
                        Number(
                            v.quantidade || 0
                        ) *
                        Number(
                            v.pesoMedio || 0
                        )
                    ),
                0
            );


        const custoPorKg =
            kgVendido > 0
                ? despesas / kgVendido
                : 0;


        const margem =
            receitas > 0
                ? (
                    resultado /
                    receitas
                ) * 100
                : 0;


        dashboardContent.innerHTML = `

            ${cabecalho(
                "📊 Resultados",
                "Indicadores econômicos e produtivos."
            )}


            <section class="cards">

                ${card(
                    "💰",
                    "Receitas",
                    moeda(receitas),
                    "acumulado"
                )}


                ${card(
                    "💸",
                    "Despesas",
                    moeda(despesas),
                    "acumulado"
                )}


                ${card(
                    "📈",
                    "Resultado",
                    moeda(resultado),
                    `Margem ${numero(margem)}%`
                )}


                ${card(
                    "🐄",
                    "Animais vendidos",
                    numero(
                        totalVendido,
                        0
                    ),
                    `${numero(
                        kgVendido
                    )} kg vendidos`
                )}

            </section>


            <section class="cards">

                ${card(
                    "⚖️",
                    "Peso médio",
                    `${numero(
                        pesoMedio
                    )} kg`,
                    "estoque atual"
                )}


                ${card(
                    "💵",
                    "Valor médio/kg",
                    moeda(
                        kgVendido
                            ? (
                                vendas.reduce(
                                    (s,v) =>
                                        s +
                                        Number(
                                            v.valorTotal ||
                                            0
                                        ),
                                    0
                                ) /
                                kgVendido
                            )
                            : 0
                    ),
                    "vendas"
                )}


                ${card(
                    "📉",
                    "Custo/kg",
                    moeda(
                        custoPorKg
                    ),
                    "baseado em vendas"
                )}


                ${card(
                    "⚖️",
                    "Pesagens",
                    numero(
                        pesagens.length,
                        0
                    ),
                    "registradas"
                )}

            </section>


            <section class="dashboard-card">

                <h2>
                    Resumo operacional
                </h2>


                <div
                    style="
                        margin-top:20px;
                        overflow:auto;
                    "
                >

                    <table
                        style="
                            width:100%;
                            min-width:650px;
                            border-collapse:collapse;
                        "
                    >

                        <thead>

                            <tr>

                                <th>
                                    Indicador
                                </th>

                                <th>
                                    Valor
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            <tr>
                                <td>Receita</td>
                                <td>${moeda(receitas)}</td>
                            </tr>

                            <tr>
                                <td>Despesa</td>
                                <td>${moeda(despesas)}</td>
                            </tr>

                            <tr>
                                <td>Resultado</td>
                                <td>${moeda(resultado)}</td>
                            </tr>

                            <tr>
                                <td>Margem</td>
                                <td>${numero(margem)}%</td>
                            </tr>

                            <tr>
                                <td>Animais</td>
                                <td>${numero(animais.length,0)}</td>
                            </tr>

                            <tr>
                                <td>Peso médio</td>
                                <td>${numero(pesoMedio)} kg</td>
                            </tr>

                        </tbody>

                    </table>

                </div>

            </section>

        `;

    }


    // =====================================================
    // SIMULADOR
    // =====================================================

    function renderSimulador() {

        dashboardContent.innerHTML = `

            ${cabecalho(
                "🧮 Simulador",
                "Simule compra, engorda e venda."
            )}


            <section class="dashboard-card">

                <form
                    onsubmit="gepCalcularSimulador(event)"
                >

                    <div
                        style="
                            display:grid;
                            grid-template-columns:
                                repeat(
                                    auto-fit,
                                    minmax(180px,1fr)
                                );
                            gap:15px;
                        "
                    >

                        ${campoNumerico(
                            "Quantidade",
                            "simQtd",
                            100
                        )}

                        ${campoNumerico(
                            "Peso inicial (kg)",
                            "simInicial",
                            350
                        )}

                        ${campoNumerico(
                            "Peso final (kg)",
                            "simFinal",
                            500
                        )}

                        ${campoNumerico(
                            "Dias",
                            "simDias",
                            150
                        )}

                        ${campoNumerico(
                            "Compra/animal",
                            "simCompra",
                            2500
                        )}

                        ${campoNumerico(
                            "Custo diário/animal",
                            "simCusto",
                            8
                        )}

                        ${campoNumerico(
                            "Preço da arroba",
                            "simArroba",
                            300
                        )}

                    </div>


                    <button
                        type="submit"
                        class="btn-primary"
                        style="
                            margin-top:20px;
                            border:0;
                        "
                    >
                        🧮 Calcular
                    </button>

                </form>


                <div
                    id="resultadoSim"
                    style="margin-top:20px;"
                ></div>

            </section>

        `;

    }


    window.gepCalcularSimulador =
        function (event) {

            event.preventDefault();


            const qtd =
                Number(
                    document.getElementById(
                        "simQtd"
                    ).value
                );


            const inicial =
                Number(
                    document.getElementById(
                        "simInicial"
                    ).value
                );


            const final =
                Number(
                    document.getElementById(
                        "simFinal"
                    ).value
                );


            const dias =
                Number(
                    document.getElementById(
                        "simDias"
                    ).value
                );


            const compra =
                Number(
                    document.getElementById(
                        "simCompra"
                    ).value
                );


            const custo =
                Number(
                    document.getElementById(
                        "simCusto"
                    ).value
                );


            const arroba =
                Number(
                    document.getElementById(
                        "simArroba"
                    ).value
                );


            const ganho =
                final - inicial;


            const gmd =
                dias > 0
                    ? ganho / dias
                    : 0;


            const investimento =
                qtd * compra;


            const custoEngorda =
                qtd *
                custo *
                dias;


            const custoTotal =
                investimento +
                custoEngorda;


            const receita =
                qtd *
                (final / 30) *
                arroba;


            const lucro =
                receita -
                custoTotal;


            const margem =
                receita > 0
                    ? (
                        lucro /
                        receita
                    ) * 100
                    : 0;


            document.getElementById(
                "resultadoSim"
            ).innerHTML = `

                <div class="cards">

                    ${card(
                        "📈",
                        "GMD",
                        `${numero(gmd,3)} kg/dia`,
                        "ganho médio"
                    )}


                    ${card(
                        "💰",
                        "Custo",
                        moeda(custoTotal),
                        "total"
                    )}


                    ${card(
                        "💵",
                        "Receita",
                        moeda(receita),
                        "estimada"
                    )}


                    ${card(
                        "📊",
                        "Lucro",
                        moeda(lucro),
                        `Margem ${numero(margem)}%`
                    )}

                </div>

            `;

        };


    // =====================================================
    // TAXA DE LOTAÇÃO
    // =====================================================

    function renderLotacao() {

        dashboardContent.innerHTML = `

            ${cabecalho(
                "📐 Taxa de lotação",
                "Calcule animais/ha e UA/ha."
            )}


            <section class="dashboard-card">

                <form
                    onsubmit="gepCalcularLotacao(event)"
                >

                    <div
                        style="
                            display:grid;
                            grid-template-columns:
                                repeat(
                                    auto-fit,
                                    minmax(200px,1fr)
                                );
                            gap:15px;
                        "
                    >

                        ${campoNumerico(
                            "Área utilizada (ha)",
                            "lotArea",
                            100
                        )}

                        ${campoNumerico(
                            "Animais",
                            "lotAnimais",
                            100
                        )}

                        ${campoNumerico(
                            "Peso médio (kg)",
                            "lotPeso",
                            400
                        )}

                    </div>


                    <button
                        class="btn-primary"
                        type="submit"
                        style="
                            margin-top:20px;
                            border:0;
                        "
                    >
                        📐 Calcular
                    </button>

                </form>


                <div id="resultadoLot"></div>

            </section>

        `;

    }


    window.gepCalcularLotacao =
        function (event) {

            event.preventDefault();


            const area =
                Number(
                    document.getElementById(
                        "lotArea"
                    ).value
                );


            const animais =
                Number(
                    document.getElementById(
                        "lotAnimais"
                    ).value
                );


            const peso =
                Number(
                    document.getElementById(
                        "lotPeso"
                    ).value
                );


            const animaisHa =
                area > 0
                    ? animais / area
                    : 0;


            const uaPorAnimal =
                peso / 450;


            const uaHa =
                area > 0
                    ? (
                        animais *
                        uaPorAnimal
                    ) / area
                    : 0;


            document.getElementById(
                "resultadoLot"
            ).innerHTML = `

                <div class="cards">

                    ${card(
                        "🐂",
                        "Animais/ha",
                        numero(animaisHa),
                        "animais por hectare"
                    )}

                    ${card(
                        "📐",
                        "UA/ha",
                        numero(uaHa),
                        "1 UA = 450 kg"
                    )}

                    ${card(
                        "⚖️",
                        "Peso total",
                        `${numero(
                            animais * peso
                        )} kg`,
                        "peso vivo"
                    )}

                </div>

            `;

        };


    // =====================================================
    // RELATÓRIOS
    // =====================================================

    function renderRelatorios() {

        const fazendas =
            DB.get(KEY.fazendas);

        const lotes =
            DB.get(KEY.lotes);

        const animais =
            DB.get(KEY.animais);

        const pesagens =
            DB.get(KEY.pesagens);

        const vendas =
            DB.get(KEY.vendas);

        const compras =
            DB.get(KEY.compras);


        const receitas =
            DB.get(KEY.lancamentos)
                .filter(
                    l =>
                        l.tipo === "receita"
                )
                .reduce(
                    (s,l) =>
                        s +
                        Number(
                            l.valor || 0
                        ),
                    0
                );


        const despesas =
            DB.get(KEY.lancamentos)
                .filter(
                    l =>
                        l.tipo === "despesa"
                )
                .reduce(
                    (s,l) =>
                        s +
                        Number(
                            l.valor || 0
                        ),
                    0
                );


        const resultado =
            receitas -
            despesas;


        dashboardContent.innerHTML = `

            ${cabecalho(
                "📑 Relatórios",
                "Resumo geral da operação."
            )}


            <section class="cards">

                ${card(
                    "🌾",
                    "Fazendas",
                    numero(fazendas.length,0),
                    "cadastradas"
                )}

                ${card(
                    "🐂",
                    "Lotes",
                    numero(lotes.length,0),
                    "cadastrados"
                )}

                ${card(
                    "🐄",
                    "Animais",
                    numero(animais.length,0),
                    "cadastrados"
                )}

                ${card(
                    "⚖️",
                    "Pesagens",
                    numero(pesagens.length,0),
                    "registradas"
                )}

            </section>


            <section class="cards">

                ${card(
                    "🐄",
                    "Compras",
                    numero(compras.length,0),
                    "operações"
                )}

                ${card(
                    "💵",
                    "Vendas",
                    numero(vendas.length,0),
                    "operações"
                )}

                ${card(
                    "💰",
                    "Receita",
                    moeda(receitas),
                    "total"
                )}

                ${card(
                    "📊",
                    "Resultado",
                    moeda(resultado),
                    "saldo"
                )}

            </section>


            <section class="dashboard-card">

                <div class="section-header">

                    <div>

                        <h2>
                            Relatório consolidado
                        </h2>

                        <p>
                            Resumo atual do sistema
                        </p>

                    </div>


                    <button
                        onclick="window.print()"
                    >
                        🖨️ Imprimir
                    </button>

                </div>


                <table
                    style="
                        width:100%;
                        border-collapse:collapse;
                        margin-top:20px;
                    "
                >

                    <tbody>

                        <tr>
                            <td>Fazendas</td>
                            <td>${fazendas.length}</td>
                        </tr>

                        <tr>
                            <td>Lotes</td>
                            <td>${lotes.length}</td>
                        </tr>

                        <tr>
                            <td>Animais</td>
                            <td>${animais.length}</td>
                        </tr>

                        <tr>
                            <td>Pesagens</td>
                            <td>${pesagens.length}</td>
                        </tr>

                        <tr>
                            <td>Compras</td>
                            <td>${compras.length}</td>
                        </tr>

                        <tr>
                            <td>Vendas</td>
                            <td>${vendas.length}</td>
                        </tr>

                        <tr>
                            <td>Receitas</td>
                            <td>${moeda(receitas)}</td>
                        </tr>

                        <tr>
                            <td>Despesas</td>
                            <td>${moeda(despesas)}</td>
                        </tr>

                        <tr>
                            <td>Resultado</td>
                            <td>
                                <strong>
                                    ${moeda(resultado)}
                                </strong>
                            </td>
                        </tr>

                    </tbody>

                </table>

            </section>

        `;

    }


    // =====================================================
    // CONFIGURAÇÕES
    // =====================================================

    function renderConfiguracoes() {

        const usuario =
            usuarioAtual();


        dashboardContent.innerHTML = `

            ${cabecalho(
                "⚙️ Configurações",
                "Gerencie perfil e dados locais."
            )}


            <section class="dashboard-card">

                <h2>
                    Meu perfil
                </h2>


                <form
                    onsubmit="gepSalvarPerfil(event)"
                    style="margin-top:20px;"
                >

                    <div
                        style="
                            display:grid;
                            grid-template-columns:
                                repeat(
                                    auto-fit,
                                    minmax(220px,1fr)
                                );
                            gap:15px;
                        "
                    >

                        <div>

                            <label>
                                Nome
                            </label>

                            <input
                                id="perfilNome"
                                value="${escapar(
                                    usuario?.name || ""
                                )}"
                                required
                                style="width:100%;"
                            >

                        </div>


                        <div>

                            <label>
                                Usuário
                            </label>

                            <input
                                id="perfilUsuario"
                                value="${escapar(
                                    usuario?.user || ""
                                )}"
                                required
                                style="width:100%;"
                            >

                        </div>


                        <div>

                            <label>
                                E-mail
                            </label>

                            <input
                                id="perfilEmail"
                                value="${escapar(
                                    usuario?.email || ""
                                )}"
                                required
                                style="width:100%;"
                            >

                        </div>


                        <div>

                            <label>
                                Nova senha
                            </label>

                            <input
                                type="password"
                                id="perfilSenha"
                                style="width:100%;"
                            >

                        </div>

                    </div>


                    <button
                        type="submit"
                        class="btn-primary"
                        style="
                            margin-top:20px;
                            border:0;
                        "
                    >
                        💾 Salvar
                    </button>

                </form>

            </section>


            <section class="dashboard-card">

                <h2>
                    Backup
                </h2>


                <div
                    style="
                        display:flex;
                        gap:10px;
                        margin-top:20px;
                        flex-wrap:wrap;
                    "
                >

                    <button
                        onclick="gepExportar()"
                    >
                        📥 Exportar
                    </button>


                    <button
                        onclick="gepImportar()"
                    >
                        📤 Importar
                    </button>

                </div>

            </section>

        `;

    }


    window.gepSalvarPerfil =
        function (event) {

            event.preventDefault();


            const usuario =
                usuarioAtual();


            if (!usuario) return;


            usuario.name =
                document
                    .getElementById(
                        "perfilNome"
                    )
                    .value.trim();


            usuario.user =
                document
                    .getElementById(
                        "perfilUsuario"
                    )
                    .value.trim();


            usuario.email =
                document
                    .getElementById(
                        "perfilEmail"
                    )
                    .value.trim();


            const senha =
                document
                    .getElementById(
                        "perfilSenha"
                    )
                    .value;


            if (senha) {

                usuario.password =
                    senha;

            }


            localStorage.setItem(
                "gepUser",
                JSON.stringify(usuario)
            );


            atualizarUsuario();


            renderConfiguracoes();

        };


    // =====================================================
    // BACKUP
    // =====================================================

    window.gepExportar =
        function () {

            const backup = {

                usuario:
                    usuarioAtual(),

                fazendas:
                    DB.get(KEY.fazendas),

                lotes:
                    DB.get(KEY.lotes),

                animais:
                    DB.get(KEY.animais),

                pesagens:
                    DB.get(KEY.pesagens),

                lancamentos:
                    DB.get(KEY.lancamentos),

                compras:
                    DB.get(KEY.compras),

                vendas:
                    DB.get(KEY.vendas)

            };


            const blob =
                new Blob(
                    [
                        JSON.stringify(
                            backup,
                            null,
                            2
                        )
                    ],
                    {
                        type:
                            "application/json"
                    }
                );


            const url =
                URL.createObjectURL(blob);


            const link =
                document.createElement(
                    "a"
                );


            link.href = url;


            link.download =
                `gep-backup-${hoje()}.json`;


            link.click();


            URL.revokeObjectURL(url);

        };


    window.gepImportar =
        function () {

            const input =
                document.createElement(
                    "input"
                );


            input.type = "file";
            input.accept = ".json";


            input.onchange =
                function () {

                    const file =
                        input.files[0];


                    if (!file) return;


                    const reader =
                        new FileReader();


                    reader.onload =
                        function () {

                            try {

                                const dados =
                                    JSON.parse(
                                        reader.result
                                    );


                                if (
                                    dados.usuario
                                ) {

                                    localStorage.setItem(
                                        "gepUser",
                                        JSON.stringify(
                                            dados.usuario
                                        )
                                    );

                                }


                                const chaves = [

                                    "fazendas",
                                    "lotes",
                                    "animais",
                                    "pesagens",
                                    "lancamentos",
                                    "compras",
                                    "vendas"

                                ];


                                chaves.forEach(
                                    chave => {

                                        if (
                                            dados[chave]
                                            !==
                                            undefined
                                        ) {

                                            DB.set(
                                                KEY[chave],
                                                dados[chave]
                                            );

                                        }

                                    }
                                );


                                alert(
                                    "Backup importado com sucesso."
                                );


                                abrirSistema();

                            } catch {

                                alert(
                                    "Arquivo inválido."
                                );

                            }

                        };


                    reader.readAsText(
                        file
                    );

                };


            input.click();

        };


    // =====================================================
    // LOGIN / LOGOUT
    // =====================================================

    window.showRegister =
        function () {

            loginPage.classList.add(
                "hidden"
            );

            registerPage.classList.remove(
                "hidden"
            );

        };


    window.showLogin =
        function () {

            registerPage.classList.add(
                "hidden"
            );

            loginPage.classList.remove(
                "hidden"
            );

        };


    window.forgotPassword =
        function () {

            alert(
                "A recuperação de senha será implementada na versão online."
            );

        };


    window.logout =
        function () {

            localStorage.removeItem(
                "gepLogged"
            );


            dashboardPage.classList.add(
                "hidden"
            );


            loginPage.classList.remove(
                "hidden"
            );

        };


    // =====================================================
    // INÍCIO
    // =====================================================

    if (
        localStorage.getItem(
            "gepLogged"
        ) === "true"
        &&
        usuarioAtual()
    ) {

        abrirSistema();

    }

});