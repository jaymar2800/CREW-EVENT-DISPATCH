// ==============================
// Crew Picker Modal Functions
// ==============================

let selectedCrewNames = [];

// Prevent duplicate binding (very important)
let crewPickerInitialized = false;

// ============================================
// LOCALSTORAGE PERSISTENCE FOR CREW DATA
// ============================================

const CREW_DATA_STORAGE_KEY = 'soundstorm_crew_data';

// Save crew data to localStorage
function saveCrewDataToStorage() {
  try {
    localStorage.setItem(CREW_DATA_STORAGE_KEY, JSON.stringify(CREW_DATA));
    console.log('✅ Crew data saved to localStorage');
  } catch (error) {
    console.error('❌ Error saving crew data to localStorage:', error);
  }
}

// Load crew data from localStorage
function loadCrewDataFromStorage() {
  try {
    const savedData = localStorage.getItem(CREW_DATA_STORAGE_KEY);
    if (savedData) {
      const loadedData = JSON.parse(savedData);
      // Merge loaded data with CREW_DATA
      Object.keys(loadedData).forEach(department => {
        CREW_DATA[department] = loadedData[department];
      });
      console.log('✅ Crew data loaded from localStorage');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error loading crew data from localStorage:', error);
    return false;
  }
}

// Initialize crew data on page load
loadCrewDataFromStorage();

// Context menu for crew picker
let crewContextMenu = null;
let crewContextMenuTarget = null;

// Show crew picker modal
function showCrewPicker() {
  if (!selectedCell) {
    alert('Please select a cell first!');
    return;
  }

  const modal = document.getElementById('crewModal');
  modal.style.display = 'block';

  // Populate the modal with crew names
  populateCrewCategories();
  
  // Initialize crew context menu
  initCrewContextMenu();
}

// Populate crew categories in the modal
function populateCrewCategories() {
  const container = document.getElementById('horizontalDepartments');
  container.innerHTML = '';

  // Get already selected names from the sheet
  const existingNames = getSelectedNamesInSheet();

  DEPARTMENT_ORDER.forEach(category => {
    if (!CREW_DATA[category]) return;

    const names = CREW_DATA[category];

    // Create department box
    const deptBox = document.createElement('div');
    deptBox.className = 'dept-box';
    deptBox.setAttribute('data-department', category);

    // Department title
    const title = document.createElement('div');
    title.className = 'dept-title';
    title.textContent = category;
    deptBox.appendChild(title);

    // Checkbox list
    const checkList = document.createElement('div');
    checkList.className = 'checkbox-list';

    names.forEach(name => {
      const label = document.createElement('label');
      label.className = 'checkbox-item';
      label.setAttribute('data-crew-name', name);
      label.setAttribute('data-department', category);

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = 'selectedNames';
      checkbox.value = name;

      // Disable if already in sheet
      if (existingNames.includes(name)) {
        checkbox.disabled = true;
        checkbox.checked = false;
      }

      const span = document.createElement('span');
      span.textContent = name;

      label.appendChild(checkbox);
      label.appendChild(span);
      checkList.appendChild(label);
      
      // Add right-click event to crew name
      label.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showCrewContextMenu(e, name, category, 'name');
      });
    });

    deptBox.appendChild(checkList);
    container.appendChild(deptBox);
    
    // Add right-click event to department box for adding names
    deptBox.addEventListener('contextmenu', (e) => {
      // Only show if clicking on the box itself or title, not on a name
      if (e.target.classList.contains('dept-box') || 
          e.target.classList.contains('dept-title') ||
          e.target.classList.contains('checkbox-list')) {
        e.preventDefault();
        e.stopPropagation();
        showCrewContextMenu(e, null, category, 'department');
      }
    });
  });
}

