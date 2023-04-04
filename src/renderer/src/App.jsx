import React from "react";
import { ConnectionInput } from "./components/connectionInput";
import { FileList } from "./components/fileList";
import { ReceivedFileList } from "./components/receivedFileList";
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serverIP: "",
      downloadCounter:0
    };
  }

  connectServer = async (newServerIP) => {
    try {
      ftp.createClient(newServerIP).then(() => {
        this.setState(() => {
          return { serverIP: newServerIP };
        });
      });
    } catch (err) {
      console.log(err);
    }
  };

  informDownload = ()=>{
    this.setState(()=>{return {downloadCounter:this.state.downloadCounter+1}},()=>console.log(this.state.downloadCounter))
  }

  render() {
    return (
      <div className="container mt-5">
        <h2 className="text-center mb-4">Server Connection</h2>
        <ConnectionInput connectServer={this.connectServer} />
        <div className="row">
          
            <FileList serverIP={this.state.serverIP} informDownload={this.informDownload}/>
  
          <div className="col-2"></div>
          
            <ReceivedFileList downloadCounter={this.state.downloadCounter}/>
        </div>
      </div>
    );
  }
}
