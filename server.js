import app from "./app.js"
import { createServer } from "http";
import { initializSocketServer } from "./src/sockets/socket.js";
import { connectToRabbitMQ } from "./src/config/rabbitmq.js";
const server = createServer(app);
//RabbitMQ initialization
connectToRabbitMQ().then(() => {
  console.log("RabbitMQ is ready");
}).catch((error) => {
  console.error("Failed to initialize RabbitMQ:", error);
  process.exit(1); // Exit if RabbitMQ fails to initialize
});

//socket initialization
initializSocketServer(server);
server.listen(process.env.PORT , ()=>{`Server is runnong on port: ${process.env.PORT}`});