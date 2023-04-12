"use strict";
import { FileItem } from "./fileItem";
import { useState, useEffect } from "react";

export const FileList = (props) => {
  const [files, setFiles] = useState([]);
  const [currentDirectory, setCurrentDirectory] = useState("./");
  useEffect(resetDirectory, [props.serverIP]); //reset dir when server ip change (new connection)
  useEffect(updateFileList, [currentDirectory]);
  function updateFileList() {
    ftp
      .getFileList(currentDirectory)
      .then((result) => {
        console.log("filelist result: ");
        console.log(result);
        setFiles(result);
      })
      .catch((err) => console.log(err));
  }

  function resetDirectory() {
    setCurrentDirectory("./");
  }

  const updateCurrentDirectory = (subdir) => {
    console.log(subdir);
    let newDir = currentDirectory + subdir;
    if (!newDir.endsWith("/")) {
      newDir += "/";
    }
    console.log(newDir);
    setCurrentDirectory(newDir);
  };

  return (
    <div className="col-5">
      <h3 className="mb-3">Files and Directories</h3>
      <span>Current Directory: {currentDirectory}</span>
      <ul className="list-group limited-height">
        {files.map((element) => (
          <FileItem
            fileName={element.name}
            type={element.type}
            key={element.name}
            updateCurrentDirectory={updateCurrentDirectory}
            dir={currentDirectory}
            informDownload={props.informDownload}
            connectionMode={props.connectionMode}
          />
          // type 1 means file, type 2 means folder
        ))}
      </ul>
    </div>
  );
};
