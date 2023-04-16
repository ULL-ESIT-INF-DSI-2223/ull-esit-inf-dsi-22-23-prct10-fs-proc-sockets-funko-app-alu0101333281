# Practica 10 - APIs asíncronas de gestión del sistema de ficheros, creación de procesos y creación de sockets de Node.js
[![Tests](https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct10-fs-proc-sockets-funko-app-alu0101333281/actions/workflows/node.js.yml/badge.svg)](https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct10-fs-proc-sockets-funko-app-alu0101333281/actions/workflows/node.js.yml)
[![Coveralls](https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct10-fs-proc-sockets-funko-app-alu0101333281/actions/workflows/coveralls.yml/badge.svg)](https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct10-fs-proc-sockets-funko-app-alu0101333281/actions/workflows/coveralls.yml)
[![Sonar-Cloud](https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct10-fs-proc-sockets-funko-app-alu0101333281/actions/workflows/sonarcloud.yml/badge.svg)](https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct10-fs-proc-sockets-funko-app-alu0101333281/actions/workflows/sonarcloud.yml)
## Introduccion 
En este informe trataremos una serie de ejercicios orientados al uso de las APIs proporcionadas por Node.js para interactuar con el sistema de ficheros, así como para crear procesos.

El próposito general de la misma es comprender el funcionamientos de la API de Callbacks y su API asincrona para la creación de procesos en Node.js, este es un entorno de de ejecución javascript que trabaja de forma asíncrona, trabajaremos también con que bloquea el bucle de eventos hasta que terminan todas las operaciones, además seguiremos usando algunos módulos de desarrollo como: yargs o chalk.

Tambíen seguiremos avanzando en el desarrollo de cubrimiento, testing y seguridad del código usando Github Actions, Coveralls y Sonar Cloud. Seguimos utilizando documentación generada por Typedoc y comprobando el correcto funcionamiento por medio de las metodologías de desarrollo TDD usando Mocha y Chai.

## Modificacion
Desarrolle los siguientes ejercicios en un proyecto alojado en un nuevo repositorio de GitHub:

    Desarrolle un cliente y un servidor en Node.js, haciendo uso de sockets, que incorporen la siguiente funcionalidad:
        El cliente debe recibir, desde la línea de comandos, un comando Unix/Linux, además de sus argumentos correspondientes, que ejecutaremos en el servidor.
        El servidor debe recibir la petición del cliente, procesarla, esto es, ejecutar el comando solicitado, y devolver la respuesta del comando al cliente. Para ello, piense que el comando solicitado puede haberse ejecutado correctamente o puede haber fallado, por ejemplo, por no existir o porque se le han pasado unos argumentos no válidos.
    Trate de definir pruebas con Mocha y Chai que comprueben el funcionamiento de los métodos que ha implementado. Tenga en cuenta que, lo ideal, es que utilice el patrón callback para implementar dichos métodos, dado que lo anterior facilitará el desarrollo de las pruebas.
    Incorpore un flujo de GitHub que ejecute sus pruebas en diferentes entornos con diferentes versiones de Node.js.

### cliente.ts

```ts
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
```
### servidor.ts
```ts
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
```
## Desarrollo 

### Ejercicio 1
En este ejercicio se nos pide ejecutar la siguiente traza de código:

```ts
import {access, constants, watch} from 'fs';

if (process.argv.length !== 3) {
  console.log('Please, specify a file');
} else {
  const filename = process.argv[2];

  access(filename, constants.F_OK, (err) => {
    if (err) {
      console.log(`File ${filename} does not exist`);
    } else {
      console.log(`Starting to watch file ${filename}`);

      const watcher = watch(process.argv[2]);

      watcher.on('change', () => {
        console.log(`File ${filename} has been modified somehow`);
      });

      console.log(`File ${filename} is no longer watched`);
    }
  });
}
```

y observar en su ejecución el estado de la pila de llamadas, el registro de eventos de la API, la cola de manejadores de Node.js y la Terminal.

