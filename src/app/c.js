const FtpFileTransferClient = require('../ftp/client.js')

let client= new FtpFileTransferClient("127.0.0.1");
client.getFile('./src/ftp/',"client.js")

client.putFile("./",".gitignore","./src/")