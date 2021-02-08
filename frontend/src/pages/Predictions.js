import React from 'react';
import axios from 'axios';
import * as settings from '../Settings';
import { PredictionPlot, gauge } from '../components/Figures.js';
import CssBaseline from '@material-ui/core/CssBaseline';
import Layout from '../components/Layout';
import getCookie from '../components/getCookie';

class Predictions extends React.Component{
    constructor(props) {
        super(props)
        this.getData = this.getData.bind(this);
        this.searchButton = this.searchButton.bind(this);
        this.searchChange = this.searchChange.bind(this);
        this.card = this.card.bind(this);
        this.classificationPlot = React.createRef();
        this.state = {
            assets: [],
            search: "",
        };
    }
    componentDidMount() {
      this.getData('');      
    }

    // Query
    getData(search) {
        axios.post(
            `${settings.API_SERVER}/api/predictionData/`, 
            {search: search}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(data => {
            this.setState({assets: data.data});
        })
        .catch(err => {console.log(err)});
    }
    // Graphs


    // Items
    searchButton() {
        return(
            <div>
                <div className="card">
                    <div className="card-header">
                        <h5>Search Asset</h5>
                    </div>
                    <div className='card-body'>
                        <input className='my-input' placeholder="Search..." value={this.state.search} onChange={this.searchChange}/>
                    </div>
                </div>
            </div>
        )
    }
    searchChange(event) {
        this.setState({search: event.target.value});
        this.getData(event.target.value);
    }
    card(idx) {
        return(
            <div className="card card-body" key={idx+'c'}>
                <div className="card-header bg-transparent m--2" key={idx+'d'}>
                    <a href={"/data?asset="+this.state.assets[idx].pk} key={idx+'b'}>
                        <h3 className="card-title text-muted m--4" key={idx+'e'}>
                            {this.state.assets[idx].type}, {this.state.assets[idx].location}
                        </h3>
                    </a>
                </div>
                <div className="row" key={idx+'f'}>
                    <div className="col-xl-3" key={idx+'g'}>
                        <div className="card shadow" key={idx+'h'}>
                            <div className="card-header bg-transparent" key={idx+'i'}>
                                <h4 className="mb-0" key={idx+'j'}>State of Health</h4>
                            </div>
                            <div className="card-body" key={idx+'k'}>
                                <div className="chart" key={idx+'l'}>
                                    {gauge(Math.round(this.state.assets[idx].soh * 10) / 10)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <PredictionPlot
                            titles={['Anomalies', 'Degraded Capacitor', 'Transformer Insulation']}
                            cols={['Anomalies', 'Capacitor', 'Transformer']}
                            data={this.state.assets[idx].data}
                        />
                </div>
            </div>
        )
    }

    render() {
        return(
            <Layout {...this.props}>
                <React.Fragment>
                    <CssBaseline/>
                    {this.searchButton()}
                    {   
                        this.state.assets.map((asset, idx) => {
                            return(this.card(idx));
                        })
                    }
                </React.Fragment>
            </Layout>
        )
    }
}

export default Predictions;