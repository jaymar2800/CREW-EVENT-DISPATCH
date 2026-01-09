// Mock crew data (replace with your actual data source)
const CREW_DATA = {
  LIGHTS: [
    'John Smith',
    'Mike Johnson',
    'Sarah Williams',
    'David Brown',
    'Emily Davis'
  ],
  LEDWALL: [
    'Robert Miller',
    'Jennifer Wilson',
    'Michael Moore',
    'Lisa Taylor'
  ],
  AUDIO: [
    'James Anderson',
    'Mary Thomas',
    'Christopher Jackson',
    'Patricia White'
  ],
  TRUSSES: [
    'Daniel Harris',
    'Linda Martin',
    'Matthew Thompson'
  ],
  EFFECTS: [
    'Anthony Garcia',
    'Barbara Martinez',
    'Mark Robinson'
  ],
  CREW: [
    'Paul Clark',
    'Nancy Rodriguez',
    'Steven Lewis',
    'Karen Lee'
  ],
  DRIVER: [
    'Kevin Walker',
    'Betty Hall',
    'Brian Allen'
  ],
  MEGATENT: [
    'George Young',
    'Helen Hernandez',
    'Edward King'
  ]
};



const DEPARTMENT_ORDER = [
  'LIGHTS',
  'LEDWALL', 
  'AUDIO',
  'TRUSSES',
  'EFFECTS',
  'CREW',
  'MEGATENT',
  'DRIVER'
];

// ==============================
// ADD / DELETE CREW (BOTTOM UI)
// ==============================

// Fill department dropdown (once)
function initBottomCrewManager() {
  const deptSelect = document.getElementById('manageDeptBottom');
  if (!deptSelect || deptSelect.options.length) return;

  DEPARTMENT_ORDER.forEach(dept => {
    const opt = document.createElement('option');
    opt.value = dept;
    opt.textContent = dept;
    deptSelect.appendChild(opt);
  });
}

// Normalize
function normalizeCrewName(name) {
  return String(name || '').trim().replace(/\s+/g, ' ');
}

// ADD crew name
function addCrewFromBottom() {
  const dept = document.getElementById('manageDeptBottom').value;
  const nameInput = document.getElementById('manageNameBottom');
  const name = normalizeCrewName(nameInput.value);

  if (!dept || !name) {
    alert('Select department and enter name');
    return;
  }

  if (!CREW_DATA[dept]) CREW_DATA[dept] = [];

  const exists = CREW_DATA[dept].some(n => n.toLowerCase() === name.toLowerCase());
  if (exists) {
    alert('Name already exists');
    return;
  }

  CREW_DATA[dept].push(name);
  nameInput.value = '';

  populateCrewCategories(); // 🔁 refresh popup
}

// DELETE crew name
function deleteCrewFromBottom() {
  const dept = document.getElementById('manageDeptBottom').value;
  const name = normalizeCrewName(document.getElementById('manageNameBottom').value);

  if (!dept || !name) {
    alert('Select department and enter name');
    return;
  }

  if (!CREW_DATA[dept]) return;

  const before = CREW_DATA[dept].length;
  CREW_DATA[dept] = CREW_DATA[dept].filter(n => n.toLowerCase() !== name.toLowerCase());

  if (CREW_DATA[dept].length === before) {
    alert('Name not found');
    return;
  }

  populateCrewCategories(); // 🔁 refresh popup
}

// Hook buttons (SAFE – once)
document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('addCrewBottomBtn');
  const delBtn = document.getElementById('deleteCrewBottomBtn');

  if (addBtn) addBtn.addEventListener('click', addCrewFromBottom);
  if (delBtn) delBtn.addEventListener('click', deleteCrewFromBottom);
});

// Ensure dropdown is ready when popup opens
const _origShowCrewPicker = showCrewPicker;
showCrewPicker = function () {
  _origShowCrewPicker();
  initBottomCrewManager();
};


