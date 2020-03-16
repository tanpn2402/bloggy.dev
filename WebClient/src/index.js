import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import React from 'react';
import { store, history } from './store';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';
import { MuiThemeProvider, createMuiTheme, fade } from '@material-ui/core/styles';

import App from './components/App';

import './assets/styles/main.css';
import './assets/styles/app.css';

const MAIN_COLOR = '#5cb85c';

const muiTheme = createMuiTheme({
    typography: {
        fontFamily: 'inherit'
    },
    palette: {
        primary: {
            main: MAIN_COLOR,
        },
        // secondary: {
        //   main: '#6c757d',
        // },
    },
    overrides: {
        MuiButton: {
            root: {
                textTransform: 'inherit'
            },
            containedPrimary: {
                color: 'white'
            }
        },
        MuiOutlinedInput: {
            root: {
                backgroundColor: 'white',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: fade(MAIN_COLOR, 0.8)
                }
            }
        },
        MuiChip: {
            colorPrimary: {
                color: 'white'
            },
            deleteIconColorPrimary: {
                color: 'white'
            }
        }
    }
});

ReactDOM.render((
    <Provider store={store}>
        <MuiThemeProvider theme={muiTheme}>
            <ConnectedRouter history={history}>
                <Switch>
                    <Route path="/" component={App} />
                </Switch>
            </ConnectedRouter>
        </MuiThemeProvider>
    </Provider>

), document.getElementById('root'));
