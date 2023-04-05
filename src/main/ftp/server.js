const FtpSrv = require("ftp-srv");
const config = require("../../common/config.json");
const net = require('net');
// import * as config from "../../common/config.json";

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
      socket.on('data',data=>{
          console.log(data.toString());
          fs.readFile(data.toString(),(err,file_data)=>{
              // 判断是否读取成功
              if(err){
                  return console.log('Read File Failed on TCP server！'+err.message)
              }
              console.log('Read File Successfully on TCP server' ) // the content of file is stored in variable: dataStr
              let Dir = path.join(__dirname,`../log`);//创建目录
              fs.mkdirSync(Dir,{
                  //是否使用递归创建目录
                  recursive:true
              })
              let directory = Dir + '/dataStr.log'
              console.log(file_data)
              fs.writeFile(directory, file_data, function (err,data) {
                  console.log('write in file successfully')
                  console.log(file_data)
              });

          })
      })

  })

  server.listen(9000,'127.0.0.1')
  }
  
  shutDown() {
    this.ftpServer.close();
  }
}

module.exports = FtpFileTransferServer;
