import { useEffect, useState } from 'react'
import * as config from '../../../common/config.json'
export const ReceivedFileList = (props)=>{
    const [files,setFiles] = useState([])
    const getDownloadedFiles = ()=>{
        local.getReceivedFiles().then(result=>{
            console.log('files');
            console.log(result);
            setFiles(result)
        }).catch(err=>console.log(err))
    }
    useEffect(getDownloadedFiles,[props.downloadCounter])

    const openFile = (fileName)=>{
        //to be implemented
    }

    return (
        <div className="col-5">
            <h3 className="mb-3">Received Files</h3>
        <ul className='list-group'>
            {files.map(fileName=><li className='list-group-item d-flex align-items-center' onClick={()=>{openFile(fileName)}} key={fileName}>{fileName}</li>)}
        </ul>
        </div>
    )
}