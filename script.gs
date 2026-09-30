// ===============================
// CONFIGURATION
// ===============================

const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
const SHEET_NAME = "Enrollments";

const DRIVE_FOLDER_ID = "YOUR_GOOGLE_DRIVE_FOLDER_ID";


// ===============================
// HANDLE POST REQUEST
// ===============================

function doPost(e) {

  try {

    // Make sure data was received
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No data received.");
    }

    // Parse JSON sent from your website
    const data = JSON.parse(e.postData.contents);


    // ===============================
    // VALIDATE REQUIRED FIELDS
    // ===============================

    if (!data.LRN) {
      throw new Error("LRN is required.");
    }

    if (!data.FirstName) {
      throw new Error("First name is required.");
    }

    if (!data.LastName) {
      throw new Error("Last name is required.");
    }

    if (!data.picture) {
      throw new Error("Picture is required.");
    }


    // ===============================
    // OPEN GOOGLE SHEET
    // ===============================

    const spreadsheet =
      SpreadsheetApp.openById(SPREADSHEET_ID);

    let sheet =
      spreadsheet.getSheetByName(SHEET_NAME);


    // Create sheet if it doesn't exist
    if (!sheet) {

      sheet =
        spreadsheet.insertSheet(SHEET_NAME);

    }


    // ===============================
    // CREATE HEADERS
    // ===============================

    if (sheet.getLastRow() === 0) {

      sheet.appendRow([
        "Timestamp",
        "LRN",
        "First Name",
        "Middle Name",
        "Last Name",
        "Gender",
        "Term",
        "Section",
        "Birthday",
        "Adviser",
        "Picture Name",
        "Picture URL"
      ]);

    }


    // ===============================
    // SAVE PICTURE TO GOOGLE DRIVE
    // ===============================

    const folder =
      DriveApp.getFolderById(DRIVE_FOLDER_ID);


    // Remove the Base64 prefix
    // Example:
    // data:image/jpeg;base64,/9j/4AAQ...
    const base64Data =
      data.picture.split(",")[1];


    // Convert Base64 to bytes
    const bytes =
      Utilities.base64Decode(base64Data);


    // Determine file type
    let mimeType =
      data.pictureType || MimeType.JPEG;


    // Create blob
    const blob =
      Utilities.newBlob(
        bytes,
        mimeType,
        data.pictureName || "student-picture"
      );


    // Create file in Drive
    const file =
      folder.createFile(blob);


    // Picture URL
    const pictureUrl =
      file.getUrl();


    // ===============================
    // SAVE DATA TO GOOGLE SHEETS
    // ===============================

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

      data.pictureName || "",

      pictureUrl

    ]);


    // ===============================
    // SUCCESS RESPONSE
    // ===============================

    return ContentService

      .createTextOutput(
        JSON.stringify({
          success: true,
          message: "Enrollment submitted successfully.",
          pictureUrl: pictureUrl
        })
      )

      .setMimeType(
        ContentService.MimeType.JSON
      );


  } catch (error) {

    // ===============================
    // ERROR RESPONSE
    // ===============================

    return ContentService

      .createTextOutput(
        JSON.stringify({
          success: false,
          message: error.message
        })
      )

      .setMimeType(
        ContentService.MimeType.JSON
      );

  }

}