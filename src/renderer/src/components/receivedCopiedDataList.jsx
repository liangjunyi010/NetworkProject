export const ReceivedCopiedDataList = (props) => {
  return (
    <div>
      <h3>Copied Data</h3>
      <ul>
        {props.dataQueue.map((data) => (
          <li>{data}</li>
        ))}
      </ul>
    </div>
  );
};
