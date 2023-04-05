const sftp_client = require('ssh2-sftp-client');
const config = require("../../common/config.json");
var fs = require('fs');
class SftpFileTransferClient {
    client;
    serverIP;
    serverPort;
    username;
    password;
    constructor(serverIP, serverPort = config.sftp.serverDefaultPort,username="anonymous",password="123456") {
        this.client = new sftp_client();
        this.serverPort = serverPort;
        this.serverIP = serverIP;
        this.username = username;
        this.password = password;
    }

    uploadFile(localDir, localFileName, remoteDir){       
        let data = fs.createReadStream(localDir+localFileName);
        this.client.connect({
            host: this.serverIP,
            port: this.serverPort,
            username: this.username,
            password: this.password
          }).then(() => {
              return this.client.put(data, remoteDir);
            })
            .then(() => {
              return this.client.end();
            })
            .catch(err => {
              console.error(err.message);
        });
    }

    // async downloadFile(dir, fileName) {
    //     await this.connect();
    //     console.log("requested dir: " + dir);
    //     console.log("requested fileName: " + fileName);
    //     try {
    //     await this.client.fastget(
    //         dir + fileName,
    //         config.sftp.downloadDir + fileName
    //     );
    //     } catch (err) {
    //         console.error(err.message);
    //     }
    // }       
}
module.exports =SftpFileTransferClient