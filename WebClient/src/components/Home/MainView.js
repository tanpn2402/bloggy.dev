import React, { useState } from 'react';
import ArticleList from '../ArticleList';
import agent from '../../agent';
import { connect } from 'react-redux';
import { Paper, Typography, withStyles, Grid, Button, Divider } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import withPopup from '../../withPopup';
import CheckIcon from '@material-ui/icons/Check';

const TYPE = require('../../constants/spaceTypes').default;

const MainView = props => {
    return (
        <div>
            <div className="feed-toggle">
                <ul className="nav nav-pills outline-active">

                    <YourFeedTab
                        token={props.token}
                        tab={props.tab}
                        onTabClick={props.onTabClick}
                    />

                    <GlobalFeedTab
                        tab={props.tab}
                        onTabClick={props.onTabClick}
                    />

                    <TagFilterTab tag={props.tag} />

                    <SpaceFilterTab space={props.space} />

                </ul>
            </div>

            <SpaceInfo
                classes={props.classes}
                token={props.token}
                space={props.space}
                history={props.history}
                spaceInfo={props.spaceInfo}
                showPopup={props.showPopup}
            />

            <ArticleList
                articles={props.articles}
                loading={props.loading}
            />
        </div>
    );
};


const YourFeedTab = props => {
    if (props.token) {
        const clickHandler = ev => {
            ev.preventDefault();
            props.onTabClick('feed', agent.Articles.feed());
        }

        return (
            <li className="nav-item">
                <a href=""
                    className={props.tab === 'feed' ? 'nav-link active' : 'nav-link'}
                    onClick={clickHandler}>
                    Tin của bạn
                </a>
            </li>
        );
    }
    return null;
};

const GlobalFeedTab = props => {
    const clickHandler = ev => {
        ev.preventDefault();
        props.onTabClick('all', agent.Articles.all());
    };
    return (
        <li className="nav-item">
            <a
                href=""
                className={props.tab === 'all' ? 'nav-link active' : 'nav-link'}
                onClick={clickHandler}>
                Tổng hợp
            </a>
        </li>
    );
};

const TagFilterTab = props => {
    if (!props.tag) {
        return null;
    }

    return (
        <li className="nav-item">
            <a href="" className="nav-link active">
                Thẻ&nbsp;&nbsp;<i className="ion-pound"></i>{props.tag}
            </a>
        </li>
    );
};

const SpaceFilterTab = props => {
    if (!props.space) {
        return null;
    }

    return (
        <li className="nav-item">
            <a href="" className="nav-link active">
                &nbsp;&nbsp;<i className="ion-pound"></i>{props.space}
            </a>
        </li>
    );
};

const SpaceInfo = props => {
    const { classes, space, spaceInfo } = props;

    if (!space || !spaceInfo) {
        return null;
    }

    const [isFollowed, setIsFollowed] = useState(spaceInfo.followed);
    const template = TYPE.filter(e => e.type === spaceInfo.type)[0] || {};
    const Icon = template.icon;

    const onFollow = () => {
        if (props.token) {
            agent.Spaces.follow(spaceInfo._id).then(res => {
                if (res.code === 200) {
                    setIsFollowed(true);
                }
            })
        } else {
            props.showPopup({
                title: () => <Typography variant='h6' color='primary'>Theo dõi Space</Typography>,
                body: 'Bạn cần Đăng nhập để thực hiện thao tác này.',
                footer: () => <>
                    <Button color='primary' variant='outlined'
                        onClick={() => props.history.replace('/register')}>
                        Đăng kí
                    </Button>
                    <Button color='primary' variant='contained'
                        onClick={() => props.history.replace('/login')}>
                        Đăng nhập
                    </Button>
                </>
            })
        }
    }

    return (
        <Paper elevation={1} className={classes.spaceInfo} >
            <img src={spaceInfo.cover_photo} className={classes.coverPhoto} />
            <Typography variant='h5' className={classes.spaceName}>{spaceInfo.name}</Typography>
            <Divider />
            <Grid container alignItems='center' spacing={4}>
                <Grid item>
                    <Grid container alignItems='center'>
                        {Icon && <Icon color='primary' size='sm' />}&nbsp;
                        <Typography>{template.label}</Typography>
                    </Grid>
                </Grid>
                <Grid item>
                    <Typography color='primary' display='inline'><b>{spaceInfo.followsCount}</b></Typography> người theo dõi
                </Grid>
                <Grid item xs />
                <Grid item>
                    {!isFollowed && <Button color='primary'
                        startIcon={<AddIcon color='primary' />}
                        onClick={onFollow}
                    >
                        Theo dõi
                    </Button>}
                    {isFollowed && <Grid container alignItems='center'>
                        <Grid item>
                            <Grid container alignItems='center'><CheckIcon color='primary' /></Grid>
                        </Grid>
                        <Typography variant='button' color='primary'>&nbsp;&nbsp;&nbsp;Đã theo dõi</Typography>
                    </Grid>}
                </Grid>
            </Grid>
            <Divider />
            <Typography paragraph>
                {spaceInfo.description}
            </Typography>
        </Paper>
    );
}


const styles = theme => {
    return ({
        spaceInfo: {
            marginBottom: 10,
            padding: 20
        },
        coverPhoto: {
            width: '100%',
            borderRadius: theme.shape.borderRadius
        },
        spaceName: {
            marginTop: 10,
            marginBottom: 10
        }
    })
}

const mapStateToProps = state => ({
    token: state.common.token
});

const mapDispatchToProps = dispatch => ({
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withPopup(MainView)));
