import React from 'react';
import axios from 'axios';
import * as settings from '../Settings';
import * as d3 from 'd3';
import { PredictionPlot } from '../components/Figures.js';
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
    gauge(value) {
        const min = 0;
        const max = 100;
        const backgroundArc = d3.arc().innerRadius(0.65).outerRadius(1).startAngle(-Math.PI / 2).endAngle(Math.PI / 2)
          .cornerRadius(1)();
        const percentScale = d3.scaleLinear().domain([min, max]).range([0, 1])
        const percent = percentScale(value);
        const angleScale = d3.scaleLinear().domain([0, 1]).range([-Math.PI / 2, Math.PI / 2]).clamp(true);
        const angle = angleScale(percent);
        const filledArc = d3.arc().innerRadius(0.65).outerRadius(1).startAngle(-Math.PI / 2).endAngle(angle)
            .cornerRadius(1)();
        const colorScale = d3.scaleLinear().domain([0, 1]).range(["#ffffff", "#236868"])
        const gradientSteps = colorScale.ticks(10).map(value => colorScale(value))
        return (
            <div>
                <div style={{textAlign: 'center'}}>
                    <svg style={{overflow: "visible"}} width="12em" viewBox={[-1, -1, 2, 1, ].join(" ")}>
              <defs>
                <linearGradient id="Gauge__gradient" gradientUnits="userSpaceOnUse" x1="-1" x2="1" y2="0">
                  {gradientSteps.map((color, index) => (
                    <stop
                      key={color}
                      stopColor={color}
                      offset={`${
                        index
                        / (gradientSteps.length - 1)
                      }`}
                    />
                  ))}
                </linearGradient>
              </defs>
              <path d={backgroundArc} fill="#dbdbe7" />
              <path d="M0.136364 0.0290102C0.158279 -0.0096701 0.219156 -0.00967009 0.241071 0.0290102C0.297078 0.120023 0.375 0.263367 0.375 0.324801C0.375 0.422639 0.292208 0.5 0.1875 0.5C0.0852272 0.5 -1.8346e-08 0.422639 -9.79274e-09 0.324801C0.00243506 0.263367 0.0803571 0.120023 0.136364 0.0290102ZM0.1875 0.381684C0.221591 0.381684 0.248377 0.356655 0.248377 0.324801C0.248377 0.292947 0.221591 0.267918 0.1875 0.267918C0.153409 0.267918 0.126623 0.292947 0.126623 0.324801C0.126623 0.356655 0.155844 0.381684 0.1875 0.381684Z"
                transform={`rotate(${
                  angle * (180 / Math.PI)
                }) translate(-0.2, -0.33)`} fill="#6a6a85" />
              <path d={filledArc} fill="url(#Gauge__gradient)" />
            </svg>
          </div>
          <div style={{marginTop: "2em", fontsize:"1em", textAlign: 'center'}}>
            Health:
          </div>
          <div style={{fontSize: "3em", textAlign: 'center', lineHeight: "1em", fontFeatureSettings: "'zero', 'tnum' 1"}}>
            {String(value)} %
          </div>
        </div>
      )
    }
    // Items
    searchButton() {
        return(
            <div>
                <div className="card card-body">
                    <div className="card-header bg-transparent">
                        <h3 className="card-title text-muted mb-0">
                            Search Asset
                        </h3>
                    </div>
                    <input type="text" name="custom-input" placeholder="Search..." value={this.state.search} onChange={this.searchChange}></input>
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
                                    {this.gauge(Math.round(this.state.assets[idx].soh * 10) / 10)}
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