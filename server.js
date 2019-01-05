var express = require('express'),
  app = express()

var port = process.env.PORT || 8080
app.listen(port)

app.use(express.static(__dirname + '/public'))

const sql = require('mssql')

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

app.get('/acompanhamentos', function (request, response) {
  const executeQuery = async function () {
    return new Promise(function (resolve, reject) {
      resolve(getAttendance(sql, sqlConfig))
    })
  }

  executeQuery().then(function (result) {
    response.json(result.recordsets)
  })
})

app.get('/funcionarios', function (request, response) {
  const executeQuery = async function () {
    return new Promise(function (resolve, reject) {
      resolve(getEmployees(sql, sqlConfig))
    })
  }

  executeQuery().then(function (result) {
    response.json(result.recordsets)
  })
})

app.get('/alunos', function (request, response) {
  const executeQuery = async function () {
    return new Promise(function (resolve, reject) {
      resolve(getStudent(sql, sqlConfig))
    })
  }

  executeQuery().then(function (result) {
    response.json(result.recordsets)
  })
})

require('cf-deployment-tracker-client').track()

function addAttendance (params, sql, sqlConfig) {
  let student = params.student
  let employees = params.employees
  let date = params.date
  let returnDate = params.returnDate
  let description = params.description

  return new Promise(function (resolve, reject) {
    resolve(
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
        sqlConfig
      )
    )
  })
}

function getAttendance (sql, sqlConfig) {
  return new Promise(function (resolve, reject) {
    resolve(executeQuery('SELECT * FROM ACOMPANHAMENTO', sql, sqlConfig))
  })
}

function getStudent (sql, sqlConfig) {
  return new Promise(function (resolve, reject) {
    resolve(
      executeQuery(
        'SELECT C.NOME AS NOME, A.ALUNO AS ID FROM PESSOA AS P INNER JOIN CANDIDATO AS C ON C.PESSOA = P.PESSOA INNER JOIN ALUNO AS A ON A.CANDIDATO = C.CANDIDATO',
        sql,
        sqlConfig
      )
    )
  })
}

function getEmployees (sql, sqlConfig) {
  return new Promise(function (resolve, reject) {
    resolve(
      executeQuery(
        'SELECT F.NOME AS NOME, P.PESSOA AS ID, F.PROFISSAO AS PROFISSAO  FROM PESSOA AS P INNER JOIN FUNCIONARIO AS F on F.PESSOA = P.PESSOA',
        sql,
        sqlConfig
      )
    )
  })
}

async function executeQuery (query, sql, sqlConfig) {
  try {
    let pool = await sql.connect(sqlConfig)
    let result = await pool.request().query(query)
    sql.close()
    return result
  } catch (err) {
    sql.close()
    return err
  }
}
