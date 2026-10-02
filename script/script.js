const form = document.getElementById("enrollmentForm");
const message = document.getElementById("message");
const toast = document.getElementById("toast");
const confirmModal = document.getElementById("confirmModal");
const cancelSubmit = document.getElementById("cancelSubmit");
const confirmSubmit = document.getElementById("confirmSubmit");

// PUT YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz30FUPh4qJuP130Bx7BZT4Z-DDJdApvX9TrNUfb4UMmjF2B8-nZN04WnTK5dPp4FHdQg/exec";

const submitButton = document.querySelector(".submit-btn");
const pictureInput = document.getElementById("picture");
const imagePreview = document.getElementById("imagePreview");
const imagePreviewWrap = document.getElementById("imagePreviewWrap");

pictureInput.addEventListener("change", function () {
    const file = this.files && this.files[0];

    if (!file) {
        if (imagePreviewWrap) imagePreviewWrap.classList.add("hidden");
        if (imagePreview) imagePreview.src = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        if (imagePreview) {
            imagePreview.src = event.target.result;
        }
        if (imagePreviewWrap) {
            imagePreviewWrap.classList.remove("hidden");
        }
    };
    reader.readAsDataURL(file);
});

form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (confirmModal) {
        confirmModal.classList.remove("hidden");
        confirmModal.setAttribute("aria-hidden", "false");
    }
});

if (cancelSubmit) {
    cancelSubmit.addEventListener("click", function () {
        if (confirmModal) {
            confirmModal.classList.add("hidden");
            confirmModal.setAttribute("aria-hidden", "true");
        }
    });
}

if (confirmSubmit) {
    confirmSubmit.addEventListener("click", async function () {
        if (confirmModal) {
            confirmModal.classList.add("hidden");
            confirmModal.setAttribute("aria-hidden", "true");
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.value = "Submitting...";
            submitButton.style.opacity = "0.7";
            submitButton.style.cursor = "wait";
        }

        message.textContent = "Submitting...";
        message.style.color = "blue";

        try {
        // Get form values
        const picture = document.getElementById("picture").files[0];
        const term = document.getElementById("term").value;
        const LRN = document.getElementById("LRN").value;
        const FirstName = document.getElementById("FirstName").value.trim();
        const MiddleName = document.getElementById("MiddleName").value;
        const LastName = document.getElementById("LastName").value.trim();
        const gender = document.getElementById("gender").value;
        const birthday = document.getElementById("birthday").value;
        const Classcode = document.getElementById("Classcode").value;
        const section = document.getElementById("section").value.trim();
        const adviser = document.getElementById("adviser").value;

        // Check if image was selected
        if (!picture) {
            message.textContent = "Please select a picture.";
            message.style.color = "red";
            return;
        }

        // Convert image to Base64
        const base64Picture = await fileToBase64(picture);
        const studentFileName = buildStudentFileName(LastName, FirstName, section, picture.type);

        // Data to send to Google Apps Script
        const data = {
            picture: base64Picture,
            pictureName: studentFileName,
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
            showToast("Enrollment submitted successfully!");

            // Clear the form and file input
            form.reset();
            const pictureInput = document.getElementById("picture");
            if (pictureInput) {
                pictureInput.value = "";
            }
        } else {
            message.textContent = result.message || "Submission failed.";
            message.style.color = "red";
        }

        } catch (error) {
            console.error("Error:", error);

            message.textContent = "An error occurred while submitting.";
            message.style.color = "red";
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.value = "Submit";
                submitButton.style.opacity = "1";
                submitButton.style.cursor = "pointer";
            }
        }
    });
}


function showToast(messageText) {
    if (!toast) return;

    toast.textContent = messageText;
    toast.classList.add("show");

    clearTimeout(showToast.timeoutId);
    showToast.timeoutId = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function buildStudentFileName(lastName, firstName, section, fileType) {
    const safeLastName = sanitizeName(lastName) || "lastname";
    const safeFirstName = sanitizeName(firstName) || "firstname";
    const safeSection = sanitizeName(section) || "section";
    const extension = (fileType && fileType.includes("/")) ? fileType.split("/")[1] : "jpg";
    const cleanExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";

    return `${safeLastName}_${safeFirstName}_${safeSection}.${cleanExtension}`;
}

function sanitizeName(value) {
    return String(value || "")
        .trim()
        .replace(/[^a-zA-Z0-9\s_-]/g, "")
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_");
}

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