// المتغيرات العامة
let allRequests = [];
let currentPage = 1;
const itemsPerPage = 10;
let currentFilters = {
  status: "all",
  type: "all",
  search: "",
};

// Chat functionality
let currentChatRequestId = null;
let chatMessages = [];

// تهيئة الصفحة
document.addEventListener("DOMContentLoaded", function () {
  fetchRequests();
  fetchUserProfile(); // جلب بيانات المستخدم عند التحميل

  // إعداد معالجات الأحداث
  document
    .getElementById("applyFilters")
    .addEventListener("click", applyFilters);
  document
    .getElementById("searchInput")
    .addEventListener("keyup", function (e) {
      if (e.key === "Enter") applyFilters();
    });
  document.getElementById("prevPage").addEventListener("click", goToPrevPage);
  document.getElementById("nextPage").addEventListener("click", goToNextPage);

  // إغلاق المودال عند النقر خارجها
  document.getElementById("editModal").addEventListener("click", function (e) {
    if (e.target === e.currentTarget) closeModal("editModal");
  });
  document.getElementById("viewModal").addEventListener("click", function (e) {
    if (e.target === e.currentTarget) closeModal("viewModal");
  });

  // إعداد حدث تغيير الصورة
  document
    .getElementById("avatarInput")
    .addEventListener("change", handleAvatarUpload);

  // إعداد حدث إرسال الفورم
  document
    .getElementById("profileForm")
    .addEventListener("submit", updateUserProfile);

  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");
  const passwordValue = sessionStorage.getItem("password");

  if (togglePassword && passwordInput) {
    if (passwordValue === "no") {
      passwordInput.disabled = true;
      passwordInput.placeholder =
        "Password cannot be changed for Google accounts";
      togglePassword.style.display = "none";
    } else {
      passwordInput.disabled = false;
      passwordInput.placeholder = "Enter new password";
      togglePassword.style.display = "block";
    }

    // إضافة حدث تبديل رؤية كلمة المرور
    togglePassword.addEventListener("click", function () {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      this.querySelector("i").classList.toggle("fa-eye");
      this.querySelector("i").classList.toggle("fa-eye-slash");
    });
  }

  const editProfileForm = document.querySelector("#profile-section form");

  editProfileForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // منع الإرسال التقليدي للفورم

    // 1. اجمع الداتا من الفورم
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;

    // 2. هات التوكين من sessionStorage
    const authToken = sessionStorage.getItem("authToken");
    if (!authToken) {
      Swal.fire({
        title: "Error!",
        text: "Authentication token not found. Please log in.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
      });

      return;
    }

    // 3. استخرج الـ user ID من التوكين
    const payload = JSON.parse(atob(authToken.split(".")[1]));
    const userId = payload.id;
    sessionStorage.setItem("IdUser", userId); // لو عايزة تخزنيه

    // 4. جهزي البودي
    const raw = JSON.stringify({
      firstname: firstName,
      lastname: lastName,
      email: email,
    });

    // 5. جهزي الهيدرز
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${authToken}`);

    // 6. جهزي الـ API endpoint
    const apiUrl = `https://backend-production-816c.up.railway.app/api/requests/users/${userId}`;

    const requestOptions = {
      method: "PUT",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    // 7. إدارة حالة الزرار
    const submitButton = editProfileForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Saving...";

    try {
      // 8. الطلب
      const response = await fetch(apiUrl, requestOptions);
      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "You have successfully Updeted Profile",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#7e22ce",
        });

        // لو عايزة تحدثي واجهة المستخدم هنا
      } else {
        Swal.fire({
          title: "Error!",
          text: result.message || `Error: ${response.status}`,
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to load user profile. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      // 9. رجعي الزرار لوضعه الطبيعي
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });

  // إضافة معالج حدث لنموذج تعديل الطلب
  const editRequestForm = document.getElementById("editRequestForm");
  if (editRequestForm) {
    editRequestForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      try {
        const requestId = document.getElementById("editRequestId").value;
        const authToken = sessionStorage.getItem("authToken");

        if (!authToken) {
          throw new Error("Authentication token not found");
        }

        // تجهيز البيانات المحدثة
        const updatedData = {
          firstName: document.getElementById("editFirstName").value,
          lastName: document.getElementById("editLastName").value,
          email: document.getElementById("editEmail").value,
          phone: document.getElementById("editPhone").value,
          establishment: document.getElementById("editEstablishment").value,
          program: document.getElementById("editProgram").value,
          graduationYear: document.getElementById("editGraduationYear").value,
          internalRef: document.getElementById("editInternalRef").value,
          company: document.getElementById("editCompany").value,
          contact: document.getElementById("editContact").value,
          contactEmail: document.getElementById("editContactEmail").value,
          address: document.getElementById("editAddress").value,
          country: document.getElementById("editCountry").value,
          comment: document.getElementById("editComment").value,
          birthDate: {
            day: document.getElementById("editBirthDay").value,
            month: document.getElementById("editBirthMonth").value,
            year: document.getElementById("editBirthYear").value,
          },
        };

        // إعداد خيارات الطلب
        const requestOptions = {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(updatedData),
        };

        // إرسال الطلب
        const response = await fetch(
          `https://backend-production-816c.up.railway.app/api/requests/${requestId}`,
          requestOptions
        );

        if (!response.ok) {
          throw new Error("Failed to update request");
        }

        // تحديث البيانات المحلية
        const updatedRequest = await response.json();
        const requestIndex = allRequests.findIndex(
          (req) => req._id === requestId
        );
        if (requestIndex !== -1) {
          allRequests[requestIndex] = {
            ...allRequests[requestIndex],
            ...updatedRequest,
          };
        }

        // إغلاق المودال
        closeModal("editRequestModal");

        // تحديث عرض الطلبات
        applyFilters();

        // عرض رسالة نجاح
        Swal.fire({
          title: "Success!",
          text: "Request updated successfully",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#7e22ce",
        });
      } catch (error) {
        console.error("Error updating request:", error);
        Swal.fire({
          title: "Error!",
          text: error.message || "Failed to update request",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#ef4444",
        });
      }
    });
  }
});

