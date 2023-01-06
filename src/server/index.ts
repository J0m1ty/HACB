import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";

const app = express();
const port = 3000;

const server = createServer(app);

export const io = new Server(server);

io.on('connection', (socket) => {
    console.log(`A user connected with id ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`A user disconnected`);
    });
});

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

server.listen(port, () => {
    console.log(`Server started on port *:${port}`)
});