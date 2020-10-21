import { last } from './utils'
import {
    HIGH_LOAD_THRESHOLD_MILLISEC,
    RECOVERY_THRESHOLD_MILLISEC
} from './constants'

export const STATES = {
    NORMAL: 'NORMAL',
    CRITICAL: 'CRITICAL',
    RECOVERING: 'RECOVERING'
}


export default class StateMachine {
    constructor() {
        this.context = {
            highLoadStartTime: null,
            recoveryStartTime: null,
            recoveryZones: [],
            criticalZones: []
        }
        this.machine = {
            currentState: STATES.NORMAL,
            states: {
                NORMAL: {
                    LOW: ({ curTime }) => {
                        this.context = { ...this.context, highLoadStartTime: null }
                    },
                    HIGH: ({ curTime, onCritical }) => {
                        if (!this.context.highLoadStartTime) {
                            this.context = { ...this.context, highLoadStartTime: curTime }
                        }

                        if (curTime - this.context.highLoadStartTime >= HIGH_LOAD_THRESHOLD_MILLISEC) {
                            this.machine.currentState = STATES.CRITICAL
                            this.addToCriticalZones(this.context.highLoadStartTime, curTime)

                            // Let listeners know that the system is in critical state.
                            // We can optionally pass the timestamp at which it becomes critical
                            if (typeof onCritical === 'function') {
                                onCritical()
                            }
                        }
                    },
                },
                CRITICAL: {
                    LOW: ({ curTime }) => {
                        this.context = { ...this.context, recoveryStartTime: curTime }
                        this.machine.currentState = STATES.RECOVERING
                    },
                    HIGH: ({ curTime, onCritical }) => {
                        const { highLoadStartTime, criticalZones } = this.context
                        if (curTime - highLoadStartTime < HIGH_LOAD_THRESHOLD_MILLISEC) {
                            return
                        }

                        if (last(criticalZones).start === highLoadStartTime) {
                            this.updateLastCriticalZone(highLoadStartTime, curTime)
                            return
                        }

                        this.addToCriticalZones(highLoadStartTime, curTime)

                        // It has again reached 2mins threshold of being at high load
                        // let listeners know about it. Optionally you can choose to pass
                        // the time.
                        if (typeof onCritical === 'function') {
                            onCritical()
                        }
                    },
                },
                RECOVERING: {
                    LOW: ({ curTime, onRecovery }) => {
                        const { recoveryStartTime, recoveryZones } = this.context
                        if (curTime - recoveryStartTime >= RECOVERY_THRESHOLD_MILLISEC) {
                            this.context = {
                                ...this.context,
                                highLoadStartTime: null,
                                recoveryZones: [...recoveryZones, { start: recoveryStartTime, end: curTime }],
                                recoveryStartTime: null,
                            }
                            this.machine.currentState = STATES.NORMAL

                            // Let listeners know that the system has recovered.
                            // We can optionally pass the timestamp at which it recovered
                            if (typeof onRecovery === 'function') {
                                onRecovery()
                            }
                        }
                    },
                    HIGH: ({ curTime }) => {
                        this.context = {
                            ...this.context,
                            recoveryStartTime: null,
                            highLoadStartTime: curTime
                        }

                        this.machine.currentState = STATES.CRITICAL
                    },
                }
            }
        }
    }

    dispatch(ACTION, payload) {
        const { currentState, states } = this.machine
        if (typeof states[currentState][ACTION] === 'function') {
            states[currentState][ACTION].call(this, payload)
        }

        return this
    }

    getContext() {
        return this.context
    }

    getState() {
        return this.machine.currentState
    }

    addToCriticalZones(start, end) {
        this.context.criticalZones = [...this.context.criticalZones, { start, end }]
    }

    // update the ongoing critical zone(which has not yet fallen below 1).
    // update its end time with curTime
    updateLastCriticalZone(start, end) {
        // remove the last critical zone
        // then add it back with updated end time
        this.context.criticalZones = this.context.criticalZones.slice(0, -1)
        this.addToCriticalZones(start, end)
    }

    // it removes all the critical and recovery zones which are no longer 
    // present in our current 10 mins moving window.
    // Since we are maintain only 10 mins window, we'll get rid of things
    // we don't need.
    //
    // we can split critical and recovery zones filtering into separate functions
    // but for now let's keep it simple unless we need to extend it.
    getFilteredZones(windowStartTime) {
        const fcz = this.context.criticalZones = this.context.criticalZones.filter(({ end }) => end > windowStartTime)
        const frz = this.context.recoveryZones = this.context.recoveryZones.filter(({ end }) => end > windowStartTime)
        return { criticalZones: fcz, recoveryZones: frz }
    }
}
