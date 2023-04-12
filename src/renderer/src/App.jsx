import React from "react";
import { ConnectionInput } from "./components/connectionInput";
import { FileList } from "./components/fileList";
import { ReceivedFileList } from "./components/receivedFileList";
import { ReceivedCopiedDataList } from "./components/receivedCopiedDataList";
import * as config from "../../common/config.json";
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serverIP: "",
      downloadCounter: 0,
      localIP: "",
      firstConnected: false,
      copiedDataQueue: [],
      connectionMode:0
    };
  }
  componentDidMount() {
    this.getLocalIP();

    //set handler for received udp data
    window.udp.onReceiveData((_event, data) => {
      
      this.setState(
        () => {
          let newQ = this.state.copiedDataQueue.concat(data);
          while (newQ.length > config.udp.maxMessage) {
            newQ.shift();
          }
          return { copiedDataQueue: newQ };
        },
        () => {
          console.log(this.state.copiedDataQueue);
        }
      );
    });

  }
  connectionModeSetter=(checked)=>{
    this.setState(()=>({connectionMode:checked}),()=>{console.log(this.state.connectionMode)})
  }

  getLocalIP = async () => {
    let ip = await local.getLocalIP();
    this.setState(
      () => {
        return { localIP: ip };
      },
      () => console.log(this.state.localIP)
    );
  };

  connectServer = async (newServerIP) => {
    try {
      udp.setUdpDest(newServerIP);
      ftp.createClient(newServerIP).then(() => {
        if (!this.state.firstConnected) {
          this.setState(
            () => {
              return { firstConnected: true };
            },
            () => {}
          );
        }
        this.setState(
          () => {
            return { serverIP: newServerIP };
          },
          () => console.log("current serverip:" + this.state.serverIP)
        );
      });
    } catch (err) {
      console.log(err);
    }
  };

  informDownload = () => {
    this.setState(
      () => {
        return { downloadCounter: this.state.downloadCounter + 1 };
      },
      () => console.log(this.state.downloadCounter)
    );
  };

  render() {
    return (
      <div className="container mt-5">
        <h4 className="text-center mb-4">Local IP: {this.state.localIP}</h4>
        <ConnectionInput connectServer={this.connectServer} connectionModeSetter = {this.connectionModeSetter}/>
        <br />
        <div className="row">
          <ReceivedFileList downloadCounter={this.state.downloadCounter} />
          <div className="col-1"></div>
          {this.state.firstConnected && (
            <FileList
              serverIP={this.state.serverIP}
              informDownload={this.informDownload}
              connectionMode={this.state.connectionMode}
            />
          )}
        </div>
        <br />
        <ReceivedCopiedDataList dataQueue={this.state.copiedDataQueue} />
      </div>
    );
  }
}
