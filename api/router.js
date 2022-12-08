let multer = require("multer");
let router = require("express").Router();
let emp = require("./controllers/emp");

const excelFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("excel") ||
    file.mimetype.includes("spreadsheetml")
  ) {
    cb(null, true);
  } else {
    cb("Please upload only excel file.", false);
  }
};

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/home/parvezpathan/Documents/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const uploadFile = multer({ storage: storage, fileFilter: excelFilter });

router.post("/upload", uploadFile.single("file"), emp.uploadData);
router.get("/download", emp.downloadData);

module.exports = router;
