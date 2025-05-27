// المتغيرات العامة
let allRequests = [];
let currentPage = 1;
const itemsPerPage = 10;
let currentFilters = {
  status: "all",
  type: "all",
  search: "",
};

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
                      request._id || "N/A"
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
                            <button onclick="openEditModal('${
                              request._id
                            }')" class="text-white bg-violet-600 hover:bg-violet-700 px-3 py-1 rounded-lg transition flex items-center">
                                <i class="fas fa-edit mr-1"></i> Message
                            </button>
                            <button onclick="openViewModal('${
                              request._id
                            }')" class="text-violet-700 bg-violet-100 hover:bg-violet-200 px-3 py-1 rounded-lg transition flex items-center">
                                <i class="fas fa-eye mr-1"></i> View
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
                                ? request._id.substring(0, 6) + "..."
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
      avatarImg.src = userData.image;
      console.log("Using profile image from API:", userData.image);
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
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById("userAvatar").src = e.target.result;
      // يمكنك هنا إضافة كود لرفع الصورة إلى السيرفر إذا أردت
    };
    reader.readAsDataURL(file);
  }
}
// دالة لتحديث بيانات البروفايل
async function updateUserProfile(event) {
  event.preventDefault();

  try {
    const authToken = sessionStorage.getItem("authToken");
    if (!authToken) throw new Error("Please login again");

    const payload = JSON.parse(atob(authToken.split('.')[1]));
    const userId = payload.id;

    // إنشاء كائن البيانات الأساسي
    const data = {
      firstname: document.getElementById("firstName").value,
      lastname: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      password: "",
      image: ""
    };

    // معالجة الصورة إذا وجدت
    const avatarInput = document.getElementById("avatarInput");
    if (avatarInput && avatarInput.files[0]) {
      data.image = await convertToBase64(avatarInput.files[0]);
    }

    // إعداد الطلب
    const requestOptions = {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify(data)
    };

    // عرض حالة التحميل
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Updating...";

    // إرسال الطلب
    const response = await fetch(
      `https://backend-production-816c.up.railway.app/api/requests/users/${userId}`,
      requestOptions
    );

    // ... باقي الكود كما هو ...
  } catch (error) {
    // ... معالجة الأخطاء ...
  } finally {
    // ... إعادة تعيين الزر ...
  }
}

// دالة مساعدة لتحويل الملف إلى base64
function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
// Initialize form event listener
document.addEventListener("DOMContentLoaded", () => {
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", updateUserProfile);
  }
});