// جلب الطلبات من API
function fetchRequests() {
  // الحصول على معرف المستخدم من sessionStorage
  const userId = sessionStorage.getItem("IdUser");
  if (!userId) {
    console.error("User ID not found in session storage");
    document.getElementById("requestsTableBody").innerHTML = `
      <tr>
          <td colspan="6" class="px-6 py-4 text-center text-violet-900">
              Error: User not authenticated
          </td>
      </tr>
    `;
    return;
  }

  // إعداد طلب API لجلب طلبات المستخدم الحالي
  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  fetch(
    `https://backend-production-816c.up.railway.app/api/requests/user/${userId}`,
    requestOptions
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      // معالجة البيانات المستلمة
      if (data && Array.isArray(data)) {
        allRequests = data;
      } else if (data && data.requests && Array.isArray(data.requests)) {
        allRequests = data.requests;
      } else {
        throw new Error("Invalid data format from API");
      }

      // عرض الطلبات
      applyFilters();
    })
    .catch((error) => {
      console.error("Error fetching requests:", error);
      document.getElementById("requestsTableBody").innerHTML = `
        <tr>
            <td colspan="6" class="px-6 py-4 text-center text-violet-900">
                Error loading requests. Please try again later.
            </td>
        </tr>
      `;
    });
}

