app.get("/sortear", (req, res) => {
  const numeroSorteado = numerosSorteados.shift();
  res.json({ numeroSorteado, numerosSorteados });
});

app.post("/marcar", (req, res) => {
  const { nome, numero } = req.body;
  const costela = costelas.find((c) => c.nome === nome);
  if (costela) {
    costela.marcados.push(Number(numero));
    const ganhou = costela.marcados.length >= 25;
    res.json({ costela, ganhou });
  } else {
    res.status(404).json({ error: "Costela não encontrada" });
  }
});

app.listen(3001, () => {
  console.log("Servidor iniciado na porta 3001");
});
