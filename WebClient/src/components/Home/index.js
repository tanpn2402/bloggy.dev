import Banner from './Banner';
import MainView from './MainView';
import React from 'react';
import Tags from './Tags';
import agent from '../../agent';
import { connect } from 'react-redux';
import { Grid, withStyles } from '@material-ui/core';
import SpaceBar from '../SpaceBar';
import classNames from 'classnames';
import {
    HOME_PAGE_LOADED,
    HOME_PAGE_UNLOADED,
    APPLY_TAG_FILTER
} from '../../constants/actionTypes';

import '../../assets/styles/home.css';

const Promise = global.Promise;

const mapStateToProps = state => ({
    ...state.home,
    appName: state.common.appName,
    token: state.common.token
});

const mapDispatchToProps = dispatch => ({
    onClickTag: (tag, pager, payload) => {
        dispatch({ type: APPLY_TAG_FILTER, tag, pager, payload })
    },
    onLoad: (tab, pager, payload) => {
        dispatch({ type: HOME_PAGE_LOADED, tab, pager, payload })
    },
    onUnload: () => {
        dispatch({ type: HOME_PAGE_UNLOADED })
    },
    onClickSpace: (space, pager, payload) => {
        
    }
});


const styles = theme => ({
    wrapper: {
        paddingLeft: 10,
        paddingRight: 10
    },
    mySpace: {
    },
    homePage: {
        paddingLeft: 10,
        paddingRight: 10
    }
})

class Home extends React.Component {
    componentWillMount() {
        const tab = this.props.token ? 'feed' : 'all';
        const articlesPromise = this.props.token ?
            agent.Articles.feed :
            agent.Articles.all;

        this.props.onLoad(tab, articlesPromise, Promise.all([agent.Tags.getAll(), articlesPromise()]));
    }

    componentWillUnmount() {
        this.props.onUnload();
    }

    render() {
        const { classes, ...props } = this.props;

        return (
            <div className="home-page">
                <Banner token={props.token} appName={props.appName} />
                <Grid container className={classes.homePage}>
                    <Grid item xs={4} sm={3} md={2} className={classNames(classes.wrapper, classes.mySpace)}>
                        <SpaceBar 
                            onClickSpace={props.onClickSpace}
                        />
                    </Grid>
                    <Grid item xs={5} sm={6} md={8} className={classes.wrapper}>
                        <MainView />
                    </Grid>
                    <Grid item xs={3} sm={3} md={2} className={classes.wrapper}>
                        <p style={{ display: 'flex', alignItems: 'center' }}>
                            <strong style={{ fontSize: 30 }}>#</strong>&nbsp;&nbsp;thịnh thành
                        </p>
                        <Tags
                            tags={props.tags}
                            onClickTag={props.onClickTag}
                        />
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Home));