// تطبيق الفلاتر
function applyFilters() {
  currentFilters = {
    status: document.getElementById("statusFilter").value,
    search: document.getElementById("searchInput").value.toLowerCase(),
  };

  let filteredRequests = allRequests.filter((request) => {
    // تصفية حسب الحالة
    if (
      currentFilters.status !== "all" &&
      request.status !== currentFilters.status
    ) {
      return false;
    }

    // تصفية حسب البحث
    if (currentFilters.search) {
      // البحث في Request ID واسم المستخدم والتاريخ
      const requestDate = request.createdAt
        ? new Date(request.createdAt).toLocaleDateString()
        : "";
      const searchStr = `${request._id || ""} ${
        request.firstName || request.user?.name || ""
      } ${requestDate}`.toLowerCase();
      if (!searchStr.includes(currentFilters.search)) {
        return false;
      }
    }

    return true;
  });

  // التقسيم إلى صفحات
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // عرض الطلبات في الجدول
  const tableBody = document.getElementById("requestsTableBody");
  tableBody.innerHTML = "";

  if (paginatedRequests.length === 0) {
    tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-violet-900">
                        No requests found matching your criteria
                    </td>
                </tr>
            `;
  } else {
    paginatedRequests.forEach((request) => {
      const requestDate = request.createdAt
        ? new Date(request.createdAt).toLocaleDateString()
        : "N/A";
      const userName = request.firstName || request.user?.name || "N/A";

      // تحديد لون الحالة
      let statusClass = "bg-gray-100 text-gray-800";
      if (request.status === "approved" || request.status === "accepted") {
        statusClass = "bg-green-100 text-green-800";
      } else if (request.status === "rejected") {
        statusClass = "bg-red-100 text-red-800";
      } else if (request.status === "pending") {
        statusClass = "bg-yellow-100 text-yellow-800";
      }

      const row = document.createElement("tr");
      row.className = "hover:bg-violet-50 transition-all";
      row.dataset.requestId = request._id;
      row.innerHTML = `
                    <td class="px-6 py-5 whitespace-nowrap text-violet-900 text-lg font-semibold">${
                      request._id
                        ?  "RV"+request._id.substring(0, 6) 
                        : "N/A"
                    }</td>
                    <td class="px-6 py-5 whitespace-nowrap">
                        <div class="flex items-center space-x-3">
                            <span class="text-violet-900 text-lg font-semibold">${userName}</span>
                        </div>
                    </td>
                    <td class="px-6 py-5 whitespace-nowrap text-violet-900 text-lg">${requestDate}</td>
                    <td class="px-6 py-5 whitespace-nowrap">
                        <span class="${statusClass} px-4 py-2 rounded-full text-base font-bold shadow capitalize">${
        request.status || "unknown"
      }</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center space-x-2">
                            <button onclick="openViewModal('${
                              request._id
                            }')" class="text-violet-700 bg-violet-100 hover:bg-violet-200 px-3 py-1 rounded-lg transition flex items-center">
                                <i class="fas fa-eye mr-1"></i> View
                            </button>
                            <button onclick="openChatModal('${
                              request._id
                            }')" class="text-blue-700 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-lg transition flex items-center">
                                <i class="fas fa-comments mr-1"></i> Chat
                            </button>
                            <button onclick="openEditRequestModal('${
                              request._id
                            }')" class="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg transition flex items-center">
                                <i class="fas fa-pencil-alt mr-1"></i> Edit
                            </button>
                        </div>
                    </td>
                `;
      tableBody.appendChild(row);
    });
  }

  // تحديث معلومات الترقيم
  updatePaginationInfo(filteredRequests.length, totalPages);
}

// تحديث معلومات الترقيم
function updatePaginationInfo(totalItems, totalPages) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  document.getElementById(
    "paginationInfo"
  ).textContent = `Showing ${startItem} to ${endItem} of ${totalItems} entries`;

  const pageNumbersContainer = document.getElementById("pageNumbers");
  pageNumbersContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    pageBtn.className = `bg-${
      i === currentPage ? "violet-100" : "violet-50"
    } text-violet-900 px-4 py-2 rounded-lg hover:bg-violet-100 transition duration-300 font-bold`;
    pageBtn.addEventListener("click", () => goToPage(i));
    pageNumbersContainer.appendChild(pageBtn);
  }

  // تحديث حالة أزرار الصفحة السابقة/التالية
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;
}

// التنقل بين الصفحات
function goToPage(page) {
  currentPage = page;
  renderRequests();
}

function goToPrevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderRequests();
  }
}

function goToNextPage() {
  const totalPages = Math.ceil(allRequests.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderRequests();
  }
}

// فتح مودال التعديل
function openEditModal(requestId) {
  const request = allRequests.find((req) => req._id === requestId);
  if (request) {
    document.getElementById("editRequestId").value = requestId;
    document.getElementById("editRequestNotes").value =
      request.adminNotes || "";

    // عرض المودال
    document.getElementById("editModal").classList.remove("hidden");
    document.getElementById("editModal").classList.add("flex");
    document.body.style.overflow = "hidden";
  }
}

// فتح مودال العرض
function openViewModal(requestId) {
  const request = allRequests.find((req) => req._id === requestId);
  if (request) {
    const detailsContent = document.getElementById("requestDetailsContent");

    // عرض مؤشر التحميل
    detailsContent.innerHTML = `
                <div class="flex justify-center items-center py-8">
                    <i class="fas fa-spinner fa-spin text-3xl text-violet-600"></i>
                </div>
            `;

    // عرض المودال
    document.getElementById("viewModal").classList.remove("hidden");
    document.getElementById("viewModal").classList.add("flex");
    document.body.style.overflow = "hidden";

    // عرض البيانات مباشرة
    renderRequestDetails(request);
  }
}

// عرض تفاصيل الطلب
function renderRequestDetails(request) {
  const detailsContent = document.getElementById("requestDetailsContent");
  const requestDate = request.createdAt
    ? new Date(request.createdAt).toLocaleString()
    : "N/A";
  const updatedDate = request.updatedAt
    ? new Date(request.updatedAt).toLocaleString()
    : "N/A";

  // تحديد لون الحالة للعرض
  let statusClass = "bg-gray-100 text-gray-800";
  if (request.status === "approved" || request.status === "accepted") {
    statusClass = "bg-green-100 text-green-800";
  } else if (request.status === "rejected") {
    statusClass = "bg-red-100 text-red-800";
  } else if (request.status === "pending") {
    statusClass = "bg-yellow-100 text-yellow-800";
  }

  // تنسيق تاريخ الميلاد
  const birthDate = request.birthDate
    ? `${request.birthDate.day || "?"}/${request.birthDate.month || "?"}/${
        request.birthDate.year || "?"
      }`
    : "N/A";

  // روابط الملفات (بافتراض أن الـ API يوفر مسارات الملفات)
  const consentFormLink = request.files?.consentForm
    ? `<a href="https://backend-production-816c.up.railway.app/${request.files.consentForm}" target="_blank" class="text-violet-600 hover:underline"><i class="fas fa-file-alt mr-2"></i>Consent Form <i class="fas fa-external-link-alt ml-1 text-xs"></i></a>`
    : "N/A";
  const idCardLink = request.files?.idCard
    ? `<a href="https://backend-production-816c.up.railway.app/${request.files.idCard}" target="_blank" class="text-violet-600 hover:underline"><i class="fas fa-id-card mr-2"></i>ID Card <i class="fas fa-external-link-alt ml-1 text-xs"></i></a>`
    : "N/A";
  const diplomaLink = request.files?.diploma
    ? `<a href="https://backend-production-816c.up.railway.app/${request.files.diploma}" target="_blank" class="text-violet-600 hover:underline"><i class="fas fa-graduation-cap mr-2"></i>Diploma Copy <i class="fas fa-external-link-alt ml-1 text-xs"></i></a>`
    : "N/A";

  // تفاصيل الرد (إذا وجدت)
  const replyMessage = request.reply?.message || "No reply yet.";
  const replyDate = request.reply?.date
    ? new Date(request.reply.date).toLocaleString()
    : "N/A";

  detailsContent.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                <!-- معلومات أساسية -->
                <div class="bg-violet-50 rounded-lg p-5 shadow-sm">
                    <h4 class="font-bold text-violet-800 mb-4 text-lg">Basic Information</h4>
                    <div class="grid grid-cols-3 gap-4 text-violet-900">
                        <div class="col-span-2">
                            <p class="text-sm text-violet-600">Request ID</p>
                            <p class="font-medium break-words">  ${
                              request._id
                                ? "RV" + request._id.substring(0, 6)
                                : "N/A"
                            }</p>
                        </div>
                        <div>
                            <p class="text-sm text-violet-600">Status</p>
                            <p class="font-medium">
                                <span class="${statusClass} px-3 py-1 rounded-full text-sm">${
    request.status || "N/A"
  }</span>
                            </p>
                        </div>
                        <div class="col-span-2">
                            <p class="text-sm text-violet-600">Created At</p>
                            <p class="font-medium">${new Date(
                              requestDate
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}</p>
                        </div>
                        <div>
                            <p class="text-sm text-violet-600">Updated At</p>
                            <p class="font-medium">${new Date(
                              updatedDate
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}</p>
                        </div>
                    </div>
                </div>

                <!-- معلومات التعليم -->
                <div class="bg-violet-50 rounded-lg p-5 shadow-sm">
                    <h4 class="font-bold text-violet-800 mb-4 text-lg">Education Information</h4>
                    <div class="grid grid-cols-3 gap-4 text-violet-900">
                        <div class="col-span-2">
                            <p class="text-sm text-violet-600">Establishment</p>
                            <p class="font-medium">${
                              request.establishment || "N/A"
                            }</p>
                        </div>
                        <div>
                            <p class="text-sm text-violet-600">Program</p>
                            <p class="font-medium">${
                              request.program || "N/A"
                            }</p>
                        </div>
                        <div class="col-span-2">
                            <p class="text-sm text-violet-600">Graduation Year</p>
                            <p class="font-medium">${
                              request.graduationYear || "N/A"
                            }</p>
                        </div>
                        <div>
                            <p class="text-sm text-violet-600">Internal Reference</p>
                            <p class="font-medium">${
                              request.internalRef || "N/A"
                            }</p>
                        </div>
                    </div>
                </div>

                <!-- معلومات شخصية -->
                <div class="bg-violet-50 rounded-lg p-5 shadow-sm">
                    <h4 class="font-bold text-violet-800 mb-4 text-lg">Personal Information</h4>
                    <div class="grid grid-cols-3 gap-4 text-violet-900">
                        <div class="col-span-2">
                            <p class="text-sm text-violet-600">First Name</p>
                            <p class="font-medium">${
                              request.firstName || "N/A"
                            }</p>
                        </div>
                        <div>
                            <p class="text-sm text-violet-600">Last Name</p>
                            <p class="font-medium">${
                              request.lastName || "N/A"
                            }</p>
                        </div>
                        <div class="col-span-2">
                            <p class="text-sm text-violet-600">Birth Date</p>
                            <p class="font-medium">${birthDate}</p>
                        </div>
                        <div>
                            <p class="text-sm text-violet-600">Phone</p>
                            <p class="font-medium">${request.phone || "N/A"}</p>
                        </div>
                        <div class="col-span-2">
                            <p class="text-sm text-violet-600">Email</p>
                            <p class="font-medium break-words mr-10">${
                              request.email || "N/A"
                            }</p>
                        </div>
                        <div>
                            <p class="text-sm text-violet-600">Address</p>
                            <p class="font-medium">${
                              request.address || "N/A"
                            }</p>
                        </div>
                        <div class="col-span-2">
                            <p class="text-sm text-violet-600">Country</p>
                            <p class="font-medium">${
                              request.country || "N/A"
                            }</p>
                        </div>
                    </div>
                </div>

                <!-- معلومات الشركة -->
                 <div class="bg-violet-50 rounded-lg p-5 shadow-sm">
                    <h4 class="font-bold text-violet-800 mb-4 text-lg">Company Information</h4>
                    <div class="grid grid-cols-3 gap-4 text-violet-900">
                        <div class="col-span-2">
                            <p class="text-sm text-violet-600">Company Name</p>
                            <p class="font-medium">${
                              request.company || "N/A"
                            }</p>
                        </div>
                        <div>
                            <p class="text-sm text-violet-600">Contact Person</p>
                            <p class="font-medium">${
                              request.contact || "N/A"
                            }</p>
                        </div>
                        <div class="col-span-2">
                            <p class="text-sm text-violet-600">Contact Email</p>
                            <p class="font-medium break-words">${
                              request.contactEmail || "N/A"
                            }</p>
                        </div>
                    </div>
                </div>

                <!-- الملفات المرفقة -->
                <div class="bg-violet-50 rounded-lg p-5 shadow-sm md:col-span-2">
                    <h4 class="font-bold text-violet-800 mb-4 text-lg">Attached Files</h4>
                    <div class="grid grid-cols-3 gap-4 text-violet-900">
                        <div class="col-span-2">
                            <p class="text-sm text-violet-600">Consent Form</p>
                            <p class="font-medium">${consentFormLink}</p>
                        </div>
                        <div>
                            <p class="text-sm text-violet-600">ID Card</p>
                            <p class="font-medium">${idCardLink}</p>
                        </div>
                        <div class="col-span-2">
                            <p class="text-sm text-violet-600">Diploma Copy</p>
                            <p class="font-medium">${diplomaLink}</p>
                        </div>
                    </div>
                </div>

                <!-- الردود والملاحظات -->
                <div class="bg-violet-50 rounded-lg p-5 shadow-sm md:col-span-2">
                    <h4 class="font-bold text-violet-800 mb-4 text-lg">Admin Reply / Notes</h4>
                    <div class="grid grid-cols-3 gap-4 text-violet-900">
                        <div class="col-span-2">
                            <p class="text-sm text-violet-600">Reply Message</p>
                            <p class="font-medium">${replyMessage}</p>
                        </div>
                        <div>
                            <p class="text-sm text-violet-600">Reply Date</p>
                            <p class="font-medium">${replyDate}</p>
                        </div>
                        <div class="col-span-2">
                            <p class="text-sm text-violet-600">Admin Notes</p>
                            <p class="font-medium">${
                              request.adminNotes || "N/A"
                            }</p>
                        </div>
                    </div>
                </div>

                 <!-- قسم التعليق (إذا كان موجوداً في البيانات وتحتاجه) -->
                  ${
                    request.comment
                      ? `
                  <div class="bg-violet-50 rounded-lg p-5 shadow-sm md:col-span-2">
                      <h4 class="font-bold text-violet-800 mb-4 text-lg">Comment</h4>
                      <div class="text-violet-900">
                          <p class="font-medium">${request.comment}</p>
                      </div>
                  </div>
                  `
                      : ""
                  }

            </div>
        `;
}

