import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";


dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50kb" }));
app.use(express.static("."));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/ia", async (req, res) => {

    try {

        const { dados, pergunta } = req.body;

        if (!Array.isArray(dados) || dados.length === 0) {
            return res.status(400).json({
                erro: "Não existem dados para analisar."
            });
        }

        if (pergunta && typeof pergunta !== "string") {
            return res.status(400).json({
                erro: "Pergunta inválida."
            });
        }

        const dadosValidos = dados.every(item =>
            typeof item.municipio === "string" &&
            typeof item.doenca === "string" &&
            Number.isFinite(item.anterior) &&
            Number.isFinite(item.atual) &&
            item.anterior >= 0 &&
            item.atual >= 0
        );

        if (!dadosValidos) {
            return res.status(400).json({
                erro: "Formato de dados inválido."
            });
        }

        const instrucao = `
Você é o Assistente Inteligente do ArboAlerta GO.

Sua função é analisar dados epidemiológicos de:
- Dengue
- Zika
- Chikungunya

Analise os dados fornecidos e:
1. Identifique aumentos e reduções.
2. Compare os municípios.
3. Destaque situações que merecem atenção.
4. Explique os resultados em português simples.
5. Sugira ações de monitoramento e prevenção.

REGRAS IMPORTANTES:
- Utilize somente os dados recebidos.
- Não invente números ou informações.
- Não afirme que existe surto apenas pela variação percentual.
- Não faça diagnóstico médico.
- Não trate dados fictícios como dados oficiais.
- Informe limitações quando necessário.
- Suas recomendações são apoio à decisão,
  não substituem a vigilância epidemiológica.

Dados analisados:
${JSON.stringify(dados)}

Pergunta do usuário:
${pergunta || "Faça uma análise geral dos dados."}
`;

        const resposta = await openai.responses.create({
            model: "gpt-5.5",
            input: instrucao
        });

        res.json({
            resposta: resposta.output_text
        });

    } catch (erro) {

        console.error("Erro na IA:", erro.message);

        res.status(500).json({
            erro: "Não foi possível consultar a inteligência artificial. Verifique a configuração da API."
        });
    }
});

app.listen(PORT, () => {
    console.log(`ArboAlerta GO rodando em http://localhost:${PORT}`);
});
