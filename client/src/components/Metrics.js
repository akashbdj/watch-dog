import React from 'react'
import { last, formatTime } from '../utils'

export default function Metrics(props) {
    const { loadAvgs, context: { recoveryZones, criticalZones } } = props
    return (
        <div className='metrics'>
            <Overloaded criticalZones={criticalZones} />
            <CurrentLoadAvg {...last(loadAvgs)} />
            <Recovered recoveryZones={recoveryZones} />
        </div>
    )
}


function CurrentLoadAvg({ loads }) {
    return (
        <div className='metric current'>
            <h3>{(+loads[0]).toFixed(2)}</h3>
            <p>Current Load Avg.</p>
        </div>
    )
}

function Overloaded({ criticalZones }) {
    return <Metric data={criticalZones} className='overload' type='Overloaded' />
}

function Recovered({ recoveryZones }) {
    return <Metric data={recoveryZones} className='recover' type='Recovered' />
}

function Metric({ className, data, type }) {
    const count = data.length
    if (!count) return null

    return (
        <div className={`metric ${className}`}>
            <h3>{count}</h3>
            <p>{count > 1 ? 'times' : 'time'} {type} in last 10 mins</p>
            <ul>
                {data.map(({ start, end }, idx) => {
                    return <li key={type}>{formatTime(start)} - {formatTime(end)}</li>
                })}
            </ul>
        </div>
    )
}