// حفظ التغييرات
function saveRequestChanges() {
  const requestId = document.getElementById("editRequestId").value;
  const notes = document.getElementById("editRequestNotes").value;

  const requestIndex = allRequests.findIndex((req) => req._id === requestId);
  if (requestIndex !== -1) {
    // تحديث البيانات المحلية - فقط الملاحظات
    allRequests[requestIndex].adminNotes = notes;

    // تحديث الصف في الجدول - لا نعدل عمود الحالة من هذه الدالة
    // لأن هذه المودال لا تعدل الحالة

    // إغلاق المودال
    closeModal("editModal");

    // عرض رسالة نجاح
    Swal.fire({
      title: "Success!",
      text: "You have successfully Send Messages to Admin",
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#7e22ce",
    });
  }
}

// إغلاق المودال
function closeModal(modalId) {
  document.getElementById(modalId).classList.add("hidden");
  document.getElementById(modalId).classList.remove("flex");
  document.body.style.overflow = "auto";
}

// Add contact form handling
document
  .getElementById("contact-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(this);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    // Here you would typically send the data to your backend
    console.log("Contact form submitted:", data);

    // Show success message
    Swal.fire({
      title: "Success!",
      text: "Thank you for your message! We will get back to you soon",
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#7e22ce",
    });

    // Reset form
    this.reset();
  });

