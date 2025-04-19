// File: public/js/bills.cjs
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
    day: 'numeric'
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
  console.log("Bills page loaded");
  
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
  } catch (error) {
    console.error("Error fetching accounts:", error);
    showError("Could not load your accounts. Please try again later.");
  }

  // Handle bill form submissions
  const billTypes = ['electricity', 'water', 'internet', 'phone', 'gas', 'rent', 'cable', 'other'];
  
  billTypes.forEach(type => {
    const formId = `${type}-bill-form`;
    const form = document.getElementById(formId);
    
    if (form) {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const accountNumber = getInputElement(`${type}Account`)?.value;
        const provider = type === 'other' 
          ? getInputElement('otherBillName')?.value 
          : getInputElement(`${type}Provider`)?.value;
        const fromAccountId = getInputElement(`${type}FromAccount`)?.value;
        const amount = parseFloat(getInputElement(`${type}Amount`)?.value);
        const paymentDate = getInputElement(`${type}Date`)?.value;
        const isRecurring = getInputElement(`${type}Recurring`)?.checked;
        
        if (!accountNumber || !provider || !fromAccountId || isNaN(amount) || amount <= 0 || !paymentDate) {
          showError("Please fill in all required fields with valid values");
          return;
        }
        
        await processBillPayment(type, {
          accountNumber,
          provider,
          fromAccountId,
          amount,
          paymentDate,
          isRecurring
        });
      });
    }
  });
  
  /**
   * Process a bill payment
   * @param {string} billType - The type of bill
   * @param {Object} paymentData - The payment data
   */
  async function processBillPayment(billType, paymentData) {
    try {
      // In a real application, this would call an API endpoint to process the bill payment
      // For now, we'll just simulate a successful payment
      
      console.log(`Processing ${billType} bill payment:`, paymentData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      showSuccess(`Your ${billType} bill payment of ${formatCurrency(paymentData.amount)} has been scheduled for ${formatDate(paymentData.paymentDate)}`);
      
      // Clear form fields
      const form = document.getElementById(`${billType}-bill-form`);
      if (form) {
        form.reset();
        
        // Set default date to today
        const dateInput = document.getElementById(`${billType}Date`);
        if (dateInput) {
          const today = new Date();
          const formattedDate = today.toISOString().split('T')[0];
          dateInput.value = formattedDate;
        }
      }
      
      // Update bill payment history (in a real app, this would fetch updated data)
      updateBillPaymentHistory(billType, paymentData);
      
    } catch (error) {
      console.error(`Error processing ${billType} bill payment:`, error);
      showError(`An error occurred while processing your ${billType} bill payment. Please try again.`);
    }
  }
  
  /**
   * Update the bill payment history
   * @param {string} billType - The type of bill
   * @param {Object} paymentData - The payment data
   */
  function updateBillPaymentHistory(billType, paymentData) {
    const historyContainer = document.getElementById('bill-payment-history');
    if (!historyContainer) return;
    
    // Create a new history item
    const newItem = document.createElement('div');
    newItem.className = 'bill-history-item';
    newItem.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <strong>${billType.charAt(0).toUpperCase() + billType.slice(1)}</strong>
          <div class="text-muted small">Scheduled for ${formatDate(paymentData.paymentDate)}</div>
        </div>
        <div class="text-danger fw-bold">${formatCurrency(paymentData.amount)}</div>
      </div>
    `;
    
    // Add to the top of the history
    historyContainer.insertBefore(newItem, historyContainer.firstChild);
    
    // Update upcoming bills if applicable
    updateUpcomingBills(billType, paymentData);
  }
  
  /**
   * Update the upcoming bills section
   * @param {string} billType - The type of bill
   * @param {Object} paymentData - The payment data
   */
  function updateUpcomingBills(billType, paymentData) {
    const upcomingBillsContainer = document.getElementById('upcoming-bills');
    if (!upcomingBillsContainer) return;
    
    // Check if this bill type already exists in upcoming bills
    const existingBills = upcomingBillsContainer.querySelectorAll('strong');
    let billExists = false;
    
    existingBills.forEach(bill => {
      if (bill.textContent.toLowerCase() === billType.toLowerCase()) {
        // Update the existing bill
        const parent = bill.closest('.d-flex');
        if (parent) {
          const statusElement = parent.querySelector('.bill-status');
          if (statusElement) {
            statusElement.textContent = formatCurrency(paymentData.amount);
            statusElement.className = 'bill-status status-pending';
          }
          
          const dateElement = parent.querySelector('.text-muted.small');
          if (dateElement) {
            dateElement.textContent = `Scheduled for ${formatDate(paymentData.paymentDate)}`;
          }
        }
        billExists = true;
      }
    });
    
    // If the bill doesn't exist, add it
    if (!billExists) {
      const newBill = document.createElement('div');
      newBill.className = 'd-flex justify-content-between align-items-center mb-3';
      newBill.innerHTML = `
        <div>
          <strong>${billType.charAt(0).toUpperCase() + billType.slice(1)}</strong>
          <div class="text-muted small">Scheduled for ${formatDate(paymentData.paymentDate)}</div>
        </div>
        <span class="bill-status status-pending">${formatCurrency(paymentData.amount)}</span>
      `;
      
      upcomingBillsContainer.appendChild(newBill);
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
    const billTypes = ['electricity', 'water', 'internet', 'phone', 'gas', 'rent', 'cable', 'other'];
    
    billTypes.forEach(type => {
      const dropdownId = `${type}FromAccount`;
      const dropdown = document.getElementById(dropdownId);
      
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
});
