const mysql = require("mysql2");

const connection = mysql.createConnection({
  host:'sql12.freesqldatabase.com',
  user:'sql12754279',
  database:'sql12754279', // Replace with your actual database name
  password:'CsvhJz52nx', // Replace with your actual password
  port: 3306,
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database.");

  const deleteUserQuery = `DELETE FROM user WHERE username = 'garimasingh2025';`;
  connection.query(deleteUserQuery, (err, results) => {
    if (err) {
      console.error('Error running the query:', err);
      return;
    }
    console.log('User deleted successfully:', results);
  });
});
