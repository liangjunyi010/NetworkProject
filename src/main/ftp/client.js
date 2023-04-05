const ftp = require("basic-ftp");
// const config = require('../../common/config.json')
import * as config from "../../common/config.json";

export default class FtpFileTransferClient {
  client;
  serverIP;
  serverPort;
  isConnecting;
  constructor(serverIP, serverPort = config.ftp.serverDefaultPort) {
    this.client = new ftp.Client();
    this.client.ftp.verbose = true;
    this.serverPort = serverPort;
    this.serverIP = serverIP;
    this.isConnecting = false;
  }

    async connect(username = "anonymous", password = "", secure = false){
        if (!this.client || this.client.closed){
            if (!this.isConnecting){
                this.isConnecting = true
                await this.client.access({
                    host: this.serverIP,
                    user: username,
                    password: password,
                    secure: false
                })
                this.isConnecting = false
                
            }else{
                await new Promise(resolve => setTimeout(resolve,100))
                await this.connect()
            }
            // await this.client.access({
            //     host: this.serverIP,
            //     user: username,
            //     password: password,
            //     secure: false
            // })
        }
    }

    async cutFile(dir, fileName){
      const clientSocket = net.createConnection(9000, '127.0.0.1')
      console.log("cutfile client")
      clientSocket.write(dir+fileName)
      clientSocket.on('data', data=>{
          console.log('服务器返回的数据：',data.toString());
      })
      clientSocket.end();

      clientSocket.on('end', () => {
          console.log('disconnected from TCP server')
      })
  }

    async getFileList(dir){
        await this.connect()
        let result = await this.client.list(dir);
        console.log(JSON.stringify(result));
        return result
    }


  async getFile(dir, fileName) {
    this.cutFile(dir, fileName);
    await this.connect();
    console.log("requested dir: " + dir);
    console.log("requested fileName: " + fileName);
    try {
      await this.client.downloadTo(
        config.ftp.downloadDir + fileName,
        dir + fileName
      );
    } catch (err) {
      this.logError(err);
    }
  }

    logError(err){
        console.log("logging error")
        console.error(err)
        this.client.close()
    }

    async putFile(localDir, localFileName, remoteDir){
        await this.connect()
        try {
            await this.client.uploadFrom(
                localDir + localFileName,
                remoteDir+localFileName,
                {}
            );
        } catch (err) {
            this.logError(err);
        }
    }

    end(){
        console.log("closing connection")
        this.client.close()
    }
}

module.exports = FtpFileTransferClient
