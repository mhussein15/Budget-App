/*-------------------------------------*/
//BUDGET CONTROLLER
/*-------------------------------------*/

const budgetController = (function() {

    //Income Object Constructor Function
    const Income = function(id, description, amount) {
        this.id = id;
        this.description = description;
        this.amount = amount;

    };

    //Expense Object Constructor Function
    const Expense = function(id, description, amount) {
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.percentage = -1;
    };

    //Expense Prototype to Calculate Percentage of each expense entry to Total Income
    Expense.prototype.calPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.amount / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    //Expense Prototype to Return Object Percentage
    Expense.prototype.getPercent = function() {
        return this.percentage;
    }

    //Private Function
    //Calculate the TOTAL AMOUNT of both INCOMES and EXPENSES arrays
    //Stores the TOTAL AMOUNT in Store
    const calculateAmount = function() {

        Object.keys(data.allItems).forEach(function(key) {
            let sum = 0;
            data.allItems[key].forEach(element => {
                sum = element.amount + sum;
            });
            data.totals[key] = sum;
        });
    };

    //Data structure (Store)
    const data = {
        allItems: {
            add: [],
            dec: []
        },
        totals: {
            add: 0,
            dec: 0
        },
        budget: 0,
        percentage: -1
    };

    //Public Functions
    return {
        //Creates new Object of INCOME OR EXPENSES and saves it to Store
        addItem: function(type, description, amount) {

            let newItem, ID;

            //Add ID to newItem
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            //Decide if Expense or Income
            if (type === "add") {
                newItem = new Income(ID, description, amount);
            } else if (type === "dec") {
                newItem = new Expense(ID, description, amount);
            }

            //Push item to data structure
            data.allItems[type].push(newItem);

            //Return newItem created
            return newItem;
        },
        //Deletes Object of INCOME OR EXPENSES 
        deleteItem: function(type, id) {
            let idArray, indexID;

            //Return the IDs of all items in (ADD or DEC depending on TYPE) and saves in an array
            idArray = data.allItems[type].map(current => {
                return current.id
            });

            //Save ID index wanted to be delete in indexID 
            indexID = idArray.indexOf(id);

            //Remove indexID from data structure of (ADD or DEC depending on TYPE) 
            if (indexID !== -1) {
                data.allItems[type].splice(indexID, 1);
            }


        },
        //Calculates Total Incomes and Expenses, Budget, and Percentage
        calculateBudget: function() {

            //Calculate Total of Incomes and Expenses
            calculateAmount();

            //Calculate the Budget
            data.budget = data.totals.add - data.totals.dec;

            //Calculate Percentage
            if (data.totals.add > 0) {
                data.percentage = Math.round((data.totals.dec / data.totals.add) * 100);

            } else {
                data.percentage = -1;
            }

        },
        //Calculates EXPENSE ITEMS Percentage
        calculatePercentage: function() {
            data.allItems.dec.forEach(element => {
                element.calPercentage(data.totals.add);
            })

        },
        //Function to return all Expense Items Percentage and assign them to an array
        getPublicPercentage: function() {
            const allPercentage = data.allItems.dec.map(element => {
                return element.getPercent();
            })
            return allPercentage;
        },
        //Function that returns Data from Store
        getBudgetPublic: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.add,
                totalExpense: data.totals.dec,
                percentage: data.percentage
            }
        }
    }

})();

/*-------------------------------------*/
//UI CONTROLLER
/*-------------------------------------*/

