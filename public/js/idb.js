// create variable to hold db connection
let db;

// establish connection to db called 'budget-tracker' set to version 1
const request = indexedDB.open('budget-tracker', 1);

// evemt will emit if db version changes
request.onupgradeneeded = function(e) {
  // save refence to db
  const db = e.target.result;

  // create an object store, set to have an auto-incrementing "primary key"
  db.createObjectStore('new_transaction', { autoIncrement: true });
};

// on success
request.onsuccess = function(e) {
  // save reference to db in global variable on successfull creation of db or connection
  db = e.target.result;

  // check if app is online, if yes run uploadTransactions() to send all local db data to api
  if (navigator.onLine) {
    uploadTransactions();
  }
};

// on fail/error
request.onerror = function(e) {
  // log error
  console.log(e.target.errorCode);
};

// save transaction to indexedDB if no internet connection
const saveRecord = (record) => {
  console.log(record);

  // open new transaction with the db with read/write permissions
  const transaction = db.transaction(['new_transaction'], 'readwrite');

  // access object store for 'new_transaction'
  const transactionObjectStore = transaction.objectStore('new_transaction');

  // add record to store
  transactionObjectStore.add(record);
};

// collect all data from new_transaction object store and POST on server on reconnect
const uploadTransactions = (record) => {
  // open transaction to db
  const transaction = db.transaction(['new_transaction'], 'readwrite');

  // access object store
  const transactionObjectStore = transaction.objectStore('new_transaction');

  // get and set all records to variable with getAll
  const getAll = transactionObjectStore.getAll();

  // on getAll success
  getAll.onsuccess = function() {
    // if there was data in the store, send to api server (POST)
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-type': 'application/json'
        }
      })
      .then((response) => response.json())
      .then(serverResponse => {
        // if there exists a message from our response, treat as error
        if (serverResponse.message) {
          throw new Error(serverResponse);
        }
        // open transaction
        const transaction = db.transaction(['new_transaction'], 'readwrite');

        // access new_transaction object store
        const transactionObjectStore = transaction.objectStore('new_transaction');

        // clear all old/outdated items in store
        transactionObjectStore.clear();

        // alert front end success message
        alert('All saved transactions submitted!');
      })
      .catch((err) => console.log(err));
    }
  };
};

// add event listener for when app comes back online
window.addEventListener('online', uploadTransactions);