El programa se encarga de observar los cambios en un fichero, asique para ver su correcta ejecución debemos introducir cambios en el fichero indicado al programa en su ejecución, en este caso helloworld.csv.

La ejecución si ignoramos las llamadas propias de los módulos de cada función y nos limitamos a nuestro programa se resuelve de la siguiente forma:

Ejecución

1. Se inicializa nuestros módulos y nuestro programa. Este se empaqueta dentro de un callback main que entra a la pila.

Call Stack	Web API	Node.js Queue	Terminal
main	–	–	–

2. Se lee el nombre del fichero en una constante. Se lee en la terminal con console.log() y entra dentro de la pila access() de fs.

Call Stack	Web API	     Node.js Queue	Terminal
access	     –	               – 	          –
main	     –	               –	          –

3. El programa se resuelve saliendo access() de la pila de llamadas5. El callback de access() es recogido dentro de la API.

Call Stack	Web API	       Node.js Queue	Terminal
main	    access	             –	            –

4. La llamada al no tener ningún retardo para su manejador pasa directamente a la Cola de manejadores a la espera de que la Pila de llamadas quede vacía.

Call Stack	Web API	      Node.js Queue 	Terminal
main	        –	          access	       –
Call Stack	Web API	      Node.js Queue	    Terminal
  –	           –	          access	       –

5. El manejador de access() entra dentro de la pila de llamadas.

Call Stack	      Web API	    Node.js Queue	Terminal
accesscallback	     –	              –	            –

6. Se ejecuta el código del manejador de access().

console.log().
Nueva variable watch() de fs.
Se invoca al proceso hijo on de watch() el cual se activa cuando detecta evento, en este caso según un tipo change. el callback de watch() es recogido por la API y solo pasará a la cola de manejadores cuando detecte un cambio en el fichero.
Nuevo console.log().

Call Stack	      Web API	Node.js Queue	Terminal
watch.on	         –	          –	            –
access() callback	 –	          –	          Starting to watch file helloworld.csv is
””	                ””	          ””	      File helloworld.csv is no longer watched

7. La Pila de llamadas vuelve a vaciarse.

Call Stack	       Web API	Node.js Queue	Terminal
access callback	   watch.on	       –	        –

Call Stack	      Web API   Node.js Queue	Terminal
    –	          watch.on	       –	        –

8. En este momento nuestro programa sigue en ejecución en otro hilo ejecutando el proceso watch.on, este está observando el fichero helloworld.csv en busca de modificaciónes. Si modificamos el mismo observaremos como la API devuelve una orden a la Cola de manejadores para ejecutar el manejador de watch.on. Este hilo no dejará de ejecutarse hasta que no se cierre el programa.

Por cada modificación que añadamos al archivo en observación, la API generará un nuevo manejador para watch(). Modificamos pues helloworld.csv.

Call Stack	   Web API	Node.js Queue	Terminal
    –	       watch.on	   watch.on	       –


9. La nueva callback pasa a la Pila de llamadas y se ejecuta su contenido, un console.log(). | Call Stack | Web API | Node.js Queue | Terminal | | – | – | – | – | | watch.on callback | watch.on | – | File helloworld.csv has been modified somehow |

El programa permanece activo hasta detectar el próximo cambio o hasta que lo detengamos.

Call Stack	Web API	    Node.js Queue	Terminal
    –	    watch.on	       –	       –

### Ejercicio 2

Para este ejercicio debemos implementar una aplicación que nos permita por medio de parámetros por consola, obtener información relativa a un fichero; número de líneas, número de palabras, número de caracteres. Estos parámetros deben ser:

Nombre del fichero
Flags: –lines, –words, –chars.
Se nos pide además realizar este ejercicio de dos formas:

