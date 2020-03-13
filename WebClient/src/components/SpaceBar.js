import React from 'react';
import { connect } from 'react-redux';
import { API_URL } from '../constants/constants';
import { fade, makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, IconButton, Typography, InputBase, Grid, Badge, MenuItem, Menu, Container, Tooltip, Button } from '@material-ui/core';
import { LOGOUT } from '../constants/actionTypes';
import CodeIcon from '@material-ui/icons/Code';

const useStyles = makeStyles(theme => ({
    sideBar: {
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#FFF',
        borderRadius: 10,
        position: 'sticky',
        top: 60
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        height: 52,
        marginBottom: 0
    },
    item: {
        color: 'inherit',
        paddingTop: 6,
        paddingBottom: 6,
        cursor: 'pointer',
        userSelect: 'none',
        '&:hover, &:focus, &:active': {
            textDecoration: 'none',
            color: theme.palette.primary.main
        },
    },
}));

function SpaceBar(props) {
    const classes = useStyles();


    return (
        <div className={classes.sideBar}>
            <p className={classes.header}>
                <strong style={{ fontSize: 20 }}>Spaces</strong>&nbsp;&nbsp;của bạn
            </p>
            {[1, 2, 3, 4, 5].map(e => <Grid container alignItems='center' className={classes.item}>
                <Grid item>
                    <Grid container alignItems='center'>
                        <Tooltip title='Space công khai'>
                            <CodeIcon color='primary' />
                        </Tooltip>
                    </Grid>
                </Grid>
                <Grid item xs container alignItems='center'
                    onClickSpace={() => {

                    }}
                >
                    <span>&nbsp;Vui chơi #{e}</span>
                </Grid>
            </Grid>)}
            <br />
            <p>Cần thêm không gian để sáng tạo, trao đổi hay là tranh luận? Hãy tạo <strong>Space</strong> mới ngay</p>
            <Button color='primay' color='primary' fullWidth size='large'>Tạo&nbsp;&nbsp;<strong>Space</strong></Button>
            <br />
            <br />
        </div>
    );
}

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
    onClickLogout: () => dispatch({ type: LOGOUT })
});

export default connect(mapStateToProps, mapDispatchToProps)(SpaceBar);
