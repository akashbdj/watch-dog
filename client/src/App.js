import React, { Component } from 'react'
import Recharts from './components/Recharts'
import StateMachine from "./stateMachine"
import Alert from './components/Alert'
import Metrics from './components/Metrics'
import './App.css'
import {
    isEmpty,
    getInitialLoads,
    storeInLocalStorage,
    getFromLocalStorage
} from './utils'
import {
    LS_KEY,
    CAPACITY,
    ALERT_INFO,
    LOAD_ENDPOINT,
    POLL_INTERVAL_IN_SEC,
} from './constants'

export default class App extends Component {
    constructor(props) {
        super(props)

        const storedState = Object.assign({}, getFromLocalStorage(LS_KEY))
        this.machine = new StateMachine(storedState)
        this.timerId = null
        this.state = !isEmpty(storedState)
            ? storedState
            : {
                showAlert: false,
                alertType: null,
                context: this.machine.getContext(),
                loadAvgs: getInitialLoads(CAPACITY)
            }

        this.handleAlertCloseClick = this.handleAlertCloseClick.bind(this)
    }

    getNewState(prevState, data) {
        let { loadAvgs, showAlert, alertType } = prevState
        const currentLoad = data.loads[0]
        const currentLoadTime = data.time

        const action = currentLoad > 1 ? 'HIGH' : 'LOW'
        const payload = {
            curTime: currentLoadTime,
            onRecovery: () => { showAlert = true; alertType = 'recovered' },
            onCritical: () => { showAlert = true; alertType = 'critical' }
        }

        const context = this.machine.dispatch(action, payload).getContext()
        let newLoadAvgs = [...prevState.loadAvgs, data]
        newLoadAvgs = newLoadAvgs.length > CAPACITY ? newLoadAvgs.slice(1) : newLoadAvgs

        return {
            showAlert,
            alertType,
            loadAvgs: newLoadAvgs,
            machineState: this.machine.getState(),
            context: {
                ...context,
                ...(this.machine.getFilteredZones(newLoadAvgs[0].time)), // newLoadAvgs[0].time is current window start time
            }
        }
    }

    handleFetchLoadSuccess(data) {
        this.setState((prevState) => this.getNewState(prevState, data), () => {
            storeInLocalStorage(LS_KEY, this.state)
        })
    }

    handleFetchLoadError(e) {
        console.log("Error in fetching load from the server: ", e)
        this.setState({ showAlert: true, alertType: 'fetchError' })
    }

    fetchLoadAvg() {
        fetch(LOAD_ENDPOINT)
            .then((res) => res.json())
            .then((data) => this.handleFetchLoadSuccess(data))
            .catch((e) => this.handleFetchLoadError(e))
    }

    getAlertData() {
        return ALERT_INFO[this.state.alertType] || {}
    }

    handleAlertCloseClick() {
        this.setState({ showAlert: false, alertType: null })
    }

    render() {
        return (
            <div className="App">
                {this.state.showAlert && <Alert {...this.getAlertData()} onCloseClick={this.handleAlertCloseClick} />}
                <div className="container">
                    <Recharts {...this.state} />
                    <Metrics {...this.state} />
                </div>
            </div>
        )
    }

    componentDidMount() {
        this.fetchLoadAvg() // fetch immediately for the 1st time
        this.timerId = setInterval(() => this.fetchLoadAvg(), POLL_INTERVAL_IN_SEC * 1000)
    }

    componentWillUnmount() {
        this.timerId = null
        clearInterval(this.timerId)
    }
}