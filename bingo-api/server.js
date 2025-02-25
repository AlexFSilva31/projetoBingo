const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Dados do jogo
let cartelas = []; // Armazena as cartelas dos jogadores
let numerosSorteados = []; // Armazena os números já sorteados

// Função para gerar uma cartela com 25 números únicos (1 a 75)
function gerarCartela() {
  const numeros = [];
  while (numeros.length < 25) {
    const numero = Math.floor(Math.random() * 75) + 1;
    if (!numeros.includes(numero)) {
      numeros.push(numero);
    }
  }
  return numeros;
}

// Rota para gerar uma nova cartela
app.post("/cartela", (req, res) => {
  const { nome } = req.body; // Recebe o nome do jogador
  if (!nome) {
    return res.status(400).json({ error: "Nome é obrigatório" });
  }

  const novaCartela = {
    nome,
    numeros: gerarCartela(),
    marcados: [], // Números marcados na cartela
  };

  cartelas.push(novaCartela);
  res.json(novaCartela);
});

// Rota para sortear um número
app.get("/sortear", (req, res) => {
  if (numerosSorteados.length >= 75) {
    return res
      .status(400)
      .json({ error: "Todos os números já foram sorteados" });
  }

  let numeroSorteado;
  do {
    numeroSorteado = Math.floor(Math.random() * 75) + 1;
  } while (numerosSorteados.includes(numeroSorteado));

  numerosSorteados.push(numeroSorteado);
  res.json({ numeroSorteado, numerosSorteados });
});

// Rota para marcar um número na cartela
app.post("/marcar", (req, res) => {
  const { nome, numero } = req.body;

  const cartela = cartelas.find((c) => c.nome === nome);
  if (!cartela) {
    return res.status(404).json({ error: "Cartela não encontrada" });
  }

  if (!cartela.numeros.includes(numero)) {
    return res.status(400).json({ error: "Número não está na cartela" });
  }

  if (!cartela.marcados.includes(numero)) {
    cartela.marcados.push(numero);
  }

  // Verificar se o jogador ganhou
  const ganhou = cartela.marcados.length === 25; // Bingo completo
  res.json({ cartela, ganhou });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
  