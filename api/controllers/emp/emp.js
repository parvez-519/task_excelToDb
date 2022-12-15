const appConst = require("../../constants");
let db = require("../../../db");
let empRepo = require("../../entities/emp");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const axios = require("axios");
const uploadData = async (req, res) => {
  try {
    if (req.file == undefined) {
      return res.status(400).send("Please upload an excel file!");
    }
    let path = req.file.path;
    let arrayData = [];
    let rowsNum = 0;
    var alphabets = /^[A-Za-z]*$/;
    const errMsg = [];

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
          errMsg.push({
            message: `Failed ! Headers columns lengths are invalid`,
          });
        }
        // CHECKING FOR ANY EMPTY ROWS
        if (row[0] === null && row[1] === null) {
          continue;
        }
        // CHECKING FOR ANY EMPTY CELL
        if (row[0] === null) {
          errMsg.push({
            message: `Failed ! empty cell at row ${rowsNum} and column 1`,
          });
        }
        // IF NO EMPTY CELL THEN PERFORM REGEX OPERATION FOR STRING VALIDATION ON NAME COLUMN
        else if (!row[0].match(alphabets)) {
          errMsg.push({
            message: `Failed ! Not string at row ${rowsNum} column 1`,
          });
        }
        // CHECKING FOR NUMBER VALIDATION ON AGE COLUMN
        if (typeof row[1] != "number") {
          errMsg.push({
            message: `Failed ! Not number at row ${rowsNum} column 2`,
          });
        }
        arrayData.push(arr);
      }
      // AFTER CHECKING ABOVE ALL SCENERIO SAVE THE DATA TO DB
      if (errMsg.length === 0) {
        empRepo.bulkCreate(arrayData);

        const resp = axios({
          method: "get",
          url: "http://localhost:4000/download",
          response: res.status(200).json({
            status: appConst.status.success,
            response: null,
            message: "Successfully Created PDF",
          }),
        });
      } else {
        res.status(400).json({
          status: appConst.status.fail,
          response: errMsg,
          message: null,
        });
      }
    });
  } catch (err) {
    res.status(400).json({
      status: appConst.status.fail,
      response: null,
      message: "Fail to import data into database!",
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
    res.status(400).json({
      status: appConst.status.fail,
      response: null,
      message: "Failed to Created PDF",
    });
  }
};
module.exports = { uploadData, downloadData };
