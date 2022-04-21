const { ipcRenderer } = require("electron");
const { $ } = require("./helper");
const path = require("path");

let musicFilesPath = [];
$("select-music").addEventListener("click", () => {
  ipcRenderer.send("add-music-file");
});

$("add-music").addEventListener("click", () => {
  ipcRenderer.send("add-tracks", musicFilesPath);
});

const renderListHTML = (pathes) => {
  const musicList = $("musicList");
  const musicItemsHTML = pathes.reduce((html, music) => {
    html += `<li class="list-group-item">${path.basename(music)}</li>`;
    return html;
  }, "");
  musicList.innerHTML = `<ul class="list-group">${musicItemsHTML}</ul>`;
};
ipcRenderer.on("select-file", (event, path) => {
  if (Array.isArray(path.filePaths)) {
    renderListHTML(path.filePaths);
    musicFilesPath = path.filePaths;
  }
});
