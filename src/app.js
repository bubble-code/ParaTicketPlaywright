import express from "express";
import path from 'path'
import exphbs from 'express-handlebars'
import morgan from 'morgan'
import {fileURLToPath} from 'url'
import router from "./routes"; 
import routerAverias from './routes/averias';
import routerSalones from './routes/salones';
import routerChecklist from './routes/checklists';
// const path = require("path");
// const exphbs = require("express-handlebars");
// const morgan = require("morgan");

const app = express();

// Settings
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set("port", process.env.PORT || 5500);
// console.log(__dirname );
app.set("views", path.join(__dirname, "views"));
app.engine( 
  ".hbs",
  exphbs.create({
    defaultLayout: "main",
    extname: ".hbs",
  }).engine
);
app.set("view engine", ".hbs");

// // middlewares
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

// // Routes
app.use(express.json());
app.use('/',router);
app.use('/averias',routerAverias);
app.use('/listplayroom',routerSalones);
app.use('/checklist',routerChecklist);

// // Static files
app.use("/public", express.static(path.join(__dirname, "public")));

export { app };
