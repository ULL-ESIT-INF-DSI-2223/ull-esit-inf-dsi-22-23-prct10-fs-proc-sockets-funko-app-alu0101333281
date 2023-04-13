[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/NApXvVde)

## modi
Desarrolle los siguientes ejercicios en un proyecto alojado en un nuevo repositorio de GitHub:

    Desarrolle un cliente y un servidor en Node.js, haciendo uso de sockets, que incorporen la siguiente funcionalidad:
        El cliente debe recibir, desde la línea de comandos, un comando Unix/Linux, además de sus argumentos correspondientes, que ejecutaremos en el servidor.
        El servidor debe recibir la petición del cliente, procesarla, esto es, ejecutar el comando solicitado, y devolver la respuesta del comando al cliente. Para ello, piense que el comando solicitado puede haberse ejecutado correctamente o puede haber fallado, por ejemplo, por no existir o porque se le han pasado unos argumentos no válidos.
    Trate de definir pruebas con Mocha y Chai que comprueben el funcionamiento de los métodos que ha implementado. Tenga en cuenta que, lo ideal, es que utilice el patrón callback para implementar dichos métodos, dado que lo anterior facilitará el desarrollo de las pruebas.
    Incorpore un flujo de GitHub que ejecute sus pruebas en diferentes entornos con diferentes versiones de Node.js.