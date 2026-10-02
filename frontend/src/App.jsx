import { useState, useEffect } from "react";

const API = "http://localhost:3000";

export default function App() {
  const [pessoas, setPessoas ] = useState ([]);
  const [nome, setNome] = useState ("");
  const [idade, setIdade] = useState ("");
  const [erro, setErro] = useState ("");

  async function carregarPessoas(){
    try{
      const resposta = await fetch(`${API}/pessoas`);
      const dados = await resposta.json();
      setPessoas(dados);
    } catch {
      setErro("Não foi possível conectar à API. O back-end está rodando?");
    }
  }

  useEffect(() => {
    carregarPessoas();
  }, []);

  async function cadastrar(e) {
    e.preventDefault();
    setErro("");

    try{
      const resposta = await fetch(`${API}/pessoas`, {
        method: "POST",
        headers: {"Content-Type": "application/json" },
        body: JSON. stringify({ nome, idade: Number(idade) }),
      });
      
      if(!resposta.ok) {
        const dados = await resposta.json();
        setErro(dados.erro || "Erro ao cadastrar");
        return;
      }

      setNome("");
      setIdade("");
      carregarPessoas();
    } catch {
      setErro("Não foi possível conectar à API. O back-end está rodando?");
    }
  }

  async function deletar(id) {
    await fetch(`${API}/pessoas/${id}`, {method: "DELETE"});
    carregarPessoas();
  }

  return(
    <div>
      <h1>Cadastro de Pessoas</h1>

      <form onSubmit={cadastrar}>
        <input placeholder="Nome aqui"
        value={nome}
        onChange ={(e) => setNome(e.target.value)}
         />
         <input placeholder="Idade"
         type="number"
         value={idade}
         onChange={(e) => setIdade(e.target.value)}
          />
          <button tyoe="submit">Salvar</button>
      </form>

      {erro && <p>{erro}</p> }

      <ul>
        {pessoas.map((p) => (
          <li key={p.id}>
            {p.nome}, {p.idade} anos{" "}
            <button onClick={() => deletar(p.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}