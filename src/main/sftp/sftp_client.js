const sftp_client = require('ssh2-sftp-client');
import * as config from "../../common/config.json";
var fs = require('fs');
export default class SftpFileTransferClient {
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

    uploadFile(localDir, localFileName){       
        let data = fs.createReadStream(localDir+localFileName);
        this.client.connect({
            host: this.serverIP,
            port: this.serverPort,
            username: this.username,
            password: this.password
          }).then(() => {
              return this.client.put(data, config.sftp.downloadDir + fileName);
            })
            .then(() => {
              return this.client.end();
            })
            .catch(err => {
              console.error(err.message);
        });
        this.isConnecting = false;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 100));
        await this.connect();
      }
    }
  }

  async downloadFile(dir, fileName) {
    await this.connect();
    console.log("requested dir: " + dir);
    console.log("requested fileName: " + fileName);
    try {
      await this.client.get(dir + fileName, config.sftp.downloadDir + fileName);
    } catch (err) {
      console.error(err.message);
    }
  }

    downloadFile(dir, fileName) {
      let dst = fs.createWriteStream(config.sftp.downloadDir + fileName);
      console.log(fileName);
        this.client.connect({
            host: this.serverIP,
            port: this.serverPort,
            username: this.username,
            password: this.password
        }).then(() => {
          return this.client.get(
            dir + fileName,
            dst
        );
        })
        .then(() => {
          return this.client.end();
        })
        .catch(err => {
          console.error(err.message);
        });
    }       
}
