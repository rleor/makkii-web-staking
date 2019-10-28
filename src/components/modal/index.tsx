import React from 'react';
import ReactDOM from 'react-dom';
import Modal, { Iaction } from './modal';
import withPortal from './modalPortal'


export default withPortal(Modal);

export const alert = (props: {
    title: string,
    message: string,
    actions?: Array<Iaction>
}) => {
    const { title, message,actions } = props;
    const modalRoot = document.body;
    const div = document.createElement("div");
    modalRoot.appendChild(div);
    const hide = ()=> {
        ReactDOM.unmountComponentAtNode(div);
        if (div && div.parentNode) {
          div.parentNode.removeChild(div);
        }
    }
    ReactDOM.render(
    <Modal
        visible
        title={title}
        hide={hide}
        actions={actions}
    >
        {message}
    </Modal>, div)

} 