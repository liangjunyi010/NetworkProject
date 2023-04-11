const ftp = require("basic-ftp");
import { resolve } from "path";
// const config = require('../../common/config.json')
import * as config from "../../common/config.json";
import { rejects } from "assert";
const net = require("net");
const fs = require('fs');

export default class FtpFileTransferClient {
  client;
  serverIP;
  serverPort;
  isConnecting;
  clientSocket;
  taskQueue;
  isProcessing;
  constructor(serverIP, serverPort = config.ftp.serverDefaultPort) {
    this.client = new ftp.Client();
    this.client.ftp.verbose = true;
    this.serverPort = serverPort;
    this.serverIP = serverIP;
    this.isConnecting = false;
    this.clientSocket = net.createConnection(9000, '127.0.0.1')
    this.clientSocket.on('data', data=>{
      console.log('服务器返回的数据：',data.toString());
      const logFileGenerator = new LogFileGenerator(JSON.parse(data.toString()));
      logFileGenerator.generateFile();
    })
    this.isProcessing = false;
    this.taskQueue=[];
  }

  async connect(username = "anonymous", password = "", secure = false) {
    if (!this.client || this.client.closed) {
      if (!this.isConnecting) {
        this.isConnecting = true;
        await this.client.access({
          host: this.serverIP,
          user: username,
          password: password,
          secure: false,
        });
        this.isConnecting = false;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 100));
        await this.connect();
      }
      // await this.client.access({
      //     host: this.serverIP,
      //     user: username,
      //     password: password,
      //     secure: false
      // })
    }
  }

    async cutFile(dir, fileName){
      console.log("cutfile client")
      this.clientSocket.write(dir+fileName)

      this.clientSocket.on('end', () => {
          console.log('disconnected from TCP server')
      })
  }

  async getFileList(dir) {
    // add request to queue if another getFileList invocation is in progress
    if (this.isProcessing) {
      console.log('Another invocation of getFileList is in progress, adding to queue.');
      return new Promise((resolve, reject) => {
        this.taskQueue.push({ dir, resolve, reject });
      });
    }

    this.isProcessing = true;

    try {
      // wait for FTP client to connect if not already connected
      if (!this.isConnected) {
        await this.connect();
      }

      // get file list from server
      let result = await this.client.list(dir);
      console.log(JSON.stringify(result));
      return result;
    } catch (error) {
      console.error(error);
    } finally {
      this.isProcessing = false;

      // execute next request in queue, if any
      if (this.taskQueue.length > 0) {
        let { dir, resolve, reject } = this.taskQueue.shift();
        try {
          let result = await this.getFileList(dir);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }
    }
  }

  async getFile(dir, fileName) {
    await this.connect();
    console.log("requested dir: " + dir);
    console.log("requested fileName: " + fileName);
    await this.cutFile(dir, fileName);

    let client_temp_folder = new ReadFolder(config.ftp.downloadDir+'../client_temp');
    client_temp_folder.read(async (fileNames) => {
      console.log(fileNames); // Output the file names from the callback
      let log_file_parser = new LogFileParser(config.ftp.downloadDir+'../client_temp/'+fileNames[0]);
      log_file_parser.parseFile();
      // log_file_parser.updateFile('my_4');
      log_file_parser.displayParsedData();
      console.log("------------------------------");
      console.log(log_file_parser.parsedData.totalNumOfFiles);
      console.log(log_file_parser.parsedData.notFinishedFiles);
      fs.mkdirSync(config.ftp.downloadDir+"temps/file/" + fileName, {recursive: true});
      for(let i = 0; i < log_file_parser.parsedData.totalNumOfFiles; i++){
        let targetFile = 'temps/file/'+fileName+'/'+fileName+'_part_'+i;
        try {
          await this.client.downloadTo(
            config.ftp.downloadDir + "temps/file/" + fileName+'/'+fileName+'_part_'+i,
            dir + targetFile
          );
        } catch (err) {
          this.logError(err);
        }
      }

      
    });
  }

  logError(err) {
    console.log("logging error");
    console.error(err);
    this.client.close();
  }

  async putFile(localDir, localFileName, remoteDir) {
    await this.connect();
    try {
      await this.client.uploadFrom(
        localDir + localFileName,
        remoteDir + localFileName,
        {}
      );
    } catch (err) {
      this.logError(err);
    }
  }

  end() {
    console.log("closing connection");
    this.client.close();
  }
}

module.exports = FtpFileTransferClient;

class LogFileGenerator {
  constructor(input) {
    this.input = input;
  }

  generateFile() {
    let fileName = `${this.input.original_file_name.split('.')[0]}_log.txt`;
    let content = `origin_file_name : ${this.input.original_file_name}\npath : ${this.input.path}\ntotal_num_of_files : ${this.input.num_of_files}\nnum_of_not_finished_files : ${this.input.num_of_files}`;

    for (let i = 0; i < this.input.num_of_files; i++) {
      content += `\n${this.input.original_file_name}_part_${i} : not_finished`;
    }

    const dirName = "client_temp";
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName);
    }
    const filePath = `./client_temp/${fileName}`

    fs.writeFile(filePath, content, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`File ${fileName} was successfully generated!`);
      }
    });
  }
}

class LogFileParser {
  constructor(filePath) {
    this.filePath = filePath;
    this.fileData = null;
    this.parsedData = null;
  }

  parseFile() {
    try {
      this.fileData = fs.readFileSync(this.filePath, 'utf-8');
      const lines = this.fileData.split('\n');
      this.parsedData = {
        originFileName: lines[0].split(' : ')[1],
        path:lines[1].split(' : ')[1],
        totalNumOfFiles: parseInt(lines[2].split(' : ')[1]),
        numOfNotFinishedFiles: parseInt(lines[3].split(' : ')[1]),
        notFinishedFiles: {}
      };

      for (let i = 4; i < lines.length; i++) {
        const [key, value] = lines[i].split(' : ');
        this.parsedData.notFinishedFiles[key] = value === 'not_finished';
      }
    } catch (error) {
      console.error(`Error parsing file: ${error}`);
    }
  }

  displayParsedData() {
    console.log(this.parsedData);
  }

  updateFile(keyToUpdate) {
      if (this.parsedData && this.parsedData.notFinishedFiles[keyToUpdate] !== undefined) {
        this.parsedData.notFinishedFiles[keyToUpdate] = false;
        this.parsedData.numOfNotFinishedFiles--;

        const updatedContent = `origin_file_name : ${this.parsedData.originFileName}\n` +
          `total_num_of_files : ${this.parsedData.totalNumOfFiles}\n` +
          `num_of_not_finished_files : ${this.parsedData.numOfNotFinishedFiles}\n` +
          Object.entries(this.parsedData.notFinishedFiles).map(([key, value]) => `${key} : ${value ? 'not_finished' : 'finished'}`).join('\n');
        
        fs.writeFileSync(this.filePath, updatedContent, 'utf-8');
        console.log(`Successfully updated key '${keyToUpdate}' to 'finished' in the file '${this.filePath}'.`);
      } else {
        console.error(`Key '${keyToUpdate}' not found or file not parsed. Please parse the file first.`);
      }
    }
}


class ReadFolder {
  constructor(folderPath) {
    this.folderPath = folderPath;
    this.fileNames = [];
  }

  read(callback) {
    fs.readdir(this.folderPath, (err, files) => {
      if (err) {
        console.error(`Error reading folder: ${err}`);
        return;
      }
      this.fileNames = files;
      console.log(`Files in ${this.folderPath}: ${this.fileNames}`);
      if (typeof callback === 'function') {
        callback(this.fileNames);
      }
    });
  }
}

