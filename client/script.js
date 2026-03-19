const nextBtn = document.getElementById("nextBtn");
const salamiForm = document.getElementById("salamiForm");
const spinBtn = document.getElementById("spinBtn");
const wheel = document.getElementById("wheel");
const spinMessage = document.getElementById("spinMessage");

const resultAmount = document.getElementById("resultAmount");
const userName = document.getElementById("userName");
const userBkash = document.getElementById("userBkash");

const homeBtn = document.getElementById("homeBtn");

const adminLoginForm = document.getElementById("adminLoginForm");
const adminList = document.getElementById("adminList");
const totalUsers = document.getElementById("totalUsers");
const logoutBtn = document.getElementById("logoutBtn");

// index page
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    window.location.href = "form.html";
  });
}

// form page
if (salamiForm) {
  salamiForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const bkashNumber = document.getElementById("bkashNumber").value.trim();
    const message = document.getElementById("message");

    if (!name || !bkashNumber) {
      message.textContent = "Name and bKash number are required";
      return;
    }

    if (bkashNumber.length !== 11) {
      message.textContent = "bKash number must be 11 digits";
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/salami/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, bkashNumber })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("name", name);
        localStorage.setItem("bkashNumber", bkashNumber);

        message.textContent = "Registration successful!";

        setTimeout(() => {
          window.location.href = "spin.html";
        }, 800);
      } else {
        message.textContent = data.message;
      }
    } catch (error) {
      message.textContent = "Server error!";
    }
  });
}

// spin page
if (spinBtn && wheel) {
  spinBtn.addEventListener("click", async () => {
    const bkashNumber = localStorage.getItem("bkashNumber");

    if (!bkashNumber) {
      alert("Please register first");
      window.location.href = "form.html";
      return;
    }

    spinBtn.disabled = true;

    if (spinMessage) {
      spinMessage.textContent = "Spinning...";
    }

    try {
      const response = await fetch("http://localhost:5000/api/salami/spin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ bkashNumber })
      });

      const data = await response.json();

      if (!data.success) {
        if (spinMessage) {
          spinMessage.textContent = data.message;
        }
        spinBtn.disabled = false;
        return;
      }

      const amount = data.amount;
      localStorage.setItem("salamiAmount", amount);

      const amounts = [
        0.01, 0.10, 0.20, 0.29, 0.50,
        1, 3, 5, 7, 10,
        15, 17, 14, 4, 13,
        12, 11, 19, 20
      ];

      const index = amounts.indexOf(amount);
      const segmentAngle = 360 / amounts.length;
      const stopAngle = segmentAngle * index + segmentAngle / 2;
      const extraSpins = 5 * 360;
      const finalRotation = extraSpins + (360 - stopAngle);

      wheel.style.transform = `rotate(${finalRotation}deg)`;

      setTimeout(() => {
        window.location.href = "result.html";
      }, 5200);
    } catch (error) {
      if (spinMessage) {
        spinMessage.textContent = "Server error!";
      }
      spinBtn.disabled = false;
    }
  });
}

// result page
if (resultAmount) {
  const amount = localStorage.getItem("salamiAmount");
  const name = localStorage.getItem("name");
  const bkashNumber = localStorage.getItem("bkashNumber");

  resultAmount.textContent = `You got ${amount} Tk Salami`;

  if (userName) {
    userName.textContent = `Name: ${name}`;
  }

  if (userBkash) {
    userBkash.textContent = `bKash: ${bkashNumber}`;
  }
}

// back to home
if (homeBtn) {
  homeBtn.addEventListener("click", () => {
    localStorage.removeItem("name");
    localStorage.removeItem("bkashNumber");
    localStorage.removeItem("salamiAmount");
    window.location.href = "index.html";
  });
}

// admin login
if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const password = document.getElementById("adminPassword").value;
    const message = document.getElementById("loginMessage");
    const ADMIN_PASSWORD = "rafi123";

    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("adminLoggedIn", "true");
      window.location.href = "admin.html";
    } else {
      message.textContent = "Wrong password";
    }
  });
}

// admin dashboard
if (adminList) {
  loadUsers();
}

function loadUsers(filter = "") {
  fetch("http://localhost:5000/api/salami/all")
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        adminList.innerHTML = "";

        let users = data.data;

        if (filter) {
          users = users.filter((user) => user.status === filter);
        }

        if (totalUsers) {
          totalUsers.textContent = users.length;
        }

        users.forEach((user) => {
          const div = document.createElement("div");
          div.classList.add("admin-item");

          div.innerHTML = `
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>bKash:</strong> ${user.bkashNumber}</p>
            <p><strong>Amount:</strong> ${user.amount} Tk</p>
            <p><strong>Status:</strong> ${user.status}</p>
            ${
              user.status === "pending"
                ? `<button onclick="markPaid('${user._id}')">Mark as Paid</button>`
                : ""
            }
          `;

          adminList.appendChild(div);
        });
      } else {
        adminList.innerHTML = "Failed to load data";
      }
    })
    .catch(() => {
      adminList.innerHTML = "Server error";
    });
}

function markPaid(id) {
  fetch(`http://localhost:5000/api/salami/paid/${id}`, {
    method: "PUT"
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert("Marked as Paid");
        loadUsers();
      } else {
        alert(data.message);
      }
    })
    .catch(() => {
      alert("Server error");
    });
}

// logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "admin-login.html";
  });
}