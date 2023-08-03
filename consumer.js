import amqp from "amqplib";
import fetch from "node-fetch";


const rabbitSettings = {
    protocol: 'amqp',
    hostname: '3.212.118.145',
    port: 5672,
    username: 'guest',
    password: 'guest'
}

let authToken = ""; // Variable global para almacenar el token

async function connect() {
    const RegistroQueue = "Registro";
    const LoginQueue = "Login";
    const sp32Queue = "sp32";
  
    try {
      const conn = await amqp.connect(rabbitSettings);
      console.log("Conexión exitosa");
      const channel = await conn.createChannel();
      console.log("Canal creado exitosamente");
  
      // Consumir la cola "newUser"
      channel.consume(RegistroQueue, async (msn) => {
        const data = msn.content.toString();
        console.log("Recibido de newUserQueue: ", data);
        const user = JSON.parse(data);
        await saveUser(user);
        channel.ack(msn);
      });
  
      // Consumir la cola "login"
      channel.consume(LoginQueue, async (msn) => {
        const data = msn.content.toString();
        console.log("Recibido de loginQueue: ", data);
        const loginData = JSON.parse(data);
        await loginUser(loginData);
        channel.ack(msn);
      });
  
      // Consumir la cola "esp32"
      channel.consume(sp32Queue, async (msn) => {
        const data = msn.content.toString();
        console.log("Recibido de esp32Queue: ", data);
        const alarmaData = JSON.parse(data);
        await registerAlarmaFire(alarmaData);
        channel.ack(msn);
      });
    } catch (error) {
      console.error("Error => ", error);
    }
}


async function saveUser(user) {
    // Envío del objeto user a la API para guardar usuarios
    try {
      const response = await fetch("", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      if (response.ok) {
        console.log("Usuario guardado correctamente");
      } else {
        console.error("Error al guardar usuario");
      }
    } catch (error) {
      console.error("Error en el fetch: ", error);
    }
}

async function loginUser(loginData) {
    // Envío del objeto loginData a la API para realizar el inicio de sesión
    try {
      const response = await fetch("", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
      if (response.ok) {
        console.log("Inicio de sesión exitoso");
        const dataAuth = await response.json();
        authToken = dataAuth.data.token; // Obtener el token y guardarlo en la variable global
        console.log(dataAuth.data.token)
      } else {
        console.error("Error en el inicio de sesión");
      }
    } catch (error) {
      console.error("Error en el fetch: ", error);
    }
}

async function registerAlarmaFire(alarmaData) {
    let dataFire = {
      fire_co: alarmaData,
      temperatura: alarmaData
    }
    // Envío del objeto sensorData a la API para registrar datos
    try {
      const response = await fetch("", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataFire),
      });
      if (response.ok) {
        console.log("Datos del sensor registrados correctamente");
      } else {
        console.error("Error al registrar datos del sensor");
      }
    } catch (error) {
      console.error("Error en el fetch: ", error);
    }
}

connect();