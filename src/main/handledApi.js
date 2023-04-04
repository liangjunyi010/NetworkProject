const { dialog } = require("electron");
import FtpFileTransferClient from "./ftp/client";
import * as config from '../common/config.json'
const fs = require('fs')
export default function addIPCHandler(ipcMain) {
  ipcMain.handle("ftpClient:getFile", async (event, fileDir, fileName) => {
    try {
      await ftpClient.getFile(fileDir, fileName);
      return true;
    } catch (err) {
      handleError(err);
    }
  });

  ipcMain.handle("ftpClient:getFileList", async (event, fileDir) => {
    try {
      return await ftpClient.getFileList(fileDir);
    } catch (err) {
      handleError(err);
    }
  });

  ipcMain.handle("ftpClient:createNew", (event, serverIP) => {
    if (serverIP !== ftpClient.serverIP) {
      ftpClient = new FtpFileTransferClient(serverIP);
    }
    return true;
  });

  // ipcMain.handle("ftpClient:cd",async (event,subDir)=>{
  //   try{
  //     return await ftpClient.cd(subDir)
  //   } catch (err){
  //     handleError(err)
  //   }
  // })

  ipcMain.handle("localFs:downloadedFileList",async (event)=>{

    //create a promise and await for it. any better way of doing it?
    return await new Promise((resolve, reject) => {
      fs.readdir(config.ftp.downloadDir, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  })
}

function handleError(error) {
  // dialog.showErrorBox(error.name,error.message+'\n'+error.stack)
  throw error;
}

let ftpClient = new FtpFileTransferClient("");
