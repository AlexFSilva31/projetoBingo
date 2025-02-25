let playerName = '';
let playerCartela = null;

document.getElementById("game-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  playerName = document.getElementById("player-name").value;

  if (playerName) {
    try {
      const response = await fetch('http://localhost:3001/cartela', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome: playerName })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar cartela');
      }

      playerCartela = await response.json();
      preencherCartela(playerCartela.numeros);
      
      document.getElementById("tela-inicial").style.display = "none";
      document.getElementById("tela-jogo").style.display = "block";
    } catch (error) {
      alert("Erro ao iniciar o jogo: " + error.message);
    }
  } else {
    alert("Por favor, insira seu nome antes de começar!");
  }
});

document.getElementById("sortear").addEventListener("click", async function () {
  try {
    const response = await fetch('http://localhost:3001/sortear');
    if (!response.ok) {
      throw new Error('Erro ao sortear número');
    }

    const data = await response.json();
    document.getElementById("numero-sorteado").innerText = data.numeroSorteado;
    document.getElementById("numeros-sorteados").innerText = data.numerosSorteados.join(", ");

    // Verifica se o número está na cartela e marca automaticamente
    if (playerCartela.numeros.includes(data.numeroSorteado)) {
      marcarNumero(data.numeroSorteado);
    }
  } catch (error) {
    alert("Erro ao sortear número: " + error.message);
  }
});

function marcarNumero(numero) {
  fetch('http://localhost:3001/marcar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nome: playerName, numero })
  })
  .then(response => response.json())
  .then(data => {
    if (data.ganhou) {
      alert("BINGO! Parabéns, você ganhou!");
    }
    destacarNumeroNaCartela(numero);
  })
  .catch(error => {
    console.error('Erro ao marcar número:', error);
  });
}

function preencherCartela(numeros) {
  const cells = document.querySelectorAll('#cartela-body td');
  cells.forEach((cell, index) => {
    cell.innerText = numeros[index];
    cell.addEventListener('click', () => {
      const numero = parseInt(cell.innerText);
      if (!isNaN(numero)) {
        marcarNumero(numero);
      }
    });
  });
}

function destacarNumeroNaCartela(numero) {
  const cells = document.querySelectorAll('#cartela-body td');
  cells.forEach(cell => {
    if (cell.innerText === numero.toString()) {
      cell.classList.add('marcado');
    }
  });
}

// Rota para criar uma nova cartela
app.post("/cartela", (req, res) => {
  const { nome } = req.body;
  const cartela = gerarCartela();
  cartelas.push({ nome, numeros: cartela, marcados: [] });
  res.json({ numeros: cartela });
});

// Rota para sortear um número
app.get("/sortear", (req, res) => {
  if (numerosSorteados.length < 75) {
    const numeroSorteado = numerosSorteados[numerosSorteados.length];
    res.json({ numeroSorteado, numerosSorteados });
  } else {
    res.status(400).json({ error: "Todos os números já foram sorteados" });
  }
});

// Rota para marcar um número na cartela
app.post("/marcar", (req, res) => {
  const { nome, numero } = req.body;
  const cartela = cartelas.find((cartela) => cartela.nome === nome);
  if (cartela) {
    if (cartela.numeros.includes(numero)) {
      cartela.marcados.push(numero);
      if (cartela.marcados.length === 25) {
        res.json({ ganhou: true });
      } else {
        res.json({ ganhou: false });
      }
    } else {
      res.status(400).json({ error: "Número não está na cartela" });
    }
  } else {
    res.status(404).json({ error: "Cartela não encontrada" });
  }
});

// Função para gerar uma cartela de bingo
function gerarCartela() {
  const cartela = [];
  while (cartela.length < 25) {
    const numero = Math.floor(Math.random() * 75) + 1;
    if (!cartela.includes(numero)) {
      cartela.push(numero);
    }
  }
  return cartela;
}

// Lista de cartelas
const cartelas = [];

// Lista de números sorteados
const numerosSorteados = [];

// Sortear números
while (numerosSorteados.length < 75) {
  let numeroSorteado;
  do {
    numeroSorteado = Math.floor(Math.random() * 75) + 1;
  } while (numerosSorteados.includes(numeroSorteado));
  numerosSorteados.push(numeroSorteado);
}

app.listen(3001, () => {
  console.log("Servidor iniciado na porta 3001");
});
