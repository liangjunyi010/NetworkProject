
'use strict';

// class LikeButton extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = { liked: false };
//     }
//
//     render() {
//         if (this.state.liked) {
//             return 'You liked this.';
//         }
//
//         return e(
//             'button',
//             { onClick: () => this.setState({ liked: true }) },
//             'Like'
//         );
//     }
// }

import React from "react";

export class FileList extends React.Component{
    constructor(props) {
        super(props);
    }

    render(){
        return (
            <ul>
                {
                    this.props.files.map(
                        element=>
                            <li key={element.name}>{element.name}</li>
                        
                    )
                }
            </ul>

        )
    }
}