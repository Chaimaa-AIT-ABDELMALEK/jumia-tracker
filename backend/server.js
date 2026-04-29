const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "root",
  database: "jumia_tracker",
});

// 📊 snapshot (latest prices)
app.get("/snapshot", (req, res) => {
  const sql = `
    SELECT p.id, p.name, pr.price
    FROM products p
    JOIN prices pr ON pr.product_id = p.id
    WHERE pr.date = (
      SELECT MAX(date)
      FROM prices
      WHERE product_id = p.id
    )
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result || []);
  });
});

app.listen(5000, () => {
  console.log("API running ✔");
});