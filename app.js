const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'todoApplication.db')
let db = null

//IntialiseDbandServer

const initialiseDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error : ${e.message}`)
    process.exit(1)
  }
}
initialiseDbAndServer()

//GET

app.get('/todos/', async (request, response) => {
  const {status, priority, search_q} = request.query
  let query
  let dbStatus

  if (status != undefined && priority != undefined) {
    query = `
    SELECT 
    id,
    todo,
    priority,
    status
    FROM
    todo
    WHERE status = '${status}' 
    and
    priority = '${priority}';`
    dbStatus = await db.all(query)
  } else if (status != undefined) {
    query = `
    SELECT 
    id,
    todo,
    priority,
    status
    FROM
    todo
    WHERE status = '${status}';`
    dbStatus = await db.all(query)
  } else if (priority != undefined) {
    query = `
    SELECT 
    id,
    todo,
    priority,
    status
    FROM
    todo
    WHERE priority = '${priority}';`
    dbStatus = await db.all(query)
  } else if (search_q != undefined) {
    query = `
    SELECT 
    id,
    todo,
    priority,
    status
    FROM 
    todo
    WHERE todo LIKE '%${search_q}%';`
    dbStatus = await db.all(query)
  }
  response.send(dbStatus)
})

//GET -->By todoId

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getQuery = `
  SELECT 
  *
  FROM
  todo
  WHERE id = ${todoId};`
  const dbStatus = await db.get(getQuery)
  response.send(dbStatus)
})

//POST

app.post('/todos/', async (request, response) => {
  const postDetails = request.body
  const {id, todo, priority, status} = postDetails
  const postQuery = `
  INSERT 
  INTO 
  todo (id,todo,priority,status)
  VALUES (${id},'${todo}','${priority}','${status}');`
  await db.run(postQuery)
  response.send('Todo Successfully Added')
})

//PUT

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const {status, priority, todo} = request.body
  if (status != undefined) {
    const query = `
    UPDATE
    todo
    SET
    status = '${status}'
    WHERE id = ${todoId};`
    await db.run(query)
    response.send('Status Updated')
  } else if (priority != undefined) {
    const query = `
    UPDATE
    todo
    SET
    priority = '${priority}'
    WHERE id = ${todoId};`
    await db.run(query)
    response.send('Priority Updated')
  } else if (todo != undefined) {
    const query = `
    UPDATE
    todo
    SET
    todo = '${todo}'
    WHERE
    id = ${todoId};`
    await db.run(query)
    response.send('Todo Updated')
  }
})

//DELETE

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const query = `
  DELETE
  FROM
  todo
  WHERE
  id = ${todoId};`
  await db.run(query)
  response.send('Todo Deleted')
})

module.exports = app