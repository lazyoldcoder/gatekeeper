console.log('App loaded');

let isLoading = false;

const tableBody = document.querySelector('#dataTable tbody');
const addRowBtn = document.getElementById('addRowBtn');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');
const clearBtn = document.getElementById('clearBtn');

const COLUMNS = ['A','B','C','D'];

// ---------------- Backend URL ----------------
const BACKEND_URL = 'https://gatekeeper-gtvr.onrender.com'; // your Render backend URL

// ---------------- Save / Load table ----------------
function saveTable() {
  const data = [];
  tableBody.querySelectorAll('tr').forEach(tr => {
    const row = {};
    tr.querySelectorAll('td').forEach((td, i) => row[COLUMNS[i]] = td.textContent);
    data.push(row);
  });

  fetch(`${BACKEND_URL}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(r => console.log('Table saved', r))
  .catch(err => console.error('Save error', err));
}

function loadTable() {
  isLoading = true;
  tableBody.innerHTML = '';

  fetch(`${BACKEND_URL}/load`)
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) {
        createRow();
        saveTable();
      } else {
        data.forEach(row => createRow(row));
      }
      isLoading = false;
      console.log('Table loaded', data);
    })
    .catch(err => {
      console.error('Load error', err);
      isLoading = false;
      createRow();
    });
}

// ---------------- Table manipulation ----------------
function createRow(data = {A:'',B:'',C:'',D:''}) {
  const tr = document.createElement('tr');
  COLUMNS.forEach(col => {
    const td = document.createElement('td');
    td.contentEditable = "true";
    td.textContent = data[col] || '';
    td.addEventListener('input', () => {
      if (!isLoading) saveTable();
    });
    tr.appendChild(td);
  });
  tableBody.appendChild(tr);
}

// ---------------- Buttons ----------------
addRowBtn.addEventListener('click', () => createRow());

clearBtn.addEventListener('click', () => {
  tableBody.innerHTML = '';
  createRow();
  saveTable();
});

// Export JSON
exportBtn.addEventListener('click', () => {
  fetch(`${BACKEND_URL}/load`)
    .then(res => res.json())
    .then(data => {
      const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'table.json';
      a.click();
      URL.revokeObjectURL(url);
    })
    .catch(err => console.error('Export error', err));
});

// Import JSON
importFile.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function() {
    const data = JSON.parse(reader.result);
    tableBody.innerHTML = '';
    data.forEach(row => createRow(row));
    saveTable();
  };
  reader.readAsText(file);
});

// ---------------- Final safety ----------------
window.addEventListener('beforeunload', saveTable);

// ---------------- Initial load ----------------
loadTable();
