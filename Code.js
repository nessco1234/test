function doGet(e) {
  if (e.parameter.page) {
    var pageName = e.parameter.page.trim().toLowerCase();
    if (pageName !== "home") {
      var template = HtmlService.createTemplateFromFile(pageName);
         template.url = getPageUrl();
      return template.evaluate();
    } else {
      return homePage();
    }
  } else {
    return homePage();
  }
 
}

function checkLogin(username, password) {
  var ss = SpreadsheetApp.openById("1HxsRC7DZt5pi-CoDKjEfbwAniR6GkWiQCoZH8n7aaFw");
  var webAppSheet = ss.getSheetByName("login");
  var getLastRow = webAppSheet.getLastRow();
  var found_record = '';
  for (var i = 1; i <= getLastRow; i++) {
    if (webAppSheet.getRange(i, 1).getValue().toUpperCase() == username.toUpperCase() &&
      webAppSheet.getRange(i, 2).getValue().toUpperCase() == password.toUpperCase()) {
      found_record = 'TRUE';
      var newSheet = ss.getSheetByName("Logins");
      var lastRow = newSheet.getLastRow();
      var usernameCheck = newSheet.getRange(lastRow,1).getValue();
      var randomNum = getRandomNum();
      if(usernameCheck == username){
        newSheet.getRange(lastRow, 2).setValue(new Date());
        newSheet.getRange(lastRow, 3).setValue(randomNum);
      }else{
        newSheet.appendRow([username, new Date(),randomNum]);
      }
      return {status: true, token: randomNum};
    }
  }
  if (found_record === '') {
    return {status: false, token: null};
  }
}

function getRandomNum(){
  return Math.round(Math.random()*100000000);
}

function saveData(obj) {
  var folder = DriveApp.getFolderById("12JeeT3Gsa06XqhytzExpVIWT0iFnkmPG");
  var ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('state');
  var file;
  var rowData = [
    ws.getRange("G2").getValue(),
    obj.input2,
    obj.input3,
    obj.input4,
    obj.input5,
    obj.input6,
    obj.input7,
    obj.input8,
    obj.input9,
    obj.input10,
    obj.input11,
    obj.input12
  ];

  if (obj.uploadFile) {
    Object.keys(obj.uploadFile).forEach(key => {
      Logger.log(key)
      let files = obj.uploadFile[key]
      let datafile = Utilities.base64Decode(files.data)
      let blob = Utilities.newBlob(datafile, files.type, files.name);
      file = folder.createFile(blob).getUrl()
      rowData.push(file);
    })
  }
  console.log(rowData);
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('data').appendRow(rowData);
  return true;
}

function homePage() {
  var pages = ["create", "edit", "search","contact","logout"];
  var urls = pages.map(function (name) {
    return getPageUrl(name);
  });
  var template = HtmlService.createTemplateFromFile("home");
  template.urls = urls;
  return template.evaluate();
}

function getPageUrl(name) {
  if (name) {
    var url = ScriptApp.getService().getUrl();
    return url + "?page=" + name;
  } else {
    return ScriptApp.getService().getUrl();
  }
}

function getData() {
  var spreadSheetId = "1HxsRC7DZt5pi-CoDKjEfbwAniR6GkWiQCoZH8n7aaFw"; //CHANGE
  var dataRange = "data!A2:L"; //CHANGE

  var range = Sheets.Spreadsheets.Values.get(spreadSheetId, dataRange);
  var values = range.values;

  return values;
}

/* DEFINE GLOBAL VARIABLES, CHANGE THESE VARIABLES TO MATCH WITH YOUR SHEET */
function globalVariables() {
  var varArray = {
    spreadsheetId: '1HxsRC7DZt5pi-CoDKjEfbwAniR6GkWiQCoZH8n7aaFw', //** CHANGE !!!
    dataRage: 'data!A2:L',                                    //** CHANGE !!!
    idRange: 'data!A2:A',                                    //** CHANGE !!!
    lastCol: 'L',                                            //** CHANGE !!!
    insertRange: 'data!A1:L1',                                   //** CHANGE !!!
    sheetID: '0'                                            //** CHANGE !!! Ref:https://developers.google.com/sheets/api/guides/concepts#sheet_id
  };
  return varArray;
}

