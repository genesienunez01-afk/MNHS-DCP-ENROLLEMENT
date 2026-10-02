const form = document.getElementById("enrollmentForm");
const message = document.getElementById("message");

// PUT YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzOH38Rwe63XFGxs9G5Zioc2XOheVZKrgj1XSoUzI97_l1FrcS7PYCef7Lzbb_jb3iO4Q/exec;

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    message.textContent = "Submitting...";
    message.style.color = "blue";

    try {
        // Get form values
        const picture = document.getElementById("picture").files[0];
        const term = document.getElementById("term").value;
        const LRN = document.getElementById("LRN").value;
        const FirstName = document.getElementById("FirstName").value;
        const MiddleName = document.getElementById("MiddleName").value;
        const LastName = document.getElementById("LastName").value;
        const gender = document.getElementById("gender").value;
        const birthday = document.getElementById("birthday").value;
        const Classcode = document.getElementById("Classcode").value;
        const section = document.getElementById("section").value;
        const adviser = document.getElementById("adviser").value;

        // Check if image was selected
        if (!picture) {
            message.textContent = "Please select a picture.";
            message.style.color = "red";
            return;
        }

        // Convert image to Base64
        const base64Picture = await fileToBase64(picture);

        // Data to send to Google Apps Script
        const data = {
            picture: base64Picture,
            pictureName: picture.name,
            pictureType: picture.type,

            term: term,
            LRN: LRN,
            FirstName: FirstName,
            MiddleName: MiddleName,
            LastName: LastName,
            gender: gender,
            birthday: birthday,
            Classcode: Classcode,
            section: section,
            adviser: adviser
        };

        // Send data
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
            message.style.color = "green";

            // Clear the form
            form.reset();
        } else {
            message.textContent = result.message || "Submission failed.";
            message.style.color = "red";
        }

    } catch (error) {
        console.error("Error:", error);

        message.textContent = "An error occurred while submitting.";
        message.style.color = "red";
    }
});


// Convert uploaded image to Base64
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