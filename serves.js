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

async function probarConsulta(){
    let fechaHoy = moment().format("YYYY-MM-DD");

    const solicitudesPendientesTotales = await sequelize.query(`
                    SELECT S.sucursal_cercana, count(*), max(S.updatedAt) AS Ultima_Actualización 
                    FROM solicitud_estados SE 
                    JOIN solicitudes S on SE.id_solicitud = S.id 
                    JOIN solicitantes Sol on Sol.id = S.id_solicitante 
                    JOIN estados E on E.id = SE.id_estado 
                    WHERE SE.id_estado <> 3 
                    GROUP BY S.sucursal_cercana`
    , { type: QueryTypes.SELECT });

    const solicitudesPendientesAtrasadas = await sequelize.query(`
                    SELECT S.sucursal_cercana, count(*), max(S.updatedAt) AS Ultima_Actualización
                    FROM solicitud_estados SE 
                    JOIN solicitudes S on SE.id_solicitud = S.id 
                    JOIN solicitantes Sol on Sol.id = S.id_solicitante 
                    JOIN estados E on E.id = SE.id_estado 
                    WHERE SE.id_estado <> 3  AND DATEDIFF(day, SE.fecha,getdate()) > 4
                    GROUP BY S.sucursal_cercana`
    , { type: QueryTypes.SELECT });

    /* const solicitudesJoin = await sequelize.query(`
      
      SELECT *
      FROM solicitudes S1 LEFT OUTER JOIN (
        SELECT S.sucursal_cercana, count(*), max(S.updatedAt) AS Ultima_Actualización 
        FROM solicitud_estados SE 
        JOIN solicitudes S on SE.id_solicitud = S.id 
        JOIN solicitantes Sol on Sol.id = S.id_solicitante 
        JOIN estados E on E.id = SE.id_estado 
        WHERE SE.id_estado <> 3 
        GROUP BY S.sucursal_cercana) 
      ON S1.sucursal_cercana = S.sucursal_cercana
      AS Pendientes LEFT OUTER JOIN

      (SELECT S.sucursal_cercana, count(*), max(S.updatedAt) AS Ultima_Actualización
      FROM solicitud_estados SE 
      JOIN solicitudes S on SE.id_solicitud = S.id 
      JOIN solicitantes Sol on Sol.id = S.id_solicitante 
      JOIN estados E on E.id = SE.id_estado 
      WHERE SE.id_estado <> 3  AND DATEDIFF(day, SE.fecha,getdate()) > 4
      GROUP BY S.sucursal_cercana) AS Atrasadas
      ON Pendientes.sucursal_cercana = Atrasadas.sucursal_cercana
      `
  , { type: QueryTypes.SELECT }); */

    console.log('Solicitudes Totales:')
    console.log(solicitudesPendientesTotales);
    console.log('Solicitudes Atrasadas:')
    console.log(solicitudesPendientesAtrasadas);
   /*  console.log('Join')
    console.log(solicitudesJoin); */
}

/* Pendientes.sucursal_cercana, count(*), max(S.updatedAt) AS Ultima_Actualización */
probarConsulta();