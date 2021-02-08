import React from 'react';
import Select from 'react-select';
import Button from 'react-bootstrap/Button';
import Pagination from 'react-bootstrap/Pagination';
import axios from 'axios';
import * as settings from '../Settings';
import CssBaseline from '@material-ui/core/CssBaseline';
import Layout from '../components/Layout';
import getCookie from '../components/getCookie';


class TicketList extends React.Component {
    constructor(props) {
        super(props);
        this.searchChange = this.searchChange.bind(this);
        this.statusChange = this.statusChange.bind(this);
        this.periodChange = this.periodChange.bind(this);
        this.sortChange = this.sortChange.bind(this);
        this.searchbutton = this.searchbutton.bind(this);
        this.updateQuery = this.updateQuery.bind(this);
        this.issueSort = this.issueSort.bind(this);
        this.handlePageClick = this.handlePageClick.bind(this);
        this.handleAssignee = this.handleAssignee.bind(this);
        this.state = {
            selectedPage: 0,
            perPage: 10,
            pages: [0],
            search: "",
            status: "",
            period: "",
            sort: "-date_failure",
            statusOptions: [{value: "open", label: "Open"}, {value: "closed", label: "Closed"}],
            periodOptions: [{value: "1", label: "This week"}, {value: "2", label: "This month"}, {value: "3", label: "This year"}],
            sortOptions: [{value: "-date_failure", label: "Newest first"}, {value: "date_failure", label: "Oldest first"}],
            issues: [],
            userOptions: [],
            selectedUser: "",
        }
    }
    componentDidMount() {
        console.log(this.props)
        this.updateQuery(this.state.search, this.state.status, this.state.period, this.state.sort, this.state.selectedUser)
        axios.post(
            `${settings.API_SERVER}/api/getUsers/`, 
            {}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(data => {
            let users = [];
            data.forEach((user) => {
                users.push({value: user.id, label: user.first_name + ' ' + user.last_name});
            })
            this.setState({userOptions: users});
        })
        .catch(err => {console.log(err)});
    }

    // Help functions
    updateQuery(search, status, period, sort, assignee) {
        axios.post(
            `${settings.API_SERVER}/api/results/`, 
            {
                search: search, 
                status: status, 
                period: period, 
                sort: sort, 
                assignee: assignee
            }, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(res => {
            let data = res.data;
            let x = [];
            let pages = Math.ceil(data.length / this.state.perPage)
            for (let i=0; i<pages; i++) {
                x.push(i);
            }
            this.setState({
                issues: data,
                pages: x,
            });
        })
        .catch(err => {console.log(err)});
    }
    searchChange(event) {
        this.setState({search: event.target.value});
        this.updateQuery(event.target.value, this.state.status, this.state.period, this.state.sort, this.state.selectedUser);
    }
    statusChange(event) {
        if(event === null) {
            this.updateQuery(this.state.search, "", this.state.period, this.state.sort, this.state.selectedUser);
            this.setState({status: ""});
        } else {
            this.updateQuery(this.state.search, event.value, this.state.period, this.state.sort, this.state.selectedUser);
            this.setState({status: event.value});
        }
    }
    periodChange(event) {
        if(event === null) {
            this.setState({period: ""});
            this.updateQuery(this.state.search, this.state.status, "", this.state.sort, this.state.selectedUser);
        } else {
                this.setState({period: event.value});
                this.updateQuery(this.state.search, this.state.status, event.value, this.state.sort, this.state.selectedUser);
        }
    }
    sortChange(event) {
        this.setState({sort: event.value});
        this.updateQuery(this.state.search, this.state.status, this.state.period, event.value, this.state.selectedUser);
    }
    handlePageClick(data) {
        this.setState({selectedPage: data});
    }
    handleAssignee(event) {
        if (event === null) {
            this.setState({selectedUser: ""});
            this.updateQuery(this.state.search, this.state.status, this.state.period, this.state.sort, "");
        } else {
            this.setState({selectedUser: event.value});
            this.updateQuery(this.state.search, this.state.status, this.state.period, this.state.sort, event.value);
        }
    }

    // All items for the render
    button(status) {
        if(status === 'open') {
            return(
                <Button variant="outline-danger" disabled> Open </Button>
            )
        } else {
            return (
                <Button variant="outline-success" disabled>Closed</Button>
            )
        }
    }
    card(issue, idx) {
        if (issue.assignee__first_name === null){
            issue.assignee__first_name = 'not assigned'
        }
        const url = '/ticket?' + issue.pk
        return(
            <a href={url} data-thread={issue} key={idx+'0'}>
                <div className="card shadow my--2" key={idx+'a'}>
                    <div className="row" key={idx+'a'}>
                        <div className="col-lg-1 mx-3" key={idx+'b'}>
                            {this.button(issue.status)}
                        </div>
                        <div className="col-lg-10" key={idx+'c'}>
                            <h4 className="col-auto mx-4" key={idx+'d'}>
                                F{issue.pk}A{issue.asset__pk} - {issue.title}
                            </h4>
                            <div className="row my--1 mx-3" key={idx+'e'}>
                                <div className="col-auto mx-1" key={idx+'f'}>
                                    <h5>Assigned: {issue.assignee__first_name} {issue.assignee__last_name}</h5>
                                </div>
                                <div className="col-auto mx-1" key={idx+'g'}>
                                    <h5>Created: {issue.date_failure}</h5>
                                </div>
                                <div className="col-auto mx-1" key={idx+'h'}>
                                    <h5>Asset: {issue.asset__type__type}</h5>
                                </div>
                                <div className="col-auto mx-1" key={idx+'i'}>
                                    <h5>Software: {issue.asset__version}</h5>
                                </div>
                                <div className="col-auto mx-1" key={idx+'j'}>
                                    <h5>Location: {issue.asset__location}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`
            </a>
        )
    }
    searchbutton() {
        return(
            <div>
                <input type="text" name="custom-input" placeholder="Search..." value={this.state.search} onChange={this.searchChange}></input>
            </div>
        )
    }
    periodfilter() {
        return(
            <Select
                placeholder="Period"
                options={this.state.periodOptions}
                onChange={this.periodChange}
                isClearable={true}
                ></Select>
        )
    }
    issueSort() {
        return(
            <Select 
                defaultValue={this.state.sortOptions[0]}
                options={this.state.sortOptions}
                onChange={this.sortChange}
                ></Select>
        )
    }

    render() {
        return(
            <Layout {...this.props}>
                <React.Fragment>
                    <CssBaseline/>
                    <div className="row">
                        <div className="card card-body">
                            <div className="card-header bg-transparent">
                                <div className="col-xl-6">
                                    <a href="/tickets/">
                                        <h2 className="card-title">
                                            All Tickets
                                        </h2>
                                    </a>
                                </div>
                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="row">
                                            <div className="col-lg-12">
                                                {this.searchbutton()}
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-3">
                                            <Select
                                                placeholder="Status"
                                                options={this.state.statusOptions}
                                                onChange={this.statusChange}
                                                isClearable={true}
                                            />
                                            </div>
                                            <div className="col-lg-3">
                                                {this.periodfilter()}
                                            </div>
                                            <div className="col-lg-3">
                                                {this.issueSort()}
                                            </div>
                                            <div className="col-lg-3">
                                                <Select 
                                                    placeholder="Assignee"
                                                    isClearable={true}
                                                    options={this.state.userOptions}
                                                    onChange={this.handleAssignee}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 pl-9 pt-4">
                                        <a href="createticket/">
                                            <Button variant='outline-primary' size='lg'>
                                                Create Ticket
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                                <div className="col-lg-3">
                                    <h4 className="card-subtitle mx-3 my-3">
                                        {this.state.issues.length} results found.
                                    </h4>
                                </div>
                            </div>
                            {
                                this.state.issues.slice(this.state.selectedPage * this.state.perPage, (this.state.selectedPage + 1) * this.state.perPage).map((issue, idx) => {
                                    return(this.card(issue, idx));
                                })
                            }
                            <div className="row">
                                <h4 className="ml-5 mr--7">Page:</h4>
                                <Pagination>
                                    {
                                        this.state.pages.map((page) => {
                                            return(
                                                <Pagination.Item 
                                                    key={page} 
                                                    active={page === this.state.selectedPage}
                                                    onClick={() => this.handlePageClick(page)}
                                                >
                                                    {page}
                                                </Pagination.Item>
                                            )
                                        })
                                    }
                                </Pagination>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            </Layout>
        )
    }
}

export default TicketList;