// دالة لعرض الأقسام
function showSection(section) {
  document.getElementById("profile-section").classList.add("hidden");
  document.getElementById("requests-section").classList.add("hidden");
  document.getElementById("contact-section").classList.add("hidden");
  document.getElementById("add-verification-section").classList.add("hidden");

  document.getElementById(`${section}-section`).classList.remove("hidden");

  // تحديث الأزرار النشطة في السايدبار
  const sidebarButtons = document.querySelectorAll("aside nav button");
  sidebarButtons.forEach((btn) => {
    btn.classList.remove("bg-violet-100", "font-bold");
    if (btn.id === `sidebar-${section}`) {
      btn.classList.add("bg-violet-100", "font-bold");
    }
  });
}

// دالة لجلب بيانات المستخدم
async function fetchUserProfile() {
  try {
    const authToken = sessionStorage.getItem("authToken");
    if (!authToken) {
      throw new Error("Authentication token not found");
    }

    const payload = JSON.parse(atob(authToken.split(".")[1]));
    const userId = payload.id;

    const response = await fetch(
      `https://backend-production-816c.up.railway.app/api/requests/users/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    const userData = await response.json();
    console.log("User data received:", userData); // للتأكد من هيكل البيانات

    // تحديث واجهة المستخدم
    document.getElementById("firstName").value = userData.firstname || "";
    document.getElementById("lastName").value = userData.lastname || "";
    document.getElementById("email").value = userData.email || "";
    document.getElementById("userFullName").textContent =
      `${userData.firstname || ""} ${userData.lastname || ""}`.trim() || "User";

    // تحديث الصورة
    const avatarImg = document.getElementById("userAvatar");
    if (userData.image && userData.image.trim() !== "") {
      // إذا كان هناك صورة متاحة
      avatarImg.src = `${userData.image}`;
    } else {
      // إذا كانت الصورة فارغة أو غير موجودة
      avatarImg.src = "../../images/solar_user-bold-duotone.png";
      console.log("Using default profile image");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load user profile data",
    });

    // عرض الصورة الافتراضية في حالة الخطأ
    document.getElementById("userAvatar").src =
      "../../images/solar_user-bold-duotone.png";
  }
}

// دالة للتعامل مع رفع الصورة
function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    validateFileSize(file, 5); // 5MB كحد أقصى

    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("userAvatar").src = e.target.result;
    };
    reader.readAsDataURL(file);
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: error.message,
      icon: "error",
      confirmButtonText: "OK",
      confirmButtonColor: "#ef4444",
    });
    event.target.value = ""; // مسح اختيار الملف
  }
}
// دالة لتحديث بيانات البروفايل
async function updateUserProfile(event) {
  event.preventDefault();

  try {
    // جلب التوكن من sessionStorage
    const authToken = sessionStorage.getItem("authToken");
    if (!authToken) throw new Error("Please login again");

    // استخراج userId من التوكن
    const payload = JSON.parse(atob(authToken.split(".")[1]));
    const userId = payload.id;

    // إنشاء كائن البيانات الأساسي
    const data = {
      firstname: document.getElementById("firstName").value,
      lastname: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      password: "",
      image: "",
    };

    // معالجة الصورة إذا وجدت
    const avatarInput = document.getElementById("avatarInput");
    if (avatarInput && avatarInput.files[0]) {
      data.image = await compressImage(avatarInput.files[0]);
    }
    const password = document.getElementById("password").value;
    const passwordValue = sessionStorage.getItem("password");

    if (password && passwordValue == "yes") {
      data.password = password;
      console.log("kkk");
    }
    // إنشاء الهيدرات
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${authToken}`);

    // تحويل البيانات إلى JSON
    const raw = JSON.stringify(data);

    // إعداد خيارات الطلب
    const requestOptions = {
      method: "PUT",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    console.log(data);

    // عرض حالة التحميل
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Updating...";

    // إرسال طلب تحديث البروفايل
    const response = await fetch(
      `https://backend-production-816c.up.railway.app/api/requests/users/${userId}`,
      requestOptions
    );

    // معالجة الاستجابة
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update profile");
    }

    const result = await response.json();
    console.log("Update successful:", result);

    // إذا كان هناك كلمة مرور جديدة وليس حساب Google

    // if (password && passwordValue !== "yes") {
    //   // إرسال طلب إعادة تعيين كلمة المرور
    //   const passwordResetOptions = {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ password: password }),
    //     redirect: "follow"
    //   };

    //   try {
    //     const passwordResponse = await fetch(
    //       "https://backend-production-816c.up.railway.app/api/requests/forgot-password",
    //       passwordResetOptions
    //     );

    //     if (!passwordResponse.ok) {
    //       console.warn("Password reset request failed");
    //     }
    // } catch (error) {
    //     console.error("Error in password reset:", error);
    //   }
    // }

    // عرض رسالة نجاح
    Swal.fire({
      title: "Success!",
      text: "Profile updated successfully!",
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#7e22ce",
    });

    // إذا كانت هناك صورة جديدة، نقوم بتحديث العرض
    if (data.image) {
      document.getElementById("userAvatar").src = data.image;
    }
  } catch (error) {
    console.error("Update error:", error);
    Swal.fire({
      title: "Error!",
      text: error.message || "Failed to update profile",
      icon: "error",
      confirmButtonText: "OK",
      confirmButtonColor: "#ef4444",
    });
  } finally {
    // إعادة تعيين الزر
    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
}
function validateFileSize(file, maxSizeMB = 5) {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
  }
  return true;
}
async function compressImage(
  file,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.7
) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");

        // حساب الأبعاد الجديدة مع الحفاظ على التناسب
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // تحويل إلى صيغة webp لتحسين الحجم
        const mimeType = "image/webp"; // استخدام webp لتحسين الحجم
        canvas.toBlob(
          (blob) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          },
          mimeType,
          quality
        );
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}
// تعديل دالة convertToBase64 لاستخدام الضغط
async function convertToBase64(file) {
  const compressedFile = await compressImage(file);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(compressedFile);
  });
}

