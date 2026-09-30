const SHEET_NAME = "Enrollments";

// Google Drive folder ID
const FOLDER_ID = "1Kr5dRFU9uzpR8fisa2aO5cBo_h0qFDYb";


function doPost(e) {

  try {

    // Check if data was received
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No data received.");
    }


    // Parse JSON
    const data = JSON.parse(e.postData.contents);


    // Get spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    const sheet = spreadsheet.getSheetByName(SHEET_NAME);


    if (!sheet) {
      throw new Error(
        "Sheet '" + SHEET_NAME + "' was not found."
      );
    }


    // Check required fields
    if (!data.LRN) {
      throw new Error("LRN is required.");
    }

    if (!data.FirstName) {
      throw new Error("First Name is required.");
    }

    if (!data.LastName) {
      throw new Error("Last Name is required.");
    }


    // =========================
    // SAVE PICTURE TO DRIVE
    // =========================

    let pictureUrl = "";
    let pictureName = "";


    if (data.picture) {

      // Remove Base64 header
      const base64Data = data.picture.split(",")[1];

      if (!base64Data) {
        throw new Error("Invalid picture data.");
      }


      // Decode Base64
      const decodedData = Utilities.base64Decode(base64Data);


      // Create blob
      const blob = Utilities.newBlob(
        decodedData,
        data.pictureType || "image/jpeg",
        data.pictureName || "student_picture.jpg"
      );


      // Get Drive folder
      const folder = DriveApp.getFolderById(FOLDER_ID);


      // Create unique file name
      const timestamp = new Date().getTime();

      pictureName =
        timestamp + "_" +
        (data.pictureName || "student_picture.jpg");


      blob.setName(pictureName);


      // Save file
      const file = folder.createFile(blob);


      // Get file URL
      pictureUrl = file.getUrl();

    }


    // =========================
    // SAVE DATA TO SHEET
    // =========================

    sheet.appendRow([

      new Date(),

      data.LRN || "",

      data.FirstName || "",

      data.MiddleName || "",

      data.LastName || "",

      data.gender || "",

      data.term || "",

      data.section || "",

      data.birthday || "",

      data.adviser || "",

      pictureName,

      pictureUrl

    ]);


    // =========================
    // SEND SUCCESS RESPONSE
    // =========================

    return ContentService

      .createTextOutput(
        JSON.stringify({
          success: true,
          message: "Enrollment submitted successfully!"
        })
      )

      .setMimeType(ContentService.MimeType.JSON);


  } catch (error) {


    // =========================
    // SEND ERROR RESPONSE
    // =========================

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