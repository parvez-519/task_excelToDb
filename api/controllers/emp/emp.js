const appConst = require("../../constants");
let db = require("../../../db");
let empRepo = require("../../entities/emp");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const uploadData = async (req, res) => {
  try {
    // TRANSACTION
    const trans = await db.transaction();

    if (req.file == undefined) {
      return res.status(400).send("Please upload an excel file!");
    }
    let path = req.file.path;
    let arrayData = [];
    let isEmpty = false;
    let notString = false;
    let notNumber = false;
    let diffColLength = false;
    let isNull = false;
    let rowsNum = 0;
    var alphabets = /^[A-Za-z]*$/;

    readXlsxFile(path).then((rows) => {
      // SKIP HEADER
      rows.shift();
      for (let row of rows) {
        rowsNum++;

        let arr = {
          name: row[0],
          age: row[1],
        };
        var size = Object.keys(arr).length;
        // HEADERS VALIDATION FOR SAME COLUMN SIZE
        if (size != row.length) {
          diffColLength = true;
          res.status(400).json({
            status: appConst.status.fail,
            response: null,
            message: `Failed ! Headers columns lengths are invalid`,
          });
          break;
        }
        // CHECKING FOR ANY EMPTY CELL
        if (row[0] === null) {
          isNull = true;
          res.status(400).json({
            status: appConst.status.fail,
            response: null,
            message: `Failed ! empty cell at row ${rowsNum} and column 1`,
          });
          break;
        }
        // IF NO EMPTY CELL THEN PERFORM REGEX OPERATION FOR STRING VALIDATION ON NAME COLUMN
        else if (!row[0].match(alphabets)) {
          notString = true;
          res.status(400).json({
            status: appConst.status.fail,
            response: null,
            message: `Failed ! Not string at row ${rowsNum} column 1`,
          });
          break;
        }
        // CHECKING FOR NUMBER VALIDATION ON AGE COLUMN
        if (typeof row[1] != "number" && isNull === false) {
          notNumber = true;
          res.status(400).json({
            status: appConst.status.fail,
            response: null,
            message: `Failed ! Not number at row ${rowsNum} column 2`,
          });
          break;
        }
        arrayData.push(arr);
      }
      // AFTER CHECKING ABOVE ALL SCENERIO SAVE THE DATA TO DB
      if (
        isEmpty === false &&
        notString != true &&
        notNumber != true &&
        diffColLength != true &&
        isNull === false
      ) {
        empRepo.bulkCreate(arrayData, {
          transaction: trans,
        });
        trans.commit();
        res.status(200).json({
          status: appConst.status.success,
          response: arrayData,
          message: "Uploaded the file successfully: " + req.file.originalname,
        });
      }
    });
  } catch (err) {
    await trans.rollback();
    res.status(400).json({
      status: appConst.status.fail,
      response: null,
      message: "Fail to import data into database!",
      error: err.message,
    });
  }
};

const downloadData = async (req, res) => {
  try {
    // COUNT TATAL NUMBER OF RECORDS IN DB
    const totalRocordsCount = await empRepo.count();

    // SUM OF AGE DATA IN DB
    const totalSum = await empRepo.sum("age");

    // CALCULATING AVERAGE AGE
    const averageAge = totalSum / totalRocordsCount;

    // CONVERTING TO PDF USING PDFKIT PACKAGE
    let pdfDoc = new PDFDocument();
    pdfDoc.pipe(fs.createWriteStream("SampleDocument.pdf"));
    pdfDoc.text(
      "Total Rocords in Database is: " +
        totalRocordsCount +
        " \nAverage of age is: " +
        averageAge
    );
    pdfDoc.end();

    res.status(200).json({
      status: appConst.status.success,
      response: { TotalRocords: totalRocordsCount, AverageAge: averageAge },
      message: "Successfully Created PDF",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: appConst.status.fail,
      response: null,
      message: "Failed to Created PDF",
      error: err.message,
    });
  }
};
module.exports = { uploadData, downloadData };
