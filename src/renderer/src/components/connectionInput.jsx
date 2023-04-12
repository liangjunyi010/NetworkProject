import { useState } from "react";
export const ConnectionInput = (props) => {
  const [serverIP, setServerIP] = useState("");

  const onInputChange = (event) => {
    setServerIP(event.target.value);
  };

  const options = [
    { value: 0, label: 'FTP' },
    { value: 1, label: 'SFTP' },
  ];
  
  return (
    <div className="row mb-3">
      <div className="col-4">
        <label htmlFor={"server-ip"} className="form-label">
          Destination IP:{" "}
        </label>
        <input
          type="text"
          id="server-ip"
          name={"server-ip"}
          onChange={onInputChange}
          className={"form-control"}
        />
      </div>
      <div className="col-2 d-flex align-items-end">
        <button
          className="btn btn-primary w-100"
          onClick={() => props.connectServer(serverIP)}
        >
          Connect
        </button>
      </div>
      <div className="col-2 d-flex align-items-end">
        {options.map((option) => (
        <div key={option.value}>
          <input
            type="radio"
            name="connectionMode"
            value={option.value}
            checked={props.connectionMode===option.value}
            onChange={() => props.connectionModeSetter(option.value)}
          />
            <label htmlFor={option.value}>{option.label}</label>
        </div>
        ))}
      </div>
    </div>
  );
};
