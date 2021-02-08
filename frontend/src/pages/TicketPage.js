import React from 'react';
import Button from 'react-bootstrap/Button';
import Select from 'react-select';
import axios from 'axios';
import getCookie from '../components/getCookie';
import { CssBaseline } from '@material-ui/core';
import * as settings from '../Settings';
import Layout from '../components/Layout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaTrash, FaEdit } from 'react-icons/fa';

// Elements
class TicketNavigation extends React.Component {
    item(ticket) {
        const url = "/ticket?" + ticket.pk;
        if (ticket.status === 'open'){
            return(
                <div key={ticket.pk}>
                    <div className="col-auto py-1" key={ticket.pk}>
                        <a href={url} key={ticket.pk}>
                            <Button variant="outline-danger" block>F{ticket.pk}A{ticket.asset__pk}</Button>
                        </a>
                    </div>
                </div>
            )
        } else if (ticket.status === 'closed') {
            return(
                <div className="col-auto py-1" key={ticket.pk}>
                    <a href={url} key={ticket.pk}>
                        <Button variant="outline-success" block>F{ticket.pk}A{ticket.asset__pk}</Button>
                    </a>
                </div>
            )
        }
    }

    render() {
        return(
            <div>
                <div className="card card-body mx--4 pr-4">
                    <div className="card-header bg-transparent">
                        <h3 className="card-title text-muted mx--4">
                            Tickets
                        </h3>
                    </div>
                    {
                        this.props.tickets.map((ticket) => {
                            return(this.item(ticket));
                        })
                    }
                </div>
            </div>
        )
    }
}
class CommentSection extends React.Component {
    constructor(props) {
        super(props);
        this.addPost = this.addPost.bind(this);
        this.deletePost = this.deletePost.bind(this);
        this.setEditPost = this.setEditPost.bind(this);
        this.setEditBool = this.setEditBool.bind(this);
        this.Ownpost = this.Ownpost.bind(this);
        this.Otherpost = this.Otherpost.bind(this);
        this.Editpost = this.Editpost.bind(this);
        this.handlePostEvent = this.handlePostEvent.bind(this);
        this.handleEditEvent = this.handleEditEvent.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
        this.getComments = this.getComments.bind(this);
        this.state = {
            comments: [],
            newPostBody: '',
            editPostBody: '',
        }
    }
    componentDidMount() {
        this.getComments();
    }
    getComments() {
        axios.post(
            `${settings.API_SERVER}/api/getComments/`, 
            {issue: this.props.ticket}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(res => {
            let data = res.data;
            if (data[0].comment__pk != null) {
                data.forEach(comment => comment.edit=false);
                data.forEach(comment => comment.name=comment.comment__user__first_name + ' ' + comment.comment__user__last_name);
                this.setState({comments: data});
            }
        })
        .catch(err => {console.log(err)});
    }

    // Function to handle input text.
    handlePostEvent(ev) {
        this.setState({
            newPostBody: ev.target.value
        })
    }
    handleEditEvent(ev) {
        this.setState({
            editPostBody: ev.target.value
        })
    }

    // HTML code for posts
    Ownpost(user, post, idx) {
        return (
            <div key={idx}>
                <div className="card card-body" key={idx}>
                    <div className="row mx--1 my--2" key={idx}>
                        <div className="col-xl-10" key={idx}>
                            <h5 className="card-title" key={idx}>
                                {user}
                            </h5>
                        </div>
                            <div className="col-xl-1" key={idx + "1"}>
                                <Button variant="light" size="sm" onClick={() => this.setEditBool(idx)}>
                                    <FaEdit/>
                                </Button>
                            </div>
                        <div className="col-xl-1" key={idx + "4"}>
                            <Button variant="light" size="sm" onClick={() => this.deletePost(idx)}>
                                <FaTrash/>
                            </Button>
                        </div>
                    </div>
                    <span key={idx + "5"}>
                        {post}
                    </span>
                </div>
            </div>
        )
    }
    Otherpost(user, post) {
        return(
            <div>
                <div className="card card-body">
                    <div className="row mx--1 my--2">
                        <div className="col-xl-4">
                            <h5 className="card-title mb-3">
                                {user}
                            </h5>
                        </div>
                    </div>
                    <span>
                        {post}
                    </span>
                </div>
            </div>
        )
    }
    Editpost(user, post, idx) {
        return(
            <div>
                <div className="card card-body">
                    <div className="row mx--1 my--2">
                        <div className="col-xl-4">
                            <h5 className="card-title mb-3">
                                {user}
                            </h5>
                        </div>
                    </div>
                    <div className='col-xl-12 mx--1 my-1'>
                        <textarea value={this.state.editPostBody} onChange={this.handleEditEvent}></textarea>
                        <div className="row">
                            <div className="col-xl-10">
                                <Button variant="outline-success" onClick={() => this.setEditPost(idx)}>Save edit</Button>
                            </div>
                            <div className="col-xl-2">
                                <Button variant='outline-danger' onClick={() => this.cancelEdit(idx)}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Function to parse comments.
    addPost() {
        axios.post(
            `${settings.API_SERVER}/api/addComment/`, 
            {
                ticket: this.props.ticket, 
                comment: this.state.newPostBody
            }, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(data => {console.log(data.data)})
        .catch(err => {console.log(err)});
        const newState = Object.assign({}, this.state);
        newState.comments.push({
            comment__comment: this.state.newPostBody, 
            name: this.props.user,
        });
        newState.newPostBody = '';
        this.setState(newState);
    }
    deletePost(idx) {
        const idc = this.state.comments[idx].comment__pk;
        axios.post(
            `${settings.API_SERVER}/api/deletecomment/`, 
            {
                pk: idc
            }, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(data => {console.log(data)})
        .catch(err => {console.log(err)});
        var currentState = this.state;
        delete currentState.comments[idx];
        this.setState(currentState);
    }
    setEditBool(idx) {
        var currentState = this.state;
        currentState.comments.forEach(item => item.edit = false);
        currentState.comments[idx].edit = true;
        currentState.editPostBody = currentState.comments[idx].comment__comment;
        this.setState(currentState);
    }
    setEditPost(idx) {
        var currentState = this.state;
        const idc = currentState.comments[idx].comment__pk;
        const newPost = currentState.editPostBody;
        currentState.comments[idx].comment__comment = currentState.editPostBody;
        currentState.comments[idx].edit = false;
        currentState.editPostBody = "";
        this.setState(currentState);
        axios.post(
            `${settings.API_SERVER}/api/editcomment/`, 
            {
                id: idc, 
                newPost: newPost
            }, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(data => {console.log(data)})
        .catch(err => {console.log(err)});
    }
    cancelEdit(idx) {
        var currentState = this.state;
        currentState.comments[idx].edit = false;
        currentState.editPostBody = "";
        this.setState(currentState);
    }

    // Entire Comment Section
    render() {
        return (
            <div>
                {
                    this.state.comments.map((comment, idx) => {
                        if (comment.edit === true) {
                            return (this.Editpost(comment.name, comment.comment__comment, idx));
                        } else if (comment.name === this.props.user) {
                            return (this.Ownpost(this.props.user, comment.comment__comment, idx));
                        } else {
                            return (this.Otherpost(comment.name, comment.comment__comment));
                        }
                    })
                }
                <div className='panel panel-default post-editor'>
                    <div className='panel-body'>
                        <textarea className="form-control post-editor-input mb-3" value={this.state.newPostBody} onChange={this.handlePostEvent}></textarea>
                        <Button variant="outline-success" onClick={this.addPost}>Post</Button>
                    </div>
                </div>
            </div>
        );
    }
}
class TicketInformation extends React.Component {
    constructor(props) {
        super(props);
        this.getIssues = this.getIssues.bind(this);
        this.handleIssue = this.handleIssue.bind(this);
        this.handleFailureDate = this.handleFailureDate.bind(this);
        this.handleServiceDate = this.handleServiceDate.bind(this);
        this.handleOperationalDate = this.handleOperationalDate.bind(this);
        this.state = {
            issueOptions: [],
            selectedIssue: '',
            failureDate: '',
            serviceDate: '',
            operationalDate: '',
        }
    }
    componentDidMount() {
        this.getIssues();
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
        .then(data => {
            const issues = [];
            data.forEach((issue) => {
                issues.push(
                    {value: issue.pk, label: issue.title}
                );
            });
            this.setState({issueOptions: issues});
        })
        .catch(err => {console.log(err)});
    }
    handleIssue(event) {
        this.setState({selectedIssue: event});
        axios.post(
            `${settings.API_SERVER}/api/assignIssue/`, 
            {
                ticket: this.props.ticketinfo.pk, 
                issue: event.value
            }, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(data => {console.log(data)})
        .catch(err => {console.log(err)});
    }
    handleFailureDate(event){
        this.setState({failureDate: event});
        axios.post(
            `${settings.API_SERVER}/api/updateTicket/`, 
            {
                ticket: this.props.ticketinfo.pk, 
                tag: 'date_failure', 
                data: Math.floor(event/1000),
                data2: event,
            }, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(data => {console.log(data)})
        .catch(err => {console.log(err)});
    }
    handleServiceDate(event){
        this.setState({serviceDate: event});
        axios.post(
            `${settings.API_SERVER}/api/updateTicket/`, 
            {
                ticket: this.props.ticketinfo.pk, 
                tag: 'date_service', 
                data: Math.floor(event/1000),
                data2: event,
            }, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(data => {console.log(data)})
        .catch(err => {console.log(err)});
    }
    handleOperationalDate(event){
        console.log(this.state)
        this.setState({operationalDate: event})
        axios.post(
            `${settings.API_SERVER}/api/updateTicket/`, 
            {
                ticket: this.props.ticketinfo.pk, 
                tag: 'date_operational', 
                data: Math.floor(event/1000),
                data2: event,
            }, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(data => {console.log(data)})
        .catch(err => {console.log(err)});
    }

    render() {
        return(
            <div className="px-3 border-left">
                <h3>General Info</h3>
                <div className="table-responsive">
                    <table className="table align-items-end table-flush my-2">
                        <tbody>
                            <tr>
                            <th scope="row">Asset</th>
                            <td>{this.props.ticketinfo.asset__type__type}</td>
                            </tr>
                            <tr>
                                <th scope="row">Location</th>
                                <td>{this.props.ticketinfo.asset__location}</td>
                            </tr>
                            <tr>
                                <th scope="row">Commission date</th>
                                <td>{this.props.ticketinfo.asset__commission_date}</td>
                            </tr>
                            <tr>
                                <th scope="row">Version</th>
                                <td>{this.props.ticketinfo.asset__version}</td>
                            </tr>
                            <tr>
                                <th scope="row">Changed Parts</th>
                                <td>{this.props.ticketinfo.asset__parts}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <h3>Failure Info</h3>
                <div className="table-responsive">
                    <table className="table align-items-end table-flush">
                        <tbody>
                        <tr>
                            <th scope="row">Type</th>
                            <td colSpan="2">
                                <Select 
                                    placeholder={'Note Issue...'}
                                    options={this.state.issueOptions}
                                    onChange={this.handleIssue}
                                    value={this.state.selectedIssue || {value: this.props.ticketinfo.issue__pk, label: this.props.ticketinfo.issue__title}}
                                />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Failure</th>
                            <td colSpan="2">
                                <DatePicker 
                                    className="card-image py-1 w-100"
                                    selected={this.state.failureDate} 
                                    showTimeSelect
                                    isClearable={true}
                                    dateFormat="  d MMM, yyy, HH:mm"
                                    onChange={this.handleFailureDate}
                                />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Service</th>
                            <td colSpan="2">
                                <DatePicker 
                                    className="card-image py-1 w-100"
                                    selected={this.state.serviceDate} 
                                    showTimeSelect
                                    isClearable={true}
                                    dateFormat="  d MMM, yyy, HH:mm"
                                    onChange={this.handleServiceDate}
                                />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Operational</th>
                            <td>
                                <DatePicker 
                                    className="card-image py-1 w-100"
                                    selected={this.state.operationalDate} 
                                    showTimeSelect
                                    isClearable={true}
                                    dateFormat="  d MMM, yyy, HH:mm"
                                    onChange={this.handleOperationalDate}
                                />
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <h3>Technician Info</h3>
                <div className="table-responsive">
                    <table className="table align-items-end table-flush">
                        <tbody>
                        <tr>
                            <th scope="row">Name</th>
                            <td>{this.props.ticketinfo.technician__name}</td>
                        </tr>
                        <tr>
                            <th scope="row">Company</th>
                            <td>{this.props.ticketinfo.technician__company}</td>
                        </tr>
                        <tr>
                            <th scope="row">Company Location</th>
                            <td>{this.props.ticketinfo.technician__location}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}
// Set States
class TicketPage extends React.Component {
    constructor(props) {
        super(props);
        this.infoRef = React.createRef();
        this.getTicketInfo = this.getTicketInfo.bind(this);
        this.getTickets = this.getTickets.bind(this);
        this.getUsers = this.getUsers.bind(this);
        this.getTechnicians = this.getTechnicians.bind(this);
        this.handleAssignCX = this.handleAssignCX.bind(this);
        this.handleAssignTechnician = this.handleAssignTechnician.bind(this);
        this.handleStatusChange = this.handleStatusChange.bind(this);
        this.state = {
            user: "",
            ticket: parseInt(window.location.search.slice(1)),
            comments: [],
            ticketInfo: {},
            tickets: [],
            users: [],
            technicians: [],
            assignedTechnician: {},
            assignedCX: {},
        }
    }
    componentDidMount() {
        this.getTicketInfo();
        this.getTickets();
        this.getUsers();
        this.getTechnicians();
        this.getUser();
    }
    getUser() {
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
    getTicketInfo() {
        axios.post(
            `${settings.API_SERVER}/api/getTicketInfo/`, 
            {ticket: this.state.ticket}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(res => {
            let data = res.data;
            if (data.description === 'nan') {
                data.description = 'No description provided.';
            }
            this.setState({
                ticketInfo: data,
                assignedTechnician: {value: data.technician__email, label: data.technician__name},
                assignedCX: {value: data.assignee, label: data.assignee},
            });
            this.infoRef.current.setState({
                selectedIssue: {value: data.issue__pk, label: data.issue__title},
                failureDate: Date.parse(data.date_failure),
                serviceDate: Date.parse(data.date_service),
                operationalDate: Date.parse(data.date_operational),
            })
        })
        .catch(err => {this.setState({error: err})});
    }
    getTickets() {
        axios.post(
            `${settings.API_SERVER}/api/getTickets/`, 
            {}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(res => {
            let data = res.data;
            this.setState({tickets: data});
        })
        .catch(err => {console.log(err)});
    }
    deleteTicket() {
        axios.post(
            `${settings.API_SERVER}/api/deleteTicket/`, 
            {ticket: this.state.ticket}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(res => {console.log(res)})
        .catch(err => {console.log(err)});
    }
    getUsers() {
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
            const users = [];
            data.forEach((user) => {
                users.push(
                    {value: user.name, label: user.name}
                );
            });
            this.setState({users: users});
        })
        .catch(err => {this.setState({error: err})});
    }
    getTechnicians() {
        axios.post(
            `${settings.API_SERVER}/api/getTechnicians/`, 
            {}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(res => {
            let data = res.data;
            const technicians = [];
            data.forEach((technician) => {
                technicians.push(
                    {value: technician.email, label: technician.name}
                );
            });
            this.setState({technicians: technicians});
        })
        .catch(err => {this.setState({error: err})});
    }
    handleAssignCX(event) {
        this.setState({assignedCX: event})
        axios.post(
            `${settings.API_SERVER}/api/assignUser/'`, 
            {
                ticket: this.state.ticket, 
                assignee: event.value
            }, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(res => {
            let data = res.data;
            this.setState({tickets: data});
        })
        .catch(err => {this.setState({error: err})});
    }
    handleAssignTechnician(event) {
        const ticketInfo = this.state.ticketInfo;
        ticketInfo.technician__name = event.label;
        this.setState({ticketInfo: ticketInfo, assignedTechnician: event});
        axios.post(
            `${settings.API_SERVER}/api/assignTechnician/`, 
            {
                ticket: this.state.ticket, 
                name: event.label, 
                email: event.value
            }, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(data => {console.log(data.data)})
        .catch(err => {console.log(err)});
    }
    handleStatusChange(newStatus) {
        const index = this.state.tickets.findIndex(ticket => ticket.pk === this.state.ticket);
        const tickets = this.state.tickets;
        tickets[index].status = newStatus;
        const ticketInfo = this.state.ticketInfo;
        ticketInfo.status = newStatus;
        this.setState({
            ticketInfo: ticketInfo,
            tickets: tickets,
        });
        axios.post(
            `${settings.API_SERVER}/api/changestatus/`, 
            {
                ticket: this.state.ticket, 
                status: newStatus
            }, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(data => {console.log(data.data)})
        .catch(err => {console.log(err)});
    }
    // UI
    assignSelects() {
        return(
            <div>
                 <h4>Assign Technician:</h4>
                <Select
                    placeholder="Assign Technician"
                    value={this.state.assignedTechnician}
                    onChange={this.handleAssignTechnician}
                    options={this.state.technicians}/>
                <h4 className="mt-3">Assign CX Engineer:</h4>
                <Select 
                    placeholder="Assign CX"          
                    value={this.state.assignedCX}
                    onChange={this.handleAssignCX} 
                    options={this.state.users}/> 
            </div>
        )
    }
    statusButton() {
        if (this.state.ticketInfo.status === 'open'){
            return(
                <div>
                    <Button variant="outline-success" onClick={() => this.handleStatusChange('closed')} block>Close Issue</Button>
                </div>
            )
        } else if (this.state.ticketInfo.status === 'closed') {
            return(
                <div>
                    <Button variant="outline-danger" onClick={() => this.handleStatusChange('open')} block>Reopen Issue</Button>
                </div>
            )
        }
    }
    ticketButtons() {
        return(
            <div>
                {this.statusButton()}
                <a href={"/tickets/"}>
                    <Button variant='outline-danger mt-2' block onClick={this.deleteTicket}>
                        <FaTrash className="mx-2"/>
                        Delete
                    </Button>
                </a>
            </div>
        )
    }

    // Render
    render() {
        return(
            <Layout {...this.props}>
                <React.Fragment>
                    <CssBaseline/>
                    <div className="row">
                        <div className="col-auto">
                            <a href="../tickets/">
                                <Button variant='outline-light'>
                                    back
                                </Button>
                            </a>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xl-1">
                            <TicketNavigation tickets={this.state.tickets}/>
                        </div>
                        <div className="col-xl-11 pl-4">
                            <div className="card card-body">
                                <div className="card-header bg-transparent">
                                    <div className="row">
                                        <div className="col-xl-7">
                                            <h2 className="text-muted">
                                                F{this.state.ticketInfo.pk}A{this.state.ticketInfo.asset__pk} - {this.state.ticketInfo.asset__type__type} - {this.state.ticketInfo.title}
                                            </h2>
                                            <h4>Created by: {this.state.ticketInfo.user}</h4>
                                            <h4>{this.state.ticketInfo.date_failure}</h4>
                                        </div>
                                        <div className="col-xl-3 pr-6">
                                            {this.assignSelects()}
                                        </div>  
                                        <div className="col-xl-2 pt-5">
                                            {this.ticketButtons()}
                                        </div>                                  
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xl-7">
                                        <div className="col-xl-12 my-6">
                                            {this.state.ticketInfo.description}
                                        </div>
                                        <div className="col-xl-12 my-1">
                                            <CommentSection 
                                                ticket={this.state.ticket}
                                                user={this.state.user}/>
                                        </div>
                                    </div>
                                    <div className="col-xl-5">
                                        <TicketInformation ticketinfo={this.state.ticketInfo} ref={this.infoRef}/>
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


export default TicketPage;