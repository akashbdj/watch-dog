export const POLL_INTERVAL_IN_SEC = 10
export const WINDOW_SIZE_IN_MIN = 10
export const CAPACITY = ~~(WINDOW_SIZE_IN_MIN * 60) / POLL_INTERVAL_IN_SEC
export const HIGH_LOAD_THRESHOLD_MILLISEC = 2 * 60 * 1000
export const RECOVERY_THRESHOLD_MILLISEC = 2 * 60 * 1000
export const LOAD_ENDPOINT = 'http://localhost:3001'

export const ALERT_INFO = {
    critical: {
        className: 'critical',
        message: 'Alert! System is under heavy load'
    },
    recovered: {
        className: 'recovered',
        message: 'System has recovered!'
    }
}

export const CHART_AREA_CONFIG = [
    {
        name: 'Current Load Avg',
        dataKey: 'load_1',
        stroke: '#34ace0',
        fill: '#34ace0',
        filter: 'url(#colorLoad_1)'
    },
    {
        name: 'Load Avg in last 5 min',
        dataKey: 'load_5',
        stroke: '#706fd3',
        fill: '#706fd3',
        filter: 'url(#colorLoad_5)'
    },
]