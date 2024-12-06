import fs, { readFileSync } from "fs";
import http from "http";
import url from "url";
const createCards = (character, one = false) => {
  return `
            <div class="card">
              <img src="${character.image}" alt="${character.name}">
              <h2>${character.name}</h2>
              <p><strong>Power Level:</strong> ${character.abilities.map((ability) => `<span>${ability}</span>`)}</p>
              <p>${character.description}</p>
            </div>
          `;
};

const data = readFileSync("./data.json", "utf-8");
const dataObj = JSON.parse(data);
const htmlData = readFileSync("./public/index.html", "utf-8");
const server = http.createServer(async (req, res) => {
  const pathName = req.url;
  const { query } = url.parse(req.url);
  console.log(query, pathName);
  if (pathName.startsWith("/")) {
    const singleCard = dataObj.find((character) => character.name.toLowerCase() === query);
    const cardsHtml = singleCard
      ? createCards(singleCard)
      : dataObj.map((character) => createCards(character)).join("");
    const finalHtml = htmlData.replace(
      '<div id="cards-container"></div>',
      `<div id="cards-container">${cardsHtml}</div>`
    );
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(finalHtml);
  } else {
    res.writeHead(404, {
      "Content-Type": "text/html",
      "my-own-header": "hello",
    });
    res.end("<h1>404 not found</h1>");
  }
});
// open the browser in http://localhost:3000
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
