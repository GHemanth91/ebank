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

  // Initialize modals
  const quickTransferModal = document.getElementById('quickTransferModal');
  const payBillModal = document.getElementById('payBillModal');

  // Quick Transfer Submit Button
  const quickTransferSubmit = document.getElementById('quickTransferSubmit');
  if (quickTransferSubmit) {
    quickTransferSubmit.addEventListener('click', handleQuickTransfer);
  }

  // Pay Bill Submit Button
  const payBillSubmit = document.getElementById('payBillSubmit');
  if (payBillSubmit) {
    payBillSubmit.addEventListener('click', handlePayBill);
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

    // Populate account dropdowns in modals
    populateAccountDropdowns(data.accounts);

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

  /**
   * Handle quick transfer form submission
   */
  async function handleQuickTransfer() {
    const fromAccountId = document.getElementById('quickFromAccount').value;
    const toAccountId = document.getElementById('quickToAccount').value;
    const amount = parseFloat(document.getElementById('quickAmount').value);
    const description = document.getElementById('quickNote').value || 'Quick Transfer';

    if (!fromAccountId || !toAccountId || isNaN(amount) || amount <= 0) {
      alert('Please fill in all required fields with valid values');
      return;
    }

    if (fromAccountId === toAccountId) {
      alert('Cannot transfer to the same account');
      return;
    }

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromAccountId,
          toAccountId,
          amount,
          description
        })
      });

      if (response.ok) {
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('quickTransferModal'));
        modal.hide();

        // Show success message
        alert('Transfer completed successfully!');

        // Refresh the page to show updated balances
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Transfer failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error during transfer:', error);
      alert('An error occurred during the transfer. Please try again.');
    }
  }

  /**
   * Handle pay bill form submission
   */
  async function handlePayBill() {
    const fromAccountId = document.getElementById('billFromAccount').value;
    const payee = document.getElementById('billPayee').value;
    const amount = parseFloat(document.getElementById('billAmount').value);
    const date = document.getElementById('billDate').value;

    if (!fromAccountId || !payee || isNaN(amount) || amount <= 0 || !date) {
      alert('Please fill in all required fields with valid values');
      return;
    }

    try {
      // In a real application, this would call an API endpoint to process the bill payment
      // For now, we'll just show a success message

      // Close the modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('payBillModal'));
      modal.hide();

      // Show success message
      alert(`Bill payment of $${amount.toFixed(2)} to ${payee} scheduled for ${date}`);

    } catch (error) {
      console.error('Error during bill payment:', error);
      alert('An error occurred during the bill payment. Please try again.');
    }
  }

  /**
   * Open the pay bill modal
   */
  window.openPayBillModal = function() {
    const modal = new bootstrap.Modal(document.getElementById('payBillModal'));
    modal.show();
  };

  /**
   * Populate account dropdowns in modals
   * @param {Account[]} accounts - List of user accounts
   */
  function populateAccountDropdowns(accounts) {
    // Get all account dropdowns
    const quickFromAccountSelect = document.getElementById("quickFromAccount");
    const quickToAccountSelect = document.getElementById("quickToAccount");
    const billFromAccountSelect = document.getElementById("billFromAccount");

    // Array of all account dropdowns
    const accountDropdowns = [
      quickFromAccountSelect,
      quickToAccountSelect,
      billFromAccountSelect
    ].filter(dropdown => dropdown !== null);

    // Populate each dropdown
    accountDropdowns.forEach(dropdown => {
      // Clear existing options
      dropdown.innerHTML = "";

      // Add default empty option
      dropdown.add(new Option("Select account", ""));

      // Add account options
      accounts.forEach((account) => {
        const accountLabel = `${account.type.charAt(0).toUpperCase() + account.type.slice(1)} (****${account.id.slice(-4)}) - $${account.balance}`;
        dropdown.add(new Option(accountLabel, account.id));
      });
    });
  }
});