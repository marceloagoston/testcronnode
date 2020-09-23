const express = require('express')
const { Sequelize, QueryTypes } = require('sequelize');
const app = express()

  /* conectarse a la BD */
  const sequelize = new Sequelize('NBCH.Tracking', 'Usuario.NBCH.Tracking', 'Usuario.NBCH.Tracking', {
    host: '10.250.0.75',
    dialect: 'mssql',
  });

/* 
  DB_CONN_STRING=mssql;//Usuario.NBCH.Tracking:Usuario.NBCH.Tracking@10.250.0.75/NBCH.Tracking

  DB_CONN_STRING_EXAMPLE={dialect};//{user}:{password}@{host}/{db}

  SMTP_HOST=smtp.nbch.com.ar
  SMTP_PORT=25
  EMAIL_ACCOUNT=info@nbch.com.ar
  EMAIL_ACCOUNT_NAME="Info NBCH"

  PUBLIC_URL=http://localhost:3000
  FILES_URI="/files" */

/* async function probar(){
try {
    await sequelize.authenticate();
    console.log('Conectado');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

probar() */
async function probarConsulta(){
    const solicitudes = await sequelize.query("SELECT * FROM solicitudes", { type: QueryTypes.SELECT });
    console.log(solicitudes)
}
/* 
Notas sobre Cron

* * * * * * --> cada segundo
0 * * * * * --> Cada minutos
0 0 * * * * --> Cada hora
0 0 0 * * * --> Cada dia

etc

*/

let x = 0;
var CronJob = require('cron').CronJob;
var job = new CronJob('* * * * * *', function() {
  console.log('Muestra esto cada segundo');
  probarConsulta();
  x++;
  console.log(x);
}, null, true, 'America/Los_Angeles');
job.start();






app.get('/', function (req, res) {
    res.send('Este es el <strong>home1221</strong>')
    console.log('Pagina de inicio...')
})



app.listen(3030)