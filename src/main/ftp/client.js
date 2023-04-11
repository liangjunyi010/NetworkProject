const ftp = require("basic-ftp");
// const config = require('../../common/config.json')
import * as config from "../../common/config.json";
const net = require("net");
const fs = require('fs');
const path = require('path');

export default class FtpFileTransferClient {
  client;
  serverIP;
  serverPort;
  isConnecting;
  clientSocket;
  constructor(serverIP, serverPort = config.ftp.serverDefaultPort) {
    this.client = new ftp.Client();
    this.client.ftp.verbose = true;
    this.serverPort = serverPort;
    this.serverIP = serverIP;
    this.isConnecting = false;
    this.clientSocket = net.createConnection(9000, '127.0.0.1')
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
    await this.connect();
    let result = await this.client.list(dir);
    console.log(JSON.stringify(result));
    return result;
  }

  async getFile(dir, fileName) {
        await this.connect();
    console.log("requested dir: " + dir);
    console.log("requested fileName: " + fileName);
    await this.cutFile(dir, fileName);
    this.clientSocket.on('data', data=>{
      console.log('服务器返回的数据：',data.toString());
      const logFileGenerator = new LogFileGenerator(JSON.parse(data.toString()));
      logFileGenerator.generateFile();
      this.getFileHelper(dir, fileName)
    })
  }

  async getFileHelper(dir, fileName) {
    let client_temp_folder = new ReadFolder(config.ftp.downloadDir+'../client_temp');
    client_temp_folder.read(async (fileNames) => {
      if (fileNames.length!=0){
        for(let j =0;j<fileNames.length;j++){
          console.log('111111111111111111111111')
          if(fileNames[j]===(fileName+'_log.txt')){
            console.log('2222222222222222222222222222')
            fs.mkdirSync(config.ftp.downloadDir+"temps/file/" + fileName, {recursive: true});
            let client_temp_files_folder = new ReadFolder(config.ftp.downloadDir+'temps/file/'+fileName);
            let log_file_parser = new LogFileParser(config.ftp.downloadDir+'../client_temp/'+fileNames[j]);
            log_file_parser.parseFile();
            client_temp_files_folder.read(async(client_temp_files)=>{
              for (let i =0;i<client_temp_files;i++){
                log_file_parser.updateFile(client_temp_files[i]);
              }
            })
            for(let i = log_file_parser.parsedData.totalNumOfFiles- log_file_parser.parsedData.numOfNotFinishedFiles; i < log_file_parser.parsedData.numOfNotFinishedFiles; i++){
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
            let inputPath = config.ftp.downloadDir+"temps/file/" + fileName+'/';
            let filesObject = log_file_parser.parsedData.notFinishedFiles;
            let outputFileName = fileName;
            let outputPath = config.ftp.downloadDir;
            let mergeFiles = new MergeSplitFiles(inputPath, filesObject, outputFileName, outputPath);
            mergeFiles.streamMergeMain();
            // mergeFiles.mergeFiles();
            fs.unlinkSync('./client_temp/'+fileName+'_log.txt');
            break
          }
        }
      }
      else{
        console.log('333333333333333333333333333333333333')
        console.log(fileNames); // Output the file names from the callback
        let log_file_parser = new LogFileParser(config.ftp.downloadDir+'../client_temp/'+fileNames[0]);
        log_file_parser.parseFile();
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
        let inputPath = config.ftp.downloadDir+"temps/file/" + fileName+'/';
        let filesObject = log_file_parser.parsedData.notFinishedFiles;
        let outputFileName = fileName;
        let outputPath = config.ftp.downloadDir;
        // let mergeFiles = new MergeSplitFiles(inputPath, filesObject, outputFileName, outputPath);
        // mergeFiles.mergeFiles();
        // fs.unlinkSync('./client_temp/'+fileName+'_log.txt');
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
    let fileName = `${this.input.original_file_name}_log.txt`;
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

class MergeSplitFiles {
  constructor(inputPath, filesObject, outputFileName, outputPath) {
    this.inputPath = inputPath;
    this.filesObject = filesObject;
    this.outputFileName = outputFileName;
    this.outputPath = outputPath;
  }



  /**
   * @desc 多个文件通过Stream合并为一个文件
   * 设置可读流的 end 为 false 可保持写入流一直处于打开状态，不自动关闭
   * 直到所有的可读流结束，再将可写流给关闭。
   * @param {object[]} fileList
   * @param {string} fileList.filePath 待合并的文件路径
   * @param {WriteStream} fileWriteStream 可写入文件的流
   * @returns {*}
   */
  streamMergeRecursive(fileList, fileWriteStream) {
    if (!fileList.length) {
      console.log('-------- WriteStream 合并完成 --------');
      // 最后关闭可写流，防止内存泄漏
      // 关闭流之前立即写入最后一个额外的数据块(Stream 合并完成)。
      // fileWriteStream.end('---Stream 合并完成---');
      return;
    }
    const data = fileList.shift();
    const { filePath: chunkFilePath } = data;
    console.log('-------- 开始合并 --------\n', chunkFilePath);
    // 获取当前的可读流
    const currentReadStream = fs.createReadStream(chunkFilePath);
    // 监听currentReadStream的on('data'),将读取到的内容调用fileWriteStream.write方法
    // end:true 读取结束时终止写入流,设置 end 为 false 写入的目标流(fileWriteStream)将会一直处于打开状态，不自动关闭
    currentReadStream.pipe(fileWriteStream, { end: false });
    // 监听可读流的 end 事件，结束之后递归合并下一个文件 或者 手动调用可写流的 end 事件
    currentReadStream.on('end', () => {
      console.log('-------- 结束合并 --------\n', chunkFilePath);
      this.streamMergeRecursive(fileList, fileWriteStream);
    });

    // 监听错误事件，关闭可写流，防止内存泄漏
    currentReadStream.on('error', (error) => {
      console.error('-------- WriteStream 合并失败 --------\n', error);
      fileWriteStream.close();
    });
  }

  /**
   * @desc 合并文件入口
   * @param {string} sourceFiles 源文件目录
   * @param {string} targetFile 目标文件
   */
  streamMergeMain() {
    // 获取源文件目录(sourceFiles)下的所有文件
    const chunks = Object.keys(this.filesObject);
    console.log(chunks)
    const chunkFilesDir = path.resolve(this.inputPath);
    console.log('4444444444444444444444444444444444444444')
    console.log(chunkFilesDir)
    const list = fs.readdirSync(chunkFilesDir);
    console.log(list)
    const fileList = chunks.map((name) => ({
      name,
      filePath: path.resolve(chunkFilesDir, name),
    }));
    console.log(fileList)

    // 创建一个可写流
    const fileWriteStream = fs.createWriteStream(path.resolve(this.outputPath+this.outputFileName));
    
    this.streamMergeRecursive(fileList, fileWriteStream);
  }
}


