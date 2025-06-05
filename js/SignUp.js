document.addEventListener("DOMContentLoaded", function () {
  // Form elements
  const form = document.getElementById("registerForm");
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  // Error elements
  const firstNameError = document.getElementById("firstNameError");
  const lastNameError = document.getElementById("lastNameError");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");
  const confirmPasswordError = document.getElementById("confirmPasswordError");

  // ========== VALIDATION FUNCTIONS ==========
  function validateFirstName() {
    const value = firstNameInput.value.trim();
    if (value.length < 2) {
      firstNameInput.classList.add("input-error");
      firstNameError.style.display = "block";
      return false;
    } else {
      firstNameInput.classList.remove("input-error");
      firstNameInput.classList.add("input-success");
      firstNameError.style.display = "none";
      return true;
    }
  }

  function validateLastName() {
    const value = lastNameInput.value.trim();
    if (value.length < 2) {
      lastNameInput.classList.add("input-error");
      lastNameError.style.display = "block";
      return false;
    } else {
      lastNameInput.classList.remove("input-error");
      lastNameInput.classList.add("input-success");
      lastNameError.style.display = "none";
      return true;
    }
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      emailInput.classList.add("input-error");
      emailError.style.display = "block";
      return false;
    } else {
      emailInput.classList.remove("input-error");
      emailInput.classList.add("input-success");
      emailError.style.display = "none";
      return true;
    }
  }

  function validatePassword() {
    const value = passwordInput.value;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(value)) {
      passwordInput.classList.add("input-error");
      passwordError.style.display = "block";
      return false;
    } else {
      passwordInput.classList.remove("input-error");
      passwordInput.classList.add("input-success");
      passwordError.style.display = "none";

      // Also validate confirm password when password changes
      if (confirmPasswordInput.value) {
        validateConfirmPassword();
      }
      return true;
    }
  }

  function validateConfirmPassword() {
    const passwordValue = passwordInput.value;
    const confirmValue = confirmPasswordInput.value;

    if (confirmValue !== passwordValue) {
      confirmPasswordInput.classList.add("input-error");
      confirmPasswordError.style.display = "block";
      return false;
    } else if (confirmValue) {
      confirmPasswordInput.classList.remove("input-error");
      confirmPasswordInput.classList.add("input-success");
      confirmPasswordError.style.display = "none";
      return true;
    }
    return false;
  }

  // ========== PASSWORD VISIBILITY TOGGLE ==========
  document.querySelectorAll(".toggle-password").forEach((icon) => {
    icon.addEventListener("click", function () {
      const input = this.parentElement.querySelector("input");
      const eyeOpen = this.querySelector(".eye-open");
      const eyeClosed = this.querySelector(".eye-closed");

      if (input.type === "password") {
        input.type = "text";
        eyeOpen.style.display = "none";
        eyeClosed.style.display = "block";
      } else {
        input.type = "password";
        eyeOpen.style.display = "block";
        eyeClosed.style.display = "none";
      }
    });
  });

  // ========== FORM SUBMISSION ==========
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validate all fields
    const isFirstNameValid = validateFirstName();
    const isLastNameValid = validateLastName();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    if (
      isFirstNameValid &&
      isLastNameValid &&
      isEmailValid &&
      isPasswordValid &&
      isConfirmPasswordValid
    ) {
      // Show loading state
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.innerHTML =
        ' <span class="flex items-center justify-center gap-2"><svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>    </svg>   Registering......  </span> ';

      // Prepare the request data
      const formData = {
        firstname: firstNameInput.value.trim(),
        lastname: lastNameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value,
        confirmPassword: confirmPasswordInput.value,
      };

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(formData),
        redirect: "follow",
      };

      fetch("https://spatrak.com/api/requests/signup", requestOptions)
        .then((response) => {
          if (!response.ok) {
            return response.json().then((err) => {
              throw err;
            });
          }
          return response.json();
        })
        .then((result) => {
          // Handle successful registration
          console.log(result);
          Swal.fire({
            title: "Success!",
            text: "Registration completed successfully",
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#7e22ce",
          }).then(() => {
            // Redirect to login page after user clicks OK
            window.location.href = "login.html";
          });
        })
        .catch((error) => {
          console.error("Error:", error);

          // Handle different error cases
          if (error.message && error.message.includes("email already exists")) {
            emailInput.classList.add("input-error");
            emailError.textContent = "This email is already registered";
            emailError.style.display = "block";

            Swal.fire({
              title: "Error!",
              text: "This email is already registered",
              icon: "error",
              confirmButtonText: "OK",
              confirmButtonColor: "#ef4444",
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: "Registration failed. Please try again.",
              icon: "error",
              confirmButtonText: "OK",
              confirmButtonColor: "#ef4444",
            });
          }
        })
        .finally(() => {
          // Reset button state
          submitButton.disabled = false;
          submitButton.textContent = "Register";
        });
    }
  });
});
