import app from "./app.js"
import { createServer } from "http";
import { initializSocketServer } from "./src/sockets/socket.js";
const server = createServer(app);

initializSocketServer(server);
server.listen(process.env.PORT , ()=>{`Server is runnong on port: ${process.env.PORT}`});