import StateMachine, { STATES } from '../stateMachine'

test('default state', () => {
    const sm = new StateMachine()
    expect(sm.getState()).toBe(STATES.NORMAL);
});

test('NORMAL to CRITICAL', () => {
    const curTime = Date.now()
    const sm = new StateMachine()

    // Set highLoadStartTime 
    sm.dispatch('HIGH', { curTime })
    expect(sm.context.highLoadStartTime).toBe(curTime);
    expect(sm.getState()).toBe(STATES.NORMAL)

    // Ensure highLoadStartTime is not overwritten
    sm.dispatch('HIGH', { curTime: Date.now() })
    expect(sm.context.highLoadStartTime).toBe(curTime);
    expect(sm.getState()).toBe(STATES.NORMAL)


    // Set transition from normal to critical when 2 mins has passed
    const criticalStartTime = curTime + 2 * 60 * 1000
    sm.dispatch('HIGH', { curTime: criticalStartTime, onCritical: () => { } })
    expect(sm.context.highLoadStartTime).toBe(curTime);
    expect(sm.getState()).toBe(STATES.CRITICAL)
    expect(sm.context.criticalZones).toEqual([{ start: curTime, end: criticalStartTime }])
});


test('NORMAL receives High(>1) loads, but receives Low(<1) load before 2mins, state remains at NORMAL', () => {
    const curTime = Date.now()
    const sm = new StateMachine()

    // Set highLoadStartTime 
    sm.dispatch('HIGH', { curTime })
    expect(sm.context.highLoadStartTime).toBe(curTime);
    expect(sm.getState()).toBe(STATES.NORMAL)

    // Ensure highLoadStartTime is not overwritten
    sm.dispatch('HIGH', { curTime: curTime + 30 * 1000 })
    expect(sm.context.highLoadStartTime).toBe(curTime);
    expect(sm.getState()).toBe(STATES.NORMAL)


    // Validate transition from normal to critical when only 1 minute has passed
    // It should stay at NORMAL
    sm.dispatch('LOW', { curTime: curTime + 60 * 1000 })
    expect(sm.context.highLoadStartTime).toBe(null)
    expect(sm.getState()).toBe(STATES.NORMAL)
    expect(sm.context.criticalZones).toEqual([])
});


test('CRITICAL receives Low(<1) load immediately, state transitions to RECOVERING', () => {
    const { sm, highLoadStartTime, criticalStartTime } = setupStateMachine(STATES.CRITICAL)
    const now = Date.now()

    sm.dispatch('LOW', { curTime: now })
    expect(sm.context.recoveryStartTime).toBe(now)
    expect(sm.getState()).toBe(STATES.RECOVERING)
    expect(sm.context.criticalZones).toEqual([{ start: highLoadStartTime, end: criticalStartTime }])
});



test('CRITICAL continues be High(>1) a couple of times, state remains at CRITICAL', () => {
    const { sm, highLoadStartTime, criticalStartTime } = setupStateMachine(STATES.CRITICAL)

    // continues to be high
    sm.dispatch('HIGH', { curTime: criticalStartTime + 10 * 1000 }) // after 10 sec
    sm.dispatch('HIGH', { curTime: criticalStartTime + 40 * 1000 }) // after 40 sec

    // still continues to be high
    const time = criticalStartTime + 60 * 1000 // after 1 min
    sm.dispatch('HIGH', { curTime: time })

    expect(sm.context.criticalZones).toEqual([{ start: highLoadStartTime, end: time }])
    expect(sm.getState()).toBe(STATES.CRITICAL)
});


test('RECOVERING machine receives High(>1) load, state transitions to CRITICAL again', () => {
    const { sm, recoveryStartTime } = setupStateMachine(STATES.RECOVERING)

    // receives a high load again after 20 secs
    const newHighLoadStartTime = recoveryStartTime + 20 * 1000
    sm.dispatch('HIGH', { curTime: newHighLoadStartTime })

    // still receives high but 2 mins has not passed.
    sm.dispatch('HIGH', { curTime: newHighLoadStartTime + 50 * 1000 })
    expect(sm.getState()).toBe(STATES.CRITICAL)
    expect(sm.context.recoveryStartTime).toBe(null)
    expect(sm.context.highLoadStartTime).toBe(newHighLoadStartTime)


    // Assume the machine continues to receive High for 2 mins
    // Since we came back from RECOVERING to CRITICAL, and 2 mins has also passed
    // this is a valid critical zone we need to record so 
    // we add this info to criticalZones.
    //
    // but because below 'HIGH' action will add a new criticalZone
    // we need to record oldCriticalZones to in order to test: 
    // oldCriticalZone + newly added === sm.context.criticalZones
    const oldCriticalZones = sm.context.criticalZones
    const newCriticalStartTime = newHighLoadStartTime + 2 * 60 * 1000
    sm.dispatch('HIGH', { curTime: newCriticalStartTime, onCritical: () => { } })
    expect(sm.context.criticalZones).toEqual([...oldCriticalZones, { start: newHighLoadStartTime, end: newCriticalStartTime }])
});


