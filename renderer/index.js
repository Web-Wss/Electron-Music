const { ipcRenderer } = require("electron");
const { $, convertDuration } = require("./helper");
let musicAudio = new Audio();
let allTracks;
let currentTrack;

$("add-music-button").addEventListener("click", () => {
  ipcRenderer.send("add-music-window");
});

const renderListHTML = (tracks) => {
  const trackList = $("tracksList");
  const tracksListHTML = tracks.reduce((html, track) => {
    html += `<li class="row music-track list-group-item d-flex justify-content-between align-items-center">
      <div class="col-xs-9">
        <i class="fas fa-music mr-2"></i>
        <b>${track.fileName}</b>
      </div>
      <div class="col-xs-3">
        <i class="fas fa-play col-xs-2" data-id="${track.id}"></i>
        <i class="fas fa-trash-alt col-xs-1" data-id="${track.id}"></i>
      </div>
    </li>`;
    return html;
  }, "");
  const emptyTrackHTML =
    '<div class="alert alert-primary">还没有添加任何音乐</div>';
  tracksList.innerHTML = tracks.length
    ? `<ul class="list-group">${tracksListHTML}</ul>`
    : emptyTrackHTML;
};

const renderPlayerHTML = (name, duration) => {
  const player = $("player-status");
  const html = `<div class="col-xs-7 font-weight-bold">
                  正在播放:${name}
                </div>
                <div class="col">
                  <span id="current-seeker">00:00</span> / ${convertDuration(
                    duration
                  )}
                </div>
`;
  player.innerHTML = html;
};

const updateProgressHTML = (currentTime, duration) => {
  // 计算progress
  const progress = Math.floor((currentTime / duration) * 100);
  const bar = $("player-progress");
  bar.innerHTML = progress + "%";
  bar.style.width = progress + "%";
  const seeker = $("current-seeker");
  seeker.innerHTML = convertDuration(currentTime);
};
musicAudio.addEventListener("loadedmetadata", () => {
  // 开始渲染播放器状态
  renderPlayerHTML(currentTrack.fileName, musicAudio.duration);
});

musicAudio.addEventListener("timeupdate", () => {
  // 更新播放器状态
  updateProgressHTML(musicAudio.currentTime, musicAudio.duration);
});

ipcRenderer.on("getTracks", (event, tracks) => {
  console.log("receive tracks", tracks);
  allTracks = tracks;
  renderListHTML(tracks);
});

$("tracksList").addEventListener("click", (event) => {
  event.preventDefault();
  const { dataset, classList } = event.target;
  const id = dataset && dataset.id;
  if (id && classList.contains("fa-play")) {
    if (currentTrack && currentTrack.id === id) {
      // 继续播放音乐
      musicAudio.play();
    } else {
      // 播放新的歌曲,注意还原之前的图标
      currentTrack = allTracks.find((track) => track.id === id);
      musicAudio.src = currentTrack.path;
      musicAudio.play();
      const resetIconEle = document.querySelector(".fa-pause");
      if (resetIconEle) {
        resetIconEle.classList.replace("fa-pause", "fa-play");
      }
    }

    classList.replace("fa-play", "fa-pause");
  } else if (id && classList.contains("fa-pause")) {
    // 暂停逻辑
    musicAudio.pause();
    classList.replace("fa-pause", "fa-play");
  } else if (id && classList.contains("fa-trash-alt")) {
    // 删除按钮
    ipcRenderer.send("delete-track", id);
  }
});
