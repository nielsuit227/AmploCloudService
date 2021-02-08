import React from 'react';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import axios from 'axios';
import getCookie from '../../components/getCookie';
import { CssBaseline } from '@material-ui/core';
import * as settings from '../../Settings';
import Layout from '../../components/Layout';
import { FaPlus } from 'react-icons/fa';


class CreatePart extends React.Component {
    constructor(props) {
        super(props);
        this.handlePart = this.handlePart.bind(this);
        this.handlePrice = this.handlePrice.bind(this);
        this.handleVendor = this.handleVendor.bind(this);
        this.addEntry = this.addEntry.bind(this);
        this.submit = this.submit.bind(this);
        this.state = {
            parts: [''],
            prices: [''],
            vendors: [''],
            entries: [0],
            error: '',
        }
    }

    handlePart(event, idx) {
        let parts = this.state.parts;
        parts[idx] = event.target.value;
        this.setState({parts: parts});
    }
    handlePrice(event, idx) {
        let prices = this.state.prices;
        prices[idx] = event.target.value;
        this.setState({prices: prices});
    }
    handleVendor(event, idx) {
        let vendors = this.state.vendors;
        vendors[idx] = event.target.value;
        this.setState({vendors: vendors});
    }
    addEntry() {
        let entries = this.state.entries;
        entries.push(entries.length)
        this.setState({entries: entries})
    }
    submit() {
        if (!this.state.parts.every((part) => part !== '')){
            this.setState({error: "Please don't leave empty part names."})
        } else {
            axios.post(
                `${settings.API_SERVER}/api/addPart/`, 
                {
                    parts: this.state.parts,
                    prices: this.state.prices,
                    vendors: this.state.vendors
                }, 
                {headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                    'x-csrftoken': getCookie('csrftoken'),
                }} 
            ).then(res => {
                let data = res.data;
                this.setState({error: data});
            })
            .catch(err => {console.log(err)});
        }        
    }
    error() {
        if (this.state.error === 'Success') {
            return(<Alert variant='success' classname='my-2'>Part(s) succesfully added! <a href='/settings/parts/'>Go back.</a></Alert>)
        } else if (this.state.error === '') {
            return(<div></div>)
        } else {
            return(
                <Alert className='my-2' variant='danger'>
                    {this.state.error}
                </Alert>
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
                            <a href="/settings/parts/">
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
                                    <h2>Create Parts</h2>
                                </div>
                                {
                                    this.state.entries.map((idx) => {
                                        return(
                                            <div className='row mt--1'>
                                            <div className="col-xl-3">
                                                <input className="my--1" type="text" placeholder="Part" onChange={(ev) => this.handlePart(ev, idx)}/>
                                            </div>
                                            <div className="col-xl-3">
                                                <input className="my--1" type="text" placeholder='Price' onChange={(ev) => this.handlePrice(ev, idx)}/>
                                            </div>
                                            <div className="col-xl-3">
                                                <input className="my--1" type="text" placeholder="Vendor" onChange={(ev) => this.handleVendor(ev, idx)}/>
                                            </div>
                                            </div>
                                        )
                                    })
                                } 
                                <div className="col-xl-1 my-1">
                                    <Button variant='outline-primary' onClick={this.addEntry}>
                                        <FaPlus/>
                                    </Button>
                                </div>
                                <div className="col-xl-2">
                                    <Button variant="outline-primary" onClick={this.submit}>
                                        Add Parts!
                                    </Button>
                                </div>
                                {this.error()}
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            </Layout>
        )
    }
}

export default CreatePart;