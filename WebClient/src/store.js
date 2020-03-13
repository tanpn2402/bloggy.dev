import { applyMiddleware, createStore } from 'redux';
import { createLogger } from 'redux-logger'
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import { promiseMiddleware, localStorageMiddleware } from './middleware';
import reducer from './reducer';

import { routerMiddleware } from 'react-router-redux';
const createHistory =  require('history').createHashHistory;

export const history = createHistory();

// Build the middleware for intercepting and dispatching navigation actions
const myRouterMiddleware = routerMiddleware(history);

const getMiddleware = () => {
  if (process.env.NODE_ENV === 'production') {
    return applyMiddleware(myRouterMiddleware, promiseMiddleware, localStorageMiddleware);
  } else {
    // Enable additional logging in non-production environments.
    // return applyMiddleware(myRouterMiddleware, promiseMiddleware, localStorageMiddleware, createLogger())
    return applyMiddleware(myRouterMiddleware, promiseMiddleware, localStorageMiddleware,)

  }
};

export const store = createStore(
  reducer, composeWithDevTools(getMiddleware()));
