import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaPg} from "@Prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.ts"

const { DATABASE_URL, PORT = 3000, FRONTEND_URL = "http://localhost:5173"} = process.env;

if (!DATABASE_URL){
    console.error("Erro: a variável DATABASE_URL não está definida no arquivo .env");
    process.exit(1);
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL});
const prisma = new PrismaClient ({adapter});

const app = express();
app.use(cors({ origin: FRONTEND_URL}));
app.use(express.json())

app.get("/pessoas", async (req, res, next) =>{
    try{
        const pessoas = await prisma.pessoa.findMany({ orderBy: {id: "asc"}});
        res.json(pessoas);
    }catch(erro) {
        next(erro);
    }
});

app.post("/pessoas", async (req, res, next) => {
    try{
     const { nome: nomeBruto, idade } = req.body ??{};
     const nome = String(nomeBruto ?? "").trim();

     if(!nome || nome.length > 100 ){
        return res.status(400).json({erro: "Nome inválido (1 a 100 caracteres)"});
     }
     if (!Number.isInteger(idade) || idade < 0 || idade > 110 ) {
        return res.status(400).json({erro: "Idade inválida (número inteiro de 0 a 110"});
     }
     const pessoa = await prisma.pessoa.create({data: {nome, idade } });
     res.status(201).json(pessoa);
    } catch(erro){
        next(erro);
    }
});


app.delete("/pessoas/:id", async (req, res, next) =>{
    try{
        const id = Number(req.params.id);

        if(!Number.isInteger(id)) {
            return res.status(400).json({ erro: "ID inválido. "});
        }
        await prisma.pessoa.delete({where: {id}});
        res.json({ok:true});
    } catch(erro){
        if (erro.code === "P2025") {
            return res.status(404).json({erro: "Pessoa não encontrada."});
        }
        next(erro);
    }
});

app.use((erro, req, res, next) => {
    console.error(erro);
    res.status(500).json({erro: "Erro interno do servidor"});
});

const servidor = app.listen(PORT, () => {
    console.log(`API rodando em http>//localhost:${PORT}`);
});

async function encerrar () {
    servidor.close();
    await prisma.$disconnect();
    process.exit(0);
}

process.on("SIGINT", encerrar);
process.on("SIGTERM", encerrar);