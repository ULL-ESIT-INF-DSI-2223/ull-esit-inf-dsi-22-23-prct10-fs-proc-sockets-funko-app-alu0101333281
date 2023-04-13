import "mocha";
import { expect } from "chai";
import { exec } from 'child_process';
import * as net from 'net';
import * as readline from 'readline';
import * as jest from 'jest';

describe('Server and Client Socket Tests', () => {
  let server: net.Server;
  let clientSocket: net.Socket;
  let rl: readline.Interface;
  let output: string;

  before(() => {
    // Crear servidor de prueba
    server = net.createServer((socket) => {
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

    // Crear cliente de prueba
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    clientSocket = new net.Socket();
    clientSocket.connect(60300, '127.0.0.1', () => {
      console.log('Conectado al servidor.');
    });

    // Capturar la salida del cliente en la consola
    output = '';
    const storeLog = inputs => (output += inputs);
    console['log'] = jest.fn(storeLog);
  });

  after(() => {
    // Cerrar servidor y cliente de prueba
    server.close();
    clientSocket.end();
    rl.close();
  });

  it('Should receive response from server upon sending command', (done) => {
    // Enviar comando desde el cliente
    clientSocket.write('echo "Hola, Mundo!"');

    // Esperar a que el servidor responda
    clientSocket.on('data', (data) => {
      expect(data.toString().trim()).to.be.equal('Hola, Mundo!');
      done();
    });
  });

  it('Should handle error from server upon sending invalid command', (done) => {
    // Enviar comando inválido desde el cliente
    clientSocket.write('comando_invalido');

    // Esperar a que el servidor responda con un error
    clientSocket.on('data', (data) => {
      expect(data.toString()).to.include('Error:');
      done();
    });
  });

  it('Should handle disconnection from server', (done) => {
    // Cerrar conexión desde el servidor
    server.close();

    // Esperar a que el cliente detecte la desconexión
    clientSocket.on('close', () => {
      expect(output).to.include('Conexión cerrada.');
      done();
    });
  });
});
