// File: public/js/dashboard.cjs
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Dashboard loading...");
  // Logout functionality
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      try {
        const response = await fetch("/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // Redirect to the login page after successful logout
          globalThis.window.location.href = "/login";
        } else {
          console.error("Logout failed");
        }
      } catch (error) {
        console.error("Error during logout:", error);
        globalThis.window.location.href = "/login";
      }
    });
  }

  try {
    const response = await fetch("/api/dashboard", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Response:", response);

    if (!response.ok) {
      globalThis.window.location.href = "/login";
      console.error("Failed to fetch dashboard data");
    }

    const data = await response.json();

    // Update accounts section dynamically
    const accountsContainer = document.getElementById("accountsContainer");
    if (!accountsContainer) throw new Error("No accounts container found");
    accountsContainer.innerHTML = ""; // Clear any existing content

    if (data.accounts.length === 0) {
      // Create a card to create an account
      console.log("No Accounts");
      const accountCard = document.createElement("div");
      accountCard.classList.add("col-md-6", "col-lg-4", "mb-4");
      accountCard.innerHTML = `
        <div class="account-card">
          <div class="card-body">
            <h5 class="card-title
            ">Create an Account</h5>
            <p class="card-text text-muted mb-3">Get started by creating a new account</p>
            <button class="btn btn-primary">Create Account</button>
          </div>
        </div>
      `;
      // @ts-ignore <!-- button is guaranteed to exist by above -->
      accountCard.querySelector("button").addEventListener(
        "click",
        async () => {
          try {
            const response = await fetch("/api/accounts/create", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ type: "checking" }),
            });

            if (response.ok) {
              // Refresh the page after successful account creation
              globalThis.window.location.reload();
            } else {
              console.error("Failed to create account");
            }
          } catch (error) {
            console.error("Error during account creation:", error);
          }
        },
      );

      accountsContainer.appendChild(accountCard);
    }
    /**
     * @typedef {Object} Account
     * @property {string} id
     * @property {string} userId
     * @property {string} type
     * @property {string} accountNumber
     * @property {number} balance
     * @property {string} createdAt
     */
    data.accounts.forEach((/** @type {Account}*/ account) => {
      console.log("Account:", account);
      const accountCard = document.createElement("div");
      accountCard.classList.add("col-md-6", "col-lg-4", "mb-4");
      accountCard.innerHTML = `
        <div class="account-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="card-title mb-0">${
                account.type.charAt(0).toUpperCase() + account.type.slice(1)
              } Account</h5>
              <span class="badge ${
                account.type === "checking" ? "bg-primary" : "bg-secondary"
              }">
                ${account.type === "checking" ? "Primary" : "Savings"}
              </span>
            </div>
            <p class="card-text text-muted mb-1">Account: ••••${account.id.slice(-4)}</p>
            <div class="account-balance mb-3">$${account.balance}</div>
            <div class="d-flex gap-2">
              <a href="/transfer" class="btn btn-sm btn-outline-primary">Transfer</a>
              <button class="btn btn-sm btn-outline-secondary">Details</button>
            </div>
          </div>
        </div>
      `;
      accountsContainer.appendChild(accountCard);
    });

    // Example: Update monthly spending (similar updates can be applied to other elements)
    const spendingElem = document.querySelector(".stats-card .stat-value");
    if (spendingElem) {
      spendingElem.textContent = "$" + data.summary.monthlySpending.toFixed(2);
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }
});