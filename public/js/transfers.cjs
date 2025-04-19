// File: public/js/transfers.cjs
function getInputElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with id '${id}' not found`);
    return null;
  }
  return /** @type {HTMLInputElement} */ (element);
}

/**
 * Show a success message
 * @param {string} message - The message to display
 */
function showSuccess(message) {
  const successAlert = document.getElementById('successAlert');
  const successMessage = document.getElementById('successMessage');

  if (successAlert && successMessage) {
    successMessage.textContent = message;
    successAlert.style.display = 'block';

    // Hide after 5 seconds
    setTimeout(() => {
      successAlert.style.display = 'none';
    }, 5000);
  } else {
    // Fallback to alert if elements not found
    alert(message);
  }
}

/**
 * Show an error message
 * @param {string} message - The message to display
 */
function showError(message) {
  const errorAlert = document.getElementById('errorAlert');
  const errorMessage = document.getElementById('errorMessage');

  if (errorAlert && errorMessage) {
    errorMessage.textContent = message;
    errorAlert.style.display = 'block';

    // Hide after 5 seconds
    setTimeout(() => {
      errorAlert.style.display = 'none';
    }, 5000);
  } else {
    // Fallback to alert if elements not found
    alert(message);
  }
}

/**
 * Format a date string
 * @param {string} dateString - The date string to format
 * @returns {string} The formatted date
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format currency
 * @param {number} amount - The amount to format
 * @returns {string} The formatted amount
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

document.addEventListener("DOMContentLoaded", async function () {
  console.log("Transfers page loaded");

  // Set up profile initials
  const profileInitials = document.getElementById('profileInitials');
  const profileName = document.getElementById('profileName');

  if (profileInitials && profileName) {
    // Get user data from session storage
    const userData = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
    if (userData && userData.username) {
      const initials = userData.username.substring(0, 2).toUpperCase();
      profileInitials.textContent = initials;
      profileName.textContent = userData.username;
    }
  }

  // Fetch accounts to populate the dropdowns
  try {
    const response = await fetch("/api/accounts/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch accounts:", response);
      showError("Could not load your accounts. Please try again later.");
      return;
    }

    const data = await response.json();
    populateAccountDropdowns(data.accounts);
    loadTransferHistory();
  } catch (error) {
    console.error("Error fetching accounts:", error);
    showError("Could not load your accounts. Please try again later.");
  }

  // Handle Between Accounts form submission
  const transferBetweenForm = document.getElementById("transfer-between-form");
  if (transferBetweenForm) {
    transferBetweenForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const fromAccountId = getInputElement("fromAccountBetween").value;
      const toAccountId = getInputElement("toAccountBetween").value;
      const amount = parseFloat(getInputElement("amountBetween").value);
      const description = getInputElement("noteBetween").value || "Transfer between accounts";

      if (fromAccountId === toAccountId) {
        showError("Cannot transfer to the same account");
        return;
      }

      await processTransfer(fromAccountId, toAccountId, amount, description);
    });
  }

  // Handle To Someone form submission
  const transferSomeoneForm = document.getElementById("transfer-someone-form");
  if (transferSomeoneForm) {
    transferSomeoneForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const fromAccountId = getInputElement("fromAccountSomeone").value;
      const toAccountId = getInputElement("toAccountSomeone").value;
      const recipientName = getInputElement("recipientName").value;
      const amount = parseFloat(getInputElement("amountSomeone").value);
      const description = getInputElement("noteSomeone").value || `Transfer to ${recipientName}`;

      await processTransfer(fromAccountId, toAccountId, amount, description);
    });
  }

  // Handle Account ID form submission
  const transferAccountIdForm = document.getElementById("transfer-account-id-form");
  if (transferAccountIdForm) {
    transferAccountIdForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const fromAccountId = getInputElement("fromAccountId").value;
      const toAccountId = getInputElement("toAccountId").value;
      const amount = parseFloat(getInputElement("amountId").value);
      const description = getInputElement("noteId").value || "Transfer by account ID";

      await processTransfer(fromAccountId, toAccountId, amount, description);
    });
  }

  /**
   * Process a transfer
   * @param {string} fromAccountId - The source account ID
   * @param {string} toAccountId - The destination account ID
   * @param {number} amount - The amount to transfer
   * @param {string} description - The transfer description
   */
  async function processTransfer(fromAccountId, toAccountId, amount, description) {
    if (!fromAccountId || !toAccountId) {
      showError("Please select both source and destination accounts");
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      showError("Please enter a valid amount greater than zero");
      return;
    }

    try {
      const response = await fetch(
        `/api/transactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromAccountId,
            toAccountId,
            amount,
            description,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        showSuccess(`Transfer of ${formatCurrency(amount)} completed successfully!`);

        // Clear form fields
        document.querySelectorAll('input[type="number"], input[type="text"]').forEach(input => {
          if (input.id.includes('amount') || input.id.includes('note') || input.id.includes('recipient')) {
            input.value = '';
          }
        });

        // Refresh transfer history
        loadTransferHistory();
      } else {
        showError(data.error || "Transfer failed. Please try again.");
      }
    } catch (error) {
      console.error("Transfer error:", error);
      showError("An error occurred during the transfer. Please try again.");
    }
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
  function populateAccountDropdowns(/** @type {Account[]} **/ accounts) {
    // Get all account dropdowns
    const dropdowns = [
      'fromAccountBetween', 'toAccountBetween',
      'fromAccountSomeone',
      'fromAccountId'
    ];

    dropdowns.forEach(id => {
      const dropdown = document.getElementById(id);
      if (dropdown) {
        // Clear existing options
        dropdown.innerHTML = "";

        // Add default empty option
        dropdown.add(new Option("Select account", ""));

        // Add account options
        accounts.forEach((account) => {
          const accountLabel = `${
            account.type.charAt(0).toUpperCase() + account.type.slice(1)
          } (****${account.id.slice(-4)}) - ${formatCurrency(account.balance)}`;

          dropdown.add(new Option(accountLabel, account.id));
        });
      }
    });
  }

  async function loadTransferHistory() {
    const historyContainer = document.getElementById("transfer-history");
    if (!historyContainer) return;

    try {
      // Fetch transaction history
      const response = await fetch('/api/transactions/history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transaction history');
      }

      const data = await response.json();
      const transactions = data.transactions || [];

      if (transactions.length === 0) {
        historyContainer.innerHTML = `
          <div class="text-center py-3">
            <i class="fas fa-info-circle text-muted fa-2x mb-3"></i>
            <p>No transaction history found.</p>
          </div>
        `;
        return;
      }

      // Sort transactions by date (newest first)
      transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Display transactions
      let html = '';
      transactions.slice(0, 10).forEach(transaction => {
        html += `
          <div class="transfer-history-item">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <strong>${transaction.description || 'Transfer'}</strong>
                <div class="text-muted small">${formatDate(transaction.createdAt)}</div>
              </div>
              <div class="text-${transaction.type === 'deposit' ? 'success' : 'danger'} fw-bold">
                ${formatCurrency(transaction.amount)}
              </div>
            </div>
          </div>
        `;
      });

      historyContainer.innerHTML = html;
    } catch (error) {
      console.error("Error loading transfer history:", error);
      historyContainer.innerHTML = `
        <div class="text-center py-3">
          <i class="fas fa-exclamation-triangle text-danger fa-2x mb-3"></i>
          <p>Could not load transfer history. Please try again later.</p>
        </div>
      `;
    }
  }
});
