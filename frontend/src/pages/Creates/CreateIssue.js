import React from 'react';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import axios from 'axios';
import getCookie from '../../components/getCookie';
import { CssBaseline } from '@material-ui/core';
import * as settings from '../../Settings';
import Layout from '../../components/Layout';


class CreateIssue extends React.Component {
    constructor(props) {
        super(props);
        this.handleTitle = this.handleTitle.bind(this);
        this.handleDescription = this.handleDescription.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleFile = this.handleFile.bind(this);
        this.error = this.error.bind(this);
        this.state = {
            title: '',
            description: '',
            error: '',
            file: null,
        }
    }
    handleTitle(event) {
        this.setState({title: event.target.value});
    }
    handleDescription(event) {
        this.setState({description: event.target.value});
    }
    handleSubmit(){
        if (this.state.title === '') {
            this.setState({error: 'Please name the issue.'});
        } else if (this.state.description === '') {
            this.setState({error: 'Please provide a description.'});
        } else {
            axios.post(
                `${settings.API_SERVER}/api/uploadWorkTemplate/`, 
                this.state.file, 
                {headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                    'x-csrftoken': getCookie('csrftoken'),
                    'Content-Type': 'multipart/form-data',
                }} 
            ).then(res => {
                let data = res.data;
                if (data.slice(0, 6) === 'Failed') {
                    this.setState({error: data});
                } else {
                    axios.post(
                        `${settings.API_SERVER}/api/addIssue/`, 
                        {
                            title: this.state.title,
                            description: this.state.description,
                            file: data,
                        }, 
                        {headers: {
                            'Authorization': `Token ${localStorage.getItem('token')}`,
                            'x-csrftoken': getCookie('csrftoken'),
                            'Content-Type': 'application/json',
                        }} 
                    ).then(res => {
                        let data = res.data;
                        this.setState({error: data});
                    })
                }
            }).catch(err => {console.log(err)});
        }
    }
    handleFile(event) {
        let fileName = event.target.files[0].name;
        var formData = new FormData();
        formData.append("file", event.target.files[0], fileName);
        this.setState({file: formData});
    }
    error() {
        if (this.state.error === '') {
            return(
                <div></div>
            )
        } else if (this.state.error === 'Success') {
            return(
                <div>
                    <Alert variant='success'>Successfully created issue!</Alert>
                </div>
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
                    <div className="header-body">
                        <div className="row">
                            <div className="col-auto mt-5">
                                <a href="/settings/issues/">
                                    <Button variant='outline-light'>
                                        back
                                    </Button>
                                </a>
                            </div>
                        </div>
                        <div className="row">
                            <div className="card card-body">
                                <div className="card-header bg-transparent">
                                    <h2 className="card-title text-muted mb-0">
                                        Create Issue Template
                                    </h2>
                                </div>
                                <div className="row">
                                    <div className="col-xl-10">
                                        <h4>Title:</h4>
                                        <input type="text" placeholder="Issue Title" onChange={this.handleTitle}></input>
                                        <h4 className="mt-4">Description:</h4>
                                        <textarea rows="4" className="p-2" type="password" placeholder="Issue Description" onChange={this.handleDescription}></textarea>
                                        <div className="row mt-4">
                                            <div className="col-auto pt-2">
                                                <h4>Work Template:</h4>
                                            </div>
                                            <div className="col-xl-4">
                                                <input type="file" onChange={this.handleFile}/>
                                            </div>
                                        </div>
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

export default CreateIssue;