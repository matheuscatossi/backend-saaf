
module.exports = function () {
    this.sqlConfig = {
        user: 'usr_saaf',
        password: 'comandos',
        server: 'mssql914.umbler.com',    // don't add tcp & port number
        database: 'SAAF',
        port: '5003',
        options: {
            encrypt: true
        }
    };
}