import agent from '../agent';
import Header from './Header';
import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import { APP_LOAD, REDIRECT } from '../constants/actionTypes';
import { Route, Switch } from 'react-router-dom';
import { store } from '../store';
import { push } from 'react-router-redux';

const Login = React.lazy(() => import('../components/Login'));
const Profile = React.lazy(() => import('../components/Profile'));
const ProfileFavorites = React.lazy(() => import('../components/ProfileFavorites'));
const Home = React.lazy(() => import('../components/Home'));
const Register = React.lazy(() => import('../components/Register'));
const Settings = React.lazy(() => import('../components/Settings'));
const Editor = React.lazy(() => import('../components/Editor'));
const Article = React.lazy(() => import('../components/Article'));
const NewSpace = React.lazy(() => import('../components/NewSpace'));


const mapStateToProps = state => {
    return {
        appLoaded: state.common.appLoaded,
        appName: state.common.appName,
        currentUser: state.common.currentUser,
        redirectTo: state.common.redirectTo
    }
};

const mapDispatchToProps = dispatch => ({
    onLoad: (payload, token) =>
        dispatch({ type: APP_LOAD, payload, token, skipTracking: true }),
    onRedirect: () =>
        dispatch({ type: REDIRECT })
});

class App extends React.Component {
    componentWillReceiveProps(nextProps) {
        if (nextProps.redirectTo) {
            // this.context.router.replace(nextProps.redirectTo);
            store.dispatch(push(nextProps.redirectTo));
            this.props.onRedirect();
        }
    }

    componentWillMount() {
        const token = window.localStorage.getItem('jwt');
        if (token) {
            agent.setToken(token);
        }

        this.props.onLoad(token ? agent.Auth.current() : null, token);
    }

    render() {
        if (this.props.appLoaded) {
            return (
                <>
                    <Header
                        appName={this.props.appName}
                        currentUser={this.props.currentUser}
                    />
                    <Suspense fallback={<div>Loading...</div>}>
                        <Switch>
                            <Route exact path="/" component={Home} />
                            <Route path="/login" component={Login} />
                            <Route path="/new-space" component={NewSpace} />
                            <Route path="/register" component={Register} />
                            <Route path="/editor/:slug" component={Editor} />
                            <Route path="/editor" component={Editor} />
                            <Route path="/article/:id" component={Article} />
                            <Route path="/settings" component={Settings} />
                            <Route path="/@:username/favorites" component={ProfileFavorites} />
                            <Route path="/@:username" component={Profile} />
                        </Switch>
                    </Suspense>
                </>
            );
        }
        return (
            <>
                <Header
                    appName={this.props.appName}
                    currentUser={this.props.currentUser} />
            </>
        );
    }
}

// App.contextTypes = {
//   router: PropTypes.object.isRequired
// };

export default connect(mapStateToProps, mapDispatchToProps)(App);
