import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import React from 'react';
import { store, history } from './store';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import App from './components/App';

import './assets/styles/main.css';
import './assets/styles/app.css';

const muiTheme = createMuiTheme({
  typography: {
    fontFamily: 'inherit'
  },
  palette: {
    primary: {
      main: '#5cb85c',
    },
    // secondary: {
    //   main: '#6c757d',
    // },
  },
  overrides: {
    MuiButton: {
      root: {
        textTransform: 'inherit'
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
