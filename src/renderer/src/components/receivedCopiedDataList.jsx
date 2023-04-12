import clipboard from "clipboardy";
import { Toast } from "react-bootstrap";
import { ToastContainer } from "react-bootstrap";
import { useRef, useState } from "react";
import "../assets/receivedCopiedDataList.css"

export const ReceivedCopiedDataList = (props) => {

  const [showToast, setShowToast] = useState(false)
  const utf8decoder = new TextDecoder();
  const writeToClipboard = (data) => {
    clipboard.write(utf8decoder.decode(data)).then(() => {
      setShowToast(true)
      setTimeout(() => {
        setShowToast(false)
      }, 2000)
    })
  }


  return (
    <div>
      <h3 className="mb-3">Copied Data</h3>
      <ToastContainer className="d-inline-block m-1" position={"bottom-center"}>
        <Toast show={showToast} bg={"secondary"} >
          <Toast.Body className="text-white">Copied to clipboard!</Toast.Body>
        </Toast>
      </ToastContainer>
      <ul className="list-unstyled">
        {props.dataQueue.slice().reverse().map((data) => {
          let decodedText = utf8decoder.decode(data);
          return (
            <li className="mb-2" key={data}>

              <div className="flip-card">
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <p>{decodedText.length >= 50 ? decodedText.substring(0, 50) + " ......" : decodedText}</p>
                  </div>
                  <div className="flip-card-back">
                    <i className="bi bi-files clickable" style={{fontSize:"2rem"}} onClick={() => writeToClipboard(data)}></i>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

    </div>
  );
};
