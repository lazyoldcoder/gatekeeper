console.log('App loaded');

let isLoading = false;




const tableBody = document.querySelector('#dataTable tbody');
const addRowBtn = document.getElementById('addRowBtn');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');
const clearBtn = document.getElementById('clearBtn');

const COLUMNS = ['A','B','C','D'];

// IndexedDB helper
function openDB(callback) {
  const request = indexedDB.open('tableDB', 1);
  request.onupgradeneeded = e => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains('tableStore')) {
      db.createObjectStore('tableStore');
    }
  };
  request.onsuccess = () => callback(request.result);
  request.onerror = e => console.error('IndexedDB error', e);
}

// Save table
function saveTable() {
  const data = [];
  tableBody.querySelectorAll('tr').forEach(tr => {
    const row = {};
    tr.querySelectorAll('td').forEach((td, i) => row[COLUMNS[i]] = td.textContent);
    data.push(row);
  });

  openDB(db => {
    const tx = db.transaction('tableStore', 'readwrite');
    tx.objectStore('tableStore').put(data, 'tableData');
  });
}

// Load table
function loadTable() {
  isLoading = true;
  tableBody.innerHTML = '';

  openDB(db => {
    const tx = db.transaction('tableStore', 'readonly');
    const store = tx.objectStore('tableStore');
    const req = store.get('tableData');
  
    req.onsuccess = () => {
      const data = req.result || [];
      if (data.length === 0) createRow();
      else data.forEach(row => createRow(row));
      isLoading = false;
      saveTable(); // one clean save after load
    };
  });
}

// Create row
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


// Buttons
addRowBtn.addEventListener('click', () => createRow());
clearBtn.addEventListener('click', () => {
  tableBody.innerHTML = '';
  createRow();
  saveTable();
});

// Export JSON from IndexedDB
exportBtn.addEventListener('click', () => {
  openDB(db => {
    const tx = db.transaction('tableStore', 'readonly');
    const store = tx.objectStore('tableStore');
    const req = store.get('tableData');
    req.onsuccess = () => {
      const data = req.result || [];
      const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'table.json';
      a.click();
      URL.revokeObjectURL(url);
    };
  });
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

// Initial load
loadTable();














// console.log('App loaded');

// const tableBody = document.querySelector('#dataTable tbody');
// const addRowBtn = document.getElementById('addRowBtn');
// const exportBtn = document.getElementById('exportBtn');
// const importFile = document.getElementById('importFile');
// const clearBtn = document.getElementById('clearBtn');




// // Save table in IndexedDB
// function saveTable() {
//   const data = [];
//   tableBody.querySelectorAll('tr').forEach(tr => {
//     const row = {};
//     tr.querySelectorAll('td').forEach((td, i) => {
//       row[['A','B','C','D'][i]] = td.textContent;
//     });
//     data.push(row);
//   });

//   const request = indexedDB.open('tableDB', 1);
//   request.onsuccess = () => {
//     const db = request.result;
//     const tx = db.transaction('tableStore', 'readwrite');
//     const store = tx.objectStore('tableStore');
//     store.put(data, 'tableData');
//   };
//   request.onupgradeneeded = e => {
//     const db = e.target.result;
//     if (!db.objectStoreNames.contains('tableStore')) {
//       db.createObjectStore('tableStore');
//     }
//   };
// }

// // Load table
// function loadTable() {
//   tableBody.innerHTML = '';
//   const request = indexedDB.open('tableDB', 1);
//   request.onsuccess = () => {
//     const db = request.result;
//     const tx = db.transaction('tableStore', 'readonly');
//     const store = tx.objectStore('tableStore');
//     const getReq = store.get('tableData');
//     getReq.onsuccess = () => {
//       const data = getReq.result || [];
//       if (data.length === 0) createRow();
//       else data.forEach(row => createRow(row));
//     };
//   };
//   request.onupgradeneeded = e => {
//     const db = e.target.result;
//     if (!db.objectStoreNames.contains('tableStore')) {
//       db.createObjectStore('tableStore');
//     }
//   };
// }













// // // Use localStorage to save table data
// // function saveTable() {
// //   const data = [];
// //   tableBody.querySelectorAll('tr').forEach(tr => {
// //     const row = {};
// //     tr.querySelectorAll('td').forEach((td, i) => {
// //       row[['A','B','C','D'][i]] = td.textContent;
// //     });
// //     data.push(row);
// //   });
// //   localStorage.setItem('tableData', JSON.stringify(data));
// // }













// // Load table from localStorage
// function loadTable() {
//   tableBody.innerHTML = '';
//   const data = JSON.parse(localStorage.getItem('tableData') || '[]');
//   if (data.length === 0) createRow(); // add initial row if empty
//   else data.forEach(row => createRow(row));
// }

// // Create editable row
// function createRow(data = {A:'',B:'',C:'',D:''}) {
//   const tr = document.createElement('tr');
//   ['A','B','C','D'].forEach(col => {
//     const td = document.createElement('td');
//     td.contentEditable = "true";
//     td.textContent = data[col] || '';
//     td.addEventListener('input', saveTable); // save on edit
//     tr.appendChild(td);
//   });
//   tableBody.appendChild(tr);
//   saveTable();
// }

// // Add row button
// addRowBtn.addEventListener('click', () => createRow());

// // Clear table
// clearBtn.addEventListener('click', () => {
//   tableBody.innerHTML = '';
//   createRow();
//   saveTable();
// });

// // Export JSON
// exportBtn.addEventListener('click', () => {
//   const data = JSON.parse(localStorage.getItem('tableData') || '[]');
//   const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = 'table.json';
//   a.click();
//   URL.revokeObjectURL(url);
// });

// // Import JSON
// importFile.addEventListener('change', e => {
//   const file = e.target.files[0];
//   if (!file) return;
//   const reader = new FileReader();
//   reader.onload = function() {
//     const data = JSON.parse(reader.result);
//     tableBody.innerHTML = '';
//     data.forEach(row => createRow(row));
//     saveTable();
//   };
//   reader.readAsText(file);
// });

// // Load table on startup
// loadTable();



// console.log('App loaded');

// const tableBody = document.querySelector('#dataTable tbody');
// const addRowBtn = document.getElementById('addRowBtn'); // use your existing HTML button

// // Function to create a new row with editable cells
// function createRow(data = {A:'', B:'', C:'', D:''}) {
//   const tr = document.createElement('tr');
//   ['A','B','C','D'].forEach(col => {
//     const td = document.createElement('td');
//     td.contentEditable = "true";       // <-- makes it editable
//     td.textContent = data[col] || '';
//     tr.appendChild(td);
//   });
//   tableBody.appendChild(tr);
// }

// // Add initial row
// createRow();

// // Add row button
// addRowBtn.addEventListener('click', () => {
//   createRow();
// });
