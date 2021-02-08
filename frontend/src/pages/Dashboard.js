import React from 'react';
import Layout from '../components/Layout';
import {GaugeCard} from '../components/Cards';
import { FaExclamationTriangle } from 'react-icons/fa';


class Dashboard extends React.Component {
    insulationCard() {
        return(
            <div className='card'>
                <div className='card-header'>
                    <h5>Insulation Issues</h5>
                </div>
                <div className='card-body'>
                    <div className='row'>
                        <FaExclamationTriangle color='#ffa62b' size='4em' className='mx-5'/>
                        <h2 className='mt-3'>4</h2>
                        <h6 className='mt-4 ml-5'>in the last 7 days</h6>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        return (
            <Layout {...this.props}>
                <React.Fragment>
                    <div className='row'>
                        <div className='col-xl-4'>
                            {GaugeCard('Daily Yield', 'kWh', 60, [0, 80])}
                        </div>
                        <div className='col-xl-4'>
                            {GaugeCard('Current Power', 'kW', 22.5, [0, 25])}
                        </div>
                        <div className='col-xl-4'>
                            {GaugeCard('Nominal Power', '%', 97, [0, 100])}
                        </div>
                    </div>
                    <div className='row mt-4'>
                        <div className='col-xl-4'>
                            {this.insulationCard()}
                        </div>
                    </div>
                </React.Fragment>
            </Layout>
        )
    }
}

export default Dashboard