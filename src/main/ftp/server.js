const FtpSrv = require("ftp-srv");
const config = require("../../common/config.json");
const net = require("net");
// import * as config from "../../common/config.json";
const path = require("path");
const fs = require("fs");

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
    const server = net.createServer(); //客户端有人连接的时候触发
    server.on("connection", (socket) => {
      //当前链接的socket对象
      console.log("TCP client connected");

      //监听客户端数据
      socket.on("data", async (data) => {
        let file_name = data.toString();
        let absolute_file_name = data.toString().split("/").pop();
        console.log(data.toString());
        const BUFFER_SIZE = 5; // 5 Byte
        const stream = fs.createReadStream(file_name, {
          highWaterMark: BUFFER_SIZE,
        });
        let counter = 0;
        for await (const data of stream) {
          fs.writeFile(
            "temp/file/" + absolute_file_name + "_" + counter,
            data,
            () => {
              console.log("split and write file done");
            }
          );
          counter++;
        }

        // create header file
        let Dir = path.join(__dirname, `../log/`); //创建目录
        fs.mkdirSync(Dir, {
          //是否使用递归创建目录
          recursive: true,
        });
        let header_file_content = "";
        fs.writeFile(
          "temp/header/" + absolute_file_name + "_header",
          header_file_content,
          function (err, data) {
            console.log("write in file successfully");
          }
        );
      });
    });

    server.listen(9000, "127.0.0.1");
  }

  shutDown() {
    this.ftpServer.close();
  }
}

module.exports = FtpFileTransferServer;
