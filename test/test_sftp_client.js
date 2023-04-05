const SftpFileTransferClient = require("../src/main/sftp/sftp_client");

let client = new SftpFileTransferClient("10.12.7.60");
client.uploadFile("./src/main/sftp/", "sftp_client.js","./download/sftp_client.js");