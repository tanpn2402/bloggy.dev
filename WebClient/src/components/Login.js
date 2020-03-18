import { Link } from 'react-router-dom';
import ListErrors from './ListErrors';
import React from 'react';
import agent from '../agent';
import { connect } from 'react-redux';
import {
    UPDATE_FIELD_AUTH,
    LOGIN,
    LOGIN_PAGE_UNLOADED
} from '../constants/actionTypes';
import { GG_CLIENT_ID } from '../constants/constants';

const mapStateToProps = state => ({ ...state.auth });

const mapDispatchToProps = dispatch => ({
    onChangeEmail: value =>
        dispatch({ type: UPDATE_FIELD_AUTH, key: 'email', value }),
    onChangePassword: value =>
        dispatch({ type: UPDATE_FIELD_AUTH, key: 'password', value }),
    onSubmit: (email, password) =>
        dispatch({ type: LOGIN, payload: agent.Auth.login(email, password) }),
    onUnload: () =>
        dispatch({ type: LOGIN_PAGE_UNLOADED })
});

const gapi = window.gapi;

class Login extends React.Component {
    constructor() {
        super();
        this.changeEmail = ev => this.props.onChangeEmail(ev.target.value);
        this.changePassword = ev => this.props.onChangePassword(ev.target.value);
        this.submitForm = (email, password) => ev => {
            ev.preventDefault();
            this.props.onSubmit(email, password);
        };

        this.state = {
            isSignedIn: false
        }
    }

    componentWillUnmount() {
        this.props.onUnload();
    }

    componentDidMount() {
        gapi.load('auth2', () => {
            this.auth2 = gapi.auth2.init({
                client_id: GG_CLIENT_ID,
                // scope: 'profile'
            })

            this.auth2.then(
                () => {
                    console.log('on init');
                    const isSignedIn = this.auth2.isSignedIn.get();

                    if (isSignedIn) {
                        var googleUser = this.auth2.currentUser.get();
                        var profile = googleUser.getBasicProfile();
                        console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
                        console.log('Name: ' + profile.getName());
                        console.log('Image URL: ' + profile.getImageUrl());
                        console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

                        var scope = googleUser.getGrantedScopes();
                        console.log('scope ', scope);

                        var token = googleUser.getAuthResponse().id_token;
                        console.log('users token ', token);
                    }

                    this.setState({
                        isSignedIn
                    });
                },
                () => {
                    console.log('on error');
                }
            );
        })
    }

    onSignOut = ev => {
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(
            () => {
                console.log('User signed out.');

                this.setState({
                    isSignedIn: false
                });
            },
            () => {
                console.log('Occured some errors while signing out!');
            }
        );
    }

    onSignIn = ev => {
        var auth2 = gapi.auth2.getAuthInstance();
        let options = {
            prompt: 'select_account'
        }
        auth2.signIn(options).then(
            (user) => {
                console.log('Sign in successully!');
                var googleUser = this.auth2.currentUser.get()
                console.log('users info ', googleUser);

                var profile = googleUser.getBasicProfile();
                console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
                console.log('Name: ' + profile.getName());
                console.log('Image URL: ' + profile.getImageUrl());
                console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

                this.setState({
                    isSignedIn: true
                });
            },
            () => {
                console.log('Occured some errors while signing in!');
            }
        );
    }


    render() {
        const email = this.props.email;
        const password = this.props.password;
        return (
            <div className="auth-page">
                <div className="container page">
                    <div className="row">

                        <div className="col-md-6 offset-md-3 col-xs-12">
                            <h1 className="text-xs-center">Đăng nhập</h1>
                            <p className="text-xs-center">
                                <Link to="/register">
                                    Chưa có tài khoản? Đăng ký ngay
                                </Link>
                            </p>

                            <ListErrors errors={this.props.errors} />

                            <form onSubmit={this.submitForm(email, password)}>
                                <fieldset>

                                    <fieldset className="form-group">
                                        <input
                                            className="form-control form-control-lg"
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={this.changeEmail} />
                                    </fieldset>

                                    <fieldset className="form-group">
                                        <input
                                            className="form-control form-control-lg"
                                            type="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={this.changePassword} />
                                    </fieldset>

                                    <button
                                        className="btn btn-lg btn-primary pull-xs-right"
                                        type="submit"
                                        disabled={this.props.inProgress}>
                                        Đăng nhập
                                    </button>

                                </fieldset>
                            </form>
                        </div>

                    </div>
                </div>
                <button id="loginButton" onClick={this.onSignIn}>
                    {this.state.isSignedIn ? 'Signed with Google' : 'Login with Google'}
                </button>
                {this.state.isSignedIn && <button onClick={this.onSignOut}>Sign out GG</button>}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
