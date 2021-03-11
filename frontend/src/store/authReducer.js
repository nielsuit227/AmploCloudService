import * as actionTypes from './authActionTypes';

// ########################################################
// Initial State
// ########################################################

export const initialState = {
    error: null,
    loading: false,
    key: null,
    is_super: false,
    groups: null,
    name: null,
}
// Updates state
// this function to allow building on old state
const updateObject = (oldObject, updatedProperties) => {
    return {
        ...oldObject,
        ...updatedProperties
    }
}

// ########################################################
// Different Reducer Functions which change the store state
// ########################################################
const authStartReducer = (state, action) => {
    return updateObject(state, {
        error: null,
        loading: true
    });
}

const authSuccessReducer = (state, action) => {
    return updateObject(state, {
        error: null,
        loading: false,
        key: action.key,
        name: action.name,
        is_super: action.is_super,
        groups: action.groups,
    });
}

const authFailReducer = (state, action) => {
    return updateObject(state, {
        error: action.error,
        loading: false
    });
}

const authLogoutReducer = (state, action) => {
    return updateObject(state, {
        key: null,
        is_super: false,
        groups: null,
        name: null,
    });
}

// ########################################################
// The Main Reducer
// ########################################################

const Reducer = (state=initialState, action) => {
    switch (action.type) {
        case actionTypes.AUTH_START: return authStartReducer(state, action);
        case actionTypes.AUTH_SUCCESS: return authSuccessReducer(state, action);
        case actionTypes.AUTH_FAIL: return authFailReducer(state, action);
        case actionTypes.AUTH_LOGOUT: return authLogoutReducer(state, action);
        default:
            return state;
    }
}

export default Reducer