import React from 'react';
import { connect } from 'react-redux';
import { fade, makeStyles, withStyles } from '@material-ui/core/styles';
import { Typography, InputBase, Grid, Tooltip, Button } from '@material-ui/core';
import { Link } from 'react-router-dom';
import agent from '../agent';

const TYPE = require('../constants/spaceTypes').default;

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
                    this.setState({
                        mySpaces: payload[0].spaces || [],
                        followedSpaces: payload[1].spaces || []
                    })
                })
        }
        else {
            this.props.onLoad(Promise.all([agent.Spaces.byRecommended()]),
                ({ payload }) => {
                    console.log(payload);
                    this.setState({
                        recommendedSpaces: payload[0].spaces || []
                    })
                })
        }
    }

    render() {
        const { classes, ...props } = this.props;
        const { ...state } = this.state;

        return (
            <div className={classes.sideBar}>
                {!props.currentUser && (function () {
                    return <>
                        <br />
                        <Typography paragraph>Hãy đăng nhập để theo dõi nhiều &nbsp;
                            <Typography display='inline'><b>Space</b></Typography>
                            &nbsp;thú vị hơn nhé
                        </Typography>

                        <Link to='/login'>
                            <Button color='primay' color='primary' fullWidth size='large'>
                                Đăng nhập
                            </Button>
                        </Link>
                        <br />

                        <Typography>
                            <Typography display='inline'><b>Spaces</b></Typography>
                            &nbsp;được gợi ý
                        </Typography>
                        {state.recommendedSpaces.map(space =>
                            <Item key={space._id} classes={classes} space={space} onClickSpace={props.onClickSpace} />
                        )}
                    </>
                }).call()}

                {props.currentUser && (function () {
                    return <>
                        <p className={classes.header}>
                            <strong style={{ fontSize: 20 }}>Spaces</strong>&nbsp;&nbsp;của bạn
                        </p>

                        {[].concat(state.mySpaces).concat(state.followedSpaces).map(space =>
                            <Item key={space._id} classes={classes} space={space} onClickSpace={props.onClickSpace} />
                        )}

                        <br />
                        <p>Cần thêm không gian để sáng tạo, trao đổi hay là tranh luận? Hãy tạo <b>Space</b> mới ngay</p>
                        <Link to='/new-space'>
                            <Button color='primay' color='primary' fullWidth size='large'>
                                Tạo&nbsp;&nbsp;<b>Space</b>
                            </Button>
                        </Link>
                    </>
                }).call()}
                <br />
                <br />
            </div >
        );
    }
}


class Item extends React.Component {
    render() {
        const { classes, space, ...props } = this.props;

        let template = TYPE.filter(e => e.type === space.type)[0] || {};
        let Icon = template.icon;

        return <Grid
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
    }
}

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

const mapStateToProps = state => ({
    currentUser: state.common.currentUser
});

const mapDispatchToProps = dispatch => ({
    onLoad: (payload, callback) => dispatch({ payload, callback })
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(SpaceBar));