// Initialize crew context menu
function initCrewContextMenu() {
  if (crewContextMenu) return; // Already initialized
  
  crewContextMenu = document.createElement('div');
  crewContextMenu.id = 'crewContextMenu';
  crewContextMenu.className = 'context-menu';
  crewContextMenu.style.display = 'none';
  document.body.appendChild(crewContextMenu);
  
  // Hide context menu when clicking elsewhere
  document.addEventListener('click', () => {
    if (crewContextMenu) {
      crewContextMenu.style.display = 'none';
    }
  });
}

// Show crew context menu
function showCrewContextMenu(e, name, department, type) {
  if (!crewContextMenu) {
    initCrewContextMenu();
  }
  
  crewContextMenu.innerHTML = '';
  
  if (type === 'name') {
    // Context menu for existing crew name
    const deleteItem = document.createElement('div');
    deleteItem.className = 'context-menu-item';
    deleteItem.innerHTML = '<span>🗑️ Delete "' + name + '"</span>';
    deleteItem.addEventListener('click', () => {
      deleteCrewName(name, department);
      crewContextMenu.style.display = 'none';
    });
    crewContextMenu.appendChild(deleteItem);
    
    // Add copy/paste option
    const copyItem = document.createElement('div');
    copyItem.className = 'context-menu-item';
    copyItem.innerHTML = '<span>📋 Copy "' + name + '" to Another Department</span>';
    copyItem.addEventListener('click', () => {
      copyCrewNameToAnotherDepartment(name, department);
      crewContextMenu.style.display = 'none';
    });
    crewContextMenu.appendChild(copyItem);
    
  } else if (type === 'department') {
    // Context menu for department box
    const addItem = document.createElement('div');
    addItem.className = 'context-menu-item';
    addItem.innerHTML = '<span>➕ Add New Name to ' + department + '</span>';
    addItem.addEventListener('click', () => {
      addCrewName(department);
      crewContextMenu.style.display = 'none';
    });
    crewContextMenu.appendChild(addItem);
  }
  
  // Position the context menu
  crewContextMenu.style.left = e.pageX + 'px';
  crewContextMenu.style.top = e.pageY + 'px';
  crewContextMenu.style.display = 'block';
}

// Delete crew name
function deleteCrewName(name, department) {
  if (!confirm(`Are you sure you want to delete "${name}" from ${department}?`)) {
    return;
  }
  
  if (!CREW_DATA[department]) return;
  
  // Remove the name from the department
  CREW_DATA[department] = CREW_DATA[department].filter(n => n !== name);
  
  // Save to localStorage
  saveCrewDataToStorage();
  
  // Refresh the crew picker display
  populateCrewCategories();
  
  console.log(`Deleted "${name}" from ${department}`);
}

// Add crew name
function addCrewName(department) {
  const name = prompt(`Enter new crew member name for ${department}:`);
  
  if (!name || name.trim() === '') {
    return;
  }
  
  const trimmedName = name.trim();
  
  // Check if name already exists in this department
  if (CREW_DATA[department] && CREW_DATA[department].includes(trimmedName)) {
    alert('This name already exists in ' + department);
    return;
  }
  
  // Initialize department if it doesn't exist
  if (!CREW_DATA[department]) {
    CREW_DATA[department] = [];
  }
  
  // Add the name
  CREW_DATA[department].push(trimmedName);
  
  // Save to localStorage
  saveCrewDataToStorage();
  
  // Refresh the crew picker display
  populateCrewCategories();
  
  console.log(`Added "${trimmedName}" to ${department}`);
}

