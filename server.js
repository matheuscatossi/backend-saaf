var express = require("express"), app = express();

var sql = require('mssql');
var port = process.env.PORT || 8080;
app.listen(port);

var sqlConfig = {
  user: 'usr_saaf',
  password: 'comandos',
  server: 'mssql914.umbler.com', 
  database: 'SAAF',
  port: '5003',
  options: {
      encrypt: true
  }
};

app.use(express.static(__dirname + '/public'));

app.get("/get-pessoas", function (request, response) {
  const executeQuery = async function (query) {
    try {
      let pool =  await sql.connect(sqlConfig);
      let result = await pool.request().query(query) 
      response.end(""+ JSON.stringify(result));
      sql.close();
    } catch (err) {
      response.end(""+ err);
      sql.close();
    }
  };

  executeQuery("select * from Pessoa");
});



require("cf-deployment-tracker-client").track();
