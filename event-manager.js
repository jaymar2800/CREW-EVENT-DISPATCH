// Event Management Functions (similar to Google Apps Script functions)

// Template width (number of columns in one event)
const TEMPLATE_WIDTH = 4;

// Add Event Function (duplicates template to the right)
function addEvent() {
  const sheet = document.getElementById('sheet');
  const rows = sheet.rows;
  
  if (rows.length === 0) {
    alert('No template found!');
    return;
  }
  
  // Calculate current number of events
  const row1 = rows[1];
  let actualColumns = 0;
  for (let i = 0; i < row1.cells.length; i++) {
    actualColumns += (row1.cells[i].colSpan || 1);
  }
  const numberOfEvents = Math.floor(actualColumns / TEMPLATE_WIDTH);
  
  console.log('Current number of events:', numberOfEvents);
  
  // Build a column occupation map to handle rowspan correctly
  const columnMap = [];
  for (let i = 0; i < rows.length; i++) {
    columnMap[i] = [];
  }
  
  // Fill the column map
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let colIndex = 0;
    
    for (let j = 0; j < row.cells.length; j++) {
      const cell = row.cells[j];
      
      // Skip columns that are occupied by rowspan from above
      while (columnMap[i][colIndex]) {
        colIndex++;
      }
      
      const colspan = cell.colSpan || 1;
      const rowspan = cell.rowSpan || 1;
      
      // Mark this cell's position
      for (let r = 0; r < rowspan; r++) {
        for (let c = 0; c < colspan; c++) {
          if (i + r < rows.length) {
            columnMap[i + r][colIndex + c] = {
              cell: cell,
              isOriginal: r === 0,
              rowIndex: i,
              cellIndex: j
            };
          }
        }
      }
      
      colIndex += colspan;
    }
  }
  
  // Now extract template data using the column map
  const templateData = [];
  let newEventNumberCell = null;
  
  for (let i = 0; i < rows.length; i++) {
    const rowData = [];
    const processedCells = new Set();
    
    // Get cells for the first TEMPLATE_WIDTH columns
    for (let col = 0; col < TEMPLATE_WIDTH; col++) {
      const cellInfo = columnMap[i][col];
      
      if (cellInfo && cellInfo.isOriginal) {
        const cellKey = `${cellInfo.rowIndex}-${cellInfo.cellIndex}`;
        
        if (!processedCells.has(cellKey)) {
          processedCells.add(cellKey);
          
          const cell = cellInfo.cell;
          rowData.push({
            content: cell.innerHTML,
            colspan: cell.colSpan || 1,
            rowspan: cell.rowSpan || 1,
            className: cell.className,
            contentEditable: cell.contentEditable
          });
        }
      }
    }
    
    templateData.push(rowData);
    console.log(`Row ${i}: collected ${rowData.length} cells`);
  }
  
  // Add new columns to each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowTemplate = templateData[i];
    
    for (let j = 0; j < rowTemplate.length; j++) {
      const cellData = rowTemplate[j];
      const newCell = row.insertCell();
      
      newCell.innerHTML = cellData.content;
      newCell.className = cellData.className;
      newCell.contentEditable = cellData.contentEditable;
      
      if (cellData.colspan > 1) {
        newCell.colSpan = cellData.colspan;
      }
      if (cellData.rowspan > 1) {
        newCell.rowSpan = cellData.rowspan;
      }
      
      // Track the event number cell
      if (j === 0 && cellData.className.includes('event-number')) {
        newEventNumberCell = newCell;
        console.log('Found event number cell');
      }
      
      // Clear content for new event (except labels and specific classes)
      if (!cellData.className.includes('label') && 
          !cellData.className.includes('header') &&
          !cellData.className.includes('section-label') &&
          !cellData.className.includes('number-of-crew') &&
          !cellData.className.includes('event-number') &&
          !cellData.className.includes('event-type') &&
          !cellData.className.includes('event-status') &&
          !cellData.className.includes('venue')) {
        newCell.textContent = '';
      }
    }
  }
  
  // Update event number
  const newEventNumber = numberOfEvents + 1;
  if (newEventNumberCell) {
    newEventNumberCell.textContent = newEventNumber;
    console.log('Set event number to:', newEventNumber);
  }
  
  // Merge the date header row
  mergeFirstRow();
  
  // Save state for undo
  saveState();
  
  alert(`Event ${newEventNumber} added successfully!`);
}

