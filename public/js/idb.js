//db connection variable
let db;

//connect to db with name budget
const request= indexedDB.open('budget',1);

//function to respond to db version changes
request.onupgradeneeded= function (event) {
    const db= event.target.result;
    db.createObjectStore('new_budget', {autoIncrement: true})
};

//function to respond to successful db creation
request.onsuccess= function (event) {
    db= event.target.result;

    if (navigator.onLine)
    {
        uploadBudget();
    }
};

//function to handle errors in connecting the db
request.onerror= function (event) {
    console.log(evemt.target.errorCode);
};

//function to save offline data
function saveRecord(data) {
    const transaction= db.transaction(['new_budget'], 'readwrite');

    const budgetObjectStore= transaction.objectStore('new_budget');
    budgetObjectStore.add(data);
}

//function to send data to server
function uploadBudget() {
    const transaction= db.transaction(['new_budget'], 'readwrite');
    const budgetObjectStore= transaction.objectStore('new_budget');

    const getAll= budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0)
        {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message)
                {
                    throw new Error(serverResponse);
                }

                const transaction= db.transaction(['new_budget'], 'readwrite');
                const budgetObjectStore= transaction.objectStore('new_budget');
                budgetObjectStore.clear();

                alert('Transaction has been saved!');
            })
            .catch(err => {
                console.log(err);
            });
        }
    };

}

window.addEventListener('online', uploadBudget);