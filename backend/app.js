const express = require('express')
const app = express()
const cors = require('cors')
const loanRouter = require('./routes/loan')
const customerRouter = require('./routes/customer')
const bankRouter = require('./routes/bank')
const bodyParser = require('body-parser')

const PORT = 8000

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(cors())

app.use('/loans', loanRouter)
app.use('/customers', customerRouter)
app.use('/banks', bankRouter)

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})