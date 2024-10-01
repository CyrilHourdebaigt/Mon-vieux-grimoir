const http = require('http');
const app = require('./app');
const cors = require('cors');

const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(process.env.PORT || '4000');
app.set('port', port);

const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// Utilisation de cors avant de définir tes routes
app.use(cors()); // <--- Ajout du middleware cors ici

const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

// server.on('request', (request, response) => {
//   // On spécifie l'entête pour le CORS
//   response.setHeader('Access-Control-Allow-Origin', '*');

//   if (request.method === 'OPTIONS') {
//     // On liste des méthodes et les entêtes valides
//     response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin, Authorization');
//     response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

//     return response.end();
// }
// })

server.listen(port);
