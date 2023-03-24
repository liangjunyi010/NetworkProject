const FtpSrv = require('ftp-srv')
const config = require('../common/config.json')

class FtpFileTransferServer{

    ftpServer
    constructor(ip = config["ftp"]["serverDefaultIP"],port = config.ftp.serverDefaultPort){
        this.ftpServer = new FtpSrv({
            url: "ftp://"+ip+":" + port,
            anonymous: true,
            pasv_url:()=>"127.0.0.1",
        })
        this.ftpServer.on('login', ({ connection, username, password }, resolve, reject) => {
            if(username === 'anonymous'){
            console.log("new client logging in")
                return resolve({ root:"./" });
            }
            return reject(new Error('Invalid username or password'));
        });
        this.ftpServer.on('client-error', ({connection, context, error}) => {
            console.log(error) });
        this.ftpServer.on('server-error', ({error}) => {
            console.log(error) });
        this.ftpServer.listen().then(() => {
            console.log('Ftp server is starting...')
        });
    }

    shutDown(){
        this.ftpServer.close()
    }
}

module.exports = FtpFileTransferServer