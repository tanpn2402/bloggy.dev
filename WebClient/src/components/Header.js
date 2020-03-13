import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { API_URL } from '../constants/constants';
import { fade, makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, IconButton, Typography, InputBase, Grid, Badge, MenuItem, Menu, Container } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { LOGOUT } from '../constants/actionTypes';
import EditSharpIcon from '@material-ui/icons/EditSharp';

const useStyles = makeStyles(theme => ({
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade('#909090', 0.8),
        '&:hover, &:focus': {
            backgroundColor: fade('#909090', 1),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
        },
    },
    searchIcon: {
        width: theme.spacing(7),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 6),
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: 0,
            '&:focus': {
                paddingRight: theme.spacing(7),
                width: 200,
            },
        },
    },
    sectionDesktop: {
        display: 'flex'
    },
    appRoot: {
        backgroundColor: 'white'
    },
    link: {
        '&:hover, &:focus, &:active': {
            textDecoration: 'none'
        }
    },
    webTitleLink: {
        '&:hover, &:focus, &:active': {
            textDecoration: 'none'
        }
    },
    badge: {
        backgroundColor: '#2196f3',
        paddingLeft: 6,
        paddingRight: 6,
        height: 16,
        minWidth: 20,
        fontSize: 10,
        color: '#FFF'
    },
    notificationIcon: {
        backgroundColor: theme.palette.primary.main,
        borderRadius: '50%',
        padding: 2,
        color: '#FFF'
    },
    userImage: {
        borderRadius: '50%',
        width: 24,
        height: 24
    },
    danger: {
        '&:hover': {
            color: '#721c24',
            backgroundColor: '#f8d7da'
        }
    }
}));

function Header(props) {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const isMenuOpen = Boolean(anchorEl);

    const handleProfileMenuOpen = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = (e) => {
        if (e === 'logout') {
            props.onClickLogout();
        }
        setAnchorEl(null);
    };


    return (
        <>
            <AppBar position="fixed" className={classes.appRoot}>
                <Toolbar>
                    <Link to="/" className={classes.webTitleLink}>
                        <Typography className={classes.title} variant="h6" noWrap>
                            {props.appName.toLowerCase()}
                        </Typography>
                    </Link>
                    <div className={classes.grow} />
                    {/* <div className={classes.search}>
                            <div className={classes.searchIcon}>
                                <SearchIcon />
                            </div>
                            <InputBase
                                placeholder="Search…"
                                classes={{
                                    root: classes.inputRoot,
                                    input: classes.inputInput,
                                }}
                                inputProps={{ 'aria-label': 'search' }}
                            />
                        </div> */}
                    <div className={classes.sectionDesktop}>
                        {props.currentUser && <>
                            <Link to="/editor" className="nav-link">
                                <IconButton aria-label="show 17 new notifications" color="inherit">
                                    <EditSharpIcon className={classes.notificationIcon} />
                                </IconButton>
                            </Link>
                            <IconButton aria-label="show 17 new notifications" color="inherit">
                                <Badge badgeContent={17} classes={{ badge: classes.badge }}>
                                    <NotificationsIcon className={classes.notificationIcon} />
                                </Badge>
                            </IconButton>
                            <Link to={`/@${props.currentUser.username}`}>
                                <Grid container wrap='no-wrap' alignItems='center' justify='center'>
                                    <Grid item>
                                        <IconButton
                                            aria-label="account of current user"
                                            color="inherit"
                                        >
                                            <img
                                                src={API_URL + props.currentUser.image}
                                                className={classes.userImage}
                                                alt={props.currentUser.username}
                                            />
                                        </IconButton>
                                    </Grid>
                                    <Grid item>
                                        <span style={{ color: '#000' }}>{props.currentUser.username}</span>
                                    </Grid>
                                </Grid>
                            </Link>
                            <IconButton
                                edge="end"
                                aria-label="more menu"
                                aria-controls="primary-search-account-menu"
                                aria-haspopup="true"
                                onClick={handleProfileMenuOpen}
                                color="inherit"
                            >
                                <ArrowDropDownIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                getContentAnchorEl={null}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                id="primary-search-account-menu"
                                keepMounted
                                open={isMenuOpen}
                                onClose={handleMenuClose}
                            >
                                <MenuItem onClick={handleMenuClose}>Cài đặt</MenuItem>
                                <MenuItem onClick={() => handleMenuClose('logout')} className={classes.danger}>Đăng xuất</MenuItem>
                            </Menu>
                        </>}
                        {!props.currentUser && <>
                            &nbsp;
                                <Link to="/register" className={classes.link}>
                                Đăng ký
                                </Link>
                            &nbsp;&nbsp;&nbsp;
                                <Link to="/login" className={classes.link}>
                                Đăng nhập
                                </Link>
                        </>}
                    </div>
                </Toolbar>
            </AppBar>
            <Toolbar />
        </>
    );
}

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
    onClickLogout: () => dispatch({ type: LOGOUT })
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
