const SHEET_NAME = "Enrollments";

// Google Drive folder ID
const FOLDER_ID = "1Kr5dRFU9uzpR8fisa2aO5cBo_h0qFDYb";


function doPost(e) {

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No data received.");
    }

    const data = JSON.parse(e.postData.contents);
    const getValue = function (keys) {
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        const value = data[key];
        if (value !== undefined && value !== null && String(value).trim() !== "") {
          return value;
        }
      }
      return "";
    };

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error("Sheet '" + SHEET_NAME + "' was not found.");
    }

    const lrn = String(getValue(["LRN", "lrn"]) || "").trim();
    const firstName = String(getValue(["FirstName", "firstName", "first_name"]) || "").trim();
    const lastName = String(getValue(["LastName", "lastName", "last_name"]) || "").trim();
    const classCode = String(getValue(["Classcode", "classCode", "classcode"]) || "").trim();

    if (!lrn) {
      throw new Error("LRN is required.");
    }

    if (!firstName) {
      throw new Error("First Name is required.");
    }

    if (!lastName) {
      throw new Error("Last Name is required.");
    }

    let pictureUrl = "";
    let pictureName = "";

    if (data.picture) {
      const base64Data = String(data.picture).split(",")[1];

      if (!base64Data) {
        throw new Error("Invalid picture data.");
      }

      const decodedData = Utilities.base64Decode(base64Data);
      const blob = Utilities.newBlob(
        decodedData,
        data.pictureType || "image/jpeg",
        data.pictureName || "student_picture.jpg"
      );

      const folder = DriveApp.getFolderById(FOLDER_ID);
      const timestamp = new Date().getTime();

      pictureName = timestamp + "_" + (data.pictureName || "student_picture.jpg");
      blob.setName(pictureName);

      const file = folder.createFile(blob);
      pictureUrl = file.getUrl();
    }

    sheet.appendRow([
      new Date(),
      lrn,
      firstName,
      getValue(["MiddleName", "middleName", "middle_name"]) || "",
      lastName,
      getValue(["gender"]) || "",
      getValue(["term"]) || "",
      classCode,
      getValue(["section"]) || "",
      getValue(["birthday"]) || "",
      getValue(["adviser"]) || "",
      pictureName,
      pictureUrl
    ]);

    return ContentService
      .createTextOutput(
        JSON.stringify({
          success: true,
          message: "Enrollment submitted successfully!"
        })
      )
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(
        JSON.stringify({
          success: false,
          message: error.message
        })
      )
      .setMimeType(ContentService.MimeType.JSON);
  }
}