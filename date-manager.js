// Date Manager - Handles multiple date sheets/tabs

// Store all date sheets - start empty
let dateSheets = {};

let currentDate = null;

// ============================================
// LOCALSTORAGE PERSISTENCE FUNCTIONS
// ============================================

const STORAGE_KEY = 'soundstorm_date_sheets';
const CURRENT_DATE_KEY = 'soundstorm_current_date';

// Save dateSheets to localStorage
function saveDateSheetsToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dateSheets));
    localStorage.setItem(CURRENT_DATE_KEY, currentDate);
    console.log('✅ Data saved to localStorage');
  } catch (error) {
    console.error('❌ Error saving to localStorage:', error);
  }
}

// Load dateSheets from localStorage
function loadDateSheetsFromStorage() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedCurrentDate = localStorage.getItem(CURRENT_DATE_KEY);
    
    if (savedData) {
      dateSheets = JSON.parse(savedData);
      currentDate = savedCurrentDate;
      console.log('✅ Data loaded from localStorage:', Object.keys(dateSheets));
      console.log('Current date:', currentDate);
      
      // Restore tabs in the DOM
      const tabsContainer = document.getElementById('dateTabsContainer');
      tabsContainer.innerHTML = '';
      
      Object.keys(dateSheets).forEach(date => {
        const newTab = document.createElement('div');
        newTab.className = 'date-tab';
        newTab.setAttribute('data-date', date);
        newTab.innerHTML = `
          <span class="tab-label">${date}</span>
          <button class="tab-close" title="Delete this date sheet">×</button>
        `;
        tabsContainer.appendChild(newTab);
      });
      
      // Show the sheet and hide empty state
      const sheet = document.getElementById('sheet');
      const emptyState = document.getElementById('emptyState');
      if (sheet && emptyState) {
        sheet.style.display = 'table';
        emptyState.style.display = 'none';
      }
      
      // Switch to the saved current date or first available
      if (currentDate && dateSheets[currentDate]) {
        // Load the sheet content directly
        const sheet = document.getElementById('sheet');
        if (sheet) {
          sheet.innerHTML = dateSheets[currentDate];
          console.log('✅ Loaded sheet content for:', currentDate);
        }
        
        // Mark the tab as active
        const tabs = document.querySelectorAll('.date-tab');
        tabs.forEach(tab => {
          if (tab.getAttribute('data-date') === currentDate) {
            tab.classList.add('active');
          }
        });
      } else if (Object.keys(dateSheets).length > 0) {
        const firstDate = Object.keys(dateSheets)[0];
        currentDate = firstDate;
        
        // Load the sheet content directly
        const sheet = document.getElementById('sheet');
        if (sheet) {
          sheet.innerHTML = dateSheets[firstDate];
          console.log('✅ Loaded sheet content for:', firstDate);
        }
        
        // Mark the tab as active
        const tabs = document.querySelectorAll('.date-tab');
        tabs.forEach(tab => {
          if (tab.getAttribute('data-date') === firstDate) {
            tab.classList.add('active');
          }
        });
      }
      
      // Initialize tab handlers AFTER loading content
      initTabHandlers();
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error loading from localStorage:', error);
    return false;
  }
}

// Export for use in other files
window.loadDateSheetsFromStorage = loadDateSheetsFromStorage;
window.saveDateSheetsToStorage = saveDateSheetsToStorage;

// Save data before page unload/reload
window.addEventListener('beforeunload', () => {
  // Save current sheet content before leaving
  if (currentDate) {
    const sheet = document.getElementById('sheet');
    if (sheet) {
      dateSheets[currentDate] = sheet.innerHTML;
      console.log('💾 Saving data before page unload...');
      saveDateSheetsToStorage();
    }
  }
});

// Also save periodically (every 5 seconds) as a backup
setInterval(() => {
  if (currentDate) {
    const sheet = document.getElementById('sheet');
    if (sheet) {
      dateSheets[currentDate] = sheet.innerHTML;
      saveDateSheetsToStorage();
      console.log('🔄 Auto-saved at', new Date().toLocaleTimeString());
    }
  }
}, 5000);