// Initialize form event listener
document.addEventListener("DOMContentLoaded", () => {
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", updateUserProfile);
  }
});

// فتح مودال تعديل الطلب
async function openEditRequestModal(requestId) {
  try {
    // الحصول على التوكن من sessionStorage
    const authToken = sessionStorage.getItem("authToken");
    if (!authToken) {
      throw new Error("Authentication token not found");
    }

    // إعداد الهيدرز
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${authToken}`);

    // إعداد خيارات الطلب
    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    // جلب بيانات الطلب من API
    const response = await fetch(
      `https://backend-production-816c.up.railway.app/api/requests/${requestId}`,
      requestOptions
    );

    if (!response.ok) {
      throw new Error("Failed to fetch request data");
    }

    const request = await response.json();
    console.log("Request data received:", request);

    // تعبئة النموذج ببيانات الطلب
    document.getElementById("editRequestId").value = request._id;
    document.getElementById("editFirstName").value = request.firstName || "";
    document.getElementById("editLastName").value = request.lastName || "";
    document.getElementById("editEmail").value = request.email || "";
    document.getElementById("editPhone").value = request.phone || "";
    document.getElementById("editEstablishment").value =
      request.establishment || "";
    document.getElementById("editProgram").value = request.program || "";
    document.getElementById("editGraduationYear").value =
      request.graduationYear || "";
    document.getElementById("editInternalRef").value =
      request.internalRef || "";
    document.getElementById("editCompany").value = request.company || "";
    document.getElementById("editContact").value = request.contact || "";
    document.getElementById("editContactEmail").value =
      request.contactEmail || "";
    document.getElementById("editAddress").value = request.address || "";
    document.getElementById("editCountry").value = request.country || "";
    document.getElementById("editComment").value = request.comment || "";

    // تعبئة تاريخ الميلاد
    if (request.birthDate) {
      document.getElementById("editBirthDay").value =
        request.birthDate.day || "";
      document.getElementById("editBirthMonth").value =
        request.birthDate.month || "";
      document.getElementById("editBirthYear").value =
        request.birthDate.year || "";
    }

    // تعبئة روابط الملفات
    if (request.files) {
      const baseUrl = "https://backend-production-816c.up.railway.app/";

      // Consent Form
      const consentFormContainer = document.getElementById(
        "editConsentFormContainer"
      );
      if (request.files.consentForm) {
        const consentFormLink = document.getElementById("editConsentForm");
        consentFormLink.href = baseUrl + request.files.consentForm;
        consentFormLink.querySelector(
          "span"
        ).textContent = request.files.consentForm.split("/").pop();
        consentFormContainer.style.display = "block";
      } else {
        consentFormContainer.style.display = "none";
      }

      // ID Card
      const idCardContainer = document.getElementById("editIdCardContainer");
      if (request.files.idCard) {
        const idCardLink = document.getElementById("editIdCard");
        idCardLink.href = baseUrl + request.files.idCard;
        idCardLink.querySelector(
          "span"
        ).textContent = request.files.idCard.split("/").pop();
        idCardContainer.style.display = "block";
      } else {
        idCardContainer.style.display = "none";
      }

      // Diploma
      const diplomaContainer = document.getElementById("editDiplomaContainer");
      if (request.files.diploma) {
        const diplomaLink = document.getElementById("editDiploma");
        diplomaLink.href = baseUrl + request.files.diploma;
        diplomaLink.querySelector(
          "span"
        ).textContent = request.files.diploma.split("/").pop();
        diplomaContainer.style.display = "block";
      } else {
        diplomaContainer.style.display = "none";
      }
    }

    // إضافة معالجات الأحداث للملفات الجديدة
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input) => {
      input.addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (file) {
          try {
            validateFileSize(file, 5); // التحقق من حجم الملف (5MB)
          } catch (error) {
            Swal.fire({
              title: "Error!",
              text: error.message,
              icon: "error",
              confirmButtonText: "OK",
              confirmButtonColor: "#ef4444",
            });
            e.target.value = ""; // مسح اختيار الملف
          }
        }
      });
    });

    // عرض المودال
    document.getElementById("editRequestModal").classList.remove("hidden");
    document.getElementById("editRequestModal").classList.add("flex");
    document.body.style.overflow = "hidden";
  } catch (error) {
    console.error("Error fetching request data:", error);
    Swal.fire({
      title: "Error!",
      text: error.message || "Failed to load request data",
      icon: "error",
      confirmButtonText: "OK",
      confirmButtonColor: "#ef4444",
    });
  }
}

