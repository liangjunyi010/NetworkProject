"use strict";
const preload = require("@electron-toolkit/preload");
const ftp$1 = {
  downloadDir: "./downloaded/",
  serverDefaultPort: 21,
  serverDefaultIP: "0.0.0.0",
};
const ftp = require("basic-ftp");
class FtpFileTransferClient {
  client;
  serverIP;
  serverPort;
  isConnecting;
  constructor(serverIP, serverPort = ftp$1.serverDefaultPort) {
    this.client = new ftp.Client();
    this.client.ftp.verbose = true;
    this.serverPort = serverPort;
    this.serverIP = serverIP;
    this.isConnecting = false;
  }
  async connect(username = "anonymous", password = "", secure = false) {
    if (!this.client || this.client.closed) {
      if (!this.isConnecting) {
        this.isConnecting = true;
        await this.client.access({
          host: this.serverIP,
          user: username,
          password,
          secure: false,
        });
        this.isConnecting = false;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 100));
        await this.connect();
      }
    }
  }
  async getFileList(dir) {
    await this.connect();
    let result = await this.client.list(dir);
    console.log(JSON.stringify(result));
    return result;
  }
  async getFile(dir, fileName) {
    await this.connect();
    console.log("requested dir: " + dir);
    console.log("requested fileName: " + fileName);
    try {
      await this.client.downloadTo(
        ftp$1.downloadDir + fileName,
        dir + fileName
      );
    } catch (err) {
      this.logError(err);
    }
  }
  async cd(subDir) {
    await this.connect();
    let result = await this.client.cd(subDir);
    return result;
  }
  logError(err) {
    console.log("logging error");
    console.error(err);
    this.client.close();
  }
  async putFile(localDir, localFileName, remoteDir) {
    await this.connect();
    try {
      await this.client.uploadFrom(
        localDir + localFileName,
        remoteDir + localFileName,
        {}
      );
    } catch (err) {
      this.logError(err);
    }
  }
  end() {
    console.log("closing connection");
    this.client.close();
  }
}
module.exports = FtpFileTransferClient;
const { contextBridge, ipcRenderer } = require("electron");
const api = {};
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", preload.electronAPI);
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
      getFileList: (dir) => ipcRenderer.invoke("ftpClient:getFileList", dir),
      changeDirectory: (subDir) => ipcRenderer.invoke("ftpClient:cd", subDir),
    });
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
  window.api = api;
}
