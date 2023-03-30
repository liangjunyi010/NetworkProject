const React = require("react");

// class FileItem extends React.Component{
//
// }

function FileItem(props){
    return (
        <div class={'row'}>
            <p>{props.fileName}</p>
        </div>
    )
}