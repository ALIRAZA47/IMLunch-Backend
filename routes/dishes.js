import express from "express";
import SQLConnection from "../db/connection.js";
import cors from "cors";
const router = express.Router();
router.use(express.json());
router.use(cors());
// get all dishes
router.get("/", (req, res) => {
  console.log(req.query);
  const q =
    req.query.pageSize && req.query.page
      ? `SELECT * FROM dishes LIMIT ${--req.query.page * req.query.pageSize}, ${
          req.query.pageSize
        }`
      : "SELECT * FROM dishes";
  SQLConnection.query(q, (err, rows, fields) => {
    if (!err) {
      if (rows.length > 0) {
        console.log("No Error");
        res.status(200).json({
          error: false,
          message: "Successfully retrieved data",
          data: rows,
        });
      } else {
        if (req.query)
          res.status(404).send({ error: true, message: "Page out of range" });
        else res.status(204).json({ error: true, message: "No Data" });
      }
    } else {
      res
        .status(500)
        .json({ error: true, message: `DB ERROR: {err.sqlMessage}` });
      return;
    }
  });
});

// get dishes by week
router.get("/week-:week", (req, res) => {
  const week = req.params.week;
  console.log(req.params);
  const q =
    req.query.pageSize && req.query.page
      ? `SELECT * FROM dishes WHERE week=${week} LIMIT ${
          --req.query.page * req.query.pageSize
        }, ${req.query.pageSize}`
      : `SELECT * FROM dishes WHERE week=${week}`;
  SQLConnection.query(q, (err, rows, fields) => {
    if (!err) {
      if (rows.length > 0) {
        console.log("No Error");
        res.status(200).json({
          error: false,
          message: "Data retrieved successfully",
          data: rows,
        });
      } else {
        if (req.query)
          res
            .status(404)
            .json({ error: true, message: `No Data for Week ${week}` });
      }
    } else {
      res
        .status(500)
        .json({ error: true, message: `DB ERROR: {err.sqlMessage}` });
      return;
    }
  });
});

// get a dish by id
router.get("/dish-:id", (req, res) => {
  //   console.log("by id");
  const id = parseInt(req.params.id);

  if (id) {
    const intID = parseInt(id);
    console.log(intID);
    SQLConnection.query(
      `SELECT * FROM dishes WHERE id = ${id}`,
      (err, rows, fields) => {
        if (!err) {
          if (rows.length > 0) {
            res.status(200).json({
              error: false,
              message: "Data retrieved successfully",
              data: rows[0],
            });
          } else
            res
              .status(404)
              .json({ error: true, message: `Dish with ID ${id} not found` });
        } else {
          res
            .status(500)
            .json({ error: true, message: `DB ERROR: ${err.sqlMessage}` });
          return;
        }
      }
    );
  } else {
    console.log("int re");
    res
      .status(400)
      .json({ error: true, message: "Invalid ID, ID should be an integer" });
    return;
  }
});

// create a dish (POST)
router.post("/create", (req, res) => {
  const dish = req.body;
  if (!dish.name) {
    res.status(400).json({
      error: true,
      message: "Missing required fields (i.e. dish Name is required",
    });
    return;
  } else {
    const q = `INSERT INTO dishes (name, image, week, day) VALUES ('${
      dish.name
    }', '${dish.image || ""}', '${dish.week}', '${dish.day}')`;
    SQLConnection.query(
      "SELECT * from dishes WHERE name = ?",
      [dish.name],
      (err, rows, fields) => {
        if (err)
          res
            .status(500)
            .json({ error: true, message: `DB ERROR: ${err.sqlMessage}` });
        else {
          if (!err && rows.length > 0) {
            let dbObj = rows[0];
            delete dbObj.id;
            if (JSON.stringify(dbObj) === JSON.stringify(dish))
              res
                .status(409)
                .jaon({ error: true, message: "Dish already exists" });
          } else {
            SQLConnection.query(q, (err, rows, fields) => {
              if (!err) {
                res.status(201).json({ error: false, message: "Dish created" });
              } else {
                res.status(500).send({
                  error: true,
                  message: `DB ERROR: ${err.sqlMessage}`,
                });
                return;
              }
            });
          }
        }
      }
    );
  }
});

// update a dish (PUT)
router.put("/update/:id", (req, res) => {
  const id = req.params.id;
  const dish = req.body;
  if (!dish.name) {
    res.status(400).json({
      error: true,
      message: "Missing required fields (i.e. dish name)",
    });
    return;
  } else {
    const q = `UPDATE dishes SET name = '${dish.name}', image = '${
      dish.image || ""
    }', week=${dish.week}, day=${dish.day} WHERE id = ${id}`;
    // check if dish exists
    SQLConnection.query(
      "SELECT * from dishes WHERE id = ?",
      [id],
      (err, rows, fields) => {
        if (err)
          res
            .status(500)
            .json({ error: true, message: `DB ERROR: ${err.sqlMessage}` });
        else if (rows.length === 0)
          res.status(400).json({
            error: true,
            message: `Can't update! Dish with ID ${id} does not exist`,
          });
        else {
          console.log(rows);
          let dbObj = rows[0];
          delete dbObj.id;
          if (JSON.stringify(dbObj) === JSON.stringify(dish))
            res.status(400).json({
              error: true,
              message: "No change (i.e. Same Dish data provided as before)",
            });
          else {
            console.log("update");
            // update dish query
            SQLConnection.query(q, (err, rows, fields) => {
              if (!err) {
                res.status(200).json({ error: false, message: "Dish updated" });
              } else {
                res.status(500).json({
                  error: true,
                  message: `DB ERROR: ${err.sqlMessage}`,
                });
                return;
              }
            });
          }
        }
      }
    );
  }
});

// delete a dish (DELETE)
router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  SQLConnection.query(
    "SELECT * from dishes WHERE id = ?",
    [id],
    (err, rows, fields) => {
      if (err)
        res
          .status(500)
          .json({ error: true, message: `DB ERROR: ${err.sqlMessage}` });
      else if (rows.length === 0)
        res
          .status(400)
          .json({ error: true, message: `Dish with ID ${id} not found` });
      else {
        SQLConnection.query(
          `DELETE FROM dishes WHERE id = ${id}`,
          (err, rows, fields) => {
            if (!err)
              res.status(200).json({ error: false, message: "Dish deleted" });
            else
              res
                .status(500)
                .json({ error: true, message: `DB ERROR: ${err.sqlMessage}` });
          }
        );
      }
    }
  );
});

// invalid route
router.get("*", (req, res) => {
  res.status(404).json({
    error: true,
    message: "Invalid Path - No such route exists",
  });
});

export default router;
