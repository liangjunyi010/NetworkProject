export const FileItem = (props) => {
  let onClickHandler = () => {
    if (props.type === 1) {
      ftp.getFile(props.dir, props.fileName);
    } else if (props.type === 2) {
      props.updateCurrentDirectory(props.fileName);
    }
  };
  return (
    <div className="row" onClick={onClickHandler}>
      <p>{props.fileName}</p>
    </div>
  );
};
