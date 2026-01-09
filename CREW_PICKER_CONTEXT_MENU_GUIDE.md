# Crew Picker Context Menu Feature

## Overview
The crew picker modal now supports right-click context menu functionality for managing crew names directly within the modal.

## New Features

### 1. **Delete Crew Name** (Right-click on a name)
- Right-click on any crew member name in the crew picker
- A context menu will appear with the option: **🗑️ Delete "[Name]"**
- Click to delete the name from that department
- Confirmation dialog will appear before deletion
- The crew picker will automatically refresh to show the updated list

**Example:**
- Right-click on "James Anderson" in the AUDIO department
- Select "🗑️ Delete 'James Anderson'"
- Confirm the deletion
- James Anderson is removed from AUDIO department

### 2. **Copy Crew Name to Another Department** (Right-click on a name)
- Right-click on any crew member name in the crew picker
- A context menu will appear with the option: **📋 Copy "[Name]" to Another Department**
- Click to copy the name to another department
- Select the target department from the numbered list
- The name will be added to the target department
- The crew picker will automatically refresh to show the name in both departments

**Example:**
- Right-click on "James Anderson" in the AUDIO department
- Select "📋 Copy 'James Anderson' to Another Department"
- Enter "3" to copy to TRUSSES (or whichever number corresponds to TRUSSES)
- James Anderson now appears in both AUDIO and TRUSSES departments

**Important:** Once a name is used in the spreadsheet, it will be disabled (red strikethrough) in ALL departments where it appears, not just one.

### 3. **Add New Crew Name** (Right-click on department area)
- Right-click on the department title or empty space in a department box
- A context menu will appear with the option: **➕ Add New Name to [DEPARTMENT]**
- Click to add a new name
- Enter the name in the prompt dialog
- The new name will be added to that department
- The crew picker will automatically refresh to show the new name

**Example:**
- Right-click on the "LIGHTS" department title or empty area
- Select "➕ Add New Name to LIGHTS"
- Enter "John Doe" in the prompt
- John Doe is added to the LIGHTS department

## How to Use

### Deleting a Name:
1. Open the crew picker modal (click "👥 ADD CREW" button)
2. Find the name you want to delete
3. **Right-click** on the name
4. Click "🗑️ Delete '[Name]'"
5. Confirm the deletion in the dialog
6. The name is removed and the list refreshes

### Copying a Name to Another Department:
1. Open the crew picker modal (click "👥 ADD CREW" button)
2. Find the name you want to copy (e.g., "James Anderson" in AUDIO)
3. **Right-click** on the name
4. Click "📋 Copy '[Name]' to Another Department"
5. A prompt will show a numbered list of available departments
6. Enter the number of the target department (e.g., "3" for TRUSSES)
7. Click OK
8. The name is now in both departments and the list refreshes

**Note:** Once you use a name in the spreadsheet, it will be disabled (shown in red with strikethrough) in ALL departments where it appears.

### Adding a Name:
1. Open the crew picker modal (click "👥 ADD CREW" button)
2. Find the department where you want to add a name
3. **Right-click** on the department title or empty space in that department box
4. Click "➕ Add New Name to [DEPARTMENT]"
5. Enter the new crew member's name in the prompt
6. Click OK
7. The name is added and the list refreshes

## Technical Details

### Files Modified:
- **crew-picker.js**: Added context menu functionality with the following new functions:
  - `initCrewContextMenu()`: Initializes the context menu element
  - `showCrewContextMenu()`: Displays the context menu at cursor position
  - `deleteCrewName()`: Removes a crew member from a department
  - `addCrewName()`: Adds a new crew member to a department
  - `copyCrewNameToAnotherDepartment()`: Copies a crew member to another department

### Context Menu Behavior:
- The context menu appears at the cursor position
- Clicking anywhere else closes the context menu
- The crew picker automatically refreshes after any add/delete operation
- Changes are immediately reflected in the CREW_DATA object

### Data Persistence:
- Changes are stored in the `CREW_DATA` object in memory
- Changes persist during the current session
- To make changes permanent, you would need to implement backend storage

## Benefits

1. **Quick Management**: Add, delete, or copy crew names without leaving the crew picker
2. **Intuitive Interface**: Right-click context menu is familiar to most users
3. **Department-Specific**: Add names directly to the correct department
4. **Cross-Department Support**: Copy names to multiple departments for versatile crew members
5. **Smart Disabling**: Once a name is used in the spreadsheet, it's disabled in ALL departments
6. **Immediate Feedback**: The list refreshes automatically after changes
7. **Confirmation**: Delete operations require confirmation to prevent accidents

## Use Case Example

**Scenario:** James Anderson is skilled in both AUDIO and TRUSSES

1. James Anderson is initially in the AUDIO department
2. Right-click on "James Anderson" in AUDIO
3. Select "📋 Copy 'James Anderson' to Another Department"
4. Choose TRUSSES from the list
5. James Anderson now appears in both AUDIO and TRUSSES
6. When you add James Anderson to the spreadsheet from either department, he becomes disabled (red strikethrough) in BOTH departments
7. This prevents accidentally adding him twice to the same event

## Future Enhancements

Potential improvements could include:
- Edit/rename crew names
- Move names between departments (remove from source, add to target)
- Bulk operations (copy/delete multiple names at once)
- Undo/redo for crew management operations
- Export/import crew lists
- Backend integration for persistent storage
- Visual indicator showing which departments a name appears in
