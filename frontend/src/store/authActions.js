import axios from 'axios';
import * as actionTypes from './authActionTypes';
import * as settings from '../Settings';
// import getCookie from '../components/getCookie';

const SESSION_DURATION = settings.SESSION_DURATION



export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    }
}
export const authSuccess = (data) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        key: data.key,
        is_super: data.is_super,
        groups: data.groups,
        name: data.name,
    }
}
export const authFail = error => {
    return {
        type: actionTypes.AUTH_FAIL,
        error: error
    }
}
export const authLogout = () => {
    const key = localStorage.getItem('key');
    if (key === undefined){
        localStorage.removeItem('expirationDate');
    } else {
        axios.post(`${settings.API_SERVER}/api/auth/logout/`, {
        }, {headers: {'Authorization': `Token ${key}`}} ).catch(err => {console.log(err)});
        localStorage.removeItem('key');
        localStorage.removeItem('is_super');
        localStorage.removeItem('groups');
        localStorage.removeItem('name');
        localStorage.removeItem('expirationDate');
    }

    return {
        type: actionTypes.AUTH_LOGOUT
    };
}

// ########################################################
// ########################################################
// Auth Action Functions returning A Dispatch(Action) combination after performing some action
// ########################################################
// ########################################################
export const authCheckTimeout = expirationTime => {
    return dispatch => {
        setTimeout(() => {
            dispatch(authLogout());
        }, expirationTime)
    }
}

export const authLogin = (username, password) => {
    return dispatch => {
        dispatch(authStart());
        axios.post(`${settings.API_SERVER}/api/auth/login/`, {
            username: username,
            password: password
        }).then(res => {
            const expirationDate = new Date(new Date().getTime() + SESSION_DURATION );
            localStorage.setItem('key', res.data.key);
            localStorage.setItem('is_super', res.data.is_super);
            localStorage.setItem('groups', res.data.groups);
            localStorage.setItem('name', res.data.name);
            localStorage.setItem('expirationDate', expirationDate);
            dispatch(authSuccess(res.data));
            dispatch(authCheckTimeout(SESSION_DURATION));
        })
        .catch(err => {
            dispatch(authFail(err))
        });
    }
}


export const authCheckState = () => {
    return dispatch => {
        const key = localStorage.getItem('key');
        const is_super = localStorage.getItem('is_super')
        const groups = localStorage.getItem('groups');
        const name = localStorage.getItem('name')
        const data = {key: key, is_super: is_super, groups: groups, name: name};
        if (key === undefined) {
            dispatch(authLogout());
        } else {
            const expirationDate = new Date(localStorage.getItem('expirationDate'));
            if ( expirationDate <= new Date() ) {
                dispatch(authLogout());
            } else {
                dispatch(authSuccess(data));
                dispatch(authCheckTimeout( expirationDate.getTime() - new Date().getTime()) );
            }
        }
    }
}