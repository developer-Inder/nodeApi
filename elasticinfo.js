
var client = require('./utils/connection');
client.cluster.health({},function(err,resp,status) {  
    console.log(err)
  console.log("-- Client Health --",resp);
});