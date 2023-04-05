
import Client from "ftp"
import * as fs from "fs";
import jsftp from "jsftp";
import ftp from "basic-ftp"
import config from "../common/config.json" assert {type:'json'};
import net from "net"


export class FtpFileTransferClient{

    isReady=false
    Ftp
    constructor(serverIP,serverPort = config.ftp.serverDefaultPort){
        // this.client = new Client()
        // this.client.on('ready',()=>{
        //         console.log('client is ready')
        //         this.isReady = true
        // });
        // this.client.connect('ftp://'+serverIP+':'+serverPort)

        // this.Ftp = new jsftp({
        //     host: "127.0.0.1",
        //     port: 21, // defaults to 21
        //     user: "anonymous", //defaults to "anonymous"
        //     pass: "@anonymous" // defaults to "@anonymous"
        // });
        this.client = new ftp.Client()
        this.client.ftp.verbose = true
    }

    async cutFile(dir, fileName){
        const clientSocket = net.createConnection(9000, '127.0.0.1')
        console.log("cutfile client")
        clientSocket.write(dir+fileName)
        clientSocket.on('data', data=>{
            console.log('服务器返回的数据：',data.toString());
        })
        clientSocket.end();

        clientSocket.on('end', () => {
            console.log('disconnected from TCP server')
        })
    }

    async getFile(dir,fileName){
        try {
            await this.client.access({
                host: "127.0.0.1",
                user: "anonymous",
                password: "password",
                secure: false
            })
            console.log(await this.client.list())
            await this.client.downloadTo(config.ftp.downloadDir + fileName, dir+fileName)
        }
        catch(err) {
            console.log(err)
        }
        this.client.close()
    }

    // end(){
    //     this.Ftp.close()
    // }
}
