// Function to fetch and display recent requests
// Sample data for demonstration
const requests = [
  {
    id: "#1234",
    userName: "John Doe",
    date: "2024-03-15",
    status: "Approved",
  },
  {
    id: "#1235",
    userName: "Jane Smith",
    date: "2024-03-14",
    status: "Pending",
  },
  {
    id: "#1236",
    userName: "Mike Johnson",
    date: "2024-03-13",
    status: "Pending",
  },
];

const payments = [
  {
    invoice: "INV-001",
    status: "Success",
    amount: "$1,200.00",
    date: "2024-03-15",
  },
  {
    invoice: "INV-002",
    status: "Failed",
    amount: "$800.00",
    date: "2024-03-14",
  },
];

// Function to filter requests
function filterRequests(status) {
  // Implementation for filtering requests
  console.log(`Filtering requests by: ${status}`);
}

// Function to update request status
function updateRequestStatus(requestId, newStatus) {
  // Implementation for updating request status
  console.log(`Updating request ${requestId} to ${newStatus}`);
}

// Function to show notification
function showNotification(message, type) {
  // Implementation for showing notifications
  console.log(`Showing ${type} notification: ${message}`);
}

// Sidebar Toggle Functionality
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebar = document.querySelector("aside");
const mainContent = document.querySelector("main");
const header = document.querySelector("header");

sidebarToggle.addEventListener("click", () => {
  sidebar.classList.toggle("-translate-x-full");
});

// Close sidebar when clicking outside on mobile
document.addEventListener("click", (e) => {
  if (window.innerWidth < 1024) {
    if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
      sidebar.classList.add("-translate-x-full");
    }
  }
});

// Donut chart configs for each card
const donutConfigs = [
  {
    id: "donut-total",
    data: [800, 300, 134],
    colors: ["#f9a8d4", "#6ee7b7", "#93c5fd"],
  },
  {
    id: "donut-pending",
    data: [30, 10, 2],
    colors: ["#f9a8d4", "#6ee7b7", "#93c5fd"],
  },
  {
    id: "donut-rejected",
    data: [10, 3, 2],
    colors: ["#f9a8d4", "#6ee7b7", "#93c5fd"],
  },
  {
    id: "donut-new",
    data: [60, 20, 9],
    colors: ["#f9a8d4", "#6ee7b7", "#93c5fd"],
  },
];
donutConfigs.forEach((cfg) => {
  const ctx = document.getElementById(cfg.id).getContext("2d");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["ON HOLD", "In progress", "Candidate Action Required"],
      datasets: [
        {
          data: cfg.data,
          backgroundColor: cfg.colors,
          borderWidth: 0,
        },
      ],
    },
    options: {
      cutout: "70%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
      responsive: false,
    },
  });
});

// Scroll Animation
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove("opacity-0", "translate-y-10");
        entry.target.classList.add("opacity-100", "translate-y-0");
      }
    });
  },
  {
    threshold: 0.1,
  }
);

// Observe the chart container
const chartContainer = document.getElementById("requestsChartContainer");
observer.observe(chartContainer);

// Requests Overview Chart with Animation
const requestsCtx = document.getElementById("requestsChart").getContext("2d");
let requestsChart;

// Function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short" });
}

// Function to filter data by time period
function filterDataByTimePeriod(data, period) {
  if (!Array.isArray(data)) {
    console.error("Data is not an array:", data);
    return [];
  }

  const now = new Date();
  return data.filter((item) => {
    if (!item || !item.createdAt) {
      return false;
    }
    const itemDate = new Date(item.createdAt);
    if (isNaN(itemDate.getTime())) {
      return false;
    }

    switch (period) {
      case "year":
        return itemDate.getFullYear() === now.getFullYear();
      case "month":
        return (
          itemDate.getMonth() === now.getMonth() &&
          itemDate.getFullYear() === now.getFullYear()
        );
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= weekAgo;
      default:
        return true;
    }
  });
}

