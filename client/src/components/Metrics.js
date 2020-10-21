import React from 'react'
import { last, formatTime } from '../utils'
import moment from 'moment'


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
    const count = criticalZones.length
    if (!count) return null

    return (
        <div className='metric overload'>
            <h3>{count}</h3>
            <p>{count > 1 ? 'times' : 'time'} Overloaded in last 10 mins</p>
            <ul>
                {criticalZones.map(({ start, end }, idx) => {
                    return <li>{formatTime(start)} - {formatTime(end)}</li>
                })}
            </ul>
        </div>
    )
}

function Recovered({ recoveryZones }) {
    const count = recoveryZones.length
    if (!count) return null

    return (
        <div className='metric recover'>
            <h3>{count}</h3>
            <p>{count > 1 ? 'times' : 'time'} Recovered in last 10 mins</p>
            <ul>
                {recoveryZones.map(({ start, end }, idx) => {
                    return <li>{formatTime(start)} - {formatTime(end)}</li>
                })}
            </ul>
        </div>
    )
}