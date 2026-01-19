console.log('App loaded');
// this file is app.js
let isLoading = false;

document.addEventListener('DOMContentLoaded', () => {
const tableBody = document.querySelector('#dataTable tbody');
const addRowBtn = document.getElementById('addRowBtn');

const addRowBtnb = document.getElementById('addRowBtnb');

const exportBtn = document.getElementById('exportBtn');

const exportBtnb = document.getElementById('exportBtnb');

const importFile = document.getElementById('importFile');
const clearBtn = document.getElementById('clearBtn');

// determine number of table columns 
const COLUMNS = ['A','B'];   

// ---------------- Backend URL ----------------
const BACKEND_URL = 'https://gatekeeper-backend-qh08.onrender.com'; // your Render backend URL
//const BACKEND_URL = 'http://192.168.1.12:10000';

console.log('tableBody:', tableBody);


// ---------------- Save table ----------------
function saveTable() {
  if (isLoading) return;

  const data = [];

  // Always include header row first
  data.push(["Location", "Number"]);

  tableBody.querySelectorAll('tr').forEach(tr => {
    const row = [];

    // Remove any extra columns beyond COLUMNS.length
    while (tr.children.length > COLUMNS.length) {
      tr.removeChild(tr.lastChild);
    }

    // Collect exactly the columns you want
    tr.querySelectorAll('td').forEach((td, i) => {
      row.push(td.textContent);
    });

    // If row has less columns, fill with empty string
    while (row.length < COLUMNS.length) {
      row.push('');
    }

    data.push(row);
  });

  // Send to backend
  fetch(`${BACKEND_URL}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(r => console.log('Table saved', r))
  .catch(err => console.error('Save error', err));
}


// ---------------- Load table ----------------
function loadTable() {
  isLoading = true;
  tableBody.innerHTML = '';

  fetch(`${BACKEND_URL}/load?ts=${Date.now()}`)
    .then(res => res.json())
    .then(data => {
      if (!data || data.length <= 1) {
        // No data rows, create one blank row
        createRow();
        saveTable();
      } else {
        // Skip the first row (headers)
        data.slice(1).forEach(row => {
          // Only take first COLUMNS.length items
          createRow(row.slice(0, COLUMNS.length));
        });
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


// ---------------- CREATE ROW Table manipulation ----------------

function createRow(data = []) {
  const tr = document.createElement('tr');
  for (let i = 0; i < COLUMNS.length; i++) {


    const td = document.createElement('td');
    td.contentEditable = "true";
    td.textContent = data[i] || '';
    td.setAttribute('autocomplete', 'off');
    td.setAttribute('autocorrect', 'off');
    td.setAttribute('autocapitalize', 'off');
    td.setAttribute('spellcheck', 'false');







    // ---------------- Autosave with 3-second debounce + blur-save ----------------
    let saveTimeout;

    td.addEventListener('input', () => {
      if (isLoading) return;
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(saveTable, 3000); // 3s after last keystroke
    });

    td.addEventListener('blur', () => {
      if (isLoading) return;
      clearTimeout(saveTimeout); // cancel any pending debounce
      saveTable();               // save immediately when leaving cell
    });

    tr.appendChild(td);
  }
  tableBody.appendChild(tr);
}


// ---------------- Buttons ----------------
if (addRowBtn) {
  addRowBtn.addEventListener('click', () => createRow());
}

if (addRowBtnb) {
  addRowBtnb.addEventListener('click', () => createRow());
}


if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    tableBody.innerHTML = '';
    createRow();
    saveTable();
  });
}


// ---------------- Export JSON function ----------------
async function exportTable() {
  try {
    const res = await fetch(`${BACKEND_URL}/load?ts=${Date.now()}`);
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

    // iPhone / mobile Web Share API
    if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'gatekeeper_table.json')] })) {
      await navigator.share({
        title: 'Gatekeeper Table Export',
        text: 'Here is the exported Gatekeeper table.',
        files: [new File([blob], 'gatekeeper_table.json')]
      });
      console.log('Shared successfully!');
    } else {
      // fallback for desktop
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gatekeeper_table.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('Download complete!');
    }
  } catch (err) {
    console.error('Export error', err);
    alert('Failed to export table. Check console for details.');
  }
}

// ---------------- Attach to buttons ----------------
if (exportBtn) exportBtn.addEventListener('click', exportTable);
if (exportBtnb) exportBtnb.addEventListener('click', exportTable);




// Import JSON
if (importFile) {
  importFile.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function() {
      const data = JSON.parse(reader.result);
      tableBody.innerHTML = '';
      data.slice(1).forEach(row => createRow(row));
      saveTable();
    };
    reader.readAsText(file);
  });
}

// ---------------- Final safety ----------------
window.addEventListener('beforeunload', saveTable);

// ---------------- Initial load ----------------
loadTable();

});






// // ---------------- Save table ----------------
// function saveTable() {
//   if (isLoading) return;

//   const data = [];

//   // Always include header row first
//   data.push(["Location","Number"]);

//   // Add all table rows
//   tableBody.querySelectorAll('tr').forEach(tr => {
//     const row = [];
//     tr.querySelectorAll('td').forEach(td => row.push(td.textContent));
//     data.push(row);
//   });

//   fetch(`${BACKEND_URL}/save`, {

//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(data)
//   })
//   .then(res => res.json())
//   .then(r => console.log('Table saved', r))
//   .catch(err => console.error('Save error', err));
// }







// // ---------------- Load table ----------------
// function loadTable() {
//   isLoading = true;
//   tableBody.innerHTML = '';

//   fetch(`${BACKEND_URL}/load?ts=${Date.now()}`)
//     .then(res => res.json())
//     .then(data => {
//       if (!data || data.length <= 1) {
//         // No data rows, create one blank row
//         createRow();
//         saveTable();
//       } else {
//         // Skip the first row (headers) when creating rows
//         data.slice(1).forEach(row => createRow(row));
//       }
//       isLoading = false;
//       console.log('Table loaded', data);
//       data.slice(1).forEach(row => console.log('Row:', row));



//     })
//     .catch(err => {
//       console.error('Load error', err);
//       isLoading = false;
//       createRow();
//     });
// }






// // ---------------- Autosave with 3-second debounce ----------------

// function createRow(data = []) {
//   const tr = document.createElement('tr');
//   for (let i = 0; i < COLUMNS.length; i++) {
//     const td = document.createElement('td');
//     td.contentEditable = "true";
//     td.textContent = data[i] || '';

//     // ---------------- Autosave with 3-second debounce ----------------
//     let saveTimeout;
//     td.addEventListener('input', () => {
//       if (isLoading) return;
//       clearTimeout(saveTimeout);
//       saveTimeout = setTimeout(saveTable, 2000); // wait 3s after last keystroke
//     });

//     tr.appendChild(td);
//   }
//   tableBody.appendChild(tr);
// }




// live update per character 

// function createRow(data = []) {
//   const tr = document.createElement('tr');
//   for (let i = 0; i < COLUMNS.length; i++) {
//     const td = document.createElement('td');
//     td.contentEditable = "true";
//     td.textContent = data[i] || '';
//     td.addEventListener('input', () => {
//       if (!isLoading) saveTable();
//     });
//     tr.appendChild(td);
//   }
//   tableBody.appendChild(tr);
// }


// Example: add another export button later
// if (exportBtnB) exportBtnB.addEventListener('click', exportTable);


// // Export JSON - for mobile 
// exportBtn.addEventListener('click', async () => {
//   try {
//     const res = await fetch(`${BACKEND_URL}/load`);
//     const data = await res.json();
//     const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    
//     if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'gatekeeper_table.json')] })) {
//       // Web Share API: iPhone-friendly
//       await navigator.share({
//         title: 'Gatekeeper Table Export',
//         text: 'Here is the exported Gatekeeper table.',
//         files: [new File([blob], 'gatekeeper_table.json')]
//       });
//       console.log('Shared successfully!');
//     } else {
//       // fallback for desktop browsers
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = 'gatekeeper_table.json';
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);
//       console.log('Download complete!');
//     }
//   } catch (err) {
//     console.error('Export error', err);
//     alert('Failed to export table. Check console for details.');
//   }
// });






// // Export JSON
// if (exportBtn) {
//   exportBtn.addEventListener('click', () => {
//     fetch(`${BACKEND_URL}/load`)
//       .then(res => res.json())
//       .then(data => {
//         const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = 'table.json';
//         a.click();
//         URL.revokeObjectURL(url);
//       })
//       .catch(err => console.error('Export error', err));
//   });
// }

