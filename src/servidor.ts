import * as net from 'net';
import { exec } from 'child_process';

const server = net.createServer((socket) => {
  console.log('Cliente conectado.');

  socket.on('data', (data) => {
    const comando = data.toString().trim();

    exec(comando, (error, stdout, stderr) => {
      if (error) {
        socket.write(`Error: ${error.message}`);
      } else if (stderr) {
        socket.write(`Error: ${stderr}`);
      } else {
        socket.write(stdout);
      }

      socket.end();
    });
  });

  socket.on('end', () => {
    console.log('Cliente desconectado.');
  });
});

server.listen(60300, '127.0.0.1', () => {
  console.log('Servidor escuchando en el puerto 60300.');
});
