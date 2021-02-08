import React from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import axios from 'axios';
import CssBaseline from '@material-ui/core/CssBaseline';
import Layout from '../../components/Layout';
import getCookie from '../../components/getCookie';
import Menu from '../../components/Menu';
import * as settings from '../../Settings';
import { FaTrash, FaEdit } from 'react-icons/fa';


class PartSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            edit: [],
            active: 'Parts',
            menu: ['Assets', 'Asset Types', 'Users', 'Issues', 'Technicians', 'Parts'],
            links: ['/settings/assets/', '/settings/assettypes/', '/settings/users/', '/settings/issues/', '/settings/technicians/', '/settings/parts/'],
            cols: ['Part', 'Price', 'Vendor']
        }
    }
    componentDidMount() {
        axios.post(
            `${settings.API_SERVER}/api/getParts/`, 
            {}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(res => {
            let data = res.data;
            this.setState({
                data: data,
                edit: Array(data.length).fill(false),
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
            `${settings.API_SERVER}/api/delPart/`, 
            {name: item.name}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(data => {console.log(data)})
        .catch(err => {console.log(err)});
    }
    handleEdit(data, idx) {
        const newEdit = Array(this.state.edit.length).fill(false);
        newEdit[idx] = true;
        this.setState({
            editData: Object.assign({}, data), 
            edit: newEdit});
    }
    handleEditData(key, event) {
        const temp = Object.assign({}, this.state.editData);
        temp[key] = event.target.value;
        this.setState({editData: temp});
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
    row(data, idx) {
        if (this.state.edit[idx] === true) {
            return(
                <tr>
                    {
                        Object.entries(data).map((item) => {
                            if (item[0] in ['stock', 'location']) {
                                return(<div></div>)
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
                        Object.entries(data).map((item, jdx) => {
                            if (['stock', 'location'].indexOf(item[0]) === -1) {
                                return(
                                    <td>{item[1]}</td>
                                );
                            }
                        })          
                    }
                    <td>
                        <Button variant='outline-secondary' onClick={() => this.handleEdit(data, idx)}>
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
                                            this.state.data.map((rowData, idx) => {
                                                delete rowData.pk;
                                                return(this.row(rowData, idx));
                                            })
                                        }
                                    </tbody>
                                </Table>
                                <a href="/createPart/">
                                    <Button variant='outline-primary'>
                                        Add Parts
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            </Layout>
        )
    }
}


export default PartSettings;