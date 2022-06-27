import express from "express";
import DishRoutes from "./routes/dishes.js";
import cors from "cors";
const app = express();
const PORT = 5000;
app.use(express.json());
app.use("/dishes", DishRoutes);
app.use(cors());
app.get("/", (req, res) => {
  res.status(307).redirect("/dishes");
});
// Listen on port 3000
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
