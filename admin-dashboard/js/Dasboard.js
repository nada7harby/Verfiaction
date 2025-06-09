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
    if (item.status === "accepted") {
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
// Modify the existing updateChart function to work with real data
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

// Function to safely get DOM element
function getElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with id '${id}' not found`);
    return null;
  }
  return element;
}

// Function to safely get canvas context
function getCanvasContext(canvasId) {
  const canvas = getElement(canvasId);
  if (!canvas) {
    console.warn(`Canvas with id '${canvasId}' not found`);
    return null;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.warn(`Could not get 2d context for canvas '${canvasId}'`);
    return null;
  }
  return ctx;
}

// Function to safely create chart
function createChart(canvasId, config) {
  const ctx = getCanvasContext(canvasId);
  if (!ctx) return null;

  try {
    return new Chart(ctx, config);
  } catch (error) {
    console.error(`Error creating chart for canvas '${canvasId}':`, error);
    return null;
  }
}

// Function to safely add event listener
function addEventListenerSafe(element, event, handler) {
  if (element) {
    element.addEventListener(event, handler);
  }
}

// Function to safely set innerHTML
function setInnerHTMLSafe(element, content) {
  if (element) {
    element.innerHTML = content;
  }
}

// Function to safely set textContent
function setTextContentSafe(element, content) {
  if (element) {
    element.textContent = content;
  }
}

// Modify the fetchRecentRequests function
function fetchRecentRequests() {
  const tableBody = getElement("requestsTableBody");
  if (!tableBody) return;

  fetch("https://spatrak.com/api/requests/")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      let requests = data;
      if (data && data.requests) {
        requests = data.requests;
      }

      requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const recentRequests = requests.slice(0, 2);

      if (recentRequests.length === 0) {
        setInnerHTMLSafe(
          tableBody,
          `
          <tr>
            <td colspan="4" class="px-6 py-4 text-center text-violet-900">
              No requests found
            </td>
          </tr>
                `
        );
        return;
      }

      let tableContent = "";
      recentRequests.forEach((request) => {
        let statusClass = "bg-gray-100 text-gray-800";
        if (request.status === "approved") {
          statusClass = "bg-green-100 text-green-800";
        } else if (request.status === "pending") {
          statusClass = "bg-yellow-100 text-yellow-800";
        } else if (request.status === "rejected") {
          statusClass = "bg-red-100 text-red-800";
        }

        const requestDate = request.createdAt
          ? new Date(request.createdAt).toLocaleDateString()
          : "N/A";

        tableContent += `
                    <tr>
          <td class="px-6 py-5 whitespace-nowrap text-violet-900 text-lg font-semibold">${
                          request._id
                            ? "RV" + request._id.substring(0, 6)
                            : "N/A"
                        }</td>
          <td class="px-6 py-4 whitespace-nowrap text-violet-900">
            ${request.firstName || request.user?.name || "N/A"}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-violet-900">
            ${requestDate}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="${statusClass} px-2 py-1 rounded-full text-sm capitalize">
              ${request.status || "unknown"}
            </span>
          </td>
                    </tr>
        `;
      });

      setInnerHTMLSafe(tableBody, tableContent);
    })
    .catch((error) => {
      console.error("Error fetching requests:", error);
      setInnerHTMLSafe(
        tableBody,
        `
        <tr>
          <td colspan="4" class="px-6 py-4 text-center text-violet-900">
            Error loading requests. Please try again later.
          </td>
        </tr>
            `
      );
    });
}

// Modify the initializeCharts function
async function initializeCharts() {
  try {
    const data = await fetchDataForCharts();
    if (!data || !Array.isArray(data)) {
      console.error("Invalid data format received");
      return;
    }

    // Calculate counts from API data
    const totalRequests = data.length;
    const pendingRequests = data.filter((req) => req.status === "pending")
      .length;
    const acceptedRequests = data.filter((req) => req.status === "accepted")
      .length;
    const rejectedRequests = data.filter((req) => req.status === "rejected")
      .length;

    // Get current month data
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const newThisMonth = data.filter((req) => {
      if (!req.createdAt) return false;
      const reqDate = new Date(req.createdAt);
      return (
        reqDate.getMonth() === currentMonth &&
        reqDate.getFullYear() === currentYear
      );
    }).length;

    // Update the numbers displayed in the center of each donut chart
    const totalElement = document.querySelector("#donut-total + div span");
    const pendingElement = document.querySelector("#donut-pending + div span");
    const rejectedElement = document.querySelector(
      "#donut-rejected + div span"
    );
    const newElement = document.querySelector("#donut-new + div span");

    setTextContentSafe(totalElement, totalRequests);
    setTextContentSafe(pendingElement, pendingRequests);
    setTextContentSafe(rejectedElement, acceptedRequests);
    setTextContentSafe(newElement, newThisMonth);

    // Initialize donut charts
    const donutConfigs = [
      {
        id: "donut-total",
        data: [pendingRequests, acceptedRequests, rejectedRequests],
        colors: ["#fbbf24", "#34d399", "#f3f4f6"],
        labels: ["Pending", "Accepted", "Rejected"],
      },
      {
        id: "donut-pending",
        data: [pendingRequests, totalRequests - pendingRequests],
        colors: ["#fbbf24", "#f3f4f6"],
        labels: ["Pending", "Others"],
      },
      {
        id: "donut-rejected",
        data: [acceptedRequests, totalRequests - acceptedRequests],
        colors: ["#34d399", "#f3f4f6"],
        labels: ["Accepted", "Others"],
      },
      {
        id: "donut-new",
        data: [
          data.filter(
            (req) =>
              req.status === "pending" &&
              new Date(req.createdAt).getMonth() === currentMonth
          ).length,
          data.filter(
            (req) =>
              req.status === "accepted" &&
              new Date(req.createdAt).getMonth() === currentMonth
          ).length,
          data.filter(
            (req) =>
              req.status === "rejected" &&
              new Date(req.createdAt).getMonth() === currentMonth
          ).length,
        ],
        colors: ["#fbbf24", "#34d399", "#f3f4f6"],
        labels: ["Pending", "Accepted", "Rejected"],
      },
    ];

    donutConfigs.forEach((cfg) => {
      createChart(cfg.id, {
        type: "doughnut",
        data: {
          labels: cfg.labels,
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

    // Initialize the main chart
    const requestsCtx = getCanvasContext("requestsChart");
    if (requestsCtx) {
      const chartData = processDataForChart(data);
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
  } catch (error) {
    console.error("Error initializing charts:", error);
  }
}

// Modify the event listeners
document.addEventListener("DOMContentLoaded", () => {
  const select = document.querySelector("select");
  if (select) {
    select.addEventListener("change", function () {
      fetchDataForCharts().then((data) => {
        if (data) {
          updateChart(data, this.value);
        }
      });
    });
  }

  // Initialize charts and fetch requests
  initializeCharts();
  fetchRecentRequests();

  // Refresh data every 5 minutes
  setInterval(() => {
    initializeCharts();
    fetchRecentRequests();
  }, 300000);
});

// Function to fetch and process data for charts
async function fetchDataForCharts() {
  try {
    const response = await fetch("https://spatrak.com/api/requests");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    let data = await response.json();

    // Check if data has a requests property
    if (data && data.requests) {
      data = data.requests;
    }

    // Make sure data is an array
    if (!Array.isArray(data)) {
      throw new Error("Invalid data format");
    }

    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

fetch("./Sidebar.html")
  .then((response) => response.text())
  .then((htmlString) => {
    // Create a temporary div to parse the html string
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;

    // Get the inner content of the aside element
    const sidebarInnerContent = tempDiv.querySelector("aside").innerHTML;

    // Inject the inner content into the sidebar container in dashboard.html
    document.getElementById(
      "Sidebar-container"
    ).innerHTML = sidebarInnerContent;

    // Initialize navbar functionality (assuming loadNavbar is defined elsewhere or not needed with this approach)
    // loadNavbar();
  });