Haciendo uso del método pipe de un Stream para poder redirigir la salida de un comando hacia otro.
Sin hacer uso del método pipe, solamente creando los subprocesos necesarios y registrando manejadores a aquellos eventos necesarios para implementar la funcionalidad solicitada.
Implementación
Para implementar este ejercicio he desarrollado 2 clases practicamente identicas con la diferencia de su metodo de filtrado y uso del comando “wc”. (pensandolo mejor podría haber desarrollado una clase abstracta de la que partieran ambas, hubiera ahorrado código y respetaría mejor los principios solid).

El archivo ejercicio-2.ts implementa un menú por parametros usando yargs y chalk.

main
```ts
#!/usr/bin/env node
const chalk = require('chalk');
const yargs = require('yargs');
const fs = require('fs');
import {FileAnalize} from './FileAnalize';
import {FileAnalizePipe} from './FileAnalizePipe';

/**
 * main. Función principal:
 *      Modulos FileAnalize y FileAnalizePipe
 *      Módulo yargs 
 *      Módulo chalk
 */
function main(): void {
    /**
     * Comando Analize
     *  --file | -f => Especificar ruta del archivo a analizar
     *  --method | -a => Especificar metodo a utilizar ( " " | "pipe" ) 
     *  --line | -l => Contar número de líneas ( OPCIONAL )
     *  --world | -w => Contar número de letras ( OPCIONAL )
     *  --character | -m => Contar número de caracteres ( OPCIONAL )
     *     * Debes elegir almenos un opcional.
     */
    yargs.command({
        command: 'analize',
        describe: 'Analize a File',
        builder: {
            file: {
                describe: 'File route',
                demandOption: true,
                type: 'string',
                alias: 'f',
            },
            method: {
                describe: 'Analize method',
                demandOption: true,
                type: 'string',
                alias: 'a',
            },
            lines: {
                describe: 'Number of lines of the File',
                demandOption: false,
                type: 'string',
                alias: 'l',
            },
            words: {
                describe: 'Number of words of the File',
                demandOption: false,
                type: 'string',
                alias: 'w',
            },
            chars: {
                describe: 'Number of characters of the File',
                demandOption: false,
                type: 'string',
                alias: 'm',
            },
        },
        handler(argv) {
            if ((typeof argv.file === 'string') && (typeof argv.method === 'string')) {
                let arg: string[] = []
                if (typeof argv.lines === 'string'){
                    arg.push('-l');
                }
                if (typeof argv.words === 'string'){
                    arg.push('-w');
                }
                if (typeof argv.chars === 'string'){
                    arg.push('-m');
                }
                if (argv.method == "pipe") {
                    const file = new FileAnalizePipe(argv.file, ...arg);
                } else {
                    const file = new FileAnalize(argv.file, ...arg);
                }
            } else {
                console.log(chalk.red("ERROR. Missing parameter."));
            }
        },
    });
    yargs.parse();
}

main();
```

Clase FileAnalize

