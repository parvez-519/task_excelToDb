const appConst = require("../../constants");
let db = require("../../../db");
let empRepo = require("../../entities/emp");
const readXlsxFile = require("read-excel-file/node");

const uploadData = async (req, res) => {
  try {
    if (req.file == undefined) {
      return res.status(400).send("Please upload an excel file!");
    }
    let path = "../../" + req.file.originalname;

    let arrayData = [];
    let isEmpty = false;
    let notString = false;
    let notNumber = false;
    let diffColLength = false;
    let isNull = false;
    let rowsNum = 0;
    let cellNum = 1;
    var alphabets = /^[A-Za-z]*$/;

    readXlsxFile(path).then((rows) => {
      // skip header
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
          console.log("------inside size---------");
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
          console.log("------inside row---------");
          isNull = true;
          res.status(400).json({
            status: appConst.status.fail,
            response: null,
            message: `Failed ! empty cell at row ${rowsNum} and column 1`,
          });
          console.log("------inside row 222---------");

          break;
        }
        // IF NO EMPTY CELL THEN PERFORM REGEX OPERATION FOR STRING VALIDATION ON NAME COLUMN
         else if (!row[0].match(alphabets)) {
          console.log("------inside row else---------");

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
          console.log("------inside typeof ---------");

          notNumber = true;
          res.status(400).json({
            status: appConst.status.fail,
            response: null,
            message: `Failed ! Not number at row ${rowsNum} column 2`,
          });
          break;
        }
        
        // if (notString != true && notNumber != true && diffColLength!=true) {
        //   for (let cell of row) {
        //     if (cell === null) {
        //       cellNum++;
        //       isEmpty = true;
        //       res.status(400).json({
        //         status: appConst.status.fail,
        //         response: { rowNum: rowsNum, cellNum: cellNum },
        //         message: "Failed ! All rows required",
        //       });
        //     }
        //   }
        // }

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
        empRepo.bulkCreate(arrayData);
        res.status(200).json({
          status: appConst.status.success,
          response: arrayData,
          message: "Uploaded the file successfully: " + req.file.originalname,
        });
      }
    });
  } catch (err) {
    console.log(err);
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
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: appConst.status.fail,
      response: null,
      message: "Fail to create pdf",
      error: err.message,
    });
  }
};
module.exports = { uploadData, downloadData };
