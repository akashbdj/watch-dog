const express = require('express')
const app = express()
const cors = require('cors')
const os = require('os');
const port = 3001

app.use(cors())


let timerId = null
let c = 0

app.get('/', (req, res) => {
  const cpus = os.cpus().length
  const loadAvgs = os.loadavg().map((avg) => (avg / cpus).toFixed(2))

  console.log("current: ", c)
  if (c === 12) {
    res.send({
      loads: [((Math.random() / 1.5) + 2), Math.random() / 2, Math.random() / 3],
      time: new Date().getTime()
    })

    if (!timerId) {
      timerId = setInterval(() => {
        c++
        clearInterval(timerId)
        timerId = null
      }, 1.5 * 60 * 1000)
    }

    return

  }



  if (c === 4 || c == 50 || c == 70) {
    res.send({
      loads: [Math.random() / 2 + 1, Math.random() / 2, Math.random() / 3],
      time: new Date().getTime()
    })


    if (!timerId) {
      timerId = setInterval(() => {
        c++
        clearInterval(timerId)
        timerId = null
      }, 2.5 * 60 * 1000)
    }
  } else {
    c++
    res.send({
      loads: loadAvgs,
      time: new Date().getTime()
    })
  }
})




app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`)
})