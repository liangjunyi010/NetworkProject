
import Client from "ftp"
import * as fs from "fs";
import jsftp from "jsftp";
import ftp from "basic-ftp"
import config from "../common/config.json" assert {type:'json'};


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
        // this.client.get(dir+fileName, (err, stream)=> {
        //     // if (err) throw err;
        //     // stream.once('close', function() { c.end(); });
        //     stream.pipe(fs.createWriteStream(config.ftp.downloadDir+fileName));
        // });
        // connect to localhost:21 as anonymous
        // this.Ftp.raw("PORT","",(err,data)=>{
        //     this.Ftp.raw("RETR", dir+fileName,(err, data) => {
        //         if (err) {
        //             return console.error(err);
        //         }
        //         console.log(data.text); // Show the FTP response text to the user
        //         console.log(data.code); // Show the FTP response code to the user
        //     });
        // })
        // this.Ftp.list(dir, (err, res) => {
        //     console.log(err)
        //     console.log(res);
        //     // Prints something like
        //     // -rw-r--r--   1 sergi    staff           4 Jun 03 09:32 testfile1.txt
        //     // -rw-r--r--   1 sergi    staff           4 Jun 03 09:31 testfile2.txt
        //     // -rw-r--r--   1 sergi    staff           0 May 29 13:05 testfile3.txt
        //     // ...
        // });
        // this.Ftp.get(dir+fileName, config.ftp.downloadDir+fileName, err => {
        //     console.log(dir+fileName)
        //     if (err) {
        //         return console.error(err);
        //     }
        //     console.log("File copied successfully!");
        // });
    //     let str = ""; // Will store the contents of the file
    //     this.Ftp.get(dir+fileName, (err, socket) => {
    //         if (err) {
    //             return;
    //         }
    //
    //         socket.on("data", d => {
    //             str += d.toString();
    //         });
    //
    //         socket.on("close", err => {
    //             if (err) {
    //                 console.error("There was an error retrieving the file.");
    //             }
    //         });
    //
    //         socket.resume();
    //     });
    }

    // end(){
    //     this.Ftp.close()
    // }
}
