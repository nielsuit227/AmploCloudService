import React from 'react';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import axios from 'axios';
import getCookie from '../../components/getCookie';
import * as settings from '../../Settings';
import Layout from '../../components/Layout';
import { interpolate } from 'd3';

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
        } else if (isNaN(parseFloat(this.state.price))) {
            this.setState({error: 'Price should be a number.'});
        } else {
            axios.post(
                `${settings.API_SERVER}/api/addAssetType/`, 
                {
                    type: this.state.type,
                    description: this.state.description,
                    price: parseFloat(this.state.price),
                }, 
                {headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                    'x-csrftoken': getCookie('csrftoken'),
                }} 
            )
            .then(data => {
                console.log(data);
                // window.location.assign('/settings/assettypes')
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
                    <a href="/settings/assettypes/">
                        <Button variant='outline-primary' className='my-2'>
                            back
                        </Button>
                    </a>
                    <div className='card'>
                        <div className='card-header'>
                            <h5>Add Asset Type</h5>
                        </div>
                        <div className='card-body'>
                            <div className='col-xl-6'>
                                <h6>Type:</h6>
                                <input className='myinput' placeholder="Asset Type" onChange={this.handleType}></input>
                                <h6 className="mt-4">Description:</h6>
                                <textarea className="myinput p-2" rows="4" placeholder="Asset Description" onChange={this.handleDescription}></textarea>
                                <h6 className="mt-4">New Price:</h6>
                                <input className='myinput' placeholder="price..." onChange={this.handlePrice}></input>   
                            </div>
                        </div>
                        <div className='row mb-5'>
                            <div className='col-xl-4 ml-5'>
                                {this.error()}
                            </div>
                            <div className='col-xl-2'>
                                <Button variant='outline-primary' onClick={this.handleSubmit}>
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            </Layout>
        )
    }
}

export default CreateAssetType;