```ts
#!/usr/bin/env node
import * as fs from 'fs';
import {spawn} from 'child_process';
const chalk = require('chalk');

/**
 * Class FileAnalize . Su función es analizar un archivo a través del comando "wc".
 * 
 * @param filename      Ruta y nombre del archivo a analizar.
 * @param error         Si el programa falla, se pone en "True".
 * @param arguments[]   Contiene los parámetros para el comando "wc":
 *     - "--line" => Numero de líneas
 *     - "--words" => Número de palabras
 *     - "--chars" => Número de caracteres
 */
export class FileAnalize {
    private arguments: string[];
    private _error: boolean = true;

    constructor (
        private filename: string,
        ...argument: string[]
    ) {
        this.arguments = argument;
        this.error = this.fileCheck();
        if (!this.error) {
            argument.forEach((arg) => {
                this.fileInfo(arg);
            });
        }
    }

    /**
     * fileCheck . Comprueba si la lectura del archivo puede ejecutarse de forma correcta:
     *      - Comprueba si se puede acceder a él.
     *      - Comprueba si el número de facilitados es correcto.
     */
    fileCheck ( ): boolean {
        if ((this.arguments.length < 1) || (this.arguments.length > 3)) {
            console.log(chalk.red('At least, a file analyze and a command must be specified'));
            return true;
        } else {
            return false;
        }
    }

    /**
     * fileInfo . Se encarga de tratar la información del archivo, recibe el nombre y el flag para "wc"
     * y a través de su proceso child-process envia su salida a una variable que pasará a mostrarse por pantalla
     * en el momento que se termine el proceso.
     * 
     * @param argument Flag que utilizará "wc" para tratar la información recibida del archivo.
     */
    fileInfo ( argument: string ) {
        fs.access(this.filename, fs.constants.F_OK, (err) => {
            if ((err) && (!this.error)){
                console.log(chalk.red(`File ${this.filename} does not exist.`));
                this.error = true;
                return;
            } else if (!this.error){
                let wc = spawn('wc', [argument, this.filename]);
                let info = '';
                wc.stdout.on('data', (output) => {
                    info += output;
                });
                wc.on('close', () => {
                    let infoArray = info.split(/\s+/);
                    switch (argument) {
                        case ('-l' || '--lines'):
                            console.log(`File ` + chalk.green(this.filename) + ` has ` + chalk.green(infoArray[0]) +` lines.`);
                            break;
                        case ('-w' || '--words'):
                            console.log(`File ` + chalk.green(this.filename) + ` has ` + chalk.green(infoArray[0]) +` words.`);
                            break;
                        case ('-m' || '--chars'):
                            console.log(`File ` + chalk.green(this.filename) + ` has ` + chalk.green(infoArray[0]) +` characters.`);
                            break;
                    }
                });
            }
        });
    }

    public get error(): boolean {
        return this._error;
    }
    public set error(value: boolean) {
        this._error = value;
    }
}
```

Clase FileAnalizePipe

```ts
#!/usr/bin/env node
import * as fs from 'fs';
import {spawn} from 'child_process';
const chalk = require('chalk');

/**
 * Class FileAnalizePipe . Su función es analizar un archivo a través del comando "wc".
 * 
 * @param filename      Ruta y nombre del archivo a analizar.
 * @param error         Si el programa falla, se pone en "True".
 * @param arguments[]   Contiene los parámetros para el comando "wc":
 *     - "--line" => Numero de líneas
 *     - "--words" => Número de palabras
 *     - "--chars" => Número de caracteres
 */
export class FileAnalizePipe {
    private arguments: string[];
    private _error: boolean = true;
    constructor (
        private filename: string,
        ...argument: string[]
    ) {
        this.arguments = argument;
        this.error = this.fileCheck();
        if (!this.error) {
            argument.forEach((arg) => {
                this.fileInfo(arg);
            });
        }
    }

    /**
     * fileCheck . Comprueba si la lectura del archivo puede ejecutarse de forma correcta:
     *      - Comprueba si se puede acceder a él.
     *      - Comprueba si el número de facilitados es correcto.
     */
    fileCheck ( ): boolean {
        if ((this.arguments.length < 1) || (this.arguments.length > 3)) {
            console.log(chalk.red('At least, a file analyze and a command must be specified'));
            return true;
        } else {
            return false;
        }
    }

    /**
     * fileInfo . Se encarga de tratar la información recibida por el comando "cat" que ha trabajado como intermediario para
     * volcar la información de un archivo sobre el comando "wc" a través de su subproceso pipe heredado de "child-proccess".
     * su salida para a una variable que pasará a mostrarse por pantalla en el momento que se termine el proceso.
     * 
     * @param argument Flag que utilizará "wc" para tratar la información recibida por cat del archivo.
     */
    fileInfo ( argument: string ): void {
        fs.access(this.filename, fs.constants.F_OK, (err) => {
            if ((err) && (!this.error)){
                console.log(chalk.red(`File ${this.filename} does not exist.`));
                this.error = true;
                return;
            } else if (!this.error){
                let cat = spawn('cat', [this.filename]);
                let wc = spawn('wc', [argument]);
                cat.stdout.pipe(wc.stdin);
                let info = '';
                wc.stdout.on('data', (output) => {
                    info += output;
                });
                wc.on('close', () => {
                    let infoArray = info.split(/\s+/);
                    switch (argument) {
                        case ('-l' || '--lines'):
                            console.log(`File ` + chalk.green(this.filename) + ` has ` + chalk.green(infoArray[0]) +` lines.`);
                            break;
                        case ('-w' || '--words'):
                            console.log(`File ` + chalk.green(this.filename) + ` has ` + chalk.green(infoArray[0]) +` words.`);
                            break;
                        case ('-m' || '--chars'):
                            console.log(`File ` + chalk.green(this.filename) + ` has ` + chalk.green(infoArray[0]) +` characters.`);
                            break;
                    }
                });
            }
        });       
    }

    public get error(): boolean {
        return this._error;
    }
    public set error(value: boolean) {
        this._error = value;
    }
}
```
### tests