// Copy crew name to another department
function copyCrewNameToAnotherDepartment(name, sourceDepartment) {
  // Create a list of available departments (excluding the source)
  const availableDepts = DEPARTMENT_ORDER.filter(dept => dept !== sourceDepartment);
  
  if (availableDepts.length === 0) {
    alert('No other departments available!');
    return;
  }
  
  // Create a selection dialog
  let message = `Copy "${name}" to which department?\n\n`;
  availableDepts.forEach((dept, index) => {
    message += `${index + 1}. ${dept}\n`;
  });
  message += '\nEnter the number of the department:';
  
  const selection = prompt(message);
  
  if (!selection) {
    return; // User cancelled
  }
  
  const deptIndex = parseInt(selection) - 1;
  
  if (isNaN(deptIndex) || deptIndex < 0 || deptIndex >= availableDepts.length) {
    alert('Invalid selection!');
    return;
  }
  
  const targetDepartment = availableDepts[deptIndex];
  
  // Check if name already exists in target department
  if (CREW_DATA[targetDepartment] && CREW_DATA[targetDepartment].includes(name)) {
    alert(`"${name}" already exists in ${targetDepartment}!`);
    return;
  }
  
  // Initialize department if it doesn't exist
  if (!CREW_DATA[targetDepartment]) {
    CREW_DATA[targetDepartment] = [];
  }
  
  // Add the name to target department
  CREW_DATA[targetDepartment].push(name);
  
  // Save to localStorage
  saveCrewDataToStorage();
  
  // Refresh the crew picker display
  populateCrewCategories();
  
  alert(`"${name}" has been copied to ${targetDepartment}!`);
  console.log(`Copied "${name}" from ${sourceDepartment} to ${targetDepartment}`);
}

// Get all names currently in the sheet
function getSelectedNamesInSheet() {
  const sheet = document.getElementById('sheet');
  const rows = sheet.rows;
  const names = new Set();

  // Cache flattened crew names once
  const allCrewNames = Object.values(CREW_DATA).flat();

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].cells;
    for (let j = 0; j < cells.length; j++) {
      const text = cells[j].textContent.trim();
      if (text && text !== '--') {
        if (allCrewNames.includes(text)) {
          names.add(text);
        }
      }
    }
  }

  return Array.from(names);
}

// Submit selected crew names
function submitCrewNames() {
  const checkedBoxes = document.querySelectorAll('input[name="selectedNames"]:checked');

  if (checkedBoxes.length === 0) {
    alert('Please select at least one name.');
    return;
  }

  const names = Array.from(checkedBoxes).map(cb => cb.value);

  // Insert names into cells starting from selected cell
  insertNamesIntoSheet(names);

  // Refresh crew categories to disable newly added names
  populateCrewCategories();

  // Save state for undo
  saveState();
}

// Insert names into the sheet
function insertNamesIntoSheet(names) {
  if (!selectedCell) return;

  const sheet = document.getElementById('sheet');
  const startRow = selectedRowIndex;
  const col = selectedCell.cellIndex;

  names.forEach((name, index) => {
    const rowIndex = startRow + index;

    // Make sure row exists
    if (rowIndex < sheet.rows.length) {
      const row = sheet.rows[rowIndex];
      if (row.cells[col]) {
        row.cells[col].textContent = name;
      }
    }
  });
}

// Close crew modal
function closeCrewModal() {
  const modal = document.getElementById('crewModal');
  modal.style.display = 'none';
}

// ==============================
// Initialize crew picker event listeners
// ==============================

function initCrewPicker() {
  if (crewPickerInitialized) return; // ✅ prevent duplicates
  crewPickerInitialized = true;

  const addCrewBtn = document.getElementById('addCrewBtn');
  const selectCrewBtn = document.getElementById('selectCrewBtn');
  const cancelCrewBtn = document.getElementById('cancelCrewBtn');
  const closeBtn = document.querySelector('#crewModal .close-btn');
  const modal = document.getElementById('crewModal');

  if (addCrewBtn) addCrewBtn.addEventListener('click', showCrewPicker);
  if (selectCrewBtn) selectCrewBtn.addEventListener('click', submitCrewNames);
  if (cancelCrewBtn) cancelCrewBtn.addEventListener('click', closeCrewModal);
  if (closeBtn) closeBtn.addEventListener('click', closeCrewModal);

  // ✅ OPTION 1: NEVER close when clicking outside.
  // Keep the listener (empty) to preserve consistent event flow with your CSS.
  window.addEventListener('click', (e) => {
    // intentionally do nothing
  });

  // Initialize window controls
  initWindowControls();
}

