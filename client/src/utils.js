import moment from 'moment'

export const getInitialLoads = (capacity) => {
    if (!capacity) return []
    return [...Array(capacity)].map((_, i) => {
        const d = (new Date().getTime() - 10 * 60 * 1000) + (i * 10000)
        return { time: d, loads: [0, 0, 0] }
    })
}

export const last = (a) => {
    if (!a || !a.length) return
    return a.length && a[a.length - 1]
}

export const formatTime = (t, format = 'HH:mm:ss') => {
    if (!t) return ''
    return moment(t).format(format)
}