/* PROCESS FORM */
function processForm(formObject) {
  if (formObject.id && checkID(formObject.id)) {//Execute if form passes an ID and if is an existing ID
    updateData(getFormValues(formObject), globalVariables().spreadsheetId, getRangeByID(formObject.id)); // Update Data
  } else { //Execute if form does not pass an ID
    appendData(getFormValues(formObject), globalVariables().spreadsheetId, globalVariables().insertRange); //Append Form Data
  }
  return getLastTenRows();//Return last 10 rows
}

/* GET FORM VALUES AS AN ARRAY */
function getFormValues(formObject) {
  /* ADD OR REMOVE VARIABLES ACCORDING TO YOUR FORM*/
  if (formObject.id && checkID(formObject.id)) {
    var values = [[formObject.id,
    formObject.empid,
    formObject.cname,
    formObject.email,
    formObject.phone1,
    formObject.phone2,
    formObject.phone3,
    formObject.phone4,
    formObject.street,
    formObject.city,
    formObject.state,
    formObject.zip]];
  } else {
    var values = [[formObject.id,
    formObject.empid,
    formObject.cname,
    formObject.email,
    formObject.phone1,
    formObject.phone2,
    formObject.phone3,
    formObject.phone4,
    formObject.street,
    formObject.city,
    formObject.state,
    formObject.zip]];
  }
  return values;
}

/* READ DATA */
function readData(spreadsheetId, range) {
  var result = Sheets.Spreadsheets.Values.get(spreadsheetId, range);
  return result.values;
}

/* UPDATE DATA */
function updateData(values, spreadsheetId, range) {
  var valueRange = Sheets.newValueRange();
  valueRange.values = values;
  var result = Sheets.Spreadsheets.Values.update(valueRange, spreadsheetId, range, {
    valueInputOption: "RAW"
  });
}

/* CHECK FOR EXISTING ID, RETURN BOOLEAN */
function checkID(ID) {
  var idList = readData(globalVariables().spreadsheetId, globalVariables().idRange,).reduce(function (a, b) { return a.concat(b); });
  return idList.includes(ID);
}

/* GET DATA RANGE A1 NOTATION FOR GIVEN ID */
function getRangeByID(id) {
  if (id) {
    var idList = readData(globalVariables().spreadsheetId, globalVariables().idRange);
    for (var i = 0; i < idList.length; i++) {
      if (id == idList[i][0]) {
        return 'data!A' + (i + 2) + ':' + globalVariables().lastCol + (i + 2);
      }
    }
  }
}


/* GET RECORD BY ID */
function getRecordById(id) {
  if (id && checkID(id)) {
    var result = readData(globalVariables().spreadsheetId, getRangeByID(id));
    return result;
  }
}


/* GET ROW NUMBER FOR GIVEN ID */
function getRowIndexByID(id) {
  if (id) {
    var idList = readData(globalVariables().spreadsheetId, globalVariables().idRange);
    for (var i = 0; i < idList.length; i++) {
      if (id == idList[i][0]) {
        var rowIndex = parseInt(i + 1);
        return rowIndex;
      }
    }
  }
}


/*GET LAST 10 RECORDS */
function getLastTenRows() {
  var lastRow = readData(globalVariables().spreadsheetId, globalVariables().dataRage).length + 1;
  if (lastRow <= 11) {
    var range = globalVariables().dataRage;
  } else {
    var range = 'data!A' + (lastRow - 9) + ':' + globalVariables().lastCol;
  }
  var lastTenRows = readData(globalVariables().spreadsheetId, range);
  return lastTenRows;
}

/* GET ALL RECORDS */
function getAllData() {
  var data = readData(globalVariables().spreadsheetId, globalVariables().dataRage);
  return data;
}

/*GET DROPDOWN LIST */
function getDropdownList(range) {
  var list = readData(globalVariables().spreadsheetId, range);
  return list;
}

function test() {
  Logger.log(ScriptApp.getService().getUrl());
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
    .getContent();
}