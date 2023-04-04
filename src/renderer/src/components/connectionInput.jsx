import { useState } from "react";
export const ConnectionInput = ({ connectServer }) => {
  const [serverIP, setServerIP] = useState("");

  const onInputChange = (event) => {
    setServerIP(event.target.value);
  };

  return (
    <div className={"row"}>
      <label htmlFor={"server-ip"}>The server IP: </label>
      <input
        type="text"
        id="server-ip"
        name={"server-ip"}
        onChange={onInputChange}
      />
      <button
        className="btn btn-primary"
        onClick={() => connectServer(serverIP)}
      >
        Connect
      </button>
    </div>
  );
};
