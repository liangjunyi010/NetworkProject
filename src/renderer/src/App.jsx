import React from "react";
import { ConnectionInput } from "./components/connectionInput";
import { FileList } from "./components/fileList";
import { ReceivedFileList } from "./components/receivedFileList";
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serverIP: "",
      downloadCounter:0,
      localIP:'',
      firstConnected:false,
      connectionMode:0
    };
  }
  componentDidMount(){
    this.getLocalIP()
  }
  connectionModeSetter=(checked)=>{
    this.setState(()=>({connectionMode:checked}),()=>{console.log(this.state.connectionMode)})
  }
  
  getLocalIP = async ()=>{
    let ip = await local.getLocalIP()
    this.setState(()=>{return {localIP:ip}},()=>console.log(this.state.localIP))
  }

  connectServer = async (newServerIP) => {
    try {
      ftp.createClient(newServerIP).then(() => {
        if (!this.state.firstConnected){
          this.setState(()=>{return {firstConnected:true}},()=>{})
        }
        this.setState(() => {
          return { serverIP: newServerIP };
        },()=>console.log("current serverip:"+this.state.serverIP));
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
        <h4 className="text-center mb-4">Local IP: {this.state.localIP}</h4>
        <h2 className="mb-4">Server Connection</h2>
        <ConnectionInput connectServer={this.connectServer} connectionModeSetter = {this.connectionModeSetter}/>
        <div className="row">
            {this.state.firstConnected && (<FileList serverIP={this.state.serverIP} informDownload={this.informDownload}/>)}
            
  
          <div className="col-2"></div>
          
            <ReceivedFileList downloadCounter={this.state.downloadCounter}/>
        </div>
      </div>
    );
  }
}
