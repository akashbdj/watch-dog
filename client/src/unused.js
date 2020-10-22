// This file contains attempts at solving Alerting logic

//  It was becoming unmanageable. Too many if cases here and the code is very fragile.
//
// if (currentLoad > 1 && !highLoadStartTime) {
//     highLoadStartTime = currentLoadTime
// }

// if (currentLoad < 1 && !recoveryStartTime && (isCritical || !hasRecovered)) {
//     recoveryStartTime = currentLoadTime
// }

// if (currentLoad > 1) {
//     hasRecovered = !!(recoveryStartTime && this.pastThresholdTime(prevLoadTime, recoveryStartTime, RECOVERY_THRESHOLD_IN_MINS))
//     isCritical = !!(highLoadStartTime && this.pastThresholdTime(currentLoadTime, highLoadStartTime, HIGH_LOAD_THRESHOLD_IN_MINS))

//     if (hasRecovered) {
//         recoveryZones = [...recoveryZones, { start: recoveryStartTime, end: prevLoadTime }]
//         hasRecovered = false
//     }

//     recoveryStartTime = null
// }

// if (currentLoad < 1) {
//     hasRecovered = !!(recoveryStartTime && this.pastThresholdTime(currentLoadTime, recoveryStartTime, RECOVERY_THRESHOLD_IN_MINS))
//     isCritical = !!(highLoadStartTime && this.pastThresholdTime(prevLoadTime, highLoadStartTime, HIGH_LOAD_THRESHOLD_IN_MINS))

//     if (isCritical) {
//         criticalZones = [...criticalZones, { start: highLoadStartTime, end: prevLoadTime }]
//         isCritical = false
//     }

//     if (hasRecovered) {
//         recoveryZones = [...recoveryZones, { start: recoveryStartTime, end: currentLoadTime }]
//         hasRecovered = false
//         recoveryStartTime = null
//     }

//     highLoadStartTime = null
// }

// // remove criticalZones which are now out of our 10mins window
// criticalZones = criticalZones.filter(({ end }) => end > (currentLoadTime - WINDOW_SIZE_IN_MIN * 60 * 1000))









//
// if the graph just dipped below `1` right after
//         // the situation was critical, it could start `recovering`.
//         // Just record the start time of this recovery.
//         // 
//         // System may or may not recover, but this dip is a potential
//         // candidate for recovery, so record it.
//         if (isCritical && currentLoad < 1) {
//             hasRecovered = recoveryStartTime && this.pastThresholdTime(currentLoadTime, recoveryStartTime, RECOVERY_THRESHOLD_IN_MINS)
//             recoveryStartTime = !recoveryStartTime ? currentLoadTime : recoveryStartTime
//         }

//         // We make `isCritical` to `false` only when the system has fully recovered.
//         // So this means:
//         // if the system is not fully recovered, and the load is high again
//         // just reset our recovering flags.
//         //
//         // We will set them again when the graph dips below 1
//         if (isCritical && currentLoad > 1) {
//             recoveryStartTime = false
//         }


//         // If the system is already at high load and `currentLoad` is also high,
//         // check if 2 mins has passed since `highLoadStartTime`.
//         // If yes, it's a critical situation. 
//         if (highLoadStartTime && currentLoad > 1) {
//             isCritical = (currentLoadTime - highLoadStartTime) >= (HIGH_LOAD_THRESHOLD_IN_MINS * 60 * 1000)
//         }

//         // set highLoadStart
//         highLoadStartTime = !highLoadStartTime && currentLoad > 1 ? data.time : highLoadStartTime

//         if (data.loads[0] < 1 && highLoadStartTime) {
//             if (isCritical) {
//                 criticalZones = [
//                     ...criticalZones,
//                     {
//                         start: highLoadStartTime,
//                         end: prevState.loadAvgs[prevState.loadAvgs.length - 1].time
//                     }
//                 ]
//             }
//             highLoadStartTime = null
//             isCritical = false
//         }

//         return {
//             highLoadStartTime,
//             criticalZones,
//             isCritical,
//             loadAvgs: newLoadAvgs.length > CAPACITY ? newLoadAvgs.slice(1) : newLoadAvgs
//         }









