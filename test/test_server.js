const express = require("express");
const path = require("path");
const fs = require("fs");
const { syncExampleUrls } = require("./public/sync_testing_urls.js");

// Sync example_urls.js from TESTING.md before starting the server.
var result = syncExampleUrls(true);
if (result.success) {
    console.log('example_urls.js synced: ' + result.sections + ' sections, ' + result.entries + ' entries');
} else {
    console.error(result.error);
}

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use("/docs", express.static(path.join(__dirname, "..", "docs")));

app.get("/ping", (req, res) => {
    res.json("pong");
})

app.use(express.json());

app.post("/snapshot", (req, res) => {
    const data = req.body.data;
    const filename = req.body.filename;
    const filepath = path.join(__dirname, "snapshots", filename);
    const updateSnapshots = req.body.updateSnapshots;

    let returnData;
    if (updateSnapshots) {
        fs.writeFileSync(filepath, data);
        returnData = data;
    } else if (fs.existsSync(filepath)) {
        returnData = fs.readFileSync(filepath, "utf8");
    } else {
        returnData = "";
    }
    res.json({
        data: returnData,
    });
})

const port = 5000;
console.log(`Go to: http://localhost:${port}`);
app.listen(port);
