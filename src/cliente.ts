import * as net from 'net';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const client = new net.Socket();

client.connect(60300, '127.0.0.1', () => {
  console.log('Conectado al servidor.');

  rl.question('Ingrese el comando a ejecutar en el servidor: ', (comando) => {
    client.write(comando);
  });
});

client.on('data', (data) => {
  console.log(`Respuesta del servidor: ${data}`);
  client.end();
});

client.on('close', () => {
  console.log('Conexión cerrada.');
  rl.close();
});
