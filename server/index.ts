import express from 'express'
import path from 'path'
import api from './api'

const app = express()

app.use('/api/', api)
app.use(express.static(path.join(__dirname, '../build')))

app.listen(process.env.PORT || 3001, () => {
  console.log('> Server listening on port ' + (process.env.PORT || 3001))
})