// File: public/js/registration.cjs
/**
 * Gets an input element by ID.
 * @param {string} id - The ID of the element.
 * @returns {HTMLInputElement} The input element.
 * @throws Will throw an error if the element is not found.
 */
function getInputElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with id '${id}' not found`);
  }
  return /** @type {HTMLInputElement} */ (element);
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded");
  const registrationForm = document.getElementById("registrationForm");

  if (registrationForm) {
    registrationForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const formData = {
        fullName: getInputElement("fullName").value,
        email: getInputElement("email").value,
        phone: getInputElement("phone").value,
        address: getInputElement("address").value,
        city: getInputElement("city").value,
        state: getInputElement("state").value,
        zipCode: getInputElement("zipCode").value,
        username: getInputElement("username").value,
        password: getInputElement("password").value,
        accountType: /** @type {HTMLInputElement} */ (
          document.querySelector(
            'input[name="accountType"]:checked',
          )
        ).value,
      };

      // Validate password
      const confirmPassword = getInputElement("confirmPassword");
      // Check if confirm password is not null
      if (formData.password !== confirmPassword.value) {
        alert("Passwords do not match");
        return;
      }

      // Basic password strength validation
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        alert("Password doesn't meet requirements");
        return;
      }

      try {
        const response = await fetch("/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Account created successfully! You can now log in.");
          globalThis.window.location.href = "/login";
        } else {
          alert(data.error || "Registration failed");
        }
      } catch (error) {
        console.error("Registration error:", error);
        alert("An error occurred during registration");
      }
    });
  }
});

