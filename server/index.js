const express = require('express')
const app = express()
const cors = require('cors')
const os = require('os');
const port = 3001

app.use(cors())

app.get('/', (req, res) => {
  const cpus = os.cpus().length
  const loadAvgs = os.loadavg().map((avg) => (avg / cpus).toFixed(2))

  res.send({
    loads: loadAvgs,
    time: new Date().getTime()
  })

})

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`)
})


// Used for simulating high load
// let timerId = null
// let c = 0
// if (!timerId) {
//   timerId = setInterval(() => {
//     c++
//     clearInterval(timerId)
//     timerId = null
//   }, 2 * 60 * 1000)
// }
// if (c === 7) {
//   res.send({
//     loads: [((Math.random() / 1.5) + 2), Math.random() / 2, Math.random() / 3],
//     time: new Date().getTime()
// })