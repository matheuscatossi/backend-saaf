var express = require('express'),
  app = express()

var port = process.env.PORT || 8080
app.listen(port)

app.use(express.static(__dirname + '/public'))

const sql = require('mssql')

const cors = require('cors')
app.use(cors())
app.options('*', cors())

const sqlConfig = {
  user: 'usr_saaf',
  password: 'comandos',
  server: 'mssql914.umbler.com',
  port: '5003',
  database: 'SAAF',
  options: {
    encrypt: true
  }
}

app.get('/api/attendances', function (request, response) {
  executeQueryAttendance().then(function (result) {
    response.json(result.recordsets[0])
  })
})

function executeQueryAttendance () {
  return new Promise(function (resolve, reject) {
    resolve(getAttendance(sql, sqlConfig))
  })
}

app.get('/api/employees', function (request, response) {
  executeQueryEmployees().then(function (result) {
    response.json(result.recordsets[0])
  })
})

function executeQueryEmployees () {
  return new Promise(function (resolve, reject) {
    resolve(getEmployees(sql, sqlConfig))
  })
}

app.get('/api/students', function (request, response) {
  executeQueryStudents().then(function (result) {
    response.json(result.recordsets[0])
  })
})

function executeQueryStudents () {
  return new Promise(function (resolve, reject) {
    resolve(getStudent(sql, sqlConfig))
  })
}

require('cf-deployment-tracker-client').track()

function addAttendance (params, sql, sqlConfig) {
  let student = params.student
  let employees = params.employees
  let date = params.date
  let returnDate = params.returnDate
  let description = params.description

  return new Promise(function (resolve, reject) {
    executeQuery(
      'INSERT INTO ACOMPANHAMENTO (ALUNO, FUNCIONARIO, DATA, DATARETORNO, OBSERVACOES) VALUES (' +
        student +
        ' , ' +
        employees +
        ", '" +
        date +
        "', '" +
        returnDate +
        "', '" +
        description +
        "');",
      sql,
      sqlConfig,
      result => {
        resolve(result)
      }
    )
  })
}

function getAttendance (sql, sqlConfig) {
  return new Promise(function (resolve, reject) {
    executeQuery('SELECT * FROM ACOMPANHAMENTO', sql, sqlConfig, result => {
      resolve(result)
    })
  })
}

function getStudent (sql, sqlConfig) {
  return new Promise(function (resolve, reject) {
    executeQuery(
      'SELECT C.NOME AS NOME, A.ALUNO AS ID FROM PESSOA AS P INNER JOIN CANDIDATO AS C ON C.PESSOA = P.PESSOA INNER JOIN ALUNO AS A ON A.CANDIDATO = C.CANDIDATO',
      sql,
      sqlConfig,
      result => {
        resolve(result)
      }
    )
  })
}

function getEmployees (sql, sqlConfig) {
  return new Promise(function (resolve, reject) {
    executeQuery(
      'SELECT F.NOME AS NOME, P.PESSOA AS ID, F.PROFISSAO AS PROFISSAO  FROM PESSOA AS P INNER JOIN FUNCIONARIO AS F on F.PESSOA = P.PESSOA',
      sql,
      sqlConfig,
      result => {
        resolve(result)
      }
    )
  })
}

function executeQuery (query, sql, sqlConfig, callback) {
  try {
    let poolPromise = new Promise(function (resolve, reject) {
      resolve(sql.connect(sqlConfig))
    })

    poolPromise.then(pool => {
      let poolRequestPromise = new Promise(function (resolve, reject) {
        resolve(pool.request().query(query))
      })

      poolRequestPromise.then(resultQuery => {
        sql.close()
        callback(resultQuery)
      })
    })
  } catch (err) {
    sql.close()
    return err
  }
}