// Sync dateSheets object with actual DOM tabs
function syncDateSheetsWithDOM() {
  console.log('=== SYNCING dateSheets with DOM ===');
  console.log('Before sync, dateSheets keys:', Object.keys(dateSheets));
  
  // Get all tabs currently in the DOM
  const tabsInDOM = Array.from(document.querySelectorAll('.date-tab')).map(tab => 
    tab.getAttribute('data-date')
  );
  console.log('Tabs in DOM:', tabsInDOM);
  
  // Remove any dates from dateSheets that don't have a tab in the DOM
  Object.keys(dateSheets).forEach(date => {
    if (!tabsInDOM.includes(date)) {
      console.log(`Removing orphaned date from dateSheets: ${date}`);
      delete dateSheets[date];
    }
  });
  
  // Add any tabs from DOM that aren't in dateSheets
  tabsInDOM.forEach(date => {
    if (!dateSheets[date]) {
      console.log(`Adding missing date to dateSheets: ${date}`);
      // Keep the existing HTML if it exists
      dateSheets[date] = document.getElementById('sheet').innerHTML;
    }
  });
  
  console.log('After sync, dateSheets keys:', Object.keys(dateSheets));
  console.log('=== SYNC COMPLETE ===');
  
  // Save to localStorage after sync
  saveDateSheetsToStorage();
}

// Initialize Date Manager
function initDateManager() {
  // Load data from localStorage first
  const hasData = loadDateSheetsFromStorage();
  
  // If no saved data, sync with DOM
  if (!hasData) {
    syncDateSheetsWithDOM();
  }
  
  const addEventDateBtn = document.getElementById('addEventDateBtn');
  const dateModal = document.getElementById('dateModal');
  const closeDateModal = document.getElementById('closeDateModal');
  const confirmDateBtn = document.getElementById('confirmDateBtn');
  const cancelDateBtn = document.getElementById('cancelDateBtn');
  const eventDateInput = document.getElementById('eventDateInput');
  
  // Log to check if elements exist
  console.log('addEventDateBtn:', addEventDateBtn);
  console.log('dateModal:', dateModal);
  console.log('confirmDateBtn:', confirmDateBtn);
  
  if (!addEventDateBtn || !dateModal || !confirmDateBtn) {
    console.error('Date manager elements not found!');
    return;
  }
  
  // Open date modal
  addEventDateBtn.addEventListener('click', () => {
    console.log('Add event date button clicked');
    dateModal.style.display = 'block';
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    eventDateInput.value = today;
  });
  
  // Close modal handlers
  closeDateModal.addEventListener('click', () => {
    dateModal.style.display = 'none';
  });
  
  cancelDateBtn.addEventListener('click', () => {
    dateModal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === dateModal) {
      dateModal.style.display = 'none';
    }
  });
  
  // Confirm date selection
  confirmDateBtn.addEventListener('click', () => {
    const selectedDate = eventDateInput.value;
    
    if (!selectedDate) {
      alert('Please select a date!');
      return;
    }
    
    // Format date to readable format
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // STRICT CHECK: date must not exist in dateSheets
    console.log('Checking if date exists...');
    console.log('All dates in dateSheets:', Object.keys(dateSheets));
    console.log('Looking for:', formattedDate);
    console.log('Date exists?', formattedDate in dateSheets);
    
    if (formattedDate in dateSheets) {
      console.error('Date already exists in dateSheets!');
      alert(`A sheet for ${formattedDate} already exists! Please delete it first if you want to recreate it.`);
      return;
    }
    
    // Double-check: remove any orphaned tabs from DOM for this date
    const existingTab = document.querySelector(`[data-date="${formattedDate}"]`);
    if (existingTab) {
      console.warn('Found orphaned tab in DOM, removing...');
      existingTab.remove();
    }
    
    console.log('Creating new date sheet for:', formattedDate);
    
    // Create new date sheet
    createNewDateSheet(formattedDate);
    
    // Close modal
    dateModal.style.display = 'none';
    
    // Save to localStorage
    saveDateSheetsToStorage();
    
    alert(`New date sheet created for ${formattedDate}!`);
  });
  
  // Initialize tab click handlers
  initTabHandlers();
}