test('RECOVERING machine receives Low(<1) loads for 2mins, state transitions to NORMAL again', () => {
    const { sm, recoveryStartTime } = setupStateMachine(STATES.RECOVERING)

    // continues to receive low loads for 2 mins
    sm.dispatch('LOW', { curTime: recoveryStartTime + 20 * 1000 })
    sm.dispatch('LOW', { curTime: recoveryStartTime + 50 * 1000 })
    sm.dispatch('LOW', { curTime: recoveryStartTime + 90 * 1000 })

    const recoveredTime = recoveryStartTime + 2 * 60 * 1000
    sm.dispatch('LOW', { curTime: recoveredTime, onRecovery: () => { } }) // recovered

    expect(sm.context.recoveryStartTime).toBe(null)
    expect(sm.context.highLoadStartTime).toBe(null)
    expect(sm.getState()).toBe(STATES.NORMAL)
    expect(sm.context.recoveryZones).toEqual([{ start: recoveryStartTime, end: recoveredTime }])
});



test('Remove criticalZones which are outside of current 10mins window', () => {
    const { sm, highLoadStartTime, windowStartTime, criticalStartTime } = setupStateMachine(STATES.CRITICAL)

    // crticalZone should be present in this window
    expect(sm.context.criticalZones).toEqual([{ start: highLoadStartTime, end: criticalStartTime }]) // it shou

    // we moved to next window so that any criticalZones we found in this window
    // shouldn't be present in next window
    const nextWindowStartTime = windowStartTime + 10 * 60 * 1000
    sm.getFilteredZones(nextWindowStartTime)

    // crticalZone should be removed in next window
    expect(sm.context.criticalZones).toEqual([])
});


test('Remove recoveryZones which are outside of current 10mins window', () => {
    const { sm, windowStartTime, recoveryStartTime } = setupStateMachine(STATES.RECOVERING)

    const recoveredTime = recoveryStartTime + 2 * 60 * 1000
    sm.dispatch('LOW', { curTime: recoveredTime }) // recovered

    // at this point we expect recoveryZones to contain to recovery we just had.
    expect(sm.context.recoveryZones).toEqual([{ start: recoveryStartTime, end: recoveredTime }])


    // Now we move out window to next window by adding 10 mins to it
    // Any recoveryZones we found in this window shouldn't be present in next window
    const nextWindowStartTime = windowStartTime + 10 * 60 * 1000
    sm.getFilteredZones(nextWindowStartTime)

    // recoveryZones should be removed in next window
    expect(sm.context.recoveryZones).toEqual([])
});

test("context", () => {
    const { sm, highLoadStartTime, criticalStartTime } = setupStateMachine(STATES.CRITICAL)
    expect(sm.getContext()).toEqual({
        highLoadStartTime,
        recoveryStartTime: null,
        criticalZones: [{ start: highLoadStartTime, end: criticalStartTime }],
        recoveryZones: []
    })
})

test("Unrecognized ACTION", () => {
    const { sm, highLoadStartTime, criticalStartTime } = setupStateMachine(STATES.CRITICAL)

    // YOLO is an unrecognized action
    // this should not execute anything and state should remain intact
    sm.dispatch("YOLO")

    expect(sm.getContext()).toEqual({
        highLoadStartTime,
        recoveryStartTime: null,
        criticalZones: [{ start: highLoadStartTime, end: criticalStartTime }],
        recoveryZones: []
    })
})


function setupStateMachine(transitionTo) {
    const windowStartTime = Date.now() - 5 * 60 * 1000 // start time of our currently visible moving window
    const highLoadStartTime = Date.now() // first time when load jumps above 1
    const criticalStartTime = highLoadStartTime + (2 * 60 * 1000) // time when machine transitions from NORMAL to CRITICAL
    const recoveryStartTime = criticalStartTime + (30 * 1000) // time when machine transitions from CRITICAL to RECOVERING
    const sm = new StateMachine()

    if ([STATES.CRITICAL, STATES.RECOVERING].includes(transitionTo)) {
        sm.dispatch('HIGH', { curTime: highLoadStartTime })
        sm.dispatch('HIGH', { curTime: criticalStartTime })
    }

    if (transitionTo === STATES.RECOVERING) {
        sm.dispatch('LOW', { curTime: recoveryStartTime })
    }

    return { sm, windowStartTime, highLoadStartTime, criticalStartTime, recoveryStartTime }
}