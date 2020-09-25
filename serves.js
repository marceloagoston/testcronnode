//------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Filtro por estado y fecha de tramite, para identificar solicitudes atrasadas, y otros movimientos de solicitudes
//Fecha:  23/09/20
//Autor:  Sebastian Rodriguez
//  linea  10 a 13  definicion de constantes de librerías
//  linea  15 a 19  configuracion de sequalize (conexión con la db)
//  linea  21 a 26  definición de la consulta para obtener mail de solicitantes que no hicieron actualizaciones en 4 dias o mas y cuyo estado no sea finalizado
//  linea  27 ejecutar consulta descripta en la linea anterior
//------------------------------------------------------------------------------------------------------------------------------------------------------------------

const express = require('express')
const { Sequelize, QueryTypes } = require('sequelize');
const moment = require('moment')
const app = express()

const sequelize = new Sequelize('NBCH.Tracking', 'Usuario.NBCH.Tracking', 'Usuario.NBCH.Tracking', {
  host: '10.250.0.75',
  dialect: 'mssql',
});

async function generarReporte(){
  let fechaHoy = moment().format("YYYY-MM-DD");

  const solicitudesPendientesTotales = await sequelize.query(`
                  SELECT S.sucursal_cercana, count(*) AS cantidad_total_de_pendientes, max(S.updatedAt) AS ultima_actualización 
                  FROM solicitud_estados SE 
                  JOIN solicitudes S on SE.id_solicitud = S.id 
                  JOIN solicitantes Sol on Sol.id = S.id_solicitante 
                  JOIN estados E on E.id = SE.id_estado 
                  WHERE SE.id_estado <> 3 
                  GROUP BY S.sucursal_cercana`
  , { type: QueryTypes.SELECT });

  const solicitudesPendientesAtrasadas = await sequelize.query(`
      SELECT S.sucursal_cercana, count(*) AS pendientes_atrasadas , max(S.updatedAt) AS ultima_actualización
      FROM solicitud_estados SE 
      JOIN solicitudes S on SE.id_solicitud = S.id 
      JOIN solicitantes Sol on Sol.id = S.id_solicitante 
      JOIN estados E on E.id = SE.id_estado 
      WHERE SE.id_estado <> 3  AND DATEDIFF(day, SE.fecha,getdate()) > 4
      GROUP BY S.sucursal_cercana `
  , { type: QueryTypes.SELECT }); 

  async function obtenerReporte(){
      
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

  }

  console.log(obtenerReporte());
}
generarReporte();




/* const solicitudesJoin = await sequelize.query(`
  SELECT Pendientes.sucursal_cercana, Pendientes.Pendientes_Totales ,Atrasadas.Pendientes_Atrasadas
  FROM(
    SELECT S.sucursal_cercana, S.count(*) AS Pendientes_Totales, max(S.updatedAt) AS Ultima_Actualización 
    FROM solicitud_estados SE 
    JOIN solicitudes S on SE.id_solicitud = S.id 
    JOIN solicitantes Sol on Sol.id = S.id_solicitante 
    JOIN estados E on E.id = SE.id_estado 
    WHERE SE.id_estado <> 3 
    GROUP BY S.sucursal_cercana) Pendientes
    
    LEFT OUTER JOIN
   
    (
    SELECT S.sucursal_cercana, count(*) AS Pendientes_Atrasadas , max(S.updatedAt) AS Ultima_Actualización
    FROM solicitud_estados SE 
    JOIN solicitudes S on SE.id_solicitud = S.id 
    JOIN solicitantes Sol on Sol.id = S.id_solicitante 
    JOIN estados E on E.id = SE.id_estado 
    WHERE SE.id_estado <> 3  AND DATEDIFF(day, SE.fecha,getdate()) > 4
    GROUP BY S.sucursal_cercana) Atrasadas 
    ON Pendientes.sucursal_cercana = Atrasadas.sucursal_cercana
    `
, { type: QueryTypes.SELECT }); */