// Create a new date sheet
function createNewDateSheet(date) {
  // Save current sheet before switching
  dateSheets[currentDate] = document.getElementById('sheet').innerHTML;
  
  // Create template for new sheet
  const templateHTML = `
    <tbody>
      <!-- Date Header Row -->
      <tr>
        <td contenteditable="true" class="header-date" colspan="4">${date}</td>
      </tr>
      
      <!-- Event Number and Type Row -->
      <tr>
        <td contenteditable="true" class="event-number" rowspan="2">1</td>
        <td contenteditable="true" class="event-type">TRUCK</td>
        <td contenteditable="true" colspan="2"></td>
      </tr>
      <tr>
        <td contenteditable="true" class="event-status">OTD</td>
        <td contenteditable="true" colspan="2"></td>
      </tr>
      
      <!-- Venue Row -->
      <tr>
        <td contenteditable="true" class="venue-label">venue</td>
        <td contenteditable="true" class="venue-content" colspan="3"></td>
      </tr>
      
      <!-- Column Headers Row -->
      <tr class="header-row">
        <td contenteditable="true" class="label-cell">coor/client</td>
        <td contenteditable="true" class="header-department">DEPARTMENT</td>
        <td contenteditable="true" class="header-crew" colspan="2">CREW</td>
      </tr>
      
      <!-- # Row -->
      <tr>
        <td contenteditable="true" class="label-cell">#</td>
        <td contenteditable="true"></td>
        <td contenteditable="true" colspan="2"></td>
      </tr>
      
      <!-- Call Time HR Row -->
      <tr>
        <td contenteditable="true" class="label-cell">CALL TIME HR</td>
        <td contenteditable="true"></td>
        <td contenteditable="true" colspan="2"></td>
      </tr>
      
      <!-- Call Time 6 AM Row -->
      <tr>
        <td contenteditable="true" class="label-cell">CALL TIME 6 AM</td>
        <td contenteditable="true"></td>
        <td contenteditable="true" colspan="2"></td>
      </tr>
      
      <!-- Notes Row -->
      <tr>
        <td contenteditable="true" class="label-cell">notes</td>
        <td contenteditable="true"></td>
        <td contenteditable="true" colspan="2"></td>
      </tr>
      
      <!-- Empty Rows for Crew Details -->
      <tr>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true" colspan="2"></td>
      </tr>
      <tr>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true" colspan="2"></td>
      </tr>
      <tr>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true" colspan="2"></td>
      </tr>
      <tr>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true" colspan="2"></td>
      </tr>
      <tr>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true" colspan="2"></td>
      </tr>
      
      <!-- Number of Crew Row -->
      <tr>
        <td contenteditable="true" class="number-of-crew" colspan="4">NUMBER OF CREW</td>
      </tr>
      
      <!-- Equipment Sections -->
      <tr>
        <td contenteditable="true" class="section-label">LEDWALL</td>
        <td contenteditable="true" colspan="3">--</td>
      </tr>
      
      <tr>
        <td contenteditable="true" class="section-label">LIGHTS</td>
        <td contenteditable="true" colspan="3">--</td>
      </tr>
      
      <tr>
        <td contenteditable="true" class="section-label">TRUSSES</td>
        <td contenteditable="true" colspan="3">--</td>
      </tr>
      
      <tr>
        <td contenteditable="true" class="section-label">SOUNDSYSTEM</td>
        <td contenteditable="true" colspan="3"></td>
      </tr>
      
      <tr>
        <td contenteditable="true" class="section-label">BACKLINE</td>
        <td contenteditable="true" colspan="3">--</td>
      </tr>
      
      <tr>
        <td contenteditable="true" class="section-label">FLOORING</td>
        <td contenteditable="true" colspan="3">--</td>
      </tr>
      
      <tr>
        <td contenteditable="true" class="section-label">EFFECTS</td>
        <td contenteditable="true" colspan="3">--</td>
      </tr>
      
      <tr>
        <td contenteditable="true" class="section-label">NOTES:</td>
        <td contenteditable="true" colspan="3"></td>
      </tr>
    </tbody>
  `;
  
  // Store new sheet
  dateSheets[date] = templateHTML;
  
  // Create new tab
  const tabsContainer = document.getElementById('dateTabsContainer');
  
  // Remove old tab if it exists in DOM (cleanup orphaned elements)
  const existingTab = tabsContainer.querySelector(`[data-date="${date}"]`);
  if (existingTab) {
    existingTab.remove();
  }
  
  const newTab = document.createElement('div');
  newTab.className = 'date-tab';
  newTab.setAttribute('data-date', date);
  newTab.innerHTML = `
    <span class="tab-label">${date}</span>
    <button class="tab-close" title="Delete this date sheet">×</button>
  `;
  
  tabsContainer.appendChild(newTab);
  
  // Switch to new tab
  switchToDate(date);
  
  // Reinitialize tab handlers
  initTabHandlers();
  
  // Save to localStorage
  saveDateSheetsToStorage();
}

