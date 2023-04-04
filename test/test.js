const FtpFileTransferClient = require("../src/main/ftp/client");

let client = new FtpFileTransferClient("127.0.0.1");
client.getFile("./src/ftp/", "client.js");

client.putFile("./", ".gitignore", "./src/");
