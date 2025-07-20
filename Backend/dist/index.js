"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// call the function of express
const app = (0, express_1.default)();
// Port 
const Port = process.env.PORT;
app.get("/", (req, res) => {
    return res.send("hello sever is running");
});
app.listen(Port, () => {
    console.log(`server run on the port http://localhost:${Port}`);
});
