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
    const solicitudes = await sequelize.query(`SELECT Sol.email, Sol.nombre_apellido, SE.fecha, S.numero_solicitud, S.numero_tramite, E.descripcion AS Estado_Solicitud 
                    FROM solicitud_estados SE 
                    JOIN solicitudes S on SE.id_solicitud = S.id 
                    JOIN solicitantes Sol on Sol.id = S.id_solicitante 
                    JOIN estados E on E.id = SE.id_estado 
                    WHERE SE.id_estado <> 3 
                    AND DATEDIFF(day, SE.fecha,getdate()) > 4`
    , { type: QueryTypes.SELECT });
    /* const solicitudes = await sequelize.query("SELECT * from solicitud_estados"); */
    console.log(solicitudes);
}
probarConsulta();