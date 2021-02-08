import React from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Pagination from 'react-bootstrap/Pagination';
import DatePicker from 'react-datepicker';
import dateFormat from 'dateformat';
import axios from 'axios';
import CssBaseline from '@material-ui/core/CssBaseline';
import Layout from '../../components/Layout';
import getCookie from '../../components/getCookie';
import Menu from '../../components/Menu';
import * as settings from '../../Settings';
import { FaTrash, FaEdit } from 'react-icons/fa';


class AssetSettings extends React.Component {
    constructor(props) {
        super(props);
        this.deleteItem = this.deleteItem.bind(this);
        this.setEdit = this.setEdit.bind(this);
        this.handleEditData = this.handleEditData.bind(this);
        this.handleEditSave = this.handleEditSave.bind(this);
        this.handleCommission = this.handleCommission.bind(this);
        this.queryData = this.queryData.bind(this);
        this.editSearch = this.editSearch.bind(this);
        this.row = this.row.bind(this);
        this.state = {
            search: '',
            selectedPage: 0,
            perPage: 10,
            pages: [0],
            data: [],
            edit: [],
            menu: ['Assets', 'Asset Types', 'Users', 'Issues', 'Technicians', 'Parts'],
            links: ['/settings/assets/', '/settings/assettypes/', '/settings/users/', '/settings/issues/', '/settings/technicians/', '/settings/parts/'],
            active: 'Assets',
            cols: ['Type', 'Location','Serial', 'Version', 'Commission date', 'Parts'],
            editData: {},
            date: '',
        }
    }
    componentDidMount() {
        this.queryData(this.state.search);
    }
    queryData(search) {
        axios.post(
            `${settings.API_SERVER}/api/getAssets/`, 
            {search: search}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(data => {
            let x = [];
            let pages = Math.ceil(data.data.length / this.state.perPage);
            for (let i=0; i<pages; i++) {
                x.push(i);
            }
            this.setState({
                data: data.data,
                edit: Array(data.data.length).fill(false),
                pages: x,
            });
        })
        .catch(err => {console.log(err)});
    }
    // Handles
    deleteItem(item, idx) {
        const x = this.state.data;
        x.splice(idx, 1);
        this.setState({data: x});
        axios.post(
            `${settings.API_SERVER}/api/delAsset/`, 
            {type: item.type}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(data => {console.log(data)})
        .catch(err => {console.log(err)});
    }
    setEdit(data, idx) {
        const newEdit = Array(this.state.edit.length).fill(false);
        newEdit[idx] = true;
        let date = Date.parse(data.commission_date) || 0;
        this.setState({
            editData: data, 
            edit: newEdit,
            date: date,
        });
    }
    handleEditData(key, event) {
        const temp = Object.assign({}, this.state.editData);
        temp[key] = event.target.value;
        this.setState({editData: temp});
    }
    handleCommission(ev) {
        let tmp = this.state.editData;
        tmp.commission_date = dateFormat(ev, 'ddd d mmm yyyy, HH:MM')
        this.setState({
            editData: tmp,
            date: Math.floor(ev)
        });
    }
    handleEditSave(idx) {
        // Edit Boolean Vector
        const editStatus = this.state.edit;
        editStatus[idx] = false;
        // API update
        axios.post(
            `${settings.API_SERVER}/api/updateSettings/`, 
            {
                setting: this.state.active,
                old: this.state.data[idx],
                new: this.state.editData,
                date: this.state.date / 1000,
            }, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(data => {console.log(data)})
        .catch(err => {console.log(err)});
        // Update Data
        const updateData = this.state.data;
        updateData[idx] = this.state.editData;
        this.setState({data: updateData, edit: editStatus});
    }
    handlePageClick(data) {
        this.setState({selectedPage: data});
    }
    editSearch(event) {
        this.setState({search: event.target.value});
        this.queryData(event.target.value);
    }
    // UI
    row(data, idx) {
        if (this.state.edit[idx] === true) {
            return(
                <tr>
                    {
                        Object.entries(data).map((item) => {
                            if (item[0] === 'commission_date') {
                                return(
                                    <td>
                                        <DatePicker
                                            className="card-image py-1 w-100"
                                            selected={this.state.date}
                                            showTimeSelect
                                            isClearable={true}
                                            dateFormat=" d MMM, yyy, HH:mm"
                                            onChange={this.handleCommission}
                                        />
                                    </td>
                                )
                            } else if (item[1] != null && item[1].length > 50) {
                                return(
                                    <td>
                                        <textarea rows="3" value={this.state.editData[item[0]]} onChange={(e) => this.handleEditData(item[0], e)} type="text"></textarea>
                                    </td>
                                );

                            } else {
                                return(
                                    <td>
                                        <input value={this.state.editData[item[0]]} onChange={(e) => this.handleEditData(item[0], e)} type="text"></input>
                                    </td>
                                );
                            }
                        })          
                    }
                    <td>
                        <Button variant="outline-primary" onClick={() => this.handleEditSave(idx)}>Save</Button>
                    </td>
                    <td>
                        <Button variant='outline-primary' onClick={() => this.deleteItem(data, idx)}>
                            <FaTrash/>
                        </Button>
                    </td>
                </tr>
            )
        } else {
            return(
                <tr>
                    {
                        Object.entries(data).map((item) => {
                            return(
                                <td>{item[1]}</td>
                            );
                        })          
                    }
                    <td>
                        <Button variant='outline-secondary' onClick={() => this.setEdit(data, idx)}>
                            <FaEdit/>
                        </Button>
                    </td>
                    <td>
                        <Button variant='outline-secondary' onClick={() => this.deleteItem(data, idx)}>
                            <FaTrash/>
                        </Button>
                    </td>
                </tr>
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
                            <div className="card card-body">
                                {Menu(this.state.menu, this.state.links, this.state.active)}
                                <hr></hr>
                                <input className="mt--3 mb-3" type="text" placeholder="Search Assets" onChange={this.editSearch}/>
                                <Table striped hover>
                                    <thead>
                                        <tr>
                                            {
                                                this.state.cols.map((col) => {
                                                    return(
                                                        <th scope="col text-lowercase">{col}</th>
                                                    )
                                                })
                                            }
                                            <th scope="col text-lowercase">Edit</th>
                                            <th scope="col text-lowercase">Del</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.data.slice(this.state.selectedPage * this.state.perPage, (this.state.selectedPage + 1) * this.state.perPage).map((rowData, idx) => {
                                                delete rowData.pk
                                                return(this.row(rowData, idx));
                                            })
                                        }
                                    </tbody>
                                </Table>
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
                                <div className="col-auto">
                                    <a href='/commissionassets/'>
                                        <Button variant='outline-primary'>
                                            Commission Assets
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            </Layout>
        )
    }

}

export default AssetSettings;