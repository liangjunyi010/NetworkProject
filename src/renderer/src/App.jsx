import React from "react";
import { ConnectionInput } from "./components/connectionInput";
import { FileList } from "./components/fileList";
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serverIP: "",
      // files: [],
      currentDirectory: "",
      connected: false,
    };
  }

  connectServer = async (serverIP) => {
    try {
      ftp.createClient(serverIP).then(() => {
        this.setState(() => {
          return { connected: true };
        });
      });
    } catch (err) {
      console.log(err);
    }
  };

  // onServerIPInputChange(event){
  //     this.setState(()=>{
  //         return {serverIP:event.target.value}
  //     },
  //     ()=>{
  //         console.log("new serverIP state value: "+this.state.serverIP)
  //     })
  // }
  onServerIPInputChange = (event) => {
    this.setState(
      () => {
        return { serverIP: event.target.value };
      },
      () => {
        console.log("new serverIP state value: " + this.state.serverIP);
      }
    );
  };

  render() {
    return (
      <div>
        <ConnectionInput connectServer={this.connectServer} />
        <FileList connected={this.state.connected} />
      </div>
    );
  }
}
