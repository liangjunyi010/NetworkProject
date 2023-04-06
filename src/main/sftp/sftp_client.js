const sftp_client = require("ssh2-sftp-client");
var fs = require("fs");
export default class SftpFileTransferClient {
  client;
  serverIP;
  serverPort;
  isConnecting;
  constructor(serverIP, serverPort = config.sftp.serverDefaultPort) {
    this.client = new sftp_Client();
    this.serverPort = serverPort;
    this.serverIP = serverIP;
    this.isConnecting = false;
  }

  async connect(username = "anonymous", password = "123456", secure = false) {
    if (!this.client || this.client.closed) {
      if (!this.isConnecting) {
        this.isConnecting = true;
        await this.client.connect({
          host: this.serverIP,
          port: this.serverPort,
          username: username,
          password: password,
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

  async uploadFile(localDir, localFileName, remoteDir) {
    await this.connect();
    data = fs.createReadStream(localDir + localFileName);
    try {
      await this.client.put(data, remoteDir);
      this.client.end();
    } catch (err) {
      console.error(err.message);
    }
  }
}