// تحديث دالة حفظ التغييرات لتشمل الملفات الجديدة
async function saveRequestChanges() {
  const requestId = document.getElementById("editRequestId").value;
  const formData = new FormData();

  // إضافة البيانات الأساسية
  formData.append("firstName", document.getElementById("editFirstName").value);
  formData.append("lastName", document.getElementById("editLastName").value);
  formData.append("email", document.getElementById("editEmail").value);
  formData.append("phone", document.getElementById("editPhone").value);
  formData.append(
    "establishment",
    document.getElementById("editEstablishment").value
  );
  formData.append("program", document.getElementById("editProgram").value);
  formData.append(
    "graduationYear",
    document.getElementById("editGraduationYear").value
  );
  formData.append(
    "internalRef",
    document.getElementById("editInternalRef").value
  );
  formData.append("company", document.getElementById("editCompany").value);
  formData.append("contact", document.getElementById("editContact").value);
  formData.append(
    "contactEmail",
    document.getElementById("editContactEmail").value
  );
  formData.append("address", document.getElementById("editAddress").value);
  formData.append("country", document.getElementById("editCountry").value);
  formData.append("comment", document.getElementById("editComment").value);

  // إضافة تاريخ الميلاد
  formData.append(
    "birthDate[day]",
    document.getElementById("editBirthDay").value
  );
  formData.append(
    "birthDate[month]",
    document.getElementById("editBirthMonth").value
  );
  formData.append(
    "birthDate[year]",
    document.getElementById("editBirthYear").value
  );

  // إضافة الملفات الجديدة إذا تم اختيارها
  const consentFormFile = document.querySelector('input[name="consentForm"]')
    .files[0];
  const idCardFile = document.querySelector('input[name="idCard"]').files[0];
  const diplomaFile = document.querySelector('input[name="diploma"]').files[0];

  if (consentFormFile) formData.append("consentForm", consentFormFile);
  if (idCardFile) formData.append("idCard", idCardFile);
  if (diplomaFile) formData.append("diploma", diplomaFile);

  try {
    const authToken = sessionStorage.getItem("authToken");
    if (!authToken) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(
      `https://backend-production-816c.up.railway.app/api/requests/${requestId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update request");
    }

    // تحديث البيانات المحلية
    const updatedRequest = await response.json();
    const requestIndex = allRequests.findIndex((req) => req._id === requestId);
    if (requestIndex !== -1) {
      allRequests[requestIndex] = {
        ...allRequests[requestIndex],
        ...updatedRequest,
      };
    }

    // إغلاق المودال
    closeModal("editRequestModal");

    // تحديث عرض الطلبات
    applyFilters();

    // عرض رسالة نجاح
    Swal.fire({
      title: "Success!",
      text: "Request updated successfully",
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#7e22ce",
    });
  } catch (error) {
    console.error("Error updating request:", error);
    Swal.fire({
      title: "Error!",
      text: error.message || "Failed to update request",
      icon: "error",
      confirmButtonText: "OK",
      confirmButtonColor: "#ef4444",
    });
  }
}

// متغيرات عامة
let currentConversationId = null;
let currentRequestId = null;
var currentUserId = sessionStorage.getItem("IdUser");

// فتح نافذة المحادثة
async function openChatModal(requestId, userId = null) {
  currentRequestId = requestId;

  // إذا لم يتم تمرير userId، حاول استخراجه من الـ token
  if (!userId) {
    try {
      const authToken = sessionStorage.getItem("authToken");
      if (authToken) {
        const payload = JSON.parse(atob(authToken.split(".")[1]));
        userId = payload.id || payload.userId;
        console.log("Extracted userId from token:", userId);
      }
    } catch (error) {
      console.error("Error extracting userId from token:", error);
    }
  }
  if (!userId || !requestId) {
    displaySystemMessage("بيانات غير كاملة لفتح المحادثة");
    return;
  }

  currentUserId = userId;
  console.log("Final currentUserId:", currentUserId); // للتتبع

  if (!currentUserId) {
    console.error("No userId available");
    displaySystemMessage("Unable to identify user. Please login again.");
    return;
  }

  // إظهار النافذة
  chatModal.classList.remove("hidden");
  chatModal.classList.add("flex");
  document.body.style.overflow = "hidden";

  // تحميل المحادثة
  await loadConversation(requestId, userId);

  // التركيز على حقل الإدخال
  document.getElementById("chatInput").focus();
}

// تحميل المحادثة والرسائل
async function loadConversation(requestId, userId) {
  try {
    // 1. الحصول على جميع المحادثات (بدون فلترة مسبقة من السيرفر)
    const conversations = await getAllConversations();

    // 2. البحث عن المحادثة المطابقة تماماً لـ requestId و userId
    const conversation = conversations.find((conv) => {
      // تحقق من وجود requestId و userId في المحادثة
      const requestMatch = conv.requestId?._id === requestId;
      const userMatch = conv.userId?._id === userId;

      return requestMatch && userMatch;
    });

    console.log("Found conversation:", conversation);

    if (conversation) {
      currentConversationId = conversation._id;
      await loadMessages(conversation._id);
    } else {
      currentConversationId = null;
      displaySystemMessage("ابدأ محادثة جديدة");
    }
  } catch (error) {
    console.error("Error loading conversation:", error);
    displaySystemMessage("فشل تحميل المحادثة");
  }
}
// الحصول على جميع المحادثات
async function getAllConversations(userId, requestId) {
  const authToken = sessionStorage.getItem("authToken");
  if (!authToken) throw new Error("Authentication token not found");

  // إضافة بارامترات الفلترة إلى URL
  const url = new URL(
    "https://backend-production-816c.up.railway.app/api/requests/conversations"
  );
  if (userId) url.searchParams.append("userId", userId);
  if (requestId) url.searchParams.append("requestId", requestId);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) throw new Error("Failed to load conversations");

  const data = await response.json();

  return data.conversations;
}

async function loadMessages(conversationId) {
  try {
    const response = await fetch(
      `https://backend-production-816c.up.railway.app/api/requests/conversation/${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to load messages");

    const data = await response.json();

    // فلترة إضافية للتأكد (يمكن حذفها إذا كان السيرفر يضمن الفلترة)
    const filteredMessages = data.messages.filter(
      (message) =>
        message.senderRole === "user" ||
        message.conversationId === conversationId
    );

    displayMessages(filteredMessages);
  } catch (error) {
    console.error("Error loading messages:", error);
    displaySystemMessage("فشل تحميل الرسائل");
  }
}
// عرض الرسائل
function displayMessages(messages) {
  const chatMessagesContainer = document.getElementById("chatMessages");
  chatMessagesContainer.innerHTML = "";

  if (messages.length === 0) {
    displaySystemMessage("No messages yet");
    return;
  }

  messages.forEach((message) => {
    const messageElement = createMessageElement(message);
    chatMessagesContainer.appendChild(messageElement);
  });

  // التمرير إلى الأسفل
  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

// إنشاء عنصر رسالة
function createMessageElement(message) {
  const messageDiv = document.createElement("div");
  const isUser = message.senderRole === "user";

  messageDiv.className = `flex ${isUser ? "justify-start" : "justify-end"}`;

  const messageBubble = document.createElement("div");
  messageBubble.className = `max-w-[70%] rounded-lg p-3 ${
    isUser ? "bg-violet-100 text-violet-900" : "bg-violet-600 text-white"
  }`;

  const messageContent = document.createElement("p");
  messageContent.className = "text-sm";
  messageContent.textContent = message.messageText;

  const messageFooter = document.createElement("div");
  messageFooter.className = "flex items-center justify-end mt-1 space-x-1";

  const messageTime = document.createElement("span");
  messageTime.className = `text-xs ${
    isUser ? "text-violet-600" : "text-violet-200"
  }`;
  messageTime.textContent = new Date(message.createdAt).toLocaleTimeString();

  messageFooter.appendChild(messageTime);
  messageBubble.appendChild(messageContent);
  messageBubble.appendChild(messageFooter);
  messageDiv.appendChild(messageBubble);

  return messageDiv;
}

// عرض رسالة النظام
function displaySystemMessage(text) {
  const chatMessagesContainer = document.getElementById("chatMessages");
  const messageDiv = document.createElement("div");
  messageDiv.className = "flex justify-center";

  const messageBubble = document.createElement("div");
  messageBubble.className =
    "bg-gray-200 text-gray-700 rounded-lg px-3 py-1 text-sm";
  messageBubble.textContent = text;

  messageDiv.appendChild(messageBubble);
  chatMessagesContainer.appendChild(messageDiv);
}

// إرسال رسالة جديدة
async function sendMessage() {
  const input = document.getElementById("chatInput");
  const messageText = input.value.trim();
  console.log(currentUserId);

  if (!messageText || !currentRequestId || !currentUserId) return;

  console.log("iiii");
  try {
    const authToken = sessionStorage.getItem("authToken");
    if (!authToken) throw new Error("Authentication token not found");

    // تحضير بيانات الرسالة
    const messageData = {
      requestId: currentRequestId,
      userId: currentUserId,
      messageText: messageText,
      senderRole: "user",
    };

    if (messageData) {
      console.log(":;;;");
    } else {
      console.log("iiii");
    }

    // إرسال الرسالة
    const response = await fetch(
      "https://backend-production-816c.up.railway.app/api/requests/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(messageData),
      }
    );

    console.log("ll");
    if (!response.ok) throw new Error("Failed to send message");

    console.log(response);
    input.value = "";

    // إعادة تحميل الرسائل
    if (currentConversationId) {
      await loadMessages(currentConversationId);
    } else {
      // إذا كانت محادثة جديدة، نعيد تحميل المحادثات
      await loadConversation(currentRequestId, currentUserId);
    }
  } catch (error) {
    console.error("Error sending message:", error);
    displaySystemMessage("Failed to send message");
  }
}

// إضافة مستمع لزر الإرسال
document.getElementById("chatForm").addEventListener("submit", function (e) {
  e.preventDefault();
  sendMessage();
});
