import { useEffect, useState } from "react";
import * as config from "../../../common/config.json";
export const ReceivedFileList = (props) => {
  const [files, setFiles] = useState([]);
  const getDownloadedFiles = () => {
    local
      .getReceivedFiles()
      .then((result) => {
        setFiles(result);
      })
      .catch((err) => console.log(err));
  };
  useEffect(getDownloadedFiles, [props.downloadCounter]);

  const openFile = (fileName) => {
    //to be implemented
    // local.openFile(config.ftp.downloadDir,fileName)
    local.openDownloadFolder(fileName)
  };

  return (
    <div className="col-5">
      <h3 className="mb-3">Received Files</h3>
      <br />
      <ul className="list-group limited-height">
        {files.map((fileName) => (
          <li
            className="list-group-item d-flex align-items-center"
            onClick={() => {
              openFile(fileName);
            }}
            key={fileName}
          >
            {fileName}
          </li>
        ))}
      </ul>
    </div>
  );
};
