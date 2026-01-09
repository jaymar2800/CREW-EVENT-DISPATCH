// Month Manager - Handles month selection and day picking

let selectedMonth = null;
let selectedYear = new Date().getFullYear();
let selectedDay = null;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Show month selector on login
function showMonthSelector() {
  const overlay = document.getElementById('monthSelectorOverlay');
  overlay.style.display = 'flex';
  populateMonthGrid();
}

// Hide month selector
function hideMonthSelector() {
  const overlay = document.getElementById('monthSelectorOverlay');
  overlay.style.display = 'none';
}

// Populate month grid
function populateMonthGrid() {
  const monthGrid = document.getElementById('monthGrid');
  const yearDisplay = document.getElementById('selectedYearDisplay');
  
  monthGrid.innerHTML = '';
  yearDisplay.textContent = selectedYear;
  
  MONTHS.forEach((month, index) => {
    const monthCard = document.createElement('div');
    monthCard.className = 'month-card';
    monthCard.textContent = month;
    monthCard.setAttribute('data-month-index', index);
    
    if (selectedMonth === index) {
      monthCard.classList.add('selected');
    }
    
    monthCard.addEventListener('click', () => {
      selectedMonth = index;
      hideMonthSelector();
      // Filter tabs to show only dates from selected month
      filterTabsByMonth();
    });
    
    monthGrid.appendChild(monthCard);
  });
}

// Filter tabs to show only dates from selected month/year
function filterTabsByMonth() {
  if (selectedMonth === null) return;
  
  const allTabs = document.querySelectorAll('.date-tab');
  let visibleTabs = [];
  
  allTabs.forEach(tab => {
    const dateStr = tab.getAttribute('data-date');
    const date = new Date(dateStr);
    
    // Check if this date belongs to the selected month and year
    if (date.getMonth() === selectedMonth && date.getFullYear() === selectedYear) {
      tab.style.display = 'inline-flex';
      visibleTabs.push(tab);
    } else {
      tab.style.display = 'none';
    }
  });
  
  // Show/hide empty state and sheet
  const emptyState = document.getElementById('emptyState');
  const sheet = document.getElementById('sheet');
  
  if (visibleTabs.length === 0) {
    // No events for this month - show empty state
    emptyState.style.display = 'flex';
    sheet.style.display = 'none';
  } else {
    // Has events - show the first one
    emptyState.style.display = 'none';
    sheet.style.display = 'table';
    
    // Switch to the first visible tab
    const firstVisibleDate = visibleTabs[0].getAttribute('data-date');
    if (typeof switchToDate === 'function') {
      switchToDate(firstVisibleDate);
    }
  }
  
  console.log(`Filtered to ${MONTHS[selectedMonth]} ${selectedYear}: ${visibleTabs.length} events`);
}

// Get days in month
function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

// Populate day picker grid
function populateDayPicker() {
  if (selectedMonth === null) {
    alert('Please select a month first!');
    return;
  }
  
  const dayGrid = document.getElementById('dayPickerGrid');
  const monthLabel = document.getElementById('selectedMonthLabel');
  
  dayGrid.innerHTML = '';
  monthLabel.textContent = `${MONTHS[selectedMonth]} ${selectedYear}`;
  
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayCard = document.createElement('div');
    dayCard.className = 'day-card';
    dayCard.textContent = day;
    dayCard.setAttribute('data-day', day);
    
    if (selectedDay === day) {
      dayCard.classList.add('selected');
    }
    
    dayCard.addEventListener('click', () => {
      // Remove previous selection
      dayGrid.querySelectorAll('.day-card').forEach(card => {
        card.classList.remove('selected');
      });
      
      selectedDay = day;
      dayCard.classList.add('selected');
    });
    
    dayGrid.appendChild(dayCard);
  }
}

// Initialize month manager
function initMonthManager() {
  const changeMonthBtn = document.getElementById('changeMonthBtn');
  const prevYearBtn = document.getElementById('prevYearBtn');
  const nextYearBtn = document.getElementById('nextYearBtn');
  const addEventDateBtn = document.getElementById('addEventDateBtn');
  const confirmDateBtn = document.getElementById('confirmDateBtn');
  const cancelDateBtn = document.getElementById('cancelDateBtn');
  const closeDateModal = document.getElementById('closeDateModal');
  
  // Show month selector when clicking change month
  if (changeMonthBtn) {
    changeMonthBtn.addEventListener('click', showMonthSelector);
  }
  
  // Year navigation
  if (prevYearBtn) {
    prevYearBtn.addEventListener('click', () => {
      selectedYear--;
      populateMonthGrid();
    });
  }
  
  if (nextYearBtn) {
    nextYearBtn.addEventListener('click', () => {
      selectedYear++;
      populateMonthGrid();
    });
  }
  
  // Add event date button
  if (addEventDateBtn) {
    addEventDateBtn.addEventListener('click', () => {
      if (selectedMonth === null) {
        alert('Please select a month first using the "📅 CHANGE MONTH" button!');
        return;
      }
      
      const dateModal = document.getElementById('dateModal');
      dateModal.style.display = 'block';
      populateDayPicker();
    });
  }
  
  // Confirm date selection
  if (confirmDateBtn) {
    confirmDateBtn.addEventListener('click', () => {
      if (selectedDay === null) {
        alert('Please select a day!');
        return;
      }
      
      // Create formatted date
      const formattedDate = new Date(selectedYear, selectedMonth, selectedDay).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Check if date already exists
      if (formattedDate in dateSheets) {
        alert(`A sheet for ${formattedDate} already exists! Please delete it first if you want to recreate it.`);
        return;
      }
      
      // Create new date sheet
      createNewDateSheet(formattedDate);
      
      // Close modal and reset selection
      document.getElementById('dateModal').style.display = 'none';
      selectedDay = null;
      
      // Show the sheet and hide empty state
      document.getElementById('emptyState').style.display = 'none';
      document.getElementById('sheet').style.display = 'table';
      
      // Filter tabs to show current month
      filterTabsByMonth();
    });
  }
  
  // Cancel/close handlers
  if (cancelDateBtn) {
    cancelDateBtn.addEventListener('click', () => {
      document.getElementById('dateModal').style.display = 'none';
      selectedDay = null;
    });
  }
  
  if (closeDateModal) {
    closeDateModal.addEventListener('click', () => {
      document.getElementById('dateModal').style.display = 'none';
      selectedDay = null;
    });
  }
  
  // Show month selector on first load ONLY if no saved data exists
  const savedData = localStorage.getItem('soundstorm_date_sheets');
  if (!savedData || Object.keys(JSON.parse(savedData || '{}')).length === 0) {
    showMonthSelector();
  } else {
    // If we have saved data, set the month from the current date
    if (currentDate) {
      const date = new Date(currentDate);
      selectedMonth = date.getMonth();
      selectedYear = date.getFullYear();
      filterTabsByMonth();
    }
  }
}

// Export functions for use in other files
window.initMonthManager = initMonthManager;
window.showMonthSelector = showMonthSelector;
window.hideMonthSelector = hideMonthSelector;
