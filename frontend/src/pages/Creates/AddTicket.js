import React from 'react';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Select from 'react-select';
import axios from 'axios';
import getCookie from '../../components/getCookie';
import { CssBaseline } from '@material-ui/core';
import * as settings from '../../Settings';
import Layout from '../../components/Layout';



class AddTicket extends React.Component {
    constructor(props) {
        super(props);
        this.handleTitle = this.handleTitle.bind(this);
        this.handleDescription = this.handleDescription.bind(this);
        this.handleIssue = this.handleIssue.bind(this);
        this.handleAsset = this.handleAsset.bind(this);
        this.handleAssignee = this.handleAssignee.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.getAssets = this.getAssets.bind(this);
        this.getIssues = this.getIssues.bind(this);
        this.state = {
            title: "",
            description: "",
            selectedAsset: "",
            selectedAssignee: "",
            selectedIssue: "",
            error: "",
            assets: [],
            issues: [],
            assignees: [],
            index: 0,
        };
    }
    componentDidMount() {
        this.getIssues();
        this.getAssets();
        this.getAssignees();
        this.getIndex();
    }
    // Event Handlers
    handleTitle(event) {
        this.setState({title: event.target.value});
    }
    handleDescription(event) {
        this.setState({description: event.target.value});
    }
    handleIssue(event) {
        this.setState({selectedIssue: event.value});
    }
    handleAsset(event){
        this.setState({selectedAsset: event.value});
    }
    handleAssignee(event){
        this.setState({selectedAssignee: event.value});
    }
    // APIs
    getAssets() {
        axios.post(
            `${settings.API_SERVER}/api/getAssets/`, 
            {}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(res => {
            let data = res.data;
            const assets = [];
            data.forEach((asset) => {
                assets.push(
                    {value: asset.pk, label: '(' + String(asset.pk) + ') ' + String(asset.type__type) + ' ' + String(asset.location)}
                );
            });
            this.setState({assets: assets});
        })
        .catch(err => {console.log(err)});
    }
    getIssues() {
        axios.post(
            `${settings.API_SERVER}/api/getIssues/`, 
            {}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(res => {
            let data = res.data;
            const issues = [{value: '-1', label: 'Unknown'}];
            data.forEach((issue) => {
                issues.push(
                    {value: issue.pk, label: String(issue.title)}
                );
            });
            this.setState({issues: issues});
        })
        .catch(err => {console.log(err)});
    }
    getAssignees() {
        axios.post(
            `${settings.API_SERVER}/api/getUsers/`, 
            {}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(res => {
            let data = res.data;
            const assignees = [];
            data.forEach((assignee) => {
                assignees.push(
                    {value: assignee.id, label: assignee.first_name + ' ' + assignee.last_name}
                )
            });
            this.setState({assignees: assignees});
        })
        .catch(err => {console.log(err)});   
    }
    handleSubmit(){
        if (this.state.title === "") {
            this.setState({error: "Please provide a ticket title."});
        } else if (this.state.description === "") {
            this.setState({error: "Please provide a ticket description."});
        } else if (this.state.selectedAsset === "") {
            this.setState({error: "Please assign ticket to an asset"});
        } else {
            axios.post(
                `${settings.API_SERVER}/api/createTicket/`, 
                {
                    user: this.props.user,
                    title: this.state.title, 
                    description: this.state.description, 
                    asset: this.state.selectedAsset,
                    assignee: this.state.selectedAssignee,
                    issue: this.state.selectedIssue,
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
    getIndex() {
        axios.post(
            `${settings.API_SERVER}/api/getNewTicketIndex/`, 
            {}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(res => {
            this.setState({index: res.data})
        })
        .catch(err => {console.log(err)});   
    }
    // ui
    errorBar() {
        if (this.state.error === "Success") {
            return(
                <Alert variant='success'>
                    Ticket created! Go <a href={'/ticket?' + this.state.index}>to ticket</a> or <a href="/tickets/">back</a>.
                </Alert>
            )   
        } else if (this.state.error !== "") {
            return(<Alert variant='danger'>{this.state.error}</Alert>)
        }

    }

    render() {
        return(
            <Layout {...this.props}>
                <React.Fragment>
                    <CssBaseline/>
                    <div className="row">
                        <div className="col-auto">
                            <a href="/tickets/">
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
                                        Create Ticket (#{this.state.index})
                                    </h2>
                                </div>
                                <div className="row">
                                    <div className="col-xl-7">
                                        <h4>Ticket title:</h4>
                                        <input type="text" placeholder="Title" onChange={this.handleTitle}></input>
                                        <h4 className="pt-3">Description:</h4>
                                        <textarea className="text-area-newticket" rows="4" placeholder="Describe Issue" value={this.state.description} onChange={this.handleDescription}/>
                                        <h4 className="pt-3">Asset:</h4>
                                        <Select
                                            placeholder="Search..."
                                            onChange={this.handleAsset}
                                            options={this.state.assets}
                                            >
                                        </Select>
                                    </div>
                                    <div className='col-xl-3 pl-5 pt-5'>
                                        <h4>Issue: (if identified)</h4>
                                        <Select
                                            placeholder="Issue"
                                            onChange={this.handleIssue}
                                            options={this.state.issues}
                                            >    
                                        </Select>
                                        <h4 className="pt-3">Assign Ticket:</h4>
                                        <Select 
                                            placeholder="Assignee"
                                            onChange={this.handleAssignee}
                                            options={this.state.assignees}
                                            >
                                        </Select>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xl-10">
                                        {this.errorBar()}
                                    </div>
                                    <div className="col-xl-2">
                                        <Button variant='outline-primary' size='lg' onClick={this.handleSubmit}> Submit </Button>
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


export default AddTicket;