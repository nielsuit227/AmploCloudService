import React from 'react';
import Urls from './Urls';
import { connect } from 'react-redux';
import * as actions from './store/authActions';
import './css/bootstrap.css';
import './css/argon-dashboard.css';


function App(props) {
    React.useEffect(() => {props.setAuthenticatedIfRequired()}, []);
  	return (
      	<Urls {...props}/>
  	)
}

//This means that one or more of the redux states in the store are available as props
const mapStateToProps = (state) => {
	return {
		isAuthenticated: state.auth.key !== null && typeof state.auth.key !== 'undefined',
		key: state.auth.key,
		is_super: state.auth.is_super,
		groups: state.auth.groups,
		user: state.auth.name,
	}
}

//This means that one or more of the redux actions in the form of dispatch(action) combinations are available as props
const mapDispatchToProps = (dispatch) => {
	return {
		setAuthenticatedIfRequired: () => dispatch(actions.authCheckState()),
		logout: () => dispatch(actions.authLogout())
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(App);