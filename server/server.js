const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const port = 5050;

app.use(bodyParser.json());

const corsOptions = {
  origin: "*",
  credential: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.get("/pastMemo", (req, res) => {
  try {
    const data = fs.readFileSync("./data/pastMemo.json", "utf-8");
    console.log(data + "데이터 출력");

    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/pastMemo", (req, res) => {
  try {
    console.log("데이터 받음");
    const updatedData = req.body;

    fs.writeFileSync(
      "./data/pastMemo.json",
      JSON.stringify(updatedData, null, 2)
    );

    res.json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://127.0.0.1:${port}`);
});
