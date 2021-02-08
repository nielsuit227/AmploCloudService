import React from 'react';
import Select from 'react-select';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import axios from 'axios';
import getCookie from '../../components/getCookie';
import { CssBaseline } from '@material-ui/core';
import * as settings from '../../Settings';
import Layout from '../../components/Layout';
import { FaPlus } from 'react-icons/fa';


class AddAsset extends React.Component {
    constructor(props) {
        super(props);
        this.handleAsset = this.handleAsset.bind(this);
        this.handleSerial = this.handleSerial.bind(this);
        this.handleLocation = this.handleLocation.bind(this);
        this.handleVersion = this.handleVersion.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleFile = this.handleFile.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.manualError = this.manualError.bind(this);
        this.fileError = this.fileError.bind(this);
        this.addEntry = this.addEntry.bind(this);
        this.state = {
            assetTypes: [],
            asset: '',
            entries: [0],
            locations: [''],
            serials: [''],
            versions: [''],
            manualError: '',
            fileError: '',
            file: null,
        }
    }
    componentDidMount() {
        axios.post(
            `${settings.API_SERVER}/api/getAssetTypes/`, 
            {}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(data => {
            let x = [];
            data.data.forEach((item) => {
                x.push({value: item.type, label: item.type})
            });
            this.setState({assetTypes: x});
        })
        .catch(err => {console.log(err)});
    }
    handleAsset(event) {
        this.setState({asset: event});
        if (this.state.manualError !== '') {
            this.setState({manualError: ''});
        }
    }
    handleSerial(idx, event) {
        let serials = this.state.serials;
        serials[idx] = event.target.value;
        this.setState({serials: serials});
    }
    handleLocation(idx, event) {
        let locations = this.state.locations;
        locations[idx] = event.target.value;
        this.setState({locations: locations});
    }
    handleVersion(idx, event) {
        let versions = this.state.versions;
        versions[idx] = event.target.value;
        this.setState({versions: versions});
    }
    handleSubmit() {
        if (this.state.asset === '') {
            this.setState({manualError: 'Please select Asset Type.'})
        } else if (this.state.serials.indexOf('') !== -1) {
            this.setState({manualError: 'Serials cannot be empty.'})
        } else if ([...new Set(this.state.serials)].length !== this.state.serials.length) {
            this.setState({manualError: 'Serials need to be unique.'})
        }
        axios.post(
            `${settings.API_SERVER}/api/addAssets/`, 
            {
                type: this.state.asset.value,
                locations: this.state.locations,
                serials: this.state.serials,
                versions: this.state.versions,
            }, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(data => {
            this.setState({manualError: data.data});
            // window.location.assign('/settings/assets')
        })
        .catch(err => {console.log(err)});
    }
    handleFile(event) {
        let fileName = event.target.files[0].name;
        let fileType = fileName.slice(fileName.length - 4);
        if (fileType !== '.csv') {
            this.setState({fileError: 'Please use a .csv format.'});
        } else {
            this.setState({fileError: ''});
        }
        var formData = new FormData();
        formData.append("file", event.target.files[0], event.target.files[0].name);
        this.setState({file: formData})
    }
    uploadFile() {
        axios.post(
            `${settings.API_SERVER}/api/uploadAssets/`, 
            this.state.file, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
                'Content-Type': 'multipart/form-data',
            }} 
        )
        .then(data => {
            this.setState({fileError: data.data});
        })
        .catch(err => {console.log(err)});
    }
    addEntry() {
        let entries = this.state.entries;
        entries.push(entries.length);
        let locations = this.state.locations;
        locations.push('');
        let serials = this.state.serials;
        serials.push('');
        let versions = this.state.versions;
        versions.push('');
        this.setState({
            entries: entries,
            locations: locations,
            serials: serials,
            versions: versions,
        })
    }
    manualError() {
        if (this.state.manualError === '') {
            return(<div></div>)
        } else if (this.state.manualError === 'Success') {
            return <Alert variant='success'>Assets Commissioned!</Alert>
        } else {
            return(
                <div>
                    <Alert variant='danger'>{this.state.manualError}</Alert>
                </div>
            )
        }
    }
    fileError() {
        if (this.state.fileError === '') {
            return(<div></div>)
        } else if (this.state.fileError === 'Success') {
            return(<Alert variant='success'>Assets Commissioned!</Alert>)
        } else {
            return(<Alert variant='danger'>{this.state.fileError}</Alert>)
        }
    }

    render() {
        return(
            <Layout {...this.props}>
                <React.Fragment>
                    <CssBaseline/>
                    <div className="row">
                        <div className="col-auto mt-5">
                            <a href="/settings/assets/">
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
                                        Commission Assets
                                    </h2>
                                </div>
                                <h5 className="mt-3 mb--2">Commissioning assets can either be done manually or by uploading a csv-file.  </h5>
                                <hr></hr>
                                <div className="row">
                                    <div className="col-xl-4 pr-6">
                                        <h3>Upload .csv: </h3>
                                        <h5>The CSV needs to contain five columns; Type, Location, Serial and Version.</h5>
                                        <input className="my-2 pr-4" type="file" onChange={this.handleFile}></input>
                                        <Button className="my-2" variant="outline-primary" onClick={this.uploadFile}>
                                            Upload
                                        </Button>
                                        {this.fileError()}
                                    </div>
                                    <div className="col-xl-8 pl-6 border-left">
                                        <div className="col-auto">
                                            <h3>Manual Commission:</h3>
                                        </div>
                                        <div className="col-xl-8 mb-4">
                                            <div className="row">
                                                <div className="col-xl-8">
                                                    <Select 
                                                        placeholder="Select Asset Type"
                                                        options={this.state.assetTypes}
                                                        value={this.state.asset}
                                                        onChange={this.handleAsset}
                                                    />         
                                                </div>
                                                <div className="col-xl-4">
                                                    <Button variant='outline-primary' onClick={this.addEntry}>
                                                        <FaPlus/> 
                                                </Button>
                                                </div>
                                            </div>                       
                                        </div>
                                        {
                                            this.state.entries.map((idx) => {
                                                return(
                                                    <div className="row mt--1 mx-1">
                                                        <h4 className="mt-1 ml-3">#{idx + 1}</h4>
                                                        <div className="col-xl-3">
                                                            <input type="text" placeholder="Location" onChange={(ev) => this.handleLocation(idx, ev)}/>
                                                        </div>
                                                        <div className="col-xl-3">
                                                            <input type="text" placeholder="Serial" onChange={(ev) => this.handleSerial(idx, ev)}/>
                                                        </div>
                                                        <div className="col-xl-3">
                                                            <input type="text" placeholder="Version" onChange={(ev) => this.handleVersion(idx, ev)}/>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                        <div className="col-xl-2">
                                            <Button variant='outline-primary' onClick={this.handleSubmit}>
                                                Save
                                            </Button>
                                        </div>
                                        <div className="col-xl-8 my-3">
                                            {this.manualError()}
                                        </div>                                    
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

export default AddAsset;