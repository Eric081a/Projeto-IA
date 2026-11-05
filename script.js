
const dados = [
    { municipio: "Goiânia", doenca: "Dengue", anterior: 500, atual: 750 },
    { municipio: "Goiânia", doenca: "Zika", anterior: 30, atual: 20 },
    { municipio: "Goiânia", doenca: "Chikungunya", anterior: 80, atual: 100 },

    { municipio: "Anápolis", doenca: "Dengue", anterior: 300, atual: 450 },
    { municipio: "Anápolis", doenca: "Zika", anterior: 20, atual: 25 },
    { municipio: "Anápolis", doenca: "Chikungunya", anterior: 40, atual: 30 },

    { municipio: "Aparecida de Goiânia", doenca: "Dengue", anterior: 400, atual: 350 },
    { municipio: "Aparecida de Goiânia", doenca: "Zika", anterior: 15, atual: 10 },
    { municipio: "Aparecida de Goiânia", doenca: "Chikungunya", anterior: 50, atual: 75 }
];

const municipio = document.getElementById("municipio");
const doenca = document.getElementById("doenca");

const formatar = numero => numero.toLocaleString("pt-BR");

function atualizarPainel() {

    const municipioSelecionado = municipio.value;
    const doencaSelecionada = doenca.value;

    const filtrados = dados.filter(item => {

        const municipioOk =
            municipioSelecionado === "Todos" ||
            item.municipio === municipioSelecionado;

        const doencaOk =
            doencaSelecionada === "Todas" ||
            item.doenca === doencaSelecionada;

        return municipioOk && doencaOk;
    });

    const anterior = filtrados.reduce(
        (soma, item) => soma + item.anterior, 0
    );

    const atual = filtrados.reduce(
        (soma, item) => soma + item.atual, 0
    );

    const variacao = anterior > 0
        ? ((atual - anterior) / anterior) * 100
        : 0;

    const municipios = new Set(
        filtrados.map(item => item.municipio)
    );

    // Atualizar indicadores

    document.getElementById("casosAtuais").textContent =
        formatar(atual);

    document.getElementById("casosAnteriores").textContent =
        formatar(anterior);

    document.getElementById("variacao").textContent =
        variacao.toFixed(1).replace(".", ",") + "%";

    document.getElementById("totalMunicipios").textContent =
        municipios.size;

    // Mostrar resultado

    const resultado = document.getElementById("resultado");

    if (filtrados.length === 0) {
        resultado.textContent = "Nenhum registro encontrado.";
        desenharGrafico([]);
        return;
    }

    resultado.innerHTML = filtrados.map(item => `
        <div class="resultado-item">
            <strong>${item.municipio}</strong>
            <span>${item.doenca}</span>
            <p>Casos atuais: <b>${formatar(item.atual)}</b></p>
            <p>Casos anteriores: ${formatar(item.anterior)}</p>
        </div>
    `).join("");

    desenharGrafico(filtrados);
}

// Gráfico comparativo

function desenharGrafico(lista) {

    const canvas = document.getElementById("grafico");
    const ctx = canvas.getContext("2d");

    const largura = canvas.clientWidth;

    const altura = 300;
    const escala = window.devicePixelRatio || 1;

    canvas.width = largura * escala;
    canvas.height = altura * escala;

    ctx.setTransform(escala, 0, 0, escala, 0, 0);
    ctx.clearRect(0, 0, largura, altura);

    if (lista.length === 0) {
        ctx.fillStyle = "#64748b";
        ctx.font = "14px Arial";
        ctx.fillText("Nenhum dado para exibir.", 15, 30);
        return;
    }

    const maximo = Math.max(
        ...lista.flatMap(item => [item.anterior, item.atual]),
        1
    );

    const margem = 30;
    const larguraGrupo = (largura - margem * 2) / lista.length;
    const alturaMaxima = 190;

    lista.forEach((item, index) => {

        const x = margem + index * larguraGrupo;

        const hAnterior =
            (item.anterior / maximo) * alturaMaxima;

        const hAtual =
            (item.atual / maximo) * alturaMaxima;

        ctx.fillStyle = "#94a3b8";

        ctx.fillRect(
            x + larguraGrupo * 0.15,
            215 - hAnterior,
            larguraGrupo * 0.28,
            hAnterior
        );

        ctx.fillStyle = "#078568";

        ctx.fillRect(
            x + larguraGrupo * 0.52,
            215 - hAtual,
            larguraGrupo * 0.28,
            hAtual
        );

        ctx.fillStyle = "#263445";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";

        const nome = item.municipio.split(" ")[0];

        ctx.fillText(
            nome,
            x + larguraGrupo / 2,
            235
        );
    });
}

// Eventos dos filtros e botão

document.getElementById("consultar")
    .addEventListener("click", atualizarPainel);

municipio.addEventListener("change", atualizarPainel);
doenca.addEventListener("change", atualizarPainel);

window.addEventListener("resize", atualizarPainel);

// Carregar os dados iniciais

atualizarPainel();