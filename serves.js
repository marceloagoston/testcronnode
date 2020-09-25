//------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Filtro por estado y fecha de tramite, para identificar solicitudes atrasadas, y otros movimientos de solicitudes
//Fecha:  23/09/20
//Autor:  Sebastian Rodriguez
//  linea  10 a 13  definicion de constantes de librerías
//  linea  15 a 19  configuracion de sequalize (conexión con la db)
//  linea  22 a 31 Consulta de Solicitudes pendientes para cada sucursal
//  linea  33 a 41 Consultas de solicitudes con edad mayor a 4 dias
//  linea  44 a 61 Funcion obtenerReporte() que genera el reporte a enviar por mail basandose en ambas consultas anteriores
//  linea  68 Se invoca la funcion generarReporte() que ejecuta todo el codigo anterior
//------------------------------------------------------------------------------------------------------------------------------------------------------------------
const fs = require('fs')
const express = require('express')
const { Sequelize, QueryTypes } = require('sequelize');
const app = express()

const sequelize = new Sequelize('NBCH.Tracking', 'Usuario.NBCH.Tracking', 'Usuario.NBCH.Tracking', {
  host: '10.250.0.75',
  dialect: 'mssql',
});

async function generarReporte(){

  const solicitudesPendientesTotales = await sequelize.query(`
                  SELECT S.sucursal_cercana, count(*) AS cantidad_total_de_pendientes, max(S.updatedAt) AS ultima_actualización 
                  FROM solicitud_estados SE 
                  JOIN solicitudes S on SE.id_solicitud = S.id 
                  JOIN solicitantes Sol on Sol.id = S.id_solicitante 
                  JOIN estados E on E.id = SE.id_estado 
                  WHERE SE.id_estado <> 3 AND SE.id_estado <> 7
                  GROUP BY S.sucursal_cercana`
  , { type: QueryTypes.SELECT });

  const solicitudesPendientesAtrasadas = await sequelize.query(`
      SELECT S.sucursal_cercana, count(*) AS pendientes_atrasadas , max(S.updatedAt) AS ultima_actualización
      FROM solicitud_estados SE 
      JOIN solicitudes S on SE.id_solicitud = S.id 
      JOIN solicitantes Sol on Sol.id = S.id_solicitante 
      JOIN estados E on E.id = SE.id_estado 
      WHERE SE.id_estado <> 3 AND SE.id_estado <> 7 AND DATEDIFF(day, SE.fecha,getdate()) > 4
      GROUP BY S.sucursal_cercana `
  , { type: QueryTypes.SELECT }); 

    let pendientes = await solicitudesPendientesTotales;
    let atrasadas = await solicitudesPendientesAtrasadas;
    let salida = [];
    pendientes.forEach(loopTotales => {
      atrasadas.forEach(loopAtrasadas => {
        if(loopAtrasadas.sucursal_cercana == loopTotales.sucursal_cercana){
          /* Si hay tareas atrasadas */
          loopAtrasadas['cantidad_total_de_pendientes']=loopTotales.cantidad_total_de_pendientes
          salida.push(loopAtrasadas);
        } else {
          /* Si no hay atrasadas */
          loopTotales['pendientes_atrasadas']=0
          salida.push(loopTotales);
        }
      });
      
    });
    console.log(salida)
    return salida    
  
}
generarReporte();
/* 
//parte que crea el archivo

const filePath = `${__dirname}/reporte.xlxs`

const fd = fs.openSync(filePath, 'w')

// parte que elimina

const path = `${__dirname}/reporte.xlxs`

setTimeout(tset,3000);
function tset(){
  fs.access(path, fs.F_OK, (err) => {
    if (err) {
      console.error(err)
      return
    } else {
      
      try {
      fs.unlinkSync(path)
      console.log('archivo eliminado')
      //file removed
    } catch(err) {
      console.error(err)
    }} 
  })
} */
