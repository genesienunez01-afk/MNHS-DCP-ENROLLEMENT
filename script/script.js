const form = document.getElementById("enrollmentForm");
const message = document.getElementById("message");

// PUT YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyxXmceqNnJqooVyrrd9QjSePYkqEaBM1L1YgsPpE_GRggaFR8hrmNQdbne41UdgIo_DA/exec";


form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const submitButton = form.querySelector('input[type="submit"]');

    submitButton.disabled = true;
    submitButton.value = "Submitting...";

    message.textContent = "Uploading your enrollment...";


    try {

        // Get picture
        const pictureInput = document.getElementById("picture");

        if (pictureInput.files.length === 0) {
            throw new Error("Please select a picture.");
        }

        const picture = pictureInput.files[0];


        // Convert picture to Base64
        const base64Picture = await fileToBase64(picture);


        // Create data object
        const data = {

            picture: base64Picture,

            pictureName: picture.name,

            pictureType: picture.type,

            LRN: document.getElementById("LRN").value,

            FirstName: document.getElementById("FirstName").value,

            MiddleName: document.getElementById("MiddleName").value,

            LastName: document.getElementById("LastName").value,

            gender: document.getElementById("gender").value,

            term: document.getElementById("term").value,

            Classcode: document.getElementById("Classcode").value,

            section: document.getElementById("section").value,

            birthday: document.getElementById("birthday").value,

            adviser: document.getElementById("adviser").value

        };


        // Send data to Google Apps Script
        const response = await fetch(SCRIPT_URL, {

            method: "POST",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify(data)

        });


        const result = await response.json();


        if (result.success) {

            message.textContent = "Enrollment submitted successfully!";

            form.reset();

        } else {

            throw new Error(result.message || "Submission failed.");

        }

    }

    catch (error) {

        console.error(error);

        message.textContent =
            "Error: " + error.message;

    }

    finally {

        submitButton.disabled = false;
        submitButton.value = "Submit";

    }

});


// Convert uploaded file to Base64
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
