import { createConnection } from "mysql";
const mysqlConnection = createConnection({
  host: "localhost",
  user: "root",
  password: "root1234",
  database: "ItsMyLunch",
  multipleStatements: true,
});

mysqlConnection.connect((err) => {
  if (err) {
    // console.log(err);
    console.log("Failed to Connect to DB");
    return;
  }
  console.log("DB Connected");
});

export default mysqlConnection;
