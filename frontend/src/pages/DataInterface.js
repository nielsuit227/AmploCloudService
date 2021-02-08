import React from 'react';
import Button from 'react-bootstrap/Button';
import Select from 'react-select';
import axios from 'axios';
import getCookie from '../components/getCookie';
import { CssBaseline } from '@material-ui/core';
import * as settings from '../Settings';
import Layout from '../components/Layout';
import { DataInterfacePlot } from '../components/Figures.js';


class DataInterface extends React.Component {

    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.toggleAll = this.toggleAll.bind(this);
        this.state = {
            assetInfo: [],
            assetOptions: [],
            selectedAsset: [],
            data: [],
            sensors: ['Input Vd', 'Input Vq', 'Input Id', 'Input Iq', 'Output V', 'Output I'],
            toggle: Array(6).fill(true),
        }
    }
    componentDidMount(){
        let data = [];
        Array(50).fill(0).forEach((x, i) => {
            data.push({
                xaxis: 1604500792 + i * 60,
                'Input Vd': parseFloat((8 + Math.random()).toFixed(2)),
                'Input Vq': parseFloat((6 + Math.random()).toFixed(2)),
                'Input Id': parseFloat((5 * Math.random()).toFixed(2)),
                'Input Iq': parseFloat((8 * Math.random()).toFixed(2)),
                'Output V': parseFloat((12 + Math.random() / 2).toFixed(2)),
                'Output I': parseFloat((15 + 2 * Math.random()).toFixed(2)),
            })
        });
        this.setState({data: data});
        axios.post(
            `${settings.API_SERVER}/api/getAssets/`, 
            {}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        ).then(response => {
            let assets = [];
            let data = response.data;
            data.forEach((asset) => {
                assets.push({value: asset.pk, label: asset.type__type + ', ' + asset.location})
            });
            let assetInfo = data.find((item) => item.pk === parseInt(this.props.asset));
            this.setState({assetInfo: assetInfo, assetOptions: assets});
            let selAsset = {value: assetInfo.pk, label: assetInfo.type__type + ', ' + assetInfo.location};
            this.setState({
                assetOptions: assets,
                selectedAsset: selAsset,
            });
        })
        .catch(err => {console.log(err)});
    }
    toggle(idx) {
        let toggle = this.state.toggle;
        toggle[idx] = !toggle[idx];
        this.setState({toggle: toggle});
    }
    toggleAll() {
        if (this.state.toggle.every((e) => e === false)) {
            this.setState({
                toggle: Array(this.state.sensors.length).fill(true),
            })
        } else {
            this.setState({
                toggle: Array(this.state.sensors.length).fill(false),
            });
        }
    }
    changeAsset(ev) {
        window.location.assign('/data?asset='+String(ev.value));
    }

    render() {
        return(
            <Layout {...this.props}>
                <React.Fragment>
                    <CssBaseline/>
                    <div className="row">
                        <div className="col-auto">
                            <a href="/">
                                <Button variant='outline-light'>
                                    back
                                </Button>
                            </a>
                        </div>
                    </div>
                    <div className="card card-body">
                        <div className="card-header bg-transparent">
                            <h2 className='card-title'>
                                Data Interface
                            </h2>
                            <div className="col-xl-5">
                                <Select
                                    options={this.state.assetOptions}
                                    value={this.state.selectedAsset}
                                    onChange={this.changeAsset}
                                    />
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-xl-2 mt-9 ml-5'>
                                <Button className='mb-2' variant='outline-primary' onClick={this.toggleAll}>
                                    toggle all
                                </Button>
                                {
                                    this.state.sensors.map((sensor, idx) => {
                                        return(
                                            <div className="custom-control custom-control-alternative custom-checkbox" key={idx}>
                                                <input className="custom-control-input" id={idx} type="checkbox" checked={this.state.toggle[idx]} onChange={() => this.toggle(idx)}/>
                                                <label className="custom-control-label" htmlFor={idx}>
                                                    <h4>{sensor}</h4>
                                                </label>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <div className='col-xl-9'>
                                <DataInterfacePlot
                                    data={this.state.data}
                                    cols={this.state.toggle.flatMap((b, i) => b ? this.state.sensors[i] : [])}
                                    />
                                </div>
                        </div>                    
                    </div>
                </React.Fragment>
            </Layout>
        )
    }
}


export default DataInterface;