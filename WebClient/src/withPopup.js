import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import { Button } from '@material-ui/core';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});



export default function withPopup(WrappedComponent) {
    return class extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                isOpen: false
            }
        }

        handleClose = () => {
            this.setState({
                isOpen: false
            })
        };

        showPopup = ev => {
            this.setState({
                isOpen: true,
                title: ev.title,
                body: ev.body,
                footer: ev.footer
            })
        }

        render() {
            const { isOpen, ...state } = this.state;

            return <>
                <WrappedComponent
                    {...this.props}
                    showPopup={ev => this.showPopup(ev)}
                />

                <Dialog
                    open={isOpen}
                    TransitionComponent={Transition}
                    mountOnEnter
                    unmountOnExit
                    onClose={this.handleClose}
                >
                    <DialogTitle>{typeof state.title === 'function' ? state.title() : state.title}</DialogTitle>
                    <DialogContent>
                        {typeof state.body === 'function' ? state.body() : <DialogContentText>{state.body}</DialogContentText>}
                    </DialogContent>
                    {state.footer && <DialogActions>
                        {typeof state.footer === 'function' ? state.footer() :
                            <Button onClick={this.handleClose} color="primary">
                                Đóng
                        </Button>}
                    </DialogActions>}
                </Dialog>
            </>
        }
    };
}
