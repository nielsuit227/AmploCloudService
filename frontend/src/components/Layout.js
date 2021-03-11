import React from 'react';
import Footer from "./Footer"
import CssBaseline from '@material-ui/core/CssBaseline';
import '../css/argon-dashboard.css';
import Sidemenu from './Sidemenu';
import axios from 'axios';
import getCookie from './getCookie';
import * as settings from '../Settings';
import Notification from './Notification.js';



class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: ''
        }
    }
    componentDidMount() {
        axios.post(
            `${settings.API_SERVER}/api/getUser/`, 
            {}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(res => {
            let data = res.data;
            this.setState({user: data.first_name + ' ' + data.last_name});
        })
        .catch(err => {this.setState({error: err})});
    }
    render() {
        return (
            <React.Fragment>
                <Sidemenu {...this.props} />
                <div className="main-content">
                    <div className="header bg-gradient-primary pb-6 pt-md-4">
                        <div className="container-fluid">
                            <div className="row my-4">
                                <div className="col-xl-5 la">
                                    <span className="h4">
                                        Amplo Quality Management API Platform
                                    </span>
                                </div>
                                <div className='col-xl-4'></div>
                                <div className='col-xl-3 ra'>
                                    <div className='row ra'>
                                        <Notification/>
                                        <span className="h5">
                                            {this.props.user}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {this.props.children}
                        </div>
                    </div>
                </div>
                <Footer />
            </React.Fragment>
        )
    }
}

export default Layout