Testing "FileAnalize Class"
    ✔ newFileAnalize is created successfully 1
File helloworld.txt has 10 words.
File helloworld.txt has 4 lines.
File helloworld.txt has 69 characters.
At least, a file analyze and a command must be specified
    ✔ newFileAnalize is not created successfully
    ✔ newFileAnalize is not created successfully
File helloworld.tt does not exist.
    ✔ newFileAnalize is an instance of Note Class
File helloworld.txt has 69 characters.
File helloworld.txt has 10 words.
File helloworld.txt has 4 lines.

  Testing "FileAnalizePipe Class"
    ✔ newFileAnalizePipe is created successfully 1
File helloworld.txt has 69 characters.
File helloworld.txt has 10 words.
File helloworld.txt has 4 lines.
At least, a file analyze and a command must be specified
    ✔ newFileAnalize is not created successfully
    ✔ newFileAnalize is not created successfully
File helloworld.tt does not exist.
    ✔ newFileAnalize is an instance of Note Class

File helloworld.txt has 10 words.
File helloworld.txt has 4 lines.

  8 passing (356ms)

File helloworld.txt has 69 characters.

### Terminal

[~/P10(main)]$node --experimental-modules dist/ejercicio-2/main.js analize -f "./helloworld.txt" -alwm
File ./helloworld.txt has 69 characters.
File ./helloworld.txt has 10 words.
File ./helloworld.txt has 4 lines.
[~/P10(main)]$node --experimental-modules dist/ejercicio-2/main.js analize -f "./helloworld.txt" -al
File ./helloworld.txt has 4 lines.
[~/P10(main)]$node --experimental-modules dist/ejercicio-2/main.js analize -f "./helloworld.txt" -a "pipe" -wm
File ./helloworld.txt has 69 characters.
File ./helloworld.txt has 10 words.


## Conclusion
El manejo de de La Pila de Llamadas, La API de Node.js, La Cola de Manejadores y la Terminal de forma correcta es una tarea muy compleja si no tienes cuidado y experiencia a la hora de trabajar con funciones asincronas y puedes tener problemas si no lo haces de la forma adecuada, que es justamente el principal problema que he tenido en la elaboración de esta práctica 9, de hecho no creo haber hecho muchas cosas de forma correcta puesto que en ocaciones me he visto perdido en el código al obtener por pantalla alto totalmente inesperado a lo que que esperaba, ha sido un rompe cabezas y aún faltan bastantes piezas, resolviendo problemas así me doy cuenta de lo compleja y potente que es la API de Node.js.

Los tests utilizando Github Actions no son funcionales en el estado actual debido a que la función Watcher cuando es ejecutada requiere de cambios en tiempo real por un usuario en la base de datos, adicionalmente debido a los Tests, sin una condición de parada permanecen ejecutandose continuamente.

## Referencias

1. https://dev.to/lydiahallie/javascript-visualized-event-loop-3dif

2. https://chat.openai.com/

3. https://www.npmjs.com/package/@types/yargs

4. https://www.npmjs.com/package/chalk