// Switch to a different date sheet
function switchToDate(date) {
  // Save current sheet before switching
  if (currentDate && currentDate !== date) {
    const currentSheet = document.getElementById('sheet');
    if (currentSheet) {
      dateSheets[currentDate] = currentSheet.innerHTML;
      console.log(`💾 Saved current sheet: ${currentDate}`);
    }
  }
  
  // Load new sheet
  const sheet = document.getElementById('sheet');
  if (sheet && dateSheets[date]) {
    sheet.innerHTML = dateSheets[date];
    currentDate = date;
    console.log(`📄 Loaded sheet: ${date}`);
  }
  
  // Update active tab
  const tabs = document.querySelectorAll('.date-tab');
  tabs.forEach(tab => {
    if (tab.getAttribute('data-date') === date) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  // Reattach event listeners
  if (typeof reattachEventListeners === 'function') {
    reattachEventListeners();
  }
  
  // Save to localStorage
  saveDateSheetsToStorage();
  
  console.log(`✅ Switched to date: ${date}`);
}

// Delete a date sheet
function deleteDateSheet(date) {
  // Don't allow deleting the last sheet
  if (Object.keys(dateSheets).length === 1) {
    alert('Cannot delete the last date sheet!');
    return;
  }
  
  // Confirm deletion
  if (!confirm(`Are you sure you want to delete the sheet for ${date}?`)) {
    return;
  }
  
  console.log(`Deleting date sheet: ${date}`);
  console.log('Before deletion, dateSheets keys:', Object.keys(dateSheets));
  
  // COMPLETELY remove from dateSheets object
  delete dateSheets[date];
  
  // Verify it's gone
  if (dateSheets[date] !== undefined) {
    dateSheets[date] = null;
    delete dateSheets[date];
  }
  
  console.log('After deletion, dateSheets keys:', Object.keys(dateSheets));
  console.log('Is date still in object?', date in dateSheets); // Should be false
  
  // Remove tab from DOM
  const tabsContainer = document.getElementById('dateTabsContainer');
  const allTabs = tabsContainer.querySelectorAll('.date-tab');
  allTabs.forEach(tab => {
    if (tab.getAttribute('data-date') === date) {
      console.log(`Removing tab from DOM for date: ${date}`);
      tab.remove();
    }
  });
  
  // Verify tab is gone from DOM
  if (document.querySelector(`[data-date="${date}"]`)) {
    console.warn(`Tab still exists in DOM! Removing again...`);
    document.querySelector(`[data-date="${date}"]`).remove();
  }
  
  // If we deleted the current sheet, switch to the first available
  if (currentDate === date) {
    const remainingDates = Object.keys(dateSheets);
    const firstDate = remainingDates[0];
    if (firstDate && dateSheets[firstDate]) {
      console.log(`Switching to: ${firstDate}`);
      switchToDate(firstDate);
    }
  }
  
  // Reinitialize handlers to clean up any orphaned references
  initTabHandlers();
  
  // Save to localStorage after deletion
  saveDateSheetsToStorage();
  
  // Final verification
  console.log('=== DELETION VERIFICATION ===');
  console.log('Date in dateSheets?', date in dateSheets);
  console.log('Tab in DOM?', document.querySelector(`[data-date="${date}"]`) ? 'YES' : 'NO');
  console.log('Remaining dates:', Object.keys(dateSheets));
  
  alert(`Date sheet for ${date} has been deleted. You can now create it again if needed.`);
}

// Initialize tab click handlers
function initTabHandlers() {
  // First sync everything
  syncDateSheetsWithDOM();
  
  const tabsContainer = document.getElementById('dateTabsContainer');
  const tabs = document.querySelectorAll('.date-tab');
  
  // Clean up tabs in DOM that don't exist in dateSheets
  tabs.forEach(tab => {
    const date = tab.getAttribute('data-date');
    if (!dateSheets[date]) {
      console.log(`Removing tab with no data: ${date}`);
      tab.remove();
    }
  });
  
  // Now re-query tabs after cleanup
  const validTabs = document.querySelectorAll('.date-tab');
  
  validTabs.forEach(tab => {
    // Remove all old event listeners by cloning and replacing
    const newTab = tab.cloneNode(true);
    tab.parentNode.replaceChild(newTab, tab);
    
    const tabLabel = newTab.querySelector('.tab-label');
    const closeBtn = newTab.querySelector('.tab-close');
    const date = newTab.getAttribute('data-date');
    
    // Tab click - switch to this date
    tabLabel.addEventListener('click', () => {
      switchToDate(date);
    });
    
    // Close button - delete this date sheet
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteDateSheet(date);
    });
  });
}
