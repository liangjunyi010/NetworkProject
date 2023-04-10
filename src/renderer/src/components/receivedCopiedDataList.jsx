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
      console.log('setting to true');
      setShowToast(true)
      setTimeout(() => {
        console.log('setting to false');
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
        {props.dataQueue.reverse().map((data) => {
          let decodedText = utf8decoder.decode(data);
          return (
            <li className="mb-2" key={data}>

              <div class="flip-card">
                <div class="flip-card-inner">
                  <div class="flip-card-front">
                    <p>{decodedText.length >= 50 ? decodedText.substring(0, 50) + " ......" : decodedText}</p>
                  </div>
                  <div class="flip-card-back">
                    <i className="bi bi-files clickable" onClick={() => writeToClipboard(data)}></i>
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
