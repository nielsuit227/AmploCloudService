import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { combineReducers, createStore, compose, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import authReducer from './store/authReducer';
import axios from 'axios';
axios.defaults.withCredentials = true
axios.defaults.baseURL = 'http://127.0.0.1:8000/';
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'x-csrftoken'

/*
For those unexperienced with React Redux.
Redux has a hidden state, by reducer. The Reducer also defines 
how the state is updated. We can add different states, but for now
we only have substates within 'auth'. In App.js, a mapStateToProps is defined
This can filter or pass on states based upon states. For example,
the isAuthenticated state is defined by a non-empty token.

To add to this redux state:
1. Add in initialState in authReducer
2. Add in authSuccessReducer
3. Add in authLogoutReducer
4. Add in authSuccess in authActions
5. Remove localStorage item in authLogout
6. Set localStorage item in authLogin
7. Get localStorage item in authCheckState and add to `const data`
8. (Optional) If you want it added to the props, add in app.js
*/

const reducer = combineReducers({ auth: authReducer });
const composeEnhanced = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(reducer, composeEnhanced(applyMiddleware(thunk)));


ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
