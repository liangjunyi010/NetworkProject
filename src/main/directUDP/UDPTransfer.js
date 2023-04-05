const dgram = require("dgram");
const net = require("net");
import * as config from "../../common/config.json";

export default class UDPTransfer {
  port; //same for sending and receiving
  socket; //do both sending and receiving
  destIP;
  mainWindow;
  constructor(mainWindow) {
    this.socket = dgram.createSocket("udp4");
    this.port = config.udp.port;
    this.destIP = "127.0.0.1"; //initially set as localhost. to be set before sending
    this.mainWindow = mainWindow;
    this.socket.on("error", (err) => {
      console.error("UDP receive error:", err);
      this.socket.close();
    });

    this.socket.on("message", (msg, rinfo) => {
      console.log("received udp:");

      console.log(msg);
      console.log(rinfo);
      this.mainWindow.webContents.send("udp:newDataReceived", msg);
    });

    this.socket.bind(this.port);
  }

  setDest(ip) {
    if (net.isIP(ip)) {
      this.destIP = ip;
    } else {
      console.error("invalid ip");
    }
  }

  send(message, port, address) {
    const buffer = Buffer.from(message);
    this.socket.send(buffer, 0, buffer.length, port, address, (err) => {
      if (err) {
        console.error("UDP send error:", err);
      }
    });
  }

  sendCopiedContent(copiedContent) {
    this.send(copiedContent + "[END]", this.port, this.destIP);
  }

  //   receive(port, address, callback) {
  //     const server = dgram.createSocket('udp4');

  //     server.on('error', (err) => {
  //       console.error('UDP receive error:', err);
  //       server.close();
  //     });

  //     server.on('message', (msg, rinfo) => {
  //       if (rinfo.address === address && rinfo.port === port) {
  //         callback(msg.toString());
  //       }
  //     });

  //     server.bind(port, address);
  //   }
}

module.exports = UDPTransfer;
