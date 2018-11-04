require('colors')
var validateSchema = require('openapi-schema-validation').validate;
var validation = validateSchema(require('./swagger'), 2);
if(validation.errors.length > 0){
  validation.errors.forEach((error)=>{
    console.log( 'Property: '.red + error.property.red)
    console.log( '     Error message: ' + error.message)
    console.log( '     Stack message: ' + error.stack)
  })
}
