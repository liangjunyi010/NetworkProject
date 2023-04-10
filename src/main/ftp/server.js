const FtpSrv = require("ftp-srv");
const config = require("../../common/config.json");
const net = require('net');
// import * as config from "../../common/config.json";
const path = require('path');
const fs = require('fs');

class FtpFileTransferServer {
  ftpServer;
  constructor(
    ip = config["ftp"]["serverDefaultIP"],
    port = config.ftp.serverDefaultPort
  ) {
    this.ftpServer = new FtpSrv({
      url: "ftp://" + ip + ":" + port,
      anonymous: true,
      pasv_url: () => "127.0.0.1",
    });
    this.ftpServer.on(
      "login",
      ({ connection, username, password }, resolve, reject) => {
        if (username === "anonymous") {
          console.log("new client logging in");
          return resolve({ root: "./" });
        }
        return reject(new Error("Invalid username or password"));
      }
    );
    this.ftpServer.on("client-error", ({ connection, context, error }) => {
      console.log(error);
    });
    this.ftpServer.on("server-error", ({ error }) => {
      console.log(error);
    });
    this.ftpServer.listen().then(() => {
      console.log("Ftp server is starting...");
    });

    // tcp server to receive filname and cut
  const server = net.createServer()//客户端有人连接的时候触发
  server.on('connection',(socket)=>{//当前链接的socket对象
      console.log('TCP client connected');

      //监听客户端数据
      socket.on('data',async data => {
        let file_name = data.toString();
        fs.mkdirSync("temps/file/" + file_name, {
          //是否使用递归创建目录
          recursive: true
        })
        fs.mkdirSync("temps/header/" + file_name, {
          //是否使用递归创建目录
          recursive: true
        })
        let absolute_file_name = data.toString().split('/').pop();
        console.log(data.toString());
        const BUFFER_SIZE = config.ftp.bufferSizeByte;
        const stream = fs.createReadStream(file_name, { highWaterMark: BUFFER_SIZE });
        let counter = 0;
        for await (const data of stream) {
          fs.writeFile("temps/file/"+ file_name + "/" + absolute_file_name +"_part_" + counter, data, () => {
            // console.log("split and write file done");
          })
          counter++;
        }

        // create header file
        let header_file_content = {"original_file_name" : absolute_file_name,"path" : file_name,"num_of_files" : counter}
        socket.write(JSON.stringify(header_file_content));
        // fs.writeFile("temps/header/" + file_name + "/" + absolute_file_name + "_header", header_file_content, function(err, data){
          
        //   console.log('write in file successfully')
        // });
      })

  })

  server.listen(9000,'127.0.0.1')
  }
  
  shutDown() {
    this.ftpServer.close();
  }
}

module.exports = FtpFileTransferServer;
