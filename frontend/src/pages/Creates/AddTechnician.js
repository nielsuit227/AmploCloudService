import React from 'react';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import axios from 'axios';
import getCookie from '../../components/getCookie';
import { CssBaseline } from '@material-ui/core';
import * as settings from '../../Settings';
import Layout from '../../components/Layout';


class AddTechnician extends React.Component {
    constructor(props) {
        super(props);
        this.handleName = this.handleName.bind(this);
        this.handleCompany = this.handleCompany.bind(this);
        this.handleLocation = this.handleLocation.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleEmail = this.handleEmail.bind(this);
        this.handleForum = this.handleForum.bind(this);
        this.error = this.error.bind(this);
        this.state = {
            name: '',
            company: '',
            location: '',
            email: '',
            forumAccount: false,
            error: '',
        }
    }
    handleName(event) {
        this.setState({name: event.target.value});
    }
    handleCompany(event) {
        this.setState({company: event.target.value});
    }
    handleLocation(event) {
        this.setState({location: event.target.value});
    }
    handleEmail(event) {
        this.setState({email: event.target.value});
    }
    handleForum() {
        if(this.state.forumAccount) {
            this.setState({forumAccount: false});
        } else {
            this.setState({forumAccount: true});
        }
        
    }
    handleSubmit(){
        if (this.state.name === '') {
            this.setState({error: 'Please provide Techncians name.'});
        } else if (this.state.company === '') {
            this.setState({error: 'Please provide Company name.'});
        } else if (this.state.location === '') {
            this.setState({error: 'Please provide Company location.'});
        } else if (this.state.email === '') {
            this.setState({error: 'Please provide Technicians email.'});
        } else if (this.state.name.split(' ').length !== 2) {
            this.setState({error: 'Please provide first and last name, separated by a space.'})
        } else {
            axios.post(
                `${settings.API_SERVER}/api/addTechnician/`, 
                {
                    name: this.state.name,
                    email: this.state.email,
                    company: this.state.company,
                    location: this.state.location,
                    forumAccount: this.state.forumAccount,
                }, 
                {headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                    'x-csrftoken': getCookie('csrftoken'),
                }} 
            )
            .then(res => {
                let data = res.data;
                this.setState({error: data})
            })
            .catch(err => {console.log(err)});
        }
    }
    error() {
        if (this.state.error === '') {
            return(
                <div></div>
            )
        } else if (this.state.error === 'Success') {
            return(<Alert variant='success'>Technician Account added! <a href='/settings/technicians'>Go back.</a></Alert>)
        } else {
            return(<Alert variant='danger'>{this.state.error}</Alert>)
        }
    }

    render() {
        return(
            <Layout {...this.props}>
                <React.Fragment>
                    <CssBaseline/>
                    <div className="row">
                        <div className="col-auto mt-5">
                            <a href="/settings/technicians/">
                                <Button variant='outline-light'>
                                    back
                                </Button>
                            </a>
                        </div>
                    </div>
                    <div className="header-body">
                        <div className="row">
                            <div className="card card-body">
                                <div className="card-header bg-transparent">
                                    <h2 className="card-title text-muted mb-0">
                                        Create Technician Account
                                    </h2>
                                </div>
                                <div className="row">
                                    <div className="col-xl-6">
                                        <h4>Name:</h4>
                                        <input type="text" placeholder="Name" onChange={this.handleName}></input>
                                        <h4 className="mt-4">Email:</h4>
                                        <input type="text" placeholder="Email" onChange={this.handleEmail}></input>
                                        <div className="row">
                                            <div className='col-auto'>
                                                <h4 className="mt-4">Provide forum login:</h4> 
                                            </div>                    
                                            <div className='col-xl-1 mt-4'>
                                                <input className="custom-toggle" type='checkbox' onChange={this.handleForum}></input>
                                            </div>
                                        </div>                                    
                                    </div>
                                    <div className="col-xl-6">
                                        <h4>Company:</h4>
                                        <input type="text" placeholder="Company" onChange={this.handleCompany}></input>
                                        <h4 className="mt-4">Location:</h4>
                                        <input type="text" placeholder="Location" onChange={this.handleLocation}></input>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xl-8">
                                        {this.error()}
                                    </div>
                                    <div className="col-xl-2">
                                        <Button variant='outline-primary' onClick={this.handleSubmit}>
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            </Layout>
        )
    }
}


export default AddTechnician;