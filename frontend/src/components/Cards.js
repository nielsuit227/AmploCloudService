import React from 'react';
import { gauge } from './Figures';


export var GaugeCard = function(title, unit, value, interval) {
    return(
        <div className='card'>
            <div className='card-header'>
                <h5>{title}</h5>
            </div>
            <div className='card-body'>
                {gauge(value, interval[0], interval[1], unit)}
            </div>
        </div>
    )
}