import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Predictions from './pages/Predictions';
import TicketList from './pages/TicketList';
import AssetSettings from './pages/Settings/AssetSettings';
import AssetTypeSettings from './pages/Settings/AssetTypeSettings';
import UserSettings from './pages/Settings/UserSettings';
import IssueSettings from './pages/Settings/IssueSettings';
import TechnicianSettings from './pages/Settings/TechnicianSettings';
import PartSettings from './pages/Settings/PartSettings';
import CommissionAsset from './pages/Creates/CommissionAsset';
import CreateAssetType from './pages/Creates/CreateAssetType';
import AddUsers from './pages/Creates/AddUsers';
import CreateIssue from './pages/Creates/CreateIssue';
import AddTechnician from './pages/Creates/AddTechnician';
import CreatePart from './pages/Creates/CreatePart';
import AddTicket from './pages/Creates/AddTicket';
import TicketPage from './pages/TicketPage';
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
                    <PrivateRoute exact path='/dashboard/' isAuthenticated={props.isAuthenticated}>
                        <Dashboard {...props}/>
                    </PrivateRoute>
                    <PrivateRoute exact path='/monitor/' isAuthenticated={props.isAuthenticated}>
                        <Predictions {...props}/>
                    </PrivateRoute>
                    <PrivateRoute exact path='/tickets/' isAuthenticated={props.isAuthenticated}>
                        <TicketList {...props}/>
                    </PrivateRoute>
                    <PrivateRoute exact path='/ticket' isAuthenticated={props.isAuthenticated}>
                        <TicketPage {...props}/>
                    </PrivateRoute>
                    <PrivateRoute exact path='/data/' isAuthenticated={props.isAuthenticated}>
                        <DataInterface {...props}/>
                    </PrivateRoute>


                    <PrivateRoute exact path='/settings/assets/' isAuthenticated={props.isAuthenticated}>
                        <AssetSettings {...props}/>
                    </PrivateRoute>
                    <PrivateRoute exact path='/settings/assettypes/' isAuthenticated={props.isAuthenticated}>
                        <AssetTypeSettings {...props}/>
                    </PrivateRoute>
                    <PrivateRoute exact path='/settings/users/' isAuthenticated={props.isAuthenticated}>
                        <UserSettings {...props}/>
                    </PrivateRoute>
                    <PrivateRoute exact path='/settings/issues/' isAuthenticated={props.isAuthenticated}>
                        <IssueSettings {...props}/>
                    </PrivateRoute>
                    <PrivateRoute exact path='/settings/technicians/' isAuthenticated={props.isAuthenticated}>
                        <TechnicianSettings {...props}/>
                    </PrivateRoute>
                    <PrivateRoute exact path="/settings/parts/" isAuthenticated={props.isAuthenticated}>
                        <PartSettings {...props}/>
                    </PrivateRoute>

                    <PrivateRoute exact path="/commissionassets/" isAuthenticated={props.isAuthenticated}>
                        <CommissionAsset {...props}/>
                    </PrivateRoute>
                    <PrivateRoute exact path="/createassettype/" isAuthenticated={props.isAuthenticated}>
                        <CreateAssetType {...props}/>
                    </PrivateRoute>
                    <PrivateRoute exact path="/addusers/" isAuthenticated={props.isAuthenticated}>
                        <AddUsers {...props}/>
                    </PrivateRoute>
                    <PrivateRoute exact path="/createissue/" isAuthenticated={props.isAuthenticated}>
                        <CreateIssue {...props}/>
                    </PrivateRoute>                    
                    <PrivateRoute exact path="/addtechnician/" isAuthenticated={props.isAuthenticated}>
                        <AddTechnician {...props}/>
                    </PrivateRoute>
                    <PrivateRoute exact path="/createpart/" isAuthenticated={props.isAuthenticated}>
                        <CreatePart {...props}/>
                    </PrivateRoute>
                    <PrivateRoute exact path='/tickets/createticket/' isAuthenticated={props.isAuthenticated}>
                        <AddTicket {...props}/>
                    </PrivateRoute>
                </Switch>
            </BrowserRouter>
        </div>
    )
}
export default Urls;
