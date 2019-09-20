// for express server
const express = require("express");
const app = express();
// Read and write files
const fs = require("fs");
// Upload all the files to server
const multer = require("multer");
// extract text from image
const { TesseractWorker } = require("tesseract.js");
const worker = new TesseractWorker();

const store = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: store }).single("avatar");

// setting the page
app.set("view engine", "ejs");
app.use(express.static("public"));

// routes
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", (req, res) => {
  upload(req, res, err => {
    fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
      if (err) return console.log("Error ===> ", err);

      worker
        .recognize(data, "eng", { tessjs_create_pdf: "1" })
        .progress(progress => {
          console.log("progress ===> ", progress);
        })
        .then(result => {
          // redirecting to download
          res.redirect("/download");
        })
        .finally(() => {
          worker.terminate();
        });
    });
  });
});

app.get("/download", (req, res) => {
  // created pdf is downloaded here
  const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
  res.download(file);
});

// startup the server
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log(`listening to the port: ${PORT}`));
