const nome = document.getElementById("nome");
const peso = document.getElementById("peso");
const altura = document.getElementById("altura");
const btnCalcular = document.getElementById("btnCalcular");
const resultado = document.getElementById("resultado");
const listaPessoas = document.getElementById("listaPessoas");
const totalPessoas = document.getElementById("totalPessoas");

// Carrega a lista salva no navegador (se existir)
let pessoas = [];

try {
    pessoas = JSON.parse(localStorage.getItem("pessoasIMC")) || [];
} catch (erro) {
    pessoas = [];
}

function salvarPessoas() {
    try {
        localStorage.setItem("pessoasIMC", JSON.stringify(pessoas));
    } catch (erro) {
        // Se o navegador bloquear o armazenamento, o app continua funcionando
    }
}

// Evita que texto digitado vire HTML (segurança básica)
function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}

function classificar(imc) {
    if (imc < 18.5) return { texto: "Abaixo do peso", chave: "abaixo" };
    if (imc < 25) return { texto: "Peso adequado", chave: "adequado" };
    if (imc < 30) return { texto: "Sobrepeso", chave: "sobrepeso" };
    return { texto: "Obesidade", chave: "obesidade" };
}

// Barra colorida com um marcador na posição do IMC (escala de 15 a 40)
function gerarEscala(imc, mini) {
    const posicao = Math.min(Math.max(((imc - 15) / 25) * 100, 0), 100);

    return `
        <div class="escala ${mini ? "mini" : ""}">
            <div class="faixa abaixo"></div>
            <div class="faixa adequado"></div>
            <div class="faixa sobrepeso"></div>
            <div class="faixa obesidade"></div>
            <div class="marcador" data-posicao="${posicao}" style="left: 0%"></div>
        </div>
    `;
}

// Move os marcadores para o lugar certo (gera a animação de deslizar)
function animarMarcadores() {
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            document.querySelectorAll(".marcador").forEach(function (marcador) {
                marcador.style.left = marcador.dataset.posicao + "%";
            });
        });
    });
}

function mostrarErro(mensagem) {
    resultado.className = "resultado erro";
    resultado.innerHTML = `<p>${mensagem}</p>`;
}

function calcular() {
    const nomePessoa = nome.value.trim();
    const pesoPessoa = Number(peso.value);
    const alturaPessoa = Number(altura.value);

    if (nomePessoa === "" || pesoPessoa <= 0 || alturaPessoa <= 0) {
        mostrarErro("Preencha nome, peso e altura corretamente.");
        return;
    }

    const alturaMetros = alturaPessoa / 100;
    const imc = pesoPessoa / (alturaMetros * alturaMetros);
    const imcFormatado = imc.toFixed(2);
    const classe = classificar(imc);

    resultado.className = "resultado";
    resultado.innerHTML = `
        <h3>IMC: ${imcFormatado}</h3>
        <span class="classe" style="background-color: var(--${classe.chave})">
            ${classe.texto}
        </span>
        ${gerarEscala(imc, false)}
    `;

    pessoas.push({
        nome: nomePessoa,
        peso: pesoPessoa,
        altura: alturaMetros,
        imc: imcFormatado,
        classificacao: classe.texto,
        chave: classe.chave
    });

    salvarPessoas();
    mostrarPessoas();

    nome.value = "";
    peso.value = "";
    altura.value = "";
    nome.focus();
}

function mostrarPessoas() {
    if (pessoas.length === 0) {
        listaPessoas.innerHTML = `
            <div class="vazio">Nenhuma pessoa cadastrada ainda.</div>
        `;
    } else {
        // Monta tudo numa variável e escreve no DOM uma única vez
        let html = "";

        pessoas.forEach(function (pessoa, index) {
            html += `
                <div class="pessoa ${pessoa.chave}">

                    <div class="pessoa-topo">
                        <div>
                            <h3>${escaparHTML(pessoa.nome)}</h3>
                            <p class="pessoa-info">
                                Peso: ${pessoa.peso} kg | Altura: ${pessoa.altura.toFixed(2)} m
                            </p>
                        </div>

                        <button class="excluir" data-index="${index}">Excluir</button>
                    </div>

                    <div class="imc">
                        IMC: ${pessoa.imc}
                        <span>${pessoa.classificacao}</span>
                    </div>

                    ${gerarEscala(Number(pessoa.imc), true)}

                </div>
            `;
        });

        listaPessoas.innerHTML = html;
    }

    totalPessoas.textContent = pessoas.length;
    animarMarcadores();
}

function excluirPessoa(index) {
    pessoas.splice(index, 1);
    salvarPessoas();
    mostrarPessoas();
}

// Um único "ouvinte" para todos os botões Excluir da lista
listaPessoas.addEventListener("click", function (evento) {
    const botao = evento.target.closest(".excluir");

    if (botao) {
        excluirPessoa(Number(botao.dataset.index));
    }
});

btnCalcular.addEventListener("click", calcular);

// Apertar Enter em qualquer campo também calcula
[nome, peso, altura].forEach(function (campo) {
    campo.addEventListener("keydown", function (evento) {
        if (evento.key === "Enter") {
            calcular();
        }
    });
});

mostrarPessoas();
