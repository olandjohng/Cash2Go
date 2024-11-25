const express = require('express')
const auth = express.Router()
const jwt = require('jsonwebtoken')
const builder = require('../builder')
const secretKey = 'eRHfBiAs2s3y4+PgytlBQeU0NxIFOCzc+QBL2YmGvIQ='
const bcrypt = require('bcrypt')

auth.post('/login',async (req, res) => {
  const {username, password} = req.body
  // if(req.cookies['token']) {res.cookie('to')}
  try {
    const user = await builder('employeetbl').select(
      {id : 'employee_id'},
      builder.raw(`CONCAT_WS(', ',fname, lname) as full_name`), 
      'username',
      'password',
      'type',
      'did_init',
    )
    .where('username', username).first()
    
    if(!user)  {
      return console.log('invalid credentials')
    }

    const match =  await bcrypt.compare(password, user.password)
    if(!match) { return console.log('invalid credentials')}

    const token = await genToken({id : user.id, username : user.username})
    res.cookie('token', token, { httpOnly : true })

    res.json({id : user.id ,full_name : user.full_name, account_type : user.type, username : user.username, did_init : user.did_init})

  } catch (error) {
    console.log(error)
  }
  
  
})
auth.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.status(200).end()
})

auth.post('/:id/change-password', async (req, res) => {
  const {confirm_password} = req.body

  try {
    const new_password = await bcrypt.hash(confirm_password, 10)
    await builder('employeetbl').where('employee_id', req.params.id).update({
      password : new_password,
      did_init : true,
    })
    res.status(200).end()
  } catch (error) {
    console.log(error)
    res.status(500).end()
  }
})

function genToken(payload) {
  return new Promise((res, rej) => {
    jwt.sign(payload, secretKey, (err, token) => {
      if(err) { rej(err) }
      res(token)
    })
  })
}


module.exports = auth