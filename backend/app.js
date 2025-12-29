const express = require('express')
const app = express()
const {loanRouter} = require('./routes/loan')
const customerRouter = require('./routes/customer')
const bankRouter = require('./routes/bank')
const deductionRouter = require('./routes/deduction')
const bodyParser = require('body-parser')
const facilityRouter = require('./routes/facility')
const categoryRouter = require('./routes/category')
const customerInfoRouter = require('./routes/customerInfo')
const collateralRouter = require('./routes/collateral')
const accountCategoryRouter = require('./routes/accountCategory')
const accountTitleRouter = require('./routes/accountTitle')
const employeeRouter = require('./routes/employee')
const { sequenceRouter } = require('./routes/sequenceRouter')
const paymentRouter = require('./routes/payment');
const uploadRouter = require('./routes/upload')

const os = require('os');
const reportsRouter = require('./routes/reports')
const expensesRouter = require('./routes/expenses')
const adjustingEntriesRouter = require('./routes/adjusting-entries')
const auth = require('./routes/auth')
const receivablesRouter = require('./routes/receivables')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const getIPv4 = (port) => {
  const networkInterfaces = os.networkInterfaces()
  for (const name of Object.keys(networkInterfaces)) {
    for (const con of networkInterfaces[name]) {
      if(con.family === 'IPv4' && !con.internal)
        return `http://${con.address}:${port}`
    }
  }
}

const PORT = process.env.PORT || 8000
app.use(cookieParser())

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use('/api/public', express.static('public'))

app.use((req, res, next) => {
  req.on('aborted', () => {
    console.warn('⚠️ Client aborted the request');
  });
  next();
});

app.use(express.static('dist'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/api/loans', loanRouter)
app.use('/api/payments', paymentRouter)
app.use('/api/employee', employeeRouter)
app.use('/api/customers', customerRouter)
app.use('/api/banks', bankRouter)
app.use('/api/deductions', deductionRouter)
app.use('/api/facility', facilityRouter)
app.use('/api/sequence', sequenceRouter)
app.use('/api/category', categoryRouter)
app.use('/api/customerInfo', customerInfoRouter)
app.use('/api/collateral', collateralRouter)
app.use('/api/account-category', accountCategoryRouter)
app.use('/api/account-title', accountTitleRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/employee', employeeRouter)
app.use('/api/expenses', expensesRouter)
app.use('/api/adjusting-entries', adjustingEntriesRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/auth', auth)
app.use('/api/reports/receivables', receivablesRouter)

app.use((err, req, res, next) => {
  console.log(62);
  console.log(err);
})

app.use('*', express.static('dist'))

app.listen(PORT, () => { console.log(`Server running at  \n${getIPv4(PORT)}`) })
