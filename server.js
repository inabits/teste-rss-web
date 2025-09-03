const express = require("express");
const Parser = require("rss-parser");

const app = express();
const parser = new Parser();

app.get("/rss", async (req, res) => {
    try {
        const url = req.query.url || "https://g1.globo.com/rss/g1/"; // url do rss

        const limit = 100; // limite máximo de itens

        const keyword = req.query.q ? req.query.q.toLowerCase() : null; // filtro

        const format = req.query.format || "html"; // abre no formato html

        const feed = await parser.parseURL(url);

        let items = feed.items.map(item => ({
            titulo: item.title,
            link: item.link,
            publicado: item.pubDate || null
        }));

        if (keyword) {
            items = items.filter(
                i =>
                    (i.titulo && i.titulo.toLowerCase().includes(keyword)) ||
                    (i.link && i.link.toLowerCase().includes(keyword)) ||
                    (i.resumo && i.resumo.toLowerCase().includes(keyword))
            );
        }

        items = items.slice(0, limit);

        if (format === "html") {
            let html = `
        <html lang="pt-BR">
            <head>
                <meta charset="utf-8">
                <title>${feed.title}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                        min-height: 100vh;
                        color: #333;
                        background: linear-gradient(135deg, #ffffff, #4a90e2);
                        background-attachment: fixed;
                    }

                    .centralizando {
                        margin-top: 60px;
                        width: 90%;
                        text-align: center;
                    }

                    .container {
                        margin: 0 auto;
                        padding: 20px;
                        max-width: 700px;
                    }

                    .titulo {
                        font-weight: bold;
                        background-color: #4a90e2; 
                        color: white;
                        padding: 15px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                    }

                    .card {
                        background: #f1f5ff;
                        padding: 30px;
                        border-radius: 12px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    }

                    .search-box {
                        display: flex;
                        align-items: center;
                        background: #ffffff;
                        border: 1px solid #235eff;
                        border-radius: 25px;
                        padding: 10px 15px;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.05);
                    }

                    .search-box input {
                        border: none;
                        outline: none;
                        flex: 1;
                        font-size: 16px;
                        padding-left: 10px;
                    }

                    .search-box .icon {
                        font-size: 18px;
                        color: #4a90e2;
                    }

                    .results {
                        margin-top: 25px;
                        text-align: left;
                    }

                    .results ul {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                    }

                    .results li {
                        background: #abceed;
                        margin-bottom: 10px;
                        padding: 12px;
                        border-radius: 8px;
                        border: 1px solid #000000;
                    }
                </style>
            </head>
            <body>
                <div class="centralizando">
                    <h1>${feed.title}</h1>
                    <h2>${feed.description}</h2>
                    <div class="container">
                        <div class="card">
                            <div class="search-box">
                                <input type="text" placeholder="Digite sua pesquisa...">
                            </div>
                            <div class="results">
                                <ul id="resultsList">
                                    ${items
                                        .map(
                                            i => `
                                        <li>
                                        <a href="${i.link}" target="_blank">${i.titulo}</a>
                                        ${i.publicado ? `<br><small>${i.publicado}</small>` : ""}
                                        </li>
                                    `
                                        )
                                        .join("")}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <script>
                    document.querySelector('.search-box input').addEventListener('keydown', function(e) {
                        if (e.key === 'Enter') {
                            const params = new URLSearchParams(window.location.search);
                            params.set('q', this.value);
                            window.location.search = params.toString();
                        }
                    });
                </script>
            </body>
        </html>
      `;
            res.send(html);
        } else {

            res.json({
                feed: feed.title,
                url: url,
                filtro: keyword || "nenhum",
                total: items.length,
                itens: items
            });
        }
    } catch (error) {
        res.status(500).json({
            error: "Erro ao processar o feed RSS",
            detalhe: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("=============================================================");
    console.log("                    API de RSS Iniciada");
    console.log("=============================================================");
    console.log(` Servidor rodando em http://localhost:${PORT}`);
    console.log(` Abrir arquivo HTML em http://localhost:${PORT}/rss`);
    console.log(` Abrir arquivo JSON em http://localhost:${PORT}/rss?format=json`);
    console.log("=============================================================");
});