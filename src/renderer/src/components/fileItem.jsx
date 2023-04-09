export const FileItem = (props) => {
  let onClickHandler = () => {
    if (props.type === 1) {
      ftp.getFile(props.dir, props.fileName).then(() => {
        props.informDownload();
        //download complete triggers counter, counter triggers download list update
      });
    } else if (props.type === 2) {
      props.updateCurrentDirectory(props.fileName);
    }
  };
  return (
    <li
      className="list-group-item d-flex align-items-center clickable"
      onClick={onClickHandler}
    >
      {props.type === 1 ? (
        <i className="bi bi-file-earmark me-2"></i>
      ) : (
        <i className="bi bi-folder me-2"></i>
      )}
      <span>{props.fileName}</span>
    </li>
  );
};
