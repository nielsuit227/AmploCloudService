import React from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import axios from 'axios';
import CssBaseline from '@material-ui/core/CssBaseline';
import Layout from '../../components/Layout';
import getCookie from '../../components/getCookie';
import Menu from '../../components/Menu';
import * as settings from '../../Settings';
import { FaTrash, FaEdit, FaFilePdf } from 'react-icons/fa';


class IssueSettings extends React.Component {
    constructor(props) {
        super(props);
        this.handleFile = this.handleFile.bind(this);
        this.state = {
            file: '',
            data: [],
            edit: [],
            active: 'Issues',            
            menu: ['Assets', 'Asset Types', 'Users', 'Issues', 'Technicians', 'Parts'],
            links: ['/settings/assets/', '/settings/assettypes/', '/settings/users/', '/settings/issues/', '/settings/technicians/', '/settings/parts/'],
            cols: ['Title', 'Description', 'Work Template'],
        }
    }
    componentDidMount() {
        axios.post(
            `${settings.API_SERVER}/api/getIssues/`, 
            {}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(data => {
            this.setState({
                data: data.data,
                edit: Array(data.data.length).fill(false),
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
            `${settings.API_SERVER}/api/delIssues/`, 
            {title: item.title}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(data => {console.log(data)})
        .catch(err => {console.log(err)});
    }
    handleEdit(data, idx) {;
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
        if (this.state.file === '') {
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
            ).then(res => {
                let data = res.data;
                if (data === 'Success') {
                    let editStatus = this.state.edit;
                    editStatus[idx] = false;
                    let updateData = this.state.data;
                    updateData[idx] = this.state.editData;
                    this.setState({data: updateData, edit: editStatus});
                }
            });            
        } else {       
            axios.post(
                `${settings.API_SERVER}/api/uploadWorkTemplate/`, 
                {data: this.state.file}, 
                {headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                    'x-csrftoken': getCookie('csrftoken'),
                    'Content-Type': 'multipart/form-data',
                }} 
            )
            .then(res => {
                let data = res.data;
                if (data.slice(0, 6) === 'Failed') {
                    this.setState({file: null});
                } else {
                    let editData = this.state.editData;
                    editData.template = data;
                    axios.post(
                        `${settings.API_SERVER}/api/updateSettings/`, 
                        {
                            setting: this.state.active,
                            old: this.state.data[idx],
                            new: editData,
                        }, 
                        {headers: {
                            'Authorization': `Token ${localStorage.getItem('token')}`,
                            'x-csrftoken': getCookie('csrftoken'),
                        }} 
                    ).then(data => {
                        if (data === 'Success') {
                            let editStatus = this.state.edit;
                            editStatus[idx] = false;
                            let updateData = this.state.data;
                            updateData[idx] = editData;
                            this.setState({data: updateData, edit: editStatus});
                        }
                    });
                }
            })
            .catch(err => {console.log(err)});

        }
        // API update 
    }
    handleFile(event) {
        let fileName = event.target.files[0].name;
        var formData = new FormData();
        formData.append('file', event.target.files[0], fileName);
        this.setState({file: formData});
    }
    row(data, idx) {
        if (this.state.edit[idx] === true) {
            return(
                <tr>
                    {
                        Object.entries(data).map((item) => {
                            if (item[0] === 'template') {
                                return(
                                    <td>
                                        <input type="file" onChange={this.handleFile}/>
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
                        Object.entries(data).map((item, jdx) => {
                            if (item[0] === 'template') {
                                return(
                                    <td>
                                        <a href={settings.API_SERVER + '/' + item[1]} target="_blank" rel='noreferrer'>
                                            <FaFilePdf/>
                                        </a>
                                    </td>
                                )
                            } else {
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
                                <a href="/createissue/">
                                    <Button variant='outline-primary'>
                                        Create Issue Template
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


export default IssueSettings;