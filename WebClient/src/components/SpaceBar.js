import React from 'react';
import { connect } from 'react-redux';
import { API_URL } from '../constants/constants';
import { fade, makeStyles, withStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, IconButton, Typography, InputBase, Grid, Badge, MenuItem, Menu, Container, Tooltip, Button } from '@material-ui/core';
import { LOGOUT } from '../constants/actionTypes';
import CodeIcon from '@material-ui/icons/Code';
import { Link } from 'react-router-dom';
import agent from '../agent';
import LockIcon from '@material-ui/icons/Lock';
import WorkIcon from '@material-ui/icons/Work';
import SchoolIcon from '@material-ui/icons/School';
import ForumIcon from '@material-ui/icons/Forum';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import MovieIcon from '@material-ui/icons/Movie';
import MenuBookIcon from '@material-ui/icons/MenuBook';

const styles = theme => ({
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
});

const DATA = [
    {
        "_id": "5e70305b0ce5f9163171058d",
        "name": "Vui chơi ở tầng #high",
        "description": "test1",
        "type": "music",
        "visibility": "private",
        "slug": "test1-8euwpu",
        "author": "5e6b37e87b2fe3215e9035d5",
        "createdAt": "2020-03-17T02:05:15.482Z",
        "updatedAt": "2020-03-17T02:05:15.482Z"
    },
    {
        "_id": "5e6f5aae0ce5f9163171058c",
        "name": "test",
        "description": "test",
        "type": "forum",
        "visibility": "private",
        "slug": "test-g3napq",
        "author": "5e6b37e87b2fe3215e9035d5",
        "createdAt": "2020-03-16T10:53:34.545Z",
        "updatedAt": "2020-03-16T10:53:34.545Z"
    },
    {
        "_id": "5e6f59840ce5f9163171058b",
        "name": "Test",
        "description": "test",
        "type": "code",
        "visibility": "private",
        "slug": "test-lvciih",
        "author": "5e6b37e87b2fe3215e9035d5",
        "createdAt": "2020-03-16T10:48:36.566Z",
        "updatedAt": "2020-03-16T10:48:36.566Z"
    },
    {
        "_id": "5e6f59610ce5f9163171058a",
        "name": "Homework",
        "description": "Homework",
        "type": "other",
        "visibility": "public",
        "slug": "homework-2asrux",
        "author": "5e6b37e87b2fe3215e9035d5",
        "createdAt": "2020-03-16T10:48:01.531Z",
        "updatedAt": "2020-03-16T10:48:01.531Z"
    },
    {
        "_id": "5e6f59380ce5f91631710589",
        "name": "Homework",
        "description": "Homework",
        "type": "other",
        "visibility": "public",
        "slug": "homework-u7t9ou",
        "author": "5e6b37e87b2fe3215e9035d5",
        "createdAt": "2020-03-16T10:47:20.827Z",
        "updatedAt": "2020-03-16T10:47:20.827Z"
    }
];

const TYPE = [
    { type: 'work', icon: WorkIcon, label: 'Công việc' },
    { type: 'school', icon: SchoolIcon, label: 'Trường/Lớp' },
    { type: 'code', icon: CodeIcon, label: 'Lập trình' },
    { type: 'music', icon: MusicNoteIcon, label: 'Âm nhạc' },
    { type: 'movie', icon: MovieIcon, label: 'Phim ảnh' },
    { type: 'book', icon: MenuBookIcon, label: 'Sách truyện' },
    { type: 'forum', icon: ForumIcon, label: 'Thảo luận' },
    { type: 'other', icon: AspectRatioIcon, label: 'Khác' },
]

class SpaceBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            mySpaces: [],
            followedSpaces: [],
            recommendedSpaces: []
        }
    }

    componentWillMount() {
        const { currentUser } = this.props;
        if (currentUser) {
            this.props.onLoad(Promise.all([agent.Spaces.byAuthor(currentUser.username), agent.Spaces.byFollowed(currentUser.username)]),
                ({ payload }) => {

                })
        }
        else {
            this.props.onLoad(Promise.all([agent.Spaces.byRecommended()]),
                ({ payload }) => {

                })
        }
    }

    render() {
        const { classes, ...props } = this.props;

        return (
            <div className={classes.sideBar}>
                <p className={classes.header}>
                    <strong style={{ fontSize: 20 }}>Spaces</strong>&nbsp;&nbsp;của bạn
                </p>
                {DATA.map(space => {
                    let template = TYPE.filter(e => e.type === space.type)[0] || {};

                    let Icon = template.icon;

                    return <Grid key={space._id}
                        container alignItems='center'
                        className={classes.item}
                    >
                        <Grid item>
                            <Grid container alignItems='center'>
                                <Tooltip title='Space công khai'>
                                    <Icon color='primary' />
                                </Tooltip>
                            </Grid>
                        </Grid>
                        <Grid item xs container alignItems='center'
                            onClick={ev => {
                                ev.preventDefault();
                                props.onClickSpace(space, agent.Articles.bySpace(space._id, 0));
                            }}
                        >
                            <span>&nbsp;{space.name}</span>
                        </Grid>
                    </Grid>
                })}
                <br />
                <p>Cần thêm không gian để sáng tạo, trao đổi hay là tranh luận? Hãy tạo <strong>Space</strong> mới ngay</p>
                <Link to='/new-space'>
                    <Button color='primay' color='primary' fullWidth size='large'>Tạo&nbsp;&nbsp;<strong>Space</strong></Button>
                </Link>
                <br />
                <br />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    currentUser: state.common.currentUser
});

const mapDispatchToProps = dispatch => ({
    onLoad: (payload, callback) => dispatch({ payload, callback })
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(SpaceBar));
