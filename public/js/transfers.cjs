// File: public/js/transfers.cjs
function getInputElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with id '${id}' not found`);
  }
  return /** @type {HTMLInputElement} */ (element);
}

document.addEventListener("DOMContentLoaded", async function () {
  console.log("Transfers page loaded");

  // Fetch accounts to populate the dropdown
  try {
    const response = await fetch("/api/accounts/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch accounts:", response);
      alert("Could not load your accounts. Please try again later.");
    }

    const data = await response.json();
    populateAccountDropdowns(data.accounts);
    loadTransferHistory();
  } catch (error) {
    console.error("Error fetching accounts:", error);
    alert("Could not load your accounts. Please try again later.");
  }

  // Handle form submission
  const transferForm = document.getElementById("transfer-form");
  if (transferForm) {
    transferForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const fromAccountId = getInputElement("fromAccount").value;
      const toAccountId = getInputElement("toAccount").value;
      const amount = parseFloat(getInputElement("amount").value);
      const description = getInputElement("note").value || "Transfer";

      //if (fromAccountId === toAccountId) {
      //  alert("Cannot transfer to the same account");
      //  return;
      //}
      console.log(fromAccountId, toAccountId, amount, description);

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
        console.log(response);

        if (response.ok) {
          alert("Transfer completed successfully!");
          getInputElement("amount").value = "";
          getInputElement("note").value = "";

          // Refresh transfer history
          loadTransferHistory();
        } else {
          alert("Transfer failed. Please try again.");
          console.error(response);
        }
      } catch (error) {
        console.error("Transfer error:", error);
        alert("An error occurred during the transfer. Please try again.");
      }
    });
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
    const fromAccountSelect = document.getElementById("fromAccount");
    const toAccountSelect = document.getElementById("toAccount");

    if (fromAccountSelect && toAccountSelect) {
      // Clear existing options
      fromAccountSelect.innerHTML = "";
      toAccountSelect.innerHTML = "";

      // Add default empty option
      // @ts-ignore <-- We know this to be an HTMLSelectElement -->
      fromAccountSelect.add(new Option("Select account", ""));

      // Add account options
      accounts.forEach((account) => {
        const accountLabel = `${
          account.type.charAt(0).toUpperCase() + account.type.slice(1)
        } (****${account.id.slice(-4)}) - $${account.balance}`;

        // @ts-ignore <-- We know this to be an HTMLSelectElement -->
        fromAccountSelect.add(new Option(accountLabel, account.id));
      });
    }
  }

  async function loadTransferHistory() {
    const historyContainer = document.getElementById("transfer-history");
    if (!historyContainer) return;

    try {
      // We could fetch a consolidated transfer history here
      // For now, let's just display a message
      historyContainer.innerHTML = `
        <div class="transfer-history-item">
          <p class="no-transfers">Loading transfer history...</p>
        </div>
      `;

      // In the future, implement an API endpoint to get transfer history across accounts
      // Then fetch and display it here
    } catch (error) {
      console.error("Error loading transfer history:", error);
      historyContainer.innerHTML = `
        <div class="transfer-history-item">
          <p class="error">Could not load transfer history. Please try again later.</p>
        </div>
      `;
    }
  }
});
