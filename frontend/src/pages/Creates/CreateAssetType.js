import React from 'react';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import axios from 'axios';
import getCookie from '../../components/getCookie';
import { CssBaseline } from '@material-ui/core';
import * as settings from '../../Settings';
import Layout from '../../components/Layout';

class CreateAssetType extends React.Component {
    constructor(props) {
        super(props);
        this.handleType = this.handleType.bind(this);
        this.handleDescription = this.handleDescription.bind(this);
        this.handlePrice = this.handlePrice.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.error = this.error.bind(this);
        this.state = {
            type: '',
            description: '',
            price: '',
            error: '',
        }
    }
    handleType(event) {
        this.setState({type: event.target.value});
    }
    handleDescription(event) {
        this.setState({description: event.target.value});
    }
    handlePrice(event) {
        this.setState({price: event.target.value});
    }
    handleSubmit(){
        if (this.state.type === '') {
            this.setState({error: 'Please provide Asset Type.'});
        } else if (this.state.description === '') {
            this.setState({error: 'Please provide Asset Description.'});
        } else if (this.state.price === '') {
            this.setState({error: 'Please provide Asset Price.'});
        } else if (this.state.email === '') {
            this.setState({error: 'Pleas eprovide email.'});
        } else {
            axios.post(
                `${settings.API_SERVER}/api/addAssetType/`, 
                {
                    type: this.state.type,
                    description: this.state.description,
                    price: this.state.price,
                }, 
                {headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                    'x-csrftoken': getCookie('csrftoken'),
                }} 
            )
            .then(data => {
                console.log(data);
                window.location.assign('/settings/assettypes')
            })
            .catch(err => {console.log(err)});
        }
    }
    error() {
        if (this.state.error === '') {
            return(
                <div></div>
            )
        } else {
            return(
                <div>
                    <Alert variant='danger'>{this.state.error}</Alert>
                </div>                
            )
        }
    }

    render() {
        return(
            <Layout {...this.props}>
                <React.Fragment>
                    <CssBaseline/>
                    <div className="row">
                        <div className="col-auto mt-5">
                            <a href="/settings/assettypes/">
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
                                        Create Asset Type
                                    </h2>
                                </div>
                                <div className="row">
                                    <div className="col-xl-9">
                                        <h4>Type:</h4>
                                        <input type="text" placeholder="Asset Type" onChange={this.handleType}></input>
                                        <h4 className="mt-4">Description:</h4>
                                        <textarea className="p-2" rows="4" placeholder="Asset Description" onChange={this.handleDescription}></textarea>
                                        <h4 className="mt-4">New Price:</h4>
                                        <input placeholder="price..." onChange={this.handlePrice}></input>                                      
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

export default CreateAssetType;