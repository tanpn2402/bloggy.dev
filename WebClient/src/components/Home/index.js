import Banner from './Banner';
import MainView from './MainView';
import React from 'react';
import Tags from './Tags';
import agent from '../../agent';
import { connect } from 'react-redux';
import { Grid, withStyles } from '@material-ui/core';
import SpaceBar from '../SpaceBar';
import classNames from 'classnames';
import '../../assets/styles/home.css';

const Promise = global.Promise;

const mapStateToProps = state => ({
    appName: state.common.appName,
    token: state.common.token
});

const mapDispatchToProps = dispatch => ({
    onClickTag: (payload, callback) => dispatch({ payload, callback }),
    onLoad: (payload, callback) => dispatch({ payload, callback }),
    onTabClick: (payload, callback) => dispatch({ payload, callback }),
    onClickSpace: (payload, callback) => dispatch({ payload, callback }),
});


const styles = theme => ({
    wrapper: {
        paddingLeft: 10,
        paddingRight: 10
    },
    mySpace: {
        // 
    },
    homePage: {
        paddingLeft: 10,
        paddingRight: 10
    }
})

class Home extends React.Component {
    constructor(props) {
        super(props);

        let searchParams = props.location.search.split('?').reduce((obj, curr) => {
            if ([curr.split('=')[0]]) {
                return Object.assign(obj, { [curr.split('=')[0]]: curr.split('=')[1] })
            }

            return obj;
        })

        let tab = searchParams['tab'];
        if (tab === 'feed' && !props.token) {
            tab = 'all';
        }

        this.state = {
            tab,
            tags: [],
            articles: [],
            loading: true,
            tag: searchParams['tag'],
            space: searchParams['space'],
        }

        this.onClickTag = (tag, payload) => {
            this.setState({ tag: tag, tab: undefined, space: undefined, loading: true, articles: [] });
            props.history.push('/?tag=' + tag);
            props.onClickTag(payload, ({ payload }) => {
                this.setState({
                    loading: false,
                    articles: payload.articles || []
                })
            });
        }

        this.onTabClick = (tab, payload) => {
            this.setState({ tab: tab, tag: undefined, space: undefined, loading: true, articles: [] });
            props.history.push('/?tab=' + tab);
            props.onTabClick(payload, ({ payload }) => {
                this.setState({
                    loading: false,
                    articles: payload.articles || []
                })
            });
        }

        this.onClickSpace = (space, payload) => {
            this.setState({
                spaceInfo: space,
                space: space.name,
                tag: undefined,
                tab: undefined,
                loading: true,
                articles: []
            });
            props.history.push('/?space=' + space._id);
            props.onClickSpace(payload, ({ payload }) => {
                this.setState({
                    loading: false,
                    articles: payload[0].articles || [],
                    spaceInfo: payload[1].spaces
                })
            });
        }
    }

    componentWillMount() {
        const { tab, tag, space } = this.state;

        if (tab) {
            const articlesPromise = tab === 'feed' ? agent.Articles.feed : agent.Articles.all;
            return this.props.onLoad(Promise.all([agent.Tags.getAll(), articlesPromise()]), ({ payload }) => {
                this.setState({
                    loading: false,
                    tags: payload[0].tags || [],
                    articles: payload[1].articles || []
                })
            });
        }
        else if (tag) {
            return this.props.onLoad(Promise.all([agent.Tags.getAll(), agent.Articles.byTag(tag)]), ({ payload }) => {
                this.setState({
                    loading: false,
                    tags: payload[0].tags || [],
                    articles: payload[1].articles || []
                })
            });
        }
        else if (space) {
            return this.props.onLoad(Promise.all([agent.Tags.getAll(), agent.Articles.bySpace(space), agent.Spaces.get(space)]),
                ({ payload }) => {
                    this.setState({
                        loading: false,
                        tags: payload[0].tags || [],
                        articles: payload[1].articles || [],
                        spaceInfo: payload[2].spaces,
                        space: payload[2].code === 200 ? payload[2].spaces.name : 'Loading'
                    })
                });
        }
    }

    render() {
        const { classes, ...props } = this.props;
        const { tab, tag, ...state } = this.state;
        
        return (
            <div className="home-page">
                <Banner token={props.token} appName={props.appName} />
                <Grid container className={classes.homePage}>
                    <Grid item xs={4} sm={3} md={2} className={classNames(classes.wrapper, classes.mySpace)}>
                        <SpaceBar
                            onClickSpace={this.onClickSpace}
                        />
                    </Grid>
                    <Grid item xs={5} sm={6} md={8} className={classes.wrapper}>
                        <MainView
                            tab={tab}
                            tag={tag}
                            space={state.space}
                            loading={state.loading}
                            articles={state.articles}
                            onTabClick={this.onTabClick}
                            spaceInfo={state.spaceInfo}
                            history={props.history}
                        />
                    </Grid>
                    <Grid item xs={3} sm={3} md={2} className={classes.wrapper}>
                        <p style={{ display: 'flex', alignItems: 'center' }}>
                            <strong style={{ fontSize: 30 }}>#</strong>&nbsp;&nbsp;thịnh thành
                        </p>
                        <Tags
                            tags={state.tags}
                            loading={state.loading}
                            onClickTag={this.onClickTag}
                        />
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Home));
