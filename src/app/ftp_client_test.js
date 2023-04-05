import {FtpFileTransferClient} from "../ftp/client.js";

let client= new FtpFileTransferClient("127.0.0.1");
client.cutFile('../ftp/',"client.js")
client.getFile('./src/ftp/',"client.js")
