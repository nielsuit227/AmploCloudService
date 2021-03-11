import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DataInterface from './pages/DataInterface';


function PrivateRoute({ isAuthenticated, children, ...rest}) {
    return (
        <Route
            {...rest}
            render={({ location }) => 
                isAuthenticated ? (
                    children
                ) : (
                    <Redirect to={{
                        pathname: '/login/',
                        state: { from: location }
                        }}
                    />
                )
            }
        />
    );
}


function Urls(props) {
    return(
        <div>
            <BrowserRouter>
                <Switch>
                    <Route exact path='/'> <Login {...props}/> </Route>
                    <Route exact path='/login/'> <Login {...props}/> </Route>
                    <Route exact path='/signup/'><Signup {...props}/></Route>
                    <PrivateRoute exact path='/dashboard/' isAuthenticated={props.isAuthenticated}>
                        <Dashboard {...props}/>
                    </PrivateRoute>
                    <PrivateRoute exact path='/data-interface/' isAuthenticated={props.isAuthenticated}>
                        <DataInterface {...props}/>
                    </PrivateRoute>
                </Switch>
            </BrowserRouter>
        </div>
    )
}
export default Urls;
