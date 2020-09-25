//parte que crea el archivo

/* const filePath = './reporte.xslx'

const fd = fs.openSync(filePath, 'w') */

// parte que elimina

const path = './reporte.xslx'

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