const form = document.getElementById("enrollmentForm");
const message = document.getElementById("message");

// PUT YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyBPdH4AX3ZkGRgCu6VD_NOK2NqxEu_Pu2EuaxPSSWkOkadjSZUZz-mrVyEJ7UrAaHk/exec";
const getFieldValue = (id) => (document.getElementById(id)?.value ?? "").trim();

if (form) {
    form.addEventListener("submit", handleSubmit);
}

async function handleSubmit(event) {
    event.preventDefault();

    const submitButton = form.querySelector('input[type="submit"]');
    setSubmitting(submitButton, true);
    setMessage("Uploading your enrollment...");

    try {
        const pictureInput = document.getElementById("picture");
        const picture = pictureInput?.files?.[0];

        if (!picture) {
            throw new Error("Please select a picture.");
        }

        const data = await createEnrollmentData(picture);
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Submission failed.");
        }

        setMessage("Enrollment submitted successfully!");
        form.reset();
    } catch (error) {
        console.error(error);
        setMessage(`Error: ${error.message || "Unknown error"}`);
    } finally {
        setSubmitting(submitButton, false);
    }
}

async function createEnrollmentData(picture) {
    return {
        picture: await fileToBase64(picture),
        pictureName: picture.name,
        pictureType: picture.type,
        LRN: getFieldValue("LRN"),
        FirstName: getFieldValue("FirstName"),
        MiddleName: getFieldValue("MiddleName"),
        LastName: getFieldValue("LastName"),
        gender: getFieldValue("gender"),
        term: getFieldValue("term"),
        Classcode: getFieldValue("Classcode"),
        section: getFieldValue("section"),
        birthday: getFieldValue("birthday"),
        adviser: getFieldValue("adviser")
    };
}

function setSubmitting(button, isSubmitting) {
    if (!button) {
        return;
    }

    button.disabled = isSubmitting;
    button.value = isSubmitting ? "Submitting..." : "Submit";
}

function setMessage(text) {
    if (message) {
        message.textContent = text;
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error || new Error("Could not read the selected picture."));
        reader.readAsDataURL(file);
    });
}
