document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");

  // Password visibility toggle
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

  // Validation functions
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

    if (value.length < 6) {
      passwordInput.classList.add("input-error");
      passwordError.style.display = "block";
      return false;
    } else {
      passwordInput.classList.remove("input-error");
      passwordInput.classList.add("input-success");
      passwordError.style.display = "none";
      return true;
    }
  }

  // Form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validate all fields
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (isEmailValid && isPasswordValid) {
      // Show loading state
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.innerHTML = `
          <span class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </span>
        `;

      // Prepare the request data
      const formData = {
        email: emailInput.value.trim(),
        password: passwordInput.value,
      };

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(formData),
        redirect: "follow",
      };

      fetch(
        "https://backend-production-816c.up.railway.app/api/requests/login",
        requestOptions
      )
        .then((response) => {
          if (!response.ok) {
            return response.json().then((err) => {
              throw err;
            });
          }
          return response.json();
        })
        .then((result) => {
          console.log(result);
          // Handle successful login
          Swal.fire({
            title: "Success!",
            text: "You have successfully logged in",
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#7e22ce",
          }).then(() => {
            // Redirect to dashboard or home page
            window.location.href = "dashboard.html";
          });
        })
        .catch((error) => {
          console.error("Error:", error);
          let errorMessage = "Login failed. Please try again.";

          if (error.message && error.message.includes("Invalid credentials")) {
            errorMessage = "Invalid email or password";
            emailInput.classList.add("input-error");
            passwordInput.classList.add("input-error");
          }

          Swal.fire({
            title: "Error!",
            text: errorMessage,
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#ef4444",
          });
        })
        .finally(() => {
          // Reset button state
          submitButton.disabled = false;
          submitButton.textContent = "Sign in";
        });
    }
  });
});