const UIcontroller = (function(budgetCon) {

    let newHTMLstring;

    const DOMstring = {
        typeInput: "#typeInput",
        descriptionInput: "#descriptionInput",
        amountInput: "#amountInput",
        addID: '#add'
    }

    //Formats the Numbers to have '.00' at the end and add thousands ','
    const formatUI = function(num, type) {

        let number;

        //Turn 'number' to absolute
        number = Math.abs(num);

        //Converts 'number' to a string keeping only TWO decimals
        number = number.toFixed(2);

        //Splits 'number'  into an array of substrings from '.' and save it in 'number'
        //["5325", "00"] EXAMPLE
        number = number.split('.');

        //Turn 'number[0]' into an Integer
        number[0] = parseInt(number[0]);

        //Converts 'number[0]' to a string with a language sensitive representation of this number
        //EXAMPLE
        //'number[0]' = 5325 ----> 'number[0]' = "5,325"
        number[0] = number[0].toLocaleString();

        //Concatenate 'number[0]' and 'number[1]' into one string
        finalNumber = number[0].concat('.' + number[1]);

        //Returns 'finalNumber' with '+' or '-' depending on type
        return (type === "add" ? '+' : '-') + finalNumber;

    }

    //Callback Funtion used to loop over an ARRAY of fields and run a function over each entry
    const nodeForEach = function(list, callback) {
        for (let index = 0; index < list.length; index++) {
            callback(list[index], index);
        }
    }



    return {
        //Returns VALUE of TYPE,DESCRIPTION, and AMOUNT entered by user
        publicInput: function() {
            return {
                type: document.querySelector(DOMstring.typeInput).value,
                description: document.querySelector(DOMstring.descriptionInput).value,
                amount: parseFloat(document.querySelector(DOMstring.amountInput).value)
            };

        },
        //Returns DOMstring Object
        DOMstring: function() {
            return DOMstring;
        },
        //Adds table row to HTML file with INCOME/EXPENSE information depending on type
        addHTMLstring: function(obj, type) {
            //Decide if type is ADD or DEC in order to update UI
            if (type === "add") {
                //REMOVE HTML EMPTY STRING
                //Replace new HTML string with obj ID, DESCRIPTION, and AMOUNT
                newHTMLstring = '<tr id="add-%id%"> <td>%description%</td> <td class="text-center">%amount%</td> <td> <button id="deleteBtn" class="btn btn-md btn-warning float-right">Delete</button> </td> </tr>'.replace('%id%', obj.id);
                newHTMLstring = newHTMLstring.replace('%description%', obj.description);
                newHTMLstring = newHTMLstring.replace('%amount%', formatUI(obj.amount, 'add'));
                document.querySelector(".add").insertAdjacentHTML('beforeend', newHTMLstring);
            } else if (type === "dec") {
                //REMOVE HTML EMPTY STRING
                //Replace new HTML string with obj ID, DESCRIPTION, and AMOUNT
                newHTMLstring = '<tr id="dec-%id%"> <td>%description%</td> <td class="text-center"> %amount% - <span id="expPercent"></span></td>  <td> <button id="deleteBtn" class="btn btn-md btn-warning float-right">Delete</button> </td> </tr>'.replace('%id%', obj.id);
                newHTMLstring = newHTMLstring.replace('%description%', obj.description);
                newHTMLstring = newHTMLstring.replace('%amount%', formatUI(obj.amount, 'dec'));
                document.querySelector(".dec").insertAdjacentHTML('beforeend', newHTMLstring);
            }

        },
        //Delete Selected Row from Table 
        deleteHTML: function(selectorID) {
            const el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        //Clear inputs after entered by user
        clearInput: function() {
            document.querySelector(DOMstring.descriptionInput).value = "";
            document.querySelector(DOMstring.amountInput).value = "";
        },
        //Update Budget UI after each entry
        updateBudgetUI: function(obj) {
            let type = obj.budget >= 0 ? 'add' : 'dec';

            //Formats the numbers UI for BUDGET,TOTAL INCOME, and TOTAL EXPENSE
            document.getElementById("main_budget").textContent = formatUI(obj.budget, type);
            document.getElementById("main_budget_income").textContent = formatUI(obj.totalIncome, 'add');
            document.getElementById("main_budget_expense").textContent = formatUI(obj.totalExpense, 'dec');

            if (obj.percentage > 0) {
                document.getElementById("main_percentage").textContent = "%" + obj.percentage;
            } else {
                document.getElementById("main_percentage").textContent = '---';
            }

        },
        HTMLemptyString: function() {
            return HTMLemptyString;
        },
        //Adds EXPENSE ITEM percentages to UI 
        updatePercentagesUI: function(percentage) {

            let fields = document.querySelectorAll('#expPercent');


            nodeForEach(fields, (current, index) => {

                if (percentage[index] > 0) {
                    current.textContent = percentage[index] + '%';
                } else {
                    current.textContent = '';
                }
            });
        }
    };
})(budgetController);


/*-------------------------------------*/
//APP CONTROLLER
/*-------------------------------------*/

const controller = (function(UIcon, budgetCon) {

    let data, newItem;

    //Update Budget Function
    const updateBudget = function() {

        //Calculate Budget 
        budgetCon.calculateBudget();

        //Return the Budget
        const budget = budgetCon.getBudgetPublic();

        //Display the Budget on the UI
        UIcon.updateBudgetUI(budget)
    };

    //Update Expense Percentages
    const updatePercentages = function() {
        budgetCon.calculatePercentage();

        const percentage = budgetCon.getPublicPercentage();

        UIcon.updatePercentagesUI(percentage);
    };

    //Function to Add Item to Item Table, Update Budgets
    const ctrlAddItem = function() {
        //Get data entered by user ADD/DEC Item
        data = UIcon.publicInput();
        if (data.description !== "" && !isNaN(data.amount) && data.amount > 0) {

            //Add Item to Budget Controller
            newItem = budgetCon.addItem(data.type, data.description, data.amount);

            //Add Item to UI
            UIcon.addHTMLstring(newItem, data.type);

            //Clear Input Fields
            UIcon.clearInput();

            //Update Budget
            updateBudget();

            //Update Expense Percentages
            updatePercentages();
        }

    };

    //Function to Delete Item to Item Table, Update Budgets
    const ctrlDeleteItem = function(event) {


        let itemID, numberID, typeID;

        //Assign parentNode ID to 'itemID'
        itemID = event.target.parentNode.parentNode.id;
        console.log(itemID)


        if (itemID) {
            //Split TYPE and ID from each other 
            //Assign TYPE and ID to separate variables
            {
                itemIDsplit = itemID.split('-');
                typeID = itemIDsplit[0];
                numberID = parseInt(itemIDsplit[1]);
            }

            //Delete 
            budgetCon.deleteItem(typeID, numberID);

            //Delete ITEM from UI
            UIcon.deleteHTML(itemID);

            //Update Budget after deleting an ITEM
            updateBudget();

        }

    }

    //Function to Handle APP EVENTLISTENERS
    const eventListeners = function() {

        //EventListener --- Click the Button --- ADD ITEM
        document.querySelector('#enterBtn').addEventListener('click', () => {
            ctrlAddItem();
        });

        //EventListener --- Press 'Enter' --- ADD ITEM
        document.addEventListener('keypress', (event) => {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        })

        //EventListener --- Click the Button --- DELETE ITEM
        document.querySelector("#itemTable").addEventListener('click', (event) => {
            ctrlDeleteItem(event);
        })

    }


    return {
        init: function() {
            UIcon.updateBudgetUI({
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: -1

            })
            eventListeners();
        }
    }


})(UIcontroller, budgetController);

//Initialize State of the App
controller.init();
