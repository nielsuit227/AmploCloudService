import React, { PureComponent } from 'react';
import Button from 'react-bootstrap/Button';
import {
  Legend, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceArea,
} from 'recharts';
import dateFormat from 'dateformat';

const colors = [
    '#2369EC', 
    '#FFA62B', 
    '#236868',
    '#64606C',
    '#729CE9',
    '#ABA9B2',

];

class DataInterfacePlot extends PureComponent {
    constructor(props) {
        super(props);
        this.getAxisYDomain = this.getAxisYDomain.bind(this);
        this.registerLeft = this.registerLeft.bind(this);
        this.registerRight = this.registerRight.bind(this);
        this.zoom = this.zoom.bind(this);
        this.zoomOut = this.zoomOut.bind(this);
        this.state = {
            left: 'dataMin',
            right: 'dataMax',
            refAreaLeft: '',
            refAreaRight: '',
            indLeft: null,
            indRight: null,
            top: 'dataMax+1',
            bottom: 'dataMin-1',
            animation: true,
            colors: colors
        };
    }
    getAxisYDomain(offset) {
        const ind1 = Math.min(this.state.indLeft, this.state.indRight);
        const ind2 = Math.max(this.state.indLeft, this.state.indRight);
        const refData = this.props.data.slice(ind1- 1, ind2);
        let [bottom, top] = [refData[0][this.props.cols[0]], refData[0][this.props.cols[0]]];
        this.props.cols.forEach((col) => {
            refData.forEach((d) => {
                if (d[col] > top) {
                    top = d[col];
                };
                if (d[col] < bottom) {
                    bottom = d[col];
                };
            })
        });
        return [bottom - offset, top + offset];
      };
    zoom() {
        if (this.state.refAreaLeft === this.state.refAreaRight || this.state.refAreaRight === '') {
            this.setState({
                refAreaLeft: '',
                refAreaRight: '',
            });
        return;
        }
        // yAxis domain -- update for multiaxis
        const [bottom, top] = this.getAxisYDomain(1);
        // State
        this.setState({
            refAreaLeft: '',
            refAreaRight: '',
            left: this.state.refAreaLeft,
            right: this.state.refAreaRight,
            bottom: bottom,
            top: top,
        });
    }
    zoomOut() {
        this.setState({
            refAreaLeft: '',
            refAreaRight: '',
            left: 'dataMin',
            right: 'dataMax+1',
            top: 'dataMax+1',
            bottom: 'dataMin-1',
        });
    }
    tickFormat(tick) {
        if (tick === Infinity || tick === -Infinity){
            return '-'
        } else {
            let date = new Date(tick * 1000);
            return dateFormat(date, 'ddd d mmm yyyy, HH:MM');
        }
    }
    registerLeft(e) {
        let ind = this.props.data.findIndex((item) => item.xaxis === e.activeLabel);
        this.setState({
            indLeft: ind,
            refAreaLeft: e.activeLabel,
        });
    }
    registerRight(e) {
        if (this.state.refAreaLeft !== '') {
            let ind = this.props.data.findIndex((item) => item.xaxis === e.activeLabel);
            this.setState({
                indRight: ind,
                refAreaRight: e.activeLabel,
            });
        }
    }

