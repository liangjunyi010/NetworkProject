const { dialog } = require('electron')
import FtpFileTransferClient from './ftp/client'
export default function addIPCHandler(ipcMain){
    ipcMain.handle('ftpClient:getFile',async (event,fileDir,fileName)=>{
        try{
          await ftpClient.getFile(fileDir,fileName)
          return true
        }catch (err){
          handleError(err)
        }
      }
      )
    
    ipcMain.handle('ftpClient:getFileList',async (event,fileDir)=>{
        try{
            return await ftpClient.getFileList(fileDir)
        }catch (err){
            handleError(err)
        }
    })

    ipcMain.handle("ftpClient:createNew", (event,serverIP)=>{
      ftpClient = new FtpFileTransferClient(serverIP)
      return true
    })
}

function handleError(error){
    // dialog.showErrorBox(error.name,error.message+'\n'+error.stack)
    throw error
}

let ftpClient

