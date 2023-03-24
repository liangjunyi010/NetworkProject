
const ftp = require('basic-ftp')
const config = require('../common/config.json')


class FtpFileTransferClient{

    client
    serverIP
    serverPort
    isConnecting = false
    constructor(serverIP,serverPort = config.ftp.serverDefaultPort){
        this.client = new ftp.Client()
        this.client.ftp.verbose = true
        this.serverPort = serverPort
        this.serverIP = serverIP
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
        }
    }

    async getFile(dir,fileName){
        await this.connect()
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
