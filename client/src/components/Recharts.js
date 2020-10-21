import React from 'react'
import { scaleTime, } from "d3-scale"
import { timeMinute } from 'd3-time'
import moment from 'moment'
import { CHART_AREA_CONFIG } from '../constants'
import { formatTime } from '../utils'
import {
    AreaChart, XAxis, YAxis,
    Tooltip, Area, Legend,
    ResponsiveContainer, ReferenceLine,
    ReferenceArea, Label
} from 'recharts'

const getTicks = (data) => {
    if (!data || !data.length) return []

    const startLoadTime = data[0].time
    const currentLoadTime = data[data.length - 1].time
    const scale = scaleTime().domain([startLoadTime, currentLoadTime])
    const ticks = scale.ticks(timeMinute.every(1));

    return [scale, ticks.map(entry => +entry)]
};

export default function Recharts(props) {
    const { loadAvgs, context: { recoveryZones, criticalZones } } = props
    const data = loadAvgs.map(({ time, loads }) =>
        ({
            time,
            load_1: +loads[0],
            load_5: +loads[1]
        })
    )

    const [scale, ticks] = getTicks(data)

    return (
        <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 20, right: 50, left: 20, bottom: 30 }}>
                <defs>
                    <filter id="colorLoad_1">
                        <feDropShadow dx="0.1" dy="0.1" stdDeviation="2"
                            floodColor="#34ace0" floodOpacity="0.7" />
                    </filter>
                    <filter id="colorLoad_5">
                        <feDropShadow dx="0.1" dy="0.1" stdDeviation="2"
                            floodColor="#706fd3" floodOpacity="0.7" />
                    </filter>
                </defs>
                <XAxis
                    type="number"
                    dataKey="time"
                    domain={scale}
                    ticks={ticks}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(t) => formatTime(t, 'HH:mm')}
                    scale='time'
                    tickMargin={10}
                />
                <YAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    minTickGap={1}
                    domain={[0, dataMax => (dataMax + 1).toFixed(2)]}
                >
                    <Label
                        angle={-90}
                        value='Load Average'
                        position='insideLeft'
                        style={{ textAnchor: 'middle' }}
                        dx={-5}
                    />
                </YAxis>
                <Tooltip labelFormatter={(label) => `Time: ${formatTime(label)}`} />
                <Legend wrapperStyle={{ top: 380 }} />
                <ReferenceLine y={1} label={{ position: 'right', value: 'Max' }} stroke="red" strokeDasharray="3 3" />
                {/* Wanted to separate out these components but Recharts renders only specific components; ignores others. */}
                {recoveryZones.map(({ end }) => (
                    <ReferenceLine
                        key={end}
                        x={end}
                        label={{ position: 'top', value: 'Recovered' }}
                        stroke="green"
                        strokeDasharray="3 3"
                    />
                ))}
                {criticalZones.map(({ start, end }) => {
                    return (
                        <ReferenceArea
                            key={end}
                            x1={Math.max(start, data[0].time)}
                            x2={end}
                            y1={2} y2={2.03}
                            fillOpacity={0.2}
                            stroke="red"
                            fill='red'
                            isFront
                            ifOverflow='extendDomain'
                        />
                    )
                })}
                {CHART_AREA_CONFIG.map((config) => (
                    <Area
                        key={config.name} type='monotone' fillOpacity={0.1}
                        strokeWidth={2} {...config}
                    />)
                )}
            </AreaChart>
        </ResponsiveContainer>
    );
}