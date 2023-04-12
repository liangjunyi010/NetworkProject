const SftpFileTransferClient = require("../src/main/sftp/sftp_client");

let client = new SftpFileTransferClient('127.0.0.1');
client.uploadFile("./src/main/sftp/", "sftp_client.js");