// Delete Event Function
function deleteEvent() {
  const sheet = document.getElementById('sheet');
  const rows = sheet.rows;
  
  if (rows.length === 0) {
    alert('No events found!');
    return;
  }
  
  // Calculate number of events
  const row1 = rows[1];
  let actualColumns = 0;
  for (let i = 0; i < row1.cells.length; i++) {
    actualColumns += (row1.cells[i].colSpan || 1);
  }
  const numberOfEvents = Math.floor(actualColumns / TEMPLATE_WIDTH);
  
  if (numberOfEvents <= 1) {
    alert('Cannot delete the only event!');
    return;
  }
  
  // Ask which event to delete
  const eventToDelete = prompt(`Enter event number to delete (1 to ${numberOfEvents}):`);
  
  if (!eventToDelete) {
    return; // User cancelled
  }
  
  const eventNum = parseInt(eventToDelete);
  
  if (isNaN(eventNum) || eventNum < 1 || eventNum > numberOfEvents) {
    alert(`Invalid event number. Please enter a number between 1 and ${numberOfEvents}.`);
    return;
  }
  
  console.log(`Deleting event ${eventNum}`);
  
  // Build column occupation map
  const columnMap = [];
  for (let i = 0; i < rows.length; i++) {
    columnMap[i] = [];
  }
  
  // Fill the column map
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let colIndex = 0;
    
    for (let j = 0; j < row.cells.length; j++) {
      const cell = row.cells[j];
      
      // Skip columns occupied by rowspan from above
      while (columnMap[i][colIndex]) {
        colIndex++;
      }
      
      const colspan = cell.colSpan || 1;
      const rowspan = cell.rowSpan || 1;
      
      // Mark this cell's position
      for (let r = 0; r < rowspan; r++) {
        for (let c = 0; c < colspan; c++) {
          if (i + r < rows.length) {
            columnMap[i + r][colIndex + c] = {
              cell: cell,
              isOriginal: r === 0,
              rowIndex: i,
              cellIndex: j
            };
          }
        }
      }
      
      colIndex += colspan;
    }
  }
  
  // Calculate which columns to delete (0-based)
  const deleteStartCol = (eventNum - 1) * TEMPLATE_WIDTH;
  const deleteEndCol = deleteStartCol + TEMPLATE_WIDTH;
  
  console.log(`Deleting columns ${deleteStartCol} to ${deleteEndCol - 1}`);
  
  // For each row, find and delete cells that originate in the delete range
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cellsToDelete = [];
    
    // Find cells that originate in the columns to delete
    for (let col = deleteStartCol; col < deleteEndCol; col++) {
      const cellInfo = columnMap[i][col];
      
      if (cellInfo && cellInfo.isOriginal && cellInfo.rowIndex === i) {
        const cellIndex = cellInfo.cellIndex;
        if (!cellsToDelete.includes(cellIndex)) {
          cellsToDelete.push(cellIndex);
        }
      }
    }
    
    // Sort in descending order to delete from right to left
    cellsToDelete.sort((a, b) => b - a);
    
    // Delete the cells
    for (const cellIndex of cellsToDelete) {
      if (row.cells[cellIndex]) {
        console.log(`Row ${i}: deleting cell ${cellIndex}`);
        row.deleteCell(cellIndex);
      }
    }
  }
  
  // Renumber remaining events
  renumberEvents();
  
  // Merge the date header row
  mergeFirstRow();
  
  // Save state for undo
  saveState();
  
  alert(`Event ${eventNum} deleted successfully!`);
}

// Helper function to merge first row across all events
function mergeFirstRow() {
  const sheet = document.getElementById('sheet');
  const firstRow = sheet.rows[0];
  
  if (!firstRow) return;
  
  // Calculate total columns by counting actual column spans in row 1
  const row1 = sheet.rows[1];
  let totalColumns = 0;
  for (let i = 0; i < row1.cells.length; i++) {
    totalColumns += (row1.cells[i].colSpan || 1);
  }
  
  console.log('Merging first row to span', totalColumns, 'columns');
  
  // Break any existing merges
  while (firstRow.cells.length > 1) {
    firstRow.deleteCell(1);
  }
  
  // Set colspan to span all columns
  firstRow.cells[0].colSpan = totalColumns;
}

// Helper function to renumber events
function renumberEvents() {
  const sheet = document.getElementById('sheet');
  const rows = sheet.rows;
  
  if (rows.length < 2) return;
  
  // Calculate number of events
  const row1 = rows[1];
  let actualColumns = 0;
  for (let i = 0; i < row1.cells.length; i++) {
    actualColumns += (row1.cells[i].colSpan || 1);
  }
  const numberOfEvents = Math.floor(actualColumns / TEMPLATE_WIDTH);
  
  console.log(`Renumbering ${numberOfEvents} events`);
  
  // Build column occupation map to find event number cells
  const columnMap = [];
  for (let i = 0; i < rows.length; i++) {
    columnMap[i] = [];
  }
  
  // Fill the column map
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let colIndex = 0;
    
    for (let j = 0; j < row.cells.length; j++) {
      const cell = row.cells[j];
      
      // Skip columns occupied by rowspan from above
      while (columnMap[i][colIndex]) {
        colIndex++;
      }
      
      const colspan = cell.colSpan || 1;
      const rowspan = cell.rowSpan || 1;
      
      // Mark this cell's position
      for (let r = 0; r < rowspan; r++) {
        for (let c = 0; c < colspan; c++) {
          if (i + r < rows.length) {
            columnMap[i + r][colIndex + c] = {
              cell: cell,
              isOriginal: r === 0,
              rowIndex: i,
              cellIndex: j
            };
          }
        }
      }
      
      colIndex += colspan;
    }
  }
  
  // Find and update event number cells
  for (let eventNum = 0; eventNum < numberOfEvents; eventNum++) {
    const eventStartCol = eventNum * TEMPLATE_WIDTH;
    
    // Look for the event-number cell in this event's columns
    for (let row = 0; row < rows.length; row++) {
      const cellInfo = columnMap[row][eventStartCol];
      
      if (cellInfo && cellInfo.isOriginal) {
        const cell = cellInfo.cell;
        
        // Check if this is an event-number cell
        if (cell.className && cell.className.includes('event-number')) {
          cell.textContent = eventNum + 1;
          console.log(`Updated event ${eventNum + 1} number cell`);
          break; // Found the event number for this event, move to next
        }
      }
    }
  }
}
