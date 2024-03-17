const express = require('express')
const employeeRouter = express.Router()
const builder = require('../builder')

employeeRouter.get('/', async (req, res) => {
   const employees = await builder('employeetbl').select('*')
   const mapEmployees = employees.map((v) => {
    const fullName = `${v.lname}, ${v.fname} ${v.mname}.`
    return {
      ...v, 
      name : fullName
    }
   })
   res.status(200).json(mapEmployees)
})

module.exports = employeeRouter