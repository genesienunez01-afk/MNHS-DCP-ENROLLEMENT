// ===============================
// CONFIGURATION
// ===============================

// Google Sheet tab name
const SHEET_NAME = "Enrollments";

// Google Drive folder ID
const FOLDER_ID = "YOUR_GOOGLE_DRIVE_FOLDER_ID";


// ===============================
// POST REQUEST
// ===============================

function doPost(e) {

  try {

    // Check if data was received
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse(false, "No data received.");
    }

    // Parse JSON
    const data = JSON.parse(e.postData.contents);


    // ===============================
    // VALIDATE REQUIRED DATA
    // ===============================

    if (!data.LRN) {
      return jsonResponse(false, "LRN is required.");
    }

    if (!data.FirstName) {
      return jsonResponse(false, "First Name is required.");
    }

    if (!data.LastName) {
      return jsonResponse(false, "Last Name is required.");
    }

    if (!data.picture) {
      return jsonResponse(false, "Picture is required.");
    }


    // ===============================
    // OPEN GOOGLE SHEET
    // ===============================

    const sheet =
      SpreadsheetApp.getActiveSpreadsheet()
        .getSheetByName(SHEET_NAME);


    if (!sheet) {
      return jsonResponse(
        false,
        "Sheet '" + SHEET_NAME + "' was not found."
      );
    }


    // ===============================
    // CHECK DUPLICATE LRN
    // ===============================

    const lastRow = sheet.getLastRow();

    if (lastRow > 1) {

      const lrnValues =
        sheet
          .getRange(2, 1, lastRow - 1, 1)
          .getValues();

      for (let i = 0; i < lrnValues.length; i++) {

        const existingLRN =
          String(lrnValues[i][0]).trim();

        if (
          existingLRN ===
          String(data.LRN).trim()
        ) {

          return jsonResponse(
            false,
            "This LRN is already registered."
          );

        }

      }

    }


    // ===============================
    // UPLOAD PICTURE
    // ===============================

    const folder =
      DriveApp.getFolderById(FOLDER_ID);


    // Remove Base64 header
    const base64Data =
      data.picture.split(",")[1];


    if (!base64Data) {
      return jsonResponse(
        false,
        "Invalid picture data."
      );
    }


    // Convert Base64 to Blob
    const decoded =
      Utilities.base64Decode(base64Data);


    const blob =
      Utilities.newBlob(
        decoded,
        data.pictureType || "image/jpeg",
        data.pictureName || "student_picture.jpg"
      );


    // Create unique filename
    const timestamp =
      Utilities.formatDate(
        new Date(),
        Session.getScriptTimeZone(),
        "yyyyMMdd_HHmmss"
      );


    const fileName =
      data.LRN +
      "_" +
      data.LastName +
      "_" +
      timestamp +
      "_" +
      (data.pictureName || "picture.jpg");


    blob.setName(fileName);


    // Upload to Google Drive
    const file =
      folder.createFile(blob);


    // Picture URL
    const pictureURL =
      file.getUrl();


    // ===============================
    // SAVE TO GOOGLE SHEET
    // ===============================

    sheet.appendRow([

      data.LRN,

      data.FirstName,

      data.MiddleName,

      data.LastName,

      data.gender,

      data.term,

      data.Classcode,

      data.section,

      data.birthday,

      data.adviser,

      pictureURL,

      new Date()

    ]);


    // ===============================
    // SUCCESS RESPONSE
    // ===============================

    return jsonResponse(
      true,
      "Enrollment submitted successfully!"
    );


  } catch (error) {

    console.error(error);

    return jsonResponse(
      false,
      error.message
    );

  }

}


// ===============================
// JSON RESPONSE
// ===============================

function jsonResponse(success, message) {

  return ContentService
    .createTextOutput(
      JSON.stringify({

        success: success,

        message: message

      })
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );

}