import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import CssBaseline from '@material-ui/core/CssBaseline';
import Layout from '../components/Layout';
import Chart from 'chart.js';
import axios from 'axios';
import * as settings from '../Settings';
import getCookie from '../components/getCookie';


class Cards extends React.Component {
    constructor(props) {
        super(props);
        this.card = this.card.bind(this);
        this.state = {
            cardValues: Array(8).fill(0),
            cardDerivatives: Array(8).fill(0),
            icons: [
                "fas fa-window-close",
                "fas fa-chart-line",
                "fas fa-wrench",
                "fas fa-search",
                "fas fa-dollar-sign",
                "fas fa-redo",
                "fas fa-exclamation-triangle",
                "fas fa-arrows-alt-h",
            ],
            iconColors: [
                "icon icon-shape amploblue text-white rounded-circle shadow",
                "icon icon-shape amplolightblue text-white rounded-circle shadow",
                "icon icon-shape amploorange text-white rounded-circle shadow",
                "icon icon-shape amplogreen text-white rounded-circle shadow",
                "icon icon-shape amploblue text-white rounded-circle shadow",
                "icon icon-shape amplolightblue text-white rounded-circle shadow",
                "icon icon-shape amploorange text-white rounded-circle shadow",
                "icon icon-shape amplogreen text-white rounded-circle shadow",
            ],
            iconOverlays: [
                'Total occured issues happened in the last 31 days.',
                'Percentage of issues which were predicted.',
                'Mean Time To Repair: Average time between knowing what fault happened and fixing it.',
                'Mean Time To Diagnose: Average time between the creation of the ticket and knowing what fault happened.',
                'Maintance Cost / Asset Value: Ratio of maintenance price to component new price.',
                'Percentage of issues which happen again after service.',
                'Current open issues.',
                'Mean Time Between Failure: Average time between two new tickets.',
            ],
            titles: [
                'Issues',
                'Predicted',
                'MTTR',
                'MTTD',
                'MCAV', 
                'Rework Rate', 
                'Open Issues', 
                'MTBF',
            ],
            arrows: {
                true: ['fas fa-arrow-up', 'fas fa-arrow-up', 'fas fa-arrow-up', 'fas fa-arrow-up', 'fas fa-arrow-up', 'fas fa-arrow-up', ' ', 'fas fa-arrow-up'],
                false: ['fas fa-arrow-down', 'fas fa-arrow-down', 'fas fa-arrow-down', 'fas fa-arrow-down', 'fas fa-arrow-down', 'fas fa-arrow-down', ' ', 'fas fa-arrow-down'],
            },
            textColor: {
                true: ['text-danger mr-2', 'text-success mr-2', 'text-danger mr-2', 'text-danger mr-2',
                       'text-danger mr-2', 'text-danger mr-2', 'text-danger mr-2', 'text-success mr-2'],
                false: ['text-success mr-2', 'text-danger mr-2', 'text-success mr-2', 'text-success mr-2', 
                        'text-success mr-2', 'text-success mr-2', 'text-success mr-2', 'text-danger mr-2'],
            },
            percentage: ['  %', ' %', ' %', ' %', ' %', ' %', '', ' %'],
            bigPercentage: ['', ' %', '', '', ' %', ' %', '', ''],
        }
    }
    componentDidMount() {
        const token = localStorage.getItem('token');
        axios.post(
            `${settings.API_SERVER}/api/dashboardCards/`, 
            {}, 
            {headers: {
                'Authorization': `Token ${token}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(data => {
            this.setState({
                cardValues: data.data.val || Array(8).fill(0),
                cardDerivatives: data.data.der || Array(8).fill(0),
            });

        })
        .catch(err => {console.log(err)});
    }

    // UI 
    card(idx) {
        return(
            <div className="col-xl-3 col-lg-6" key={idx+'a'}>
                <div className="card card-stats my-4" key={idx+'b'}>
                    <div className="card-body" key={idx+'c'}>
                        <div className="row" key={idx+'d'}>
                            <div className="col" key={idx+'e'}>
                                <h2 className="card-title text-muted">{this.state.titles[idx]}</h2>
                                <span className="h4 font-weight-bold mb-0">{this.state.cardValues[idx] + this.state.bigPercentage[idx]}</span>
                            </div>
                            <OverlayTrigger overlay={
                                <Tooltip id="tooltip-disabbled" key={idx+'f'}>
                                    {this.state.iconOverlays[idx]}
                                </Tooltip>}>
                                <div className="col-auto" key={idx+'g'}>
                                    <div className={this.state.iconColors[idx]} key={idx+'h'}>
                                        <i className={this.state.icons[idx]}></i>
                                    </div>
                                </div>
                            </OverlayTrigger>
                        </div>
                        <p className="mt-3 mb-0 text-muted text-lg" key={idx+'i'}>
                            <span className={this.state.textColor[this.state.cardDerivatives[idx] >= 0][idx]}><i className={this.state.arrows[this.state.cardDerivatives[idx] >= 0][idx]}></i> {this.state.cardDerivatives[idx]} {this.state.percentage[idx]}</span>
                            <span className="text-nowrap" key={idx+'j'}> from last month</span>
                        </p>
                    </div>
                </div>
            </div>  
        )
    }

    render() {
        return(
            <div>
                <div className="row">
                    {
                        this.state.cardValues.map((item, idx) => {
                            return(this.card(idx));
                        })
                    }
                </div>
            </div>
        )
    }
}
class Graphs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            technicians: [],
            issues: [],
        }
    }
    componentDidMount() {
        const token = localStorage.getItem('token');
        axios.post(
            `${settings.API_SERVER}/api/dashboardGraphs/`, 
            {}, 
            {headers: {
                'Authorization': `Token ${token}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        )
        .then(data => {
            this.setState({
                technicians: data.data.technicians,
                issues: data.data.issues,
            });
        })
        .catch(err => {console.log(err)});
    }

    render() {
        return(
            <div className="row">
                <div className="col-xl-4">
                <div className="card shadow">
                    <div className="card-header bg-transparent">
                    <div className="row align-items-center">
                        <div className="col">
                        <h2 className="mb-0">Common Issues</h2>
                        <h4 className="mb-0">Last month</h4>
                        </div>
                    </div>
                    </div>
                    <div className="card-body">
                        <DonutChart 
                            id="issues"
                            data={this.state.issues} 
                            colors={["#2369EB", "#729CE9", "#ABA9B2", "#64606C", "#FFA62B", "#236868"]}></DonutChart>
                    </div>
                </div>
                </div>
                <div className="col-xl-4">
                <div className="card shadow">
                    <div className="card-header bg-transparent">
                        <div className="row align-items-center">
                            <div className="col">
                                <h2 className="mb-0">Active Technicians</h2>
                                <h4 className="mb-0">Last month</h4>
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <DonutChart
                            id="technicians"
                            data={this.state.technicians} 
                            colors={["#2369EB", "#729CE9", "#ABA9B2", "#64606C", "#FFA62B", "#236868"]}> </DonutChart>
                        </div>
                </div>
            </div>
        </div>
        )
    }
}
class DonutChart extends React.Component {
    constructor(props) {
        super(props);
        this.chartRef = React.createRef();
    }
    componentDidMount() {
        this.myChart = new Chart(this.chartRef.current, {
            type: 'doughnut',
            data: {
                labels: this.props.data.map(d => d.name),
                datasets: [{
                    data: this.props.data.map(d => d.value),
                    backgroundColor:this.props.colors
                }]
            }, 
            options: {
                legend: {
                    position: 'bottom',
                    labels: {
                        fontSize: 18,
                    },
                },
                tooltips: {
                    bodyFontSize: 18,
                },
                aspectRatio: 1.1,
            }
        })
    }
    componentDidUpdate() {
        this.myChart.data.labels = this.props.data.map(d => d.name);
        this.myChart.data.datasets[0].data = this.props.data.map(d => d.value);
        this.myChart.update();
    }
    render() {
        return(
            <canvas ref={this.chartRef} />
        )
    }
}
class Dashboard extends React.Component {
    render() {
        return (
            <Layout {...this.props}>
                <React.Fragment>
                    <CssBaseline />
                    <Cards />
                    <Graphs />
                </React.Fragment>
            </Layout>
        )
    }
}

export default Dashboard