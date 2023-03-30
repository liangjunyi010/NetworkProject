import React from 'react';
import {FileList} from "./components/fileList";
export default class App extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            serverIP:'',
            files:[]
        }
    }

    connectServer=async()=>{
        try{
            // this.setState(
            //     async ()=>{
            //         let newVal = await ftp.getFileList('./')
            //         console.log(newVal);
            //         return {files:newVal}
            //     },
            //     ()=>{
            //         console.log(this.state.files)
            //     }
            // )
            ftp.createClient(this.state.serverIP).then(async ()=>{
                this.setState({files:await ftp.getFileList('./')})
            })
        }catch (err){
            console.log(err)
        }
    }

    // onServerIPInputChange(event){
    //     this.setState(()=>{
    //         return {serverIP:event.target.value}
    //     },
    //     ()=>{
    //         console.log("new serverIP state value: "+this.state.serverIP)
    //     })
    // }
    onServerIPInputChange = (event) => {
        this.setState(()=>{
            return {serverIP:event.target.value}
        },
        ()=>{
            console.log("new serverIP state value: "+this.state.serverIP)
        })
    }

    render() {
        return (
            <div>
                <div className={"row"} >
                    <label htmlFor={'server-ip'}>The server IP: </label>
                    <input type="text" id='server-ip' name={'server-ip'} onChange={this.onServerIPInputChange}/>
                    <button className='btn btn-primary' onClick={this.connectServer}>Connect</button>
                </div>
                <FileList files={this.state.files}/>
            </div>
        )
    }
}

