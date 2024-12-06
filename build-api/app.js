import express from "express";
import fs from "fs";
import morgan from "morgan";
import { productsRouter } from "./routes/productsRouter.js";
export const app = express();
const data = fs.readFileSync("./data.json", "utf-8");
const dataObj = JSON.parse(data);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// 1) MIDDLEWARES
/*runs before every request */
app.use(express.json());
app.use((req, res, next) => {
  console.log("Hello from the middleware 👋");

  req.requestTime = new Date().toISOString();
  next();
});

// example on routes
/*specify the route then based on that route execute the callback */
app.get("/fighters", (req, res) => {
  //   res.status(200).send("hello world");
  console.log(req.requestTime);
  res.status(200).json({ message: "hello world", data: { dataObj }, time: req.requestTime });
});

// 3) ROUTES
// ربط الـ router بمسار محدد
app.use("/products", productsRouter);
