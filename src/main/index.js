import { app, shell, BrowserWindow, ipcMain, clipboard } from "electron";
import { join } from "path";
const fs = require("fs");
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import addIPCHandler from "./handledApi";
const { spawn } = require("child_process");
import UDPTransfer from "./directUDP/UDPTransfer";

let mainWindow; //global reference for udpagent to access it
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  let udpAgent = new UDPTransfer(mainWindow);
  setClipboardListener(udpAgent);
  addIPCHandler(ipcMain, udpAgent);
});

function setClipboardListener(udpAgent) {
  import("clipboardy")
    .then((module) => {
      let clipboard = module.default;
      let previousClipboardContent = clipboard.readSync();

      setInterval(() => {
        clipboard.read().then((currentClipboardContent) => {
          if (currentClipboardContent !== previousClipboardContent) {
            console.log(
              `Clipboard content changed: ${currentClipboardContent}`
            );
            previousClipboardContent = currentClipboardContent;
            udpAgent.sendCopiedContent(currentClipboardContent);
          }
        });
      }, 1000);
    })
    .catch((err) => console.log(err));
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// if (!fs.existsSync(config.ftp.downloadDir)) {
//   fs.mkdirSync(config.ftp.downloadDir);
// }

// import FtpFileTransferServer from "./ftp/server";
// let server = new FtpFileTransferServer();

// //run ftp server process
// // Define the command to run the Node script as root
// const command = 'sudo';
// const args = ['node', './src'];

// // Spawn a new process with the command and arguments
// const child = spawn(command, args, { stdio: 'inherit' });

// // Listen for the exit event to know when the process has finished
// child.on('exit', (code) => {
//   console.log(`Child process exited with code ${code}`);
// });
