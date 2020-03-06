import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { API_URL } from '../constants/constants';
import { fade, makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, IconButton, Typography, InputBase, Badge, MenuItem, Menu, Container } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { LOGOUT } from '../constants/actionTypes';
import EditSharpIcon from '@material-ui/icons/EditSharp';

// const LoggedOutView = props => {
//     if (!props.currentUser) {
//         return (
//             <ul className="nav navbar-nav pull-xs-right">

//                 <li className="nav-item">
//                     <Link to="/" className="nav-link">
//                         Home
//                     </Link>
//                 </li>

//                 <li className="nav-item">
//                     <Link to="/login" className="nav-link">
//                         Sign in
//                     </Link>
//                 </li>

//                 <li className="nav-item">
//                     <Link to="/register" className="nav-link">
//                         Sign up
//                     </Link>
//                 </li>

//             </ul>
//         );
//     }
//     return null;
// };

// const LoggedInView = props => {
//     if (props.currentUser) {
//         return (
//             <ul className="nav navbar-nav pull-xs-right">

//                 <li className="nav-item">
//                     <Link to="/" className="nav-link">
//                         Home
//                     </Link>
//                 </li>

//                 <li className="nav-item">
//                     <Link to="/editor" className="nav-link">
//                         <i className="ion-compose"></i>&nbsp;New Post
//                     </Link>
//                 </li>

//                 <li className="nav-item">
//                     <Link to="/settings" className="nav-link">
//                         <i className="ion-gear-a"></i>&nbsp;Settings
//                     </Link>
//                 </li>

//                 <li className="nav-item">
//                     <Link
//                         to={`/@${props.currentUser.username}`}
//                         className="nav-link">
//                         <img src={API_URL + props.currentUser.image} className="user-pic" alt={props.currentUser.username} />
//                         {props.currentUser.username}
//                     </Link>
//                 </li>

//             </ul>
//         );
//     }

//     return null;
// };

// class Header extends React.Component {
//     render() {
//         return (
//             <nav className="navbar navbar-light">
//                 <div className="container">

//                     <Link to="/" className="navbar-brand">
//                         {this.props.appName.toLowerCase()}
//                     </Link>

//                     <LoggedOutView currentUser={this.props.currentUser} />

//                     <LoggedInView currentUser={this.props.currentUser} />
//                 </div>
//             </nav>
//         );
//     }
// }

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
        <div className={classes.grow}>
            <AppBar position="static" className={classes.appRoot}>
                <Container>
                    <Toolbar>
                        <Link to="/" className={classes.webTitleLink}>
                            <Typography className={classes.title} variant="h6" noWrap>
                                {props.appName.toLowerCase()}
                            </Typography>
                        </Link>
                        <div className={classes.grow} />
                        <div className={classes.search}>
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
                        </div>
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
                                    <IconButton
                                        aria-label="account of current user"
                                        color="inherit"
                                    >
                                        <AccountCircle color='primary' />
                                    </IconButton>
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
                                    <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
                                    <MenuItem onClick={() => handleMenuClose('logout')}>Logout</MenuItem>
                                </Menu>
                            </>}
                            {!props.currentUser && <>
                                &nbsp;
                                <Link to="/register" className={classes.link}>
                                    Sign up
                                </Link>
                                &nbsp;&nbsp;&nbsp;
                                <Link to="/login" className={classes.link}>
                                    Sign in
                                </Link>
                            </>}
                        </div>
                    </Toolbar>
                </Container>
            </AppBar>
        </div>
    );
}

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
    onClickLogout: () => dispatch({ type: LOGOUT })
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
