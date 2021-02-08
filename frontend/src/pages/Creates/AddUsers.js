import React from 'react';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import axios from 'axios';
import getCookie from '../../components/getCookie';
import { CssBaseline } from '@material-ui/core';
import * as settings from '../../Settings';
import Layout from '../../components/Layout';
import { FaPlus } from 'react-icons/fa';


class AddUsers extends React.Component {
    constructor(props) {
        super(props);
        this.handleEmail = this.handleEmail.bind(this);
        this.addEntry = this.addEntry.bind(this);
        this.submit = this.submit.bind(this);
        this.state = {
            emails: [''],
            entries: [0],
            error: '',
        }
    }
    handleEmail(idx, event) {
        let emails = this.state.emails;
        emails[idx] = event.target.value;
        this.setState({emails: emails});
    }
    addEntry() {
        let entries = this.state.entries;
        entries.push(this.state.entries.length)
        let emails = this.state.emails;
        emails.push('');
        this.setState({
            entries: entries,
            emails: emails,
        });
    }
    submit(){
        axios.post(
            `${settings.API_SERVER}/api/addEmail/`, 
            {
                emails: this.state.emails,
            }, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(res => {
            let data = res.data;
            this.setState({error: data});
        })
        .catch(err => {this.setState({error: err})});
    }
    errorBar(){
        if (this.state.error === '') {
            return(<div></div>)
        } else if (this.state.error === 'Success') {
            return(
                <Alert variant='success'>Email Adresses added, these users can now register!</Alert>
            )
        } else {
            return(
                <Alert variant='danger'>{this.state.error}</Alert>
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
                            <a href="/settings/users/">
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
                                    <h2>Create User Login(s)</h2>
                                </div>
                                <div className="row">
                                    <div className="col-xl-6">
                                        {
                                            this.state.entries.map((idx) => {
                                                return(
                                                    <input className="my-2" type="text" placeholder="Email" onChange={(ev) => this.handleEmail(idx, ev)}/>
                                                )
                                            })
                                        }                                    
                                    </div>
                                    <div className="col-xl-1 my-2">
                                        <Button variant='outline-primary' onClick={this.addEntry}>
                                            <FaPlus/>
                                        </Button>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className="col-xl-8">
                                        {this.errorBar()}
                                    </div>
                                    <div className="col-xl-2">
                                        <Button variant="outline-primary" onClick={this.submit}>
                                            Add users!
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

export default AddUsers;