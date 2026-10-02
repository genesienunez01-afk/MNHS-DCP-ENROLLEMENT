const form = document.getElementById("enrollmentForm");
const message = document.getElementById("message");

// Google Apps Script Web App URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyBPdH4AX3ZkGRgCu6VD_NOK2NqxEu_Pu2EuaxPSSWkOkadjSZUZz-mrVyEJ7UrAaHk/exec";

if (form) {
    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const submitButton = form.querySelector('input[type="submit"]');

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.value = "Submitting...";
        }

        message.textContent = "Uploading your enrollment...";

        try {

            // ===============================
            // PICTURE
            // ===============================

            const pictureInput = document.getElementById("picture");

            if (!pictureInput || pictureInput.files.length === 0) {
                throw new Error("Please select a picture.");
            }

            const picture = pictureInput.files[0];

            const base64Picture = await fileToBase64(picture);


            // ===============================
            // FORM DATA
            // ===============================

            const data = {

                picture: base64Picture,

                pictureName: picture.name,

                pictureType: picture.type,

                LRN: document.getElementById("LRN").value.trim(),

                FirstName: document.getElementById("FirstName").value.trim(),

                MiddleName: document.getElementById("MiddleName").value.trim(),

                LastName: document.getElementById("LastName").value.trim(),

                gender: document.getElementById("gender").value,

                term: document.getElementById("term").value,

                section: document.getElementById("section").value.trim(),

                birthday: document.getElementById("birthday").value,

                adviser: document.getElementById("adviser").value.trim()

            };


            // ===============================
            // VALIDATION
            // ===============================

            if (!data.LRN) {
                throw new Error("LRN is required.");
            }

            if (!data.FirstName) {
                throw new Error("First Name is required.");
            }

            if (!data.LastName) {
                throw new Error("Last Name is required.");
            }


            // ===============================
            // DEBUG
            // ===============================

            console.log("Enrollment Data:", data);


            // ===============================
            // SEND TO GOOGLE APPS SCRIPT
            // ===============================

            const response = await fetch(SCRIPT_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },

                body: JSON.stringify(data)

            });


            // ===============================
            // GET RESPONSE
            // ===============================

            const result = await response.json();


            if (result.success) {

                message.textContent =
                    "Enrollment submitted successfully!";

                form.reset();

            } else {

                throw new Error(
                    result.message || "Submission failed."
                );

            }


        } catch (error) {

            console.error(error);

            message.textContent =
                "Error: " +
                (error.message || "Unknown error");

        } finally {

            if (submitButton) {

                submitButton.disabled = false;

                submitButton.value = "Submit";

            }

        }

    });
    console.log(data);
}


// ======================================
// FILE TO BASE64
// ======================================

function fileToBase64(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = function () {
            resolve(reader.result);
        };

        reader.onerror = function (error) {
            reject(error);
        };

        reader.readAsDataURL(file);

    });

}