// Function to process data for chart
function processDataForChart(data) {
  if (!Array.isArray(data)) {
    console.error("Data is not an array in processDataForChart:", data);
    return {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "Total Requests",
          data: new Array(12).fill(0),
          borderColor: "#4c1d95",
          backgroundColor: "rgba(76, 29, 149, 0.1)",
          tension: 0.4,
          fill: true,
          borderWidth: 3,
          pointBackgroundColor: "#4c1d95",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: "Approved Requests",
          data: new Array(12).fill(0),
          borderColor: "#a78bfa",
          backgroundColor: "rgba(167, 139, 250, 0.1)",
          tension: 0.4,
          fill: true,
          borderWidth: 3,
          pointBackgroundColor: "#a78bfa",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: "Pending Requests",
          data: new Array(12).fill(0),
          borderColor: "#ddd6fe",
          backgroundColor: "rgba(221, 214, 254, 0.1)",
          tension: 0.4,
          fill: true,
          borderWidth: 3,
          pointBackgroundColor: "#ddd6fe",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const totalRequests = new Array(12).fill(0);
  const approvedRequests = new Array(12).fill(0);
  const pendingRequests = new Array(12).fill(0);

  data.forEach((item) => {
    if (!item || !item.createdAt) return;

    const date = new Date(item.createdAt);
    if (isNaN(date.getTime())) return;

    const monthIndex = date.getMonth();

    totalRequests[monthIndex]++;
    if (item.status === "approved") {
      approvedRequests[monthIndex]++;
    } else if (item.status === "pending") {
      pendingRequests[monthIndex]++;
    }
  });

  return {
    labels: months,
    datasets: [
      {
        label: "Total Requests",
        data: totalRequests,
        borderColor: "#4c1d95",
        backgroundColor: "rgba(76, 29, 149, 0.1)",
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointBackgroundColor: "#4c1d95",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Approved Requests",
        data: approvedRequests,
        borderColor: "#a78bfa",
        backgroundColor: "rgba(167, 139, 250, 0.1)",
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointBackgroundColor: "#a78bfa",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Pending Requests",
        data: pendingRequests,
        borderColor: "#ddd6fe",
        backgroundColor: "rgba(221, 214, 254, 0.1)",
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointBackgroundColor: "#ddd6fe",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
}

// Function to update chart
function updateChart(data, period) {
  const filteredData = filterDataByTimePeriod(data, period);
  const chartData = processDataForChart(filteredData);

  if (requestsChart) {
    requestsChart.data = chartData;
    requestsChart.update("none");
  } else {
    requestsChart = new Chart(requestsCtx, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        animation: {
          duration: 2000,
          easing: "easeInOutQuart",
        },
        plugins: {
          legend: {
            position: "top",
            align: "end",
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12,
                family: "'Inter', sans-serif",
              },
            },
          },
          tooltip: {
            backgroundColor: "rgba(76, 29, 149, 0.9)",
            titleFont: {
              size: 14,
              family: "'Inter', sans-serif",
            },
            bodyFont: {
              size: 13,
              family: "'Inter', sans-serif",
            },
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(76, 29, 149, 0.1)",
              drawBorder: false,
            },
            ticks: {
              font: {
                family: "'Inter', sans-serif",
              },
              padding: 10,
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                family: "'Inter', sans-serif",
              },
              padding: 10,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
      },
    });
  }
}

// Fetch data from API
function fetchRecentRequests() {
  fetch("https://backend-production-816c.up.railway.app/api/requests/")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      // تحقق من بنية البيانات وتعديلها حسب الحاجة
      let requests = data;

      // إذا كانت البيانات تحتوي على خاصية requests
      if (data && data.requests) {
        requests = data.requests;
      }

      // فرز الطلبات حسب التاريخ (الأحدث أولاً)
      requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // عرض آخر طلبين فقط
      const recentRequests = requests.slice(0, 2);

      const tableBody = document.getElementById("requestsTableBody");
      tableBody.innerHTML = "";

      if (recentRequests.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="4" class="px-6 py-4 text-center text-violet-900">
              No requests found
            </td>
          </tr>
        `;
        return;
      }

      recentRequests.forEach((request) => {
        const row = document.createElement("tr");

        // تحديد لون الحالة بناءً على status
        let statusClass = "bg-gray-100 text-gray-800";
        if (request.status === "approved") {
          statusClass = "bg-green-100 text-green-800";
        } else if (request.status === "pending") {
          statusClass = "bg-yellow-100 text-yellow-800";
        } else if (request.status === "rejected") {
          statusClass = "bg-red-100 text-red-800";
        }

        // تنسيق التاريخ
        const requestDate = request.createdAt
          ? new Date(request.createdAt).toLocaleDateString()
          : "N/A";

        row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-violet-900">
            ${request._id || "N/A"}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-violet-900">
            ${request.lastName || request.user?.name || "N/A"}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-violet-900">
            ${requestDate}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="${statusClass} px-2 py-1 rounded-full text-sm capitalize">
              ${request.status || "unknown"}
            </span>
          </td>
        `;

        tableBody.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Error fetching requests:", error);
      document.getElementById("requestsTableBody").innerHTML = `
        <tr>
          <td colspan="4" class="px-6 py-4 text-center text-violet-900">
            Error loading requests. Please try again later.
          </td>
        </tr>
      `;
    });
}

// استدعاء الدالة عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", fetchRecentRequests);

fetch("https://backend-production-816c.up.railway.app/api/requests/")
  .then((response) => response.json())
  .then((responseData) => {
    // Check if responseData is an array, if not, try to parse it
    let data;
    try {
      // If responseData is a string, parse it
      if (typeof responseData === "string") {
        data = JSON.parse(responseData);
      } else {
        data = responseData;
      }

      // Check if data has a requests property
      if (data && data.requests && Array.isArray(data.requests)) {
        data = data.requests;
      } else if (!Array.isArray(data)) {
        console.error("API response is not in expected format:", data);
        return;
      }

      // Initial chart with yearly data
      updateChart(data, "year");

      // Add event listener for time period selection
      document.querySelector("select").addEventListener("change", function () {
        updateChart(data, this.value);
      });
    } catch (error) {
      console.error("Error processing API response:", error);
    }
  })
  .catch((error) => console.error("Error fetching data:", error));
fetch("./Sidebar.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("Sidebar-container").innerHTML = data;
    // Initialize navbar functionality
    loadNavbar();
  });
