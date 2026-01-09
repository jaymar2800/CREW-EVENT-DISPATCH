// ============================================
// CREW COUNTER - Auto-count crew names per event
// ============================================

// Count crew names in a specific event column
function countCrewInEvent(eventColumnStart) {
  const sheet = document.getElementById('sheet');
  if (!sheet) return 0;
  
  const rows = sheet.rows;
  const allCrewNames = Object.values(CREW_DATA).flat();
  let crewCount = 0;
  
  // Find the "NUMBER OF CREW" row index
  let numberOfCrewRowIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].cells;
    for (let j = 0; j < cells.length; j++) {
      if (cells[j].className && cells[j].className.includes('number-of-crew')) {
        numberOf CrewRowIndex = i;
        break;
      }
    }
    if (numberOfCrewRowIndex !== -1) break;
  }
  
  if (numberOfCrewRowIndex === -1) return 0;
  
  // Count crew names from header row to NUMBER OF CREW row
  for (let i = 0; i < numberOfCrewRowIndex; i++) {
    const row = rows[i];
    
    // Check cells in this event's columns
    for (let j = 0; j < row.cells.length; j++) {
      const cell = row.cells[j];
      const text = cell.textContent.trim();
      
      // Check if this text is a crew name
      if (text && text !== '--' && allCrewNames.includes(text)) {
        crewCount++;
      }
    }
  }
  
  return crewCount;
}

// Update all "NUMBER OF CREW" cells with counts
function updateAllCrewCounts() {
  const sheet = document.getElementById('sheet');
  if (!sheet) return;
  
  const rows = sheet.rows;
  
  // Find all "NUMBER OF CREW" cells
  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].cells;
    for (let j = 0; j < cells.length; j++) {
      const cell = cells[j];
      if (cell.className && cell.className.includes('number-of-crew')) {
        // Count crew in this event
        const crewCount = countCrewInEvent(j);
        
        // Update the cell text
        if (crewCount > 0) {
          cell.textContent = `NUMBER OF CREW: ${crewCount}`;
        } else {
          cell.textContent = 'NUMBER OF CREW';
        }
      }
    }
  }
}

// Initialize crew counter - attach to sheet changes
function initCrewCounter() {
  // Update counts when sheet content changes
  const sheet = document.getElementById('sheet');
  if (!sheet) return;
  
  // Create a MutationObserver to watch for changes
  const observer = new MutationObserver((mutations) => {
    // Debounce the update
    clearTimeout(window.crewCountTimeout);
    window.crewCountTimeout = setTimeout(() => {
      updateAllCrewCounts();
    }, 500);
  });
  
  // Observe the sheet for changes
  observer.observe(sheet, {
    childList: true,
    subtree: true,
    characterData: true,
    characterDataOldValue: true
  });
  
  // Initial count
  updateAllCrewCounts();
  
  console.log('✅ Crew counter initialized');
}

// Export for use in other files
window.initCrewCounter = initCrewCounter;
window.updateAllCrewCounts = updateAllCrewCounts;