    render() {
        return (
            <div className="highlight-bar-charts" style={{ userSelect: 'none' }}>
                <Button variant='outline-primary' onClick={this.zoomOut}>
                    Zoom Out
                </Button>
                <LineChart
                    width={1000}
                    height={600}
                    data={this.props.data}
                    onMouseDown={this.registerLeft}
                    onMouseMove={this.registerRight}
                    onMouseUp={this.zoom}
                >
                <CartesianGrid 
                    // horizontalCoordinatesGenerator={this.horizontalCoordinatesGenerator}
                />
                <XAxis
                    allowDataOverflow
                    dataKey="xaxis"
                    domain={[this.state.left, this.state.right]}
                    type="number"
                    tickFormatter={this.tickFormat}
                />
                <YAxis
                    allowDataOverflow
                    domain={[this.state.bottom, this.state.top]}
                    type="number"
                    yAxisId="1"
                />
                <Tooltip />
                <Legend verticalAlign={'bottom'} height={50}/>
                {
                    this.props.cols.map((col, i) => {
                        return(
                            <Line 
                                yAxisId="1" 
                                type="monotone" 
                                dataKey={col} 
                                stroke={this.state.colors[i]} 
                                strokeWidth={3}
                                animationDuration={1000} 
                                key={i}/>
                        )
                    })
                }
                {
                    (this.state.refAreaLeft && this.state.refAreaRight) ? (
                    <ReferenceArea yAxisId="1" x1={this.state.refAreaLeft} x2={this.state.refAreaRight} strokeOpacity={0.3} />) : null
                }
            </LineChart>
        </div>
        );
    }
}
class CustomTick extends PureComponent {
    render() {
        const {x, y, payload} = this.props;
        if (payload.value === Infinity || payload.value === -Infinity){
            payload.value = '-';
        } else {
            let date = new Date(payload.value * 1000);
            payload.value = dateFormat(date, 'ddd d mmm HH:MM');
        }
        return (
            <g transform={`translate(${x},${y})`}>
                <text className="recharts-text" x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">{payload.value}</text>
          </g>
        )
    }
}
class PredictionPlot extends PureComponent {
    constructor(props) {
        super(props);
        this.getAxisYDomain = this.getAxisYDomain.bind(this);
        this.registerLeft = this.registerLeft.bind(this);
        this.registerRight = this.registerRight.bind(this);
        this.xTicks = this.xTicks.bind(this);
        this.yTicks = this.yTicks.bind(this);
        this.zoom = this.zoom.bind(this);
        this.zoomOut = this.zoomOut.bind(this);
        this.state = {
            left: 'dataMin',
            right: 'dataMax',
            refAreaLeft: '',
            refAreaRight: '',
            indLeft: null,
            indRight: null,
            top: ['dataMax+1', 1, 1],
            bottom: ['dataMin-1', 0, 0],
            animation: true,
            colors: colors
        };
    }
    getAxisYDomain(offset) {
        // Select interval
        const ind1 = Math.min(this.state.indLeft, this.state.indRight);
        const ind2 = Math.max(this.state.indLeft, this.state.indRight);
        const refData = this.props.data.slice(ind1- 1, ind2);
        // Calc max & min
        let [bottom, top] = [[], []];
        this.props.cols.forEach((col, i) => {
            bottom.push(refData[0][this.props.cols[i]]);
            top.push(refData[0][this.props.cols[i]]);
            refData.forEach((d) => {
                if (d[col] > top[i]) {
                    top[i] = d[col];
                };
                if (d[col] < bottom[i]) {
                    bottom[i] = d[col];
                };
            })
            bottom[i] = (bottom[i]) * 0.9 - offset;
            top[i] = (top[i]) * 1.1 + offset
        });
        this.setState({
            bottom: bottom,
            top: top,
        })
      };
    zoom() {
        if (this.state.refAreaLeft === this.state.refAreaRight || this.state.refAreaRight === '') {
            this.setState({
                refAreaLeft: '',
                refAreaRight: '',
            });
        return;
        }
        // yAxis domain -- update for multiaxis
        this.getAxisYDomain(0.1);
        // State
        this.setState({
            refAreaLeft: '',
            refAreaRight: '',
            left: this.state.refAreaLeft,
            right: this.state.refAreaRight,
        });
    }
    zoomOut() {
        this.setState({
            refAreaLeft: '',
            refAreaRight: '',
            left: 'dataMin',
            right: 'dataMax+1',
            top: ['dataMax+1', 1, 1],
            bottom: ['dataMin-1', 0, 0],
        });
    }
    xTicks() {
        if (typeof(this.props.data) !== 'undefined'){
            let samples = this.props.data.length;
            const tickCount = 5;
            const step = samples / tickCount | 0;
            let ind = [];
            for (var i=0; i<tickCount; i++) {
                ind.push(this.props.data[step * (i+1)].xaxis);
            }     
            return ind;
        } else {
            return [0]
        }
    }
    yTicks(col) {
        return [0.25, 0.5, 0.75, 1]
    }
    tickFormat(tick) {
        if (tick === Infinity || tick === -Infinity){
            return '-'
        } else {
            let date = new Date(tick * 1000);
            return dateFormat(date, 'ddd d mmm,\n HH:MM');
        }
    }
    registerLeft(e) {
        let ind = this.props.data.findIndex((item) => item.xaxis === e.activeLabel);
        this.setState({
            indLeft: ind,
            refAreaLeft: e.activeLabel,
        });
    }
    registerRight(e) {
        if (this.state.refAreaLeft !== '') {
            let ind = this.props.data.findIndex((item) => item.xaxis === e.activeLabel);
            this.setState({
                indRight: ind,
                refAreaRight: e.activeLabel,
            });
        }
    }
    horizontalCoordinatesGenerator(ev) {
    }
    lineChart(idx) {
        return(
            <div className="col-xl-4" key={idx + 'a'}>
                <div className='card shadow' key={idx + 'b'}>
                    <div className="card-header bg-transparent" key={idx + 'c'}>
                        <div className="row mb-0">
                            <h4 className="mr-4" key={idx + 'd'}>
                                {this.props.titles[idx]}
                            </h4>
                            <Button variant='outline-primary' size='sm' onClick={this.zoomOut} key={idx + 'f'}>
                                Zoom Out
                            </Button>
                        </div>
                    </div>
                    <div className="card-body" key={idx + 'e'}>
                        <LineChart
                            width={300}
                            height={300}
                            margin={{bottom:75}}
                            data={this.props.data}
                            onMouseDown={this.registerLeft}
                            onMouseMove={this.registerRight}
                            onMouseUp={this.zoom}
                            key={idx + 'g'}
                        >
                            <CartesianGrid/>
                            <XAxis
                                allowDataOverflow
                                dataKey='xaxis'
                                domain={[this.state.left, this.state.right]}
                                type='number'
                                ticks={this.xTicks()}
                                tick={<CustomTick />}
                                key={idx + 'h'}
                            />
                            <YAxis
                                allowDataOverflow
                                domain={[this.state.bottom[idx], this.state.top[idx]]}
                                type="number"
                                yAxisId={idx}
                                // ticks={this.yTicks(this.props.cols[idx])}
                                key={idx + 'i'}
                            />
                            <Tooltip key={idx + 'j'}
                                labelFormatter={this.tickFormat}
                            />
                            <Line
                                yAxisId={idx}
                                type="monotone" 
                                dataKey={this.props.cols[idx]} 
                                stroke={this.state.colors[0]} 
                                strokeWidth={3}
                                animationDuration={1000} 
                                key={idx + 'l'}/>
                                {
                                    (this.state.refAreaLeft && this.state.refAreaRight) ? (<ReferenceArea x1={this.state.refAreaLeft} x2={this.state.refAreaRight} strokeOpacity={0.3} yAxisId={idx} key={idx + 'm'}/>) : null
                                }
                        </LineChart>
                    </div>
                </div>
            </div>

        )
    }

    render() {
        return (
            <div className="row">
                {
                    this.props.titles.map((t, i)=>{
                        return(
                            this.lineChart(i)
                        )
                    })
                }                
            </div>
        );
    }
}

export { DataInterfacePlot, PredictionPlot };