// ==============================
// Window Controls - Drag, Resize, Minimize (your working logic)
// ==============================

let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

let isResizing = false;
let resizeStartX = 0;
let resizeStartY = 0;
let resizeStartWidth = 0;
let resizeStartHeight = 0;
let resizeStartLeft = 0;
let resizeStartTop = 0;
let resizeEdge = null;

let windowControlsInitialized = false;

function initWindowControls() {
  if (windowControlsInitialized) return; // ✅ prevent duplicates
  windowControlsInitialized = true;

  const modal = document.getElementById('crewModal');
  const windowContent = modal.querySelector('.draggable-window');
  const header = modal.querySelector('.draggable-header');
  const minimizeBtn = modal.querySelector('.minimize-btn');
  const resizeHandle = modal.querySelector('.resize-handle');

  // Dragging functionality - ONLY on header (gray part)
  header.addEventListener('mousedown', (e) => {
    if (e.target.closest('.window-btn')) return;
    if (!e.target.closest('.draggable-header')) return;

    isDragging = true;
    dragOffsetX = e.clientX - windowContent.offsetLeft;
    dragOffsetY = e.clientY - windowContent.offsetTop;
    windowContent.style.cursor = 'grabbing';
  });

  // Stop dragging on mouseup
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Cursor update + dragging
  document.addEventListener('mousemove', (e) => {
    if (modal.style.display !== 'block') return;

    if (isDragging) {
      windowContent.style.left = (e.clientX - dragOffsetX) + 'px';
      windowContent.style.top = (e.clientY - dragOffsetY) + 'px';
      windowContent.style.transform = 'none';
      return;
    }

    if (isResizing) return;

    const rect = windowContent.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const isTopEdge = y < 8;
    const isBottomEdge = y > rect.height - 8;
    const isLeftEdge = x < 8;
    const isRightEdge = x > rect.width - 8;

    if (isTopEdge && isLeftEdge) {
      windowContent.style.cursor = 'nwse-resize';
    } else if (isTopEdge && isRightEdge) {
      windowContent.style.cursor = 'nesw-resize';
    } else if (isBottomEdge && isLeftEdge) {
      windowContent.style.cursor = 'nesw-resize';
    } else if (isBottomEdge && isRightEdge) {
      windowContent.style.cursor = 'nwse-resize';
    } else if (isTopEdge || isBottomEdge) {
      windowContent.style.cursor = 'ns-resize';
    } else if (isLeftEdge || isRightEdge) {
      windowContent.style.cursor = 'ew-resize';
    } else {
      windowContent.style.cursor = 'default';
    }
  });

  // Mousedown for resize (edge detection)
  document.addEventListener('mousedown', (e) => {
    if (modal.style.display !== 'block') return;

    const rect = windowContent.getBoundingClientRect();
    const padding = 8;

    if (
      e.clientX < rect.left - padding || e.clientX > rect.right + padding ||
      e.clientY < rect.top - padding || e.clientY > rect.bottom + padding
    ) {
      return;
    }

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const isTopEdge = y < 8;
    const isBottomEdge = y > rect.height - 8;
    const isLeftEdge = x < 8;
    const isRightEdge = x > rect.width - 8;

    if (isTopEdge || isBottomEdge || isLeftEdge || isRightEdge) {
      e.preventDefault();
      isResizing = true;

      resizeStartX = e.clientX;
      resizeStartY = e.clientY;
      resizeStartWidth = windowContent.offsetWidth;
      resizeStartHeight = windowContent.offsetHeight;
      resizeStartLeft = windowContent.offsetLeft;
      resizeStartTop = windowContent.offsetTop;

      resizeEdge = {
        top: isTopEdge,
        bottom: isBottomEdge,
        left: isLeftEdge,
        right: isRightEdge
      };
    }
  });

  // Handle resize movement
  document.addEventListener('mousemove', (e) => {
    if (modal.style.display !== 'block') return;

    if (isResizing && resizeEdge) {
      const deltaX = e.clientX - resizeStartX;
      const deltaY = e.clientY - resizeStartY;

      // LEFT
      if (resizeEdge.left) {
        const newWidth = resizeStartWidth - deltaX;
        const newLeft = resizeStartLeft + deltaX;

        if (newWidth > 300) {
          windowContent.style.width = newWidth + 'px';
          windowContent.style.left = newLeft + 'px';
          windowContent.style.transform = 'none';
        }
      }

      // RIGHT
      if (resizeEdge.right) {
        const newWidth = resizeStartWidth + deltaX;
        if (newWidth > 300) {
          windowContent.style.width = newWidth + 'px';
        }
      }

      // TOP
      if (resizeEdge.top) {
        const newHeight = resizeStartHeight - deltaY;
        const newTop = resizeStartTop + deltaY;

        if (newHeight > 200) {
          windowContent.style.height = newHeight + 'px';
          windowContent.style.top = newTop + 'px';
        }
      }

      // BOTTOM
      if (resizeEdge.bottom) {
        const newHeight = resizeStartHeight + deltaY;
        if (newHeight > 200) {
          windowContent.style.height = newHeight + 'px';
        }
      }
    }
  });

  // Stop resizing on mouseup
  document.addEventListener('mouseup', () => {
    isResizing = false;
    resizeEdge = null;
    windowContent.style.cursor = 'default';
  });

  // Minimize/Restore functionality
  minimizeBtn.addEventListener('click', () => {
    const isMinimized = windowContent.classList.toggle('minimized');

    if (isMinimized) {
      modal.classList.add('minimized-overlay');
      addToTaskbar('Crew Picker', 'crewModal');
    } else {
      modal.classList.remove('minimized-overlay');
      removeFromTaskbar('crewModal');
    }

    minimizeBtn.textContent = isMinimized ? '□' : '−';
  });

  // Resize handle (bottom-right corner)
  resizeHandle.addEventListener('mousedown', (e) => {
    if (modal.style.display !== 'block') return;

    e.preventDefault();
    isResizing = true;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    resizeStartWidth = windowContent.offsetWidth;
    resizeStartHeight = windowContent.offsetHeight;
    resizeEdge = { bottom: true, right: true };
  });
}

// ==============================
// Taskbar management functions
// ==============================

function addToTaskbar(title, modalId) {
  const taskbar = document.getElementById('taskbar');

  if (document.querySelector(`[data-modal="${modalId}"]`)) return;

  const taskbarItem = document.createElement('button');
  taskbarItem.className = 'taskbar-item active';
  taskbarItem.setAttribute('data-modal', modalId);
  taskbarItem.textContent = title;

  taskbarItem.addEventListener('click', () => {
    restoreWindow(modalId);
  });

  taskbar.appendChild(taskbarItem);
}

function removeFromTaskbar(modalId) {
  const taskbarItem = document.querySelector(`[data-modal="${modalId}"]`);
  if (taskbarItem) taskbarItem.remove();
}

function restoreWindow(modalId) {
  const modal = document.getElementById(modalId);
  const windowContent = modal.querySelector('.draggable-window');
  const minimizeBtn = modal.querySelector('.minimize-btn');

  windowContent.classList.remove('minimized');
  modal.classList.remove('minimized-overlay');

  if (minimizeBtn) minimizeBtn.textContent = '−';

  removeFromTaskbar(modalId);

  modal.style.zIndex = 1001;
  modal.style.display = 'block';
}

header.addEventListener('mousedown', (e) => {
  e.preventDefault();
  e.stopPropagation(); // ✅ important
  if (e.target.closest('.window-btn')) return;

  isDragging = true;
  dragOffsetX = e.clientX - windowContent.offsetLeft;
  dragOffsetY = e.clientY - windowContent.offsetTop;
});
