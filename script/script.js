const form = document.getElementById("enrollmentForm");
const message = document.getElementById("message");

// Google Apps Script Web App URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyBPdH4AX3ZkGRgCu6VD_NOK2NqxEu_Pu2EuaxPSSWkOkadjSZUZz-mrVyEJ7UrAaHk/exec";

if (form) {
    form.addEventListener("submit", handleSubmit);
}

async function handleSubmit(event) {
    event.preventDefault();

    const submitButton = form ? form.querySelector('input[type="submit"]') : null;
    const pictureInput = document.getElementById("picture");

    if (!form || !message) {
        return;
    }

    if (!pictureInput || !pictureInput.files || !pictureInput.files[0]) {
        message.textContent = "Please select a picture.";
        return;
    }

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.value = "Submitting...";
    }

    message.textContent = "Uploading your enrollment...";

    try {
        const picture = pictureInput.files[0];
        const base64Picture = await fileToBase64(picture);

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
            Classcode: document.getElementById("Classcode").value.trim(),
            section: document.getElementById("section").value.trim(),
            birthday: document.getElementById("birthday").value,
            adviser: document.getElementById("adviser").value.trim()
        };

        console.log("Selected Class Code:", data.Classcode);
        console.log("Data to send:", data);

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
    } catch (error) {
        console.error(error);
        message.textContent = "Error: " + (error.message || "Unknown error");
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.value = "Submit";
        }
    }
}

// ======================================
// FILE TO BASE64
// ======================================

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error || new Error("Could not read the selected picture."));
        reader.readAsDataURL(file);
    });
}