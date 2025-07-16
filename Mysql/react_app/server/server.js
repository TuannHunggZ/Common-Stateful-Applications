const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 5000;

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

const cluster = mysql.createPoolCluster();

cluster.add('MASTER', {
  host: "host.docker.internal",
  port: 3307,
  user: "root",
  password: "123456789",
  database: "students",
  waitForConnections: true
});

cluster.add('SLAVE1', {
  host: "host.docker.internal",
  port: 3308,
  user: "root",
  password: "123456789",
  database: "students",
  waitForConnections: true
});

cluster.add('SLAVE2', {
  host: "host.docker.internal",
  port: 3309,
  user: "root",
  password: "123456789",
  database: "students",
  waitForConnections: true
});

async function testConnection(name) {
  try {
    const conn = await cluster.getConnection(name);
    await conn.ping();
    conn.release();
    console.log(`✅ Connection to ${name} successful.`);
  } catch (err) {
    console.error(`❌ Failed to connect to ${name}:`);
    console.error(err);
  }
}

(async () => {
  await testConnection('MASTER');
  await testConnection('SLAVE1');
  await testConnection('SLAVE2');

  try {
    const conn = await cluster.getConnection('MASTER');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS student_details (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        email VARCHAR(50) NOT NULL,
        age INT(3) NOT NULL,
        gender VARCHAR(10) NOT NULL,
        PRIMARY KEY (id)
      )
    `;
    await conn.query(createTableQuery);
    conn.release();
    console.log("✅ Table 'student_details' is ready.");
  } catch (err) {
    console.error("❌ Error setting up table:", err.message);
    process.exit(1);
  }
})();

// API: Thêm sinh viên (ghi → master)
app.post("/api/add_user", async (req, res) => {
  const { name, email, age, gender } = req.body;
  try {
    const conn = await cluster.getConnection('MASTER');
    const sql = `
      INSERT INTO student_details (name, email, age, gender)
      VALUES (?, ?, ?, ?)
    `;
    await conn.query(sql, [name, email, age, gender]);
    conn.release();
    res.json({ success: "Student added successfully." });
  } catch (err) {
    console.error("❌ Error inserting user:", err.message);
    res.status(500).json({ message: "An unexpected error occurred." });
  }
});

// API: Lấy tất cả sinh viên (đọc → slave)
app.get("/api/students", async (req, res) => {
  try {
    const conn = await cluster.getConnection('SLAVE*');
    const [rows] = await conn.query("SELECT * FROM student_details");
    conn.release();
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching students:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// API: Lấy 1 sinh viên theo ID (đọc → slave)
app.get("/api/get_student/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const conn = await cluster.getConnection('SLAVE*');
    const [rows] = await conn.query("SELECT * FROM student_details WHERE id = ?", [id]);
    conn.release();
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching student:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// API: Sửa sinh viên (ghi → master)
app.post("/api/edit_user/:id", async (req, res) => {
  const id = req.params.id;
  const { name, email, age, gender } = req.body;
  try {
    const conn = await cluster.getConnection('MASTER');
    const sql = `
      UPDATE student_details 
      SET name = ?, email = ?, age = ?, gender = ? 
      WHERE id = ?
    `;
    await conn.query(sql, [name, email, age, gender, id]);
    conn.release();
    res.json({ success: "Student updated successfully." });
  } catch (err) {
    console.error("❌ Error updating user:", err.message);
    res.status(500).json({ message: "An unexpected error occurred." });
  }
});

// API: Xóa sinh viên (ghi → master)
app.delete("/api/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const conn = await cluster.getConnection('MASTER');
    await conn.query("DELETE FROM student_details WHERE id = ?", [id]);
    conn.release();
    res.json({ success: "Student deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting user:", err.message);
    res.status(500).json({ message: "An unexpected error occurred." });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
