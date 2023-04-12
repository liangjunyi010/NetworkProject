const ftp = require("basic-ftp");
import { resolve } from "path";
// const config = require('../../common/config.json')
import * as config from "../../common/config.json";
import { rejects } from "assert";
const net = require("net");
const fs = require('fs');
const path = require('path');

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
    this.isProcessing = false;
    this.taskQueue=[];
  }

  async connect(username = "anonymous", password = "", secure = false) {
    if (!this.clientSocket || !this.clientSocket.writable) {
      this.clientSocket = net.createConnection(9000, this.serverIP);
      this.clientSocket.on('data', data=>{
        console.log('服务器返回的数据：',data.toString());
        const logFileGenerator = new LogFileGenerator(JSON.parse(data.toString()));
        logFileGenerator.generateFile();
      });

    if (!this.client || this.client.closed) {
      if (!this.isConnecting) {
        this.isConnecting = true;
        await this.client.access({
          host: this.serverIP,
          user: username,
          password: password,
          secure: false,
          port:this.serverPort
        });
        this.isConnecting = false;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 100));
        await this.connect();
      }
    }
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
    this.clientSocket.on('data', async data=>{
      console.log('Header Info',data.toString());
      const logFileGenerator = new LogFileGenerator(JSON.parse(data.toString()));
      await logFileGenerator.generateFile();
      this.getFileHelper(dir, fileName)
    })
  }

  async getFileHelper(dir, fileName) {
    let client_temp_folder = new ReadFolder(config.ftp.downloadDir+'../client_temp');
    client_temp_folder.read(async (fileNames) => {
      if (fileNames.length!=0){
        for(let j =0;j<fileNames.length;j++){
          if(fileNames[j]===(fileName+'_log.txt')){
            if (dir==="./"){
              fs.mkdirSync(config.ftp.downloadDir+"temps/file/" + fileName, {recursive: true});
            } else{
              fs.mkdirSync(config.ftp.downloadDir+"temps/file/" + dir + fileName, {recursive: true});
            }
            let client_temp_files_folder = new ReadFolder(config.ftp.downloadDir+'temps/file/'+dir+fileName);
            let log_file_parser = new LogFileParser(config.ftp.downloadDir+'../client_temp/'+fileNames[j]);
            log_file_parser.parseFile();
            client_temp_files_folder.read(async(client_temp_files)=>{
              console.log(client_temp_files)
              for (let i =0;i<client_temp_files.length;i++){
                await log_file_parser.updateFile(client_temp_files[i]);
              }
              for(let i = log_file_parser.parsedData.totalNumOfFiles- log_file_parser.parsedData.numOfNotFinishedFiles; i < log_file_parser.parsedData.totalNumOfFiles; i++){
                let targetFile = fileName+'/'+fileName+'_part_'+i;
                try {
                  await this.client.downloadTo(
                    config.ftp.downloadDir + "temps/file/"+ dir + fileName+'/'+fileName+'_part_'+i,
                    'temps/file/' + dir + targetFile
                  );
                } catch (err) {
                  this.logError(err);
                }
              }
              let inputPath = config.ftp.downloadDir+"temps/file/"+ dir + fileName+'/';
              let filesObject = log_file_parser.parsedData.notFinishedFiles;
              let outputFileName = fileName;
              let outputPath = config.ftp.downloadDir;
              let mergeFiles = new MergeSplitFiles(inputPath, filesObject, outputFileName, outputPath, dir);
              await mergeFiles.streamMergeMain();
              fs.unlinkSync('./client_temp/'+fileName+'_log.txt');
            })
          }
        }
      }
    }
    );
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
    return new Promise((resolve, reject) => {
      let fileName = `${this.input.original_file_name}_log.txt`;
      let content = `origin_file_name : ${this.input.original_file_name}\npath : ${this.input.path}\ntotal_num_of_files : ${this.input.num_of_files}\nnum_of_not_finished_files : ${this.input.num_of_files}`;
      for (let i = 0; i < this.input.num_of_files; i++) {
        content += `\n${this.input.original_file_name}_part_${i} : not_finished`;
      }
  
      const dirName = "client_temp";
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName);
      }
      const filePath = `./client_temp/${fileName}`;
  
      fs.writeFile(filePath, content, (err) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log(`File ${fileName} was successfully generated!`);
          resolve();
        }
      });
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
    return new Promise((resolve, reject) => {
      if (this.parsedData && this.parsedData.notFinishedFiles[keyToUpdate] !== undefined) {
        this.parsedData.notFinishedFiles[keyToUpdate] = false;
        this.parsedData.numOfNotFinishedFiles--;
  
        const updatedContent = `origin_file_name : ${this.parsedData.originFileName}\n` +
          `total_num_of_files : ${this.parsedData.totalNumOfFiles}\n` +
          `num_of_not_finished_files : ${this.parsedData.numOfNotFinishedFiles}\n` +
          Object.entries(this.parsedData.notFinishedFiles).map(([key, value]) => `${key} : ${value ? 'not_finished' : 'finished'}`).join('\n');
  
        fs.writeFile(this.filePath, updatedContent, 'utf-8', (err) => {
          if (err) {
            console.error(`Failed to update key '${keyToUpdate}' to 'finished' in the file '${this.filePath}'.`);
            reject(err);
          } else {
            console.log(`Successfully updated key '${keyToUpdate}' to 'finished' in the file '${this.filePath}'.`);
            resolve();
          }
        });
      } else {
        console.error(`Key '${keyToUpdate}' not found or file not parsed. Please parse the file first.`);
        reject(new Error(`Key '${keyToUpdate}' not found or file not parsed. Please parse the file first.`));
      }
    });
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

class MergeSplitFiles {
  constructor(inputPath, filesObject, outputFileName, outputPath, dir) {
    this.inputPath = inputPath;
    this.filesObject = filesObject;
    this.outputFileName = outputFileName;
    this.outputPath = outputPath;
    this.dir = dir;
  }


  streamMergeRecursive(fileList, fileWriteStream) {
    return new Promise((resolve, reject) => {
      function mergeNextFile() {
        if (!fileList.length) {
          resolve();
          return;
        }
  
        const data = fileList.shift();
        const { filePath: chunkFilePath } = data;
        const currentReadStream = fs.createReadStream(chunkFilePath);
        currentReadStream.on('error', (error) => {
          fileWriteStream.close();
          reject(error);
        });
        currentReadStream.on('end', () => {
          mergeNextFile();
        });
  
        currentReadStream.pipe(fileWriteStream, { end: false });
      }
  
      mergeNextFile();
    });
  }

  async streamMergeMain() {
    const chunks = Object.keys(this.filesObject);
    const chunkFilesDir = path.resolve(this.inputPath);
    const fileList = chunks.map((name) => ({
      name,
      filePath: path.resolve(chunkFilesDir, name),
    }));
    const fileWriteStream = fs.createWriteStream(path.resolve(this.outputPath+this.outputFileName));
    await this.streamMergeRecursive(fileList, fileWriteStream);
    this.deleteFolderRecursive(config.ftp.downloadDir+"temps/file/"+ this.dir + this.outputFileName+'/')
  }

  deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
      fs.readdirSync(folderPath).forEach((file, index) => {
        const curPath = path.join(folderPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          // 如果是子目录，则递归删除子目录及其内容
          deleteFolderRecursive(curPath);
        } else {
          // 如果是文件，则直接删除文件
          fs.unlinkSync(curPath);
        }
      });
      // 删除空目录
      fs.rmdirSync(folderPath);
    }
  }
}


