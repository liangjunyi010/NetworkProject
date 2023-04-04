"use strict";
import { FileItem } from "./fileItem";
import { useState, useEffect } from "react";

export const FileList = (props) => {
  const [files, setFiles] = useState([]);
  const [currentDirectory, setCurrentDirectory] = useState("./");
  useEffect(updateFileList, [props.connected, currentDirectory]);

  function updateFileList() {
    if (props.connected) {
      ftp
        .getFileList(currentDirectory)
        .then((result) => {
          console.log("filelist result: ");
          console.log(result);
          setFiles(result);
        })
        .catch((err) => console.log(err));
    }
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
    <ul>
      {files.map((element) => (
        <FileItem
          fileName={element.name}
          type={element.type}
          key={element.name}
          updateCurrentDirectory={updateCurrentDirectory}
          dir={currentDirectory}
        />
        // type 1 means file, type 2 means folder
      ))}
    </ul>
  );
};
