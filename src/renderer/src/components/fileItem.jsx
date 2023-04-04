
export const FileItem = (props) => {
  let onClickHandler = () => {
    if (props.type === 1) {
      ftp.getFile(props.dir, props.fileName);
    } else if (props.type === 2) {
      props.updateCurrentDirectory(props.fileName);
    }
  };
  return (
    <li className="list-group-item d-flex align-items-center" onClick={onClickHandler}>
      {props.type===1 ? <i class="bi bi-file-earmark me-2"></i> : <i class="bi bi-folder me-2"></i>}
      <span>{props.fileName}</span>
    </li>
  );
};
