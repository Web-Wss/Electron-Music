const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const DataStore = require("./renderer/MusicDataStore");

const myStore = new DataStore({ name: "Music Data" });

class AppWindow extends BrowserWindow {
  constructor(config, fileLocation) {
    const basicCongig = {
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    };
    const finalConfig = { ...basicCongig, ...config };
    super(finalConfig);
    this.loadFile(fileLocation);
    this.once("ready-to-show", () => {
      this.show();
    });
  }
}

app.on("ready", () => {
  const mainWindow = new AppWindow({}, "./renderer/index.html");
  mainWindow.webContents.on("did-finish-load", () => {
    console.log("page did finish load");
    mainWindow.send("getTracks", myStore.getTracks());
  });
  ipcMain.on("add-music-window", () => {
    const addWindow = new AppWindow(
      {
        width: 500,
        height: 400,
        parent: mainWindow,
      },
      "./renderer/add.html"
    );
  });
  ipcMain.on("add-tracks", (event, tracks) => {
    console.log(tracks);
    const updateTracks = myStore.addTracks(tracks).getTracks();
    mainWindow.send("getTracks", updateTracks);
  });
  ipcMain.on("delete-track", (event, id) => {
    const updateTracks = myStore.deleteTrack(id).getTracks();
    mainWindow.send("getTracks", updateTracks);
  });
  ipcMain.on("add-music-file", (event) => {
    dialog
      .showOpenDialog({
        properties: ["openFile", "multiSelections"],
        filters: [{ name: "Music", extensions: ["mp3"] }],
      })
      .then((files) => {
        // console.log(files);
        if (files) {
          event.sender.send("select-file", files);
        }
      });
  });
});
