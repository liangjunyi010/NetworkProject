import { electronAPI } from "@electron-toolkit/preload";
const { contextBridge, ipcRenderer } = require("electron");
// const f = require('./test')
// import {f} from './test'
// const FtpFileTransferClient = require('./ftp/client')
import FtpFileTransferClient from "../main/ftp/client";
// const FtpFileTransferServer = require('./ftp/server')
// import FtpFileTransferServer from "../main/ftp/server";

// Custom APIs for renderer
const api = {};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
    contextBridge.exposeInMainWorld("versions", {
      node: () => process.versions.node,
      chrome: () => process.versions.chrome,
      electron: () => process.versions.electron,
    });

    contextBridge.exposeInMainWorld("ftp", {
      // getFtpClient:(serverIP) => new FtpFileTransferClient(serverIP),
      // getFtpServer: ()=> new FtpFileTransferServer()
      createClient: (serverIP) =>
        ipcRenderer.invoke("ftpClient:createNew", serverIP),
      getFile: (fileDir, fileName) =>
        ipcRenderer.invoke("ftpClient:getFile", fileDir, fileName),
      getFileList: (dir) => {
        console.log('getting file list');
        return ipcRenderer.invoke("ftpClient:getFileList", dir)},
      // changeDirectory: (subDir) => ipcRenderer.invoke("ftpClient:cd", subDir),
    });

    contextBridge.exposeInMainWorld("sftp", {
      uploadFile: (fileDir, fileName) =>
        ipcRenderer.invoke("sftpClient:uploadFile", fileDir, fileName),
      downloadFile: (fileDir, fileName) =>{
        // console.log(fileName);
        return ipcRenderer.invoke("sftpClient:downloadFile", fileDir, fileName)
      }
    });

    contextBridge.exposeInMainWorld("local",{
      getReceivedFiles:()=>ipcRenderer.invoke("localFs:downloadedFileList"),
      getLocalIP:()=>ipcRenderer.invoke("localNetwork:myIPAddress")
    })
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}
