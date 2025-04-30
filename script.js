let monthlySalary = null;
let expenseList = [];
function init() {
  const storedSalary = localStorage.getItem("monthlySalary");
  monthlySalary = storedSalary ? parseFloat(storedSalary) : null;
  const storedExpenses = JSON.parse(localStorage.getItem("expenseList"));
  expenseList = storedExpenses ? storedExpenses : [];
  updateSalaryDisplay();
  updateExpenseList();
}
const formatter = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function transformInputValue(value) {
  return value.replace(/\./g, "").replace(",", ".");
}
function updateSalaryDisplay() {
  const salaryDisplay = document.getElementById("salaryDisplay");
  if (monthlySalary !== null) {
    salaryDisplay.innerHTML = `<p>Gespeicherte monatliche Einnahmen: €${formatter.format(monthlySalary)}</p>`;
    document.getElementById("loan").disabled = true;
    document.getElementById("editSalaryBtn").style.display = "inline-block";
  } else {
    salaryDisplay.innerHTML = `<p>Keine Einnahmen gespeichert.</p>`;
    document.getElementById("loan").disabled = false;
    document.getElementById("editSalaryBtn").style.display = "none";
  }
}
function saveSalary() {
  const inputLoan = document.getElementById("loan");
  let loanValue = inputLoan.value.trim();
  if (loanValue === "" || isNaN(transformInputValue(loanValue))) {
    alert("Bitte gültige monatliche Einnahmen in € eingeben.");
    return;
  }
  const parsedValue = parseFloat(transformInputValue(loanValue));
  if (parsedValue < 0) {
    alert("Der Betrag darf nicht negativ sein.");
    return;
  }
  monthlySalary = parsedValue;
  localStorage.setItem("monthlySalary", monthlySalary);
  updateSalaryDisplay();
  inputLoan.value = "";
}
function editSalary() {
  document.getElementById("loan").disabled = false;
  document.getElementById("editSalaryBtn").style.display = "none";
  document.getElementById("loan").value = monthlySalary;
}
function addExpense() {
  const inputCostName = document.getElementById("costName");
  const inputCostType = document.getElementById("costType");
  const inputRate = document.getElementById("rate");
  const inputCosts = document.getElementById("costsEuro");
  const inputDueDate = document.getElementById("dueDate");
  const inputLastRate = document.getElementById("lastRate");
  if (
    inputCostName.value.trim() === "" ||
    inputCostType.value.trim() === "" ||
    inputRate.value.trim() === "" ||
    inputCosts.value.trim() === "" ||
    inputDueDate.value.trim() === "" ||
    inputLastRate.value.trim() === ""
  ) {
    alert("Bitte alle Felder für die Kosten ausfüllen.");
    return;
  }
  let costValue = transformInputValue(inputCosts.value.trim());
  if (isNaN(costValue)) {
    alert("Bitte einen gültigen Kostenbetrag eingeben.");
    return;
  }
  const parsedCost = parseFloat(costValue);
  if (parsedCost < 0) {
    alert("Der Kostenbetrag darf nicht negativ sein.");
    return;
  }
  const due = new Date(inputDueDate.value);
  const last = new Date(inputLastRate.value);
  if (due > last) {
    alert("Das Fälligkeitsdatum (1. Zahlung) muss vor der letzten Rate liegen.");
    return;
  }
  const expense = {
    costName: inputCostName.value.trim(),
    costType: inputCostType.value,
    rate: inputRate.value,
    cost: parsedCost,
    dueDate: inputDueDate.value,
    lastRate: inputLastRate.value
  };
  expenseList.push(expense);
  localStorage.setItem("expenseList", JSON.stringify(expenseList));
  inputCostName.value = "";
  inputCostType.value = "";
  inputRate.value = "";
  inputCosts.value = "";
  inputDueDate.value = "";
  inputLastRate.value = "";
  updateExpenseList();
}
function sortExpenses() {
  const sortSelect = document.getElementById("sortSelect");
  const sortOption = sortSelect.value;
  if (!sortOption) return;
  const [field, direction] = sortOption.split("_");
  expenseList.sort((a, b) => {
    let valA, valB;
    switch (field) {
      case "name":
        valA = a.costName.toLowerCase();
        valB = b.costName.toLowerCase();
        break;
      case "costType":
        valA = a.costType.toLowerCase();
        valB = b.costType.toLowerCase();
        break;
      case "rate":
        const order = { "monthly": 1, "quarterly": 2, "semiAnnualy": 3, "annualy": 4 };
        valA = order[a.rate] || 0;
        valB = order[b.rate] || 0;
        break;
      case "cost":
        valA = a.cost;
        valB = b.cost;
        break;
      case "dueDate":
        valA = new Date(a.dueDate);
        valB = new Date(b.dueDate);
        break;
      case "lastRate":
        valA = new Date(a.lastRate);
        valB = new Date(b.lastRate);
        break;
      default:
        valA = a.costName.toLowerCase();
        valB = b.costName.toLowerCase();
    }
    if (valA < valB) return direction === "asc" ? -1 : 1;
    if (valA > valB) return direction === "asc" ? 1 : -1;
    return 0;
  });
  updateExpenseList();
}
function formatShortDate(dateStr) {
  const d = new Date(dateStr);
  let day = d.getDate().toString().padStart(2, '0');
  let month = (d.getMonth() + 1).toString().padStart(2, '0');
  let year = d.getFullYear().toString().slice(-4);
  return `${day}/${month}/${year}`;
}
function translateIntervalShort(rate) {
  switch (rate) {
    case "monthly": return "monatl.";
    case "quarterly": return "viert.";
    case "semiAnnualy": return "halbj.";
    case "annualy": return "jähr.";
    default: return rate;
  }
}
function updateExpenseList() {
  const expenseDisplay = document.getElementById("expenseListDisplay");
  expenseDisplay.innerHTML = "";
  if (expenseList.length === 0) {
    expenseDisplay.innerHTML = "<p>Keine Kosten gespeichert.</p>";
    return;
  }
  const list = document.createElement("ul");
  expenseList.forEach((expense, index) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <div class="expense-main">
        <span class="expense-name font-weight-bold">${expense.costName}</span>
        <span class="expense-type">${expense.costType === "fixed" ? "fix." : "var."}</span>
        <span class="expense-interval">${translateIntervalShort(expense.rate)}</span>
      </div>
      <div class="expense-dates">
        ${formatShortDate(expense.dueDate)} - ${formatShortDate(expense.lastRate)}
      </div>
      <div class="expense-cost">
        ${formatter.format(expense.cost)} €
      </div>
    `;
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");
    const editButton = document.createElement("button");
    editButton.textContent = "Bearb.";
    editButton.classList.add("small-button");
    editButton.onclick = () => { editExpense(index); };
    const delButton = document.createElement("button");
    delButton.textContent = "Lösch.";
    delButton.classList.add("small-button");
    delButton.onclick = () => { deleteExpense(index); };
    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(delButton);
    listItem.appendChild(buttonContainer);
    list.appendChild(listItem);
  });
  expenseDisplay.appendChild(list);
}
function deleteExpense(index) {
  expenseList.splice(index, 1);
  localStorage.setItem("expenseList", JSON.stringify(expenseList));
  updateExpenseList();
}
function editExpense(index) {
  const expense = expenseList.splice(index, 1)[0];
  localStorage.setItem("expenseList", JSON.stringify(expenseList));
  updateExpenseList();
  document.getElementById("costName").value = expense.costName;
  document.getElementById("costType").value = expense.costType;
  document.getElementById("rate").value = expense.rate;
  document.getElementById("costsEuro").value = expense.cost;
  document.getElementById("dueDate").value = expense.dueDate;
  document.getElementById("lastRate").value = expense.lastRate;
}
function expenseOccursInMonth(expense, monthDate) {
  let dueDate = new Date(expense.dueDate);
  let lastRate = new Date(expense.lastRate);
  let monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  let monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  if (monthEnd < dueDate || monthStart > lastRate) return false;
  let monthsDiff = (monthDate.getFullYear() - dueDate.getFullYear()) * 12 + (monthDate.getMonth() - dueDate.getMonth());
  if (monthsDiff < 0) return false;
  switch (expense.rate) {
    case "monthly": return true;
    case "quarterly": return (monthsDiff % 3 === 0);
    case "semiAnnualy": return (monthsDiff % 6 === 0);
    case "annualy": return (monthsDiff % 12 === 0);
    default: return false;
  }
}
function calculateOverview() {
  if (monthlySalary === null) {
    alert("Bitte speichere zuerst Deine monatlichen Einnahmen.");
    return;
  }
  let startDate = new Date();
  let endYear = new Date().getFullYear();
  if (expenseList.length > 0) {
    let earliest = new Date(expenseList[0].dueDate);
    let latest = new Date(expenseList[0].lastRate);
    expenseList.forEach(expense => {
      let d = new Date(expense.dueDate);
      if (d < earliest) earliest = d;
      let l = new Date(expense.lastRate);
      if (l > latest) latest = l;
    });
    startDate = earliest;
    endYear = latest.getFullYear();
  }
  renderOverviewTable(startDate, endYear);
}
function renderOverviewTable(startDate, endYear) {
  let startYr = startDate.getFullYear();
  let html = "";
  for (let year = startYr; year <= endYear; year++) {
    let startMonth = (year === startYr) ? startDate.getMonth() : 0;
    let table = `<h3 class="mb-3">Übersicht für ${year}</h3><div class="table-responsive"><table class="table table-bordered">
      <thead class="thead-light">
        <tr>
          <th>Monat / Jahr</th>
          <th>Ges. Kosten (€)</th>
          <th>Einnahmen (€)</th>
          <th>Verfügbar (€)</th>
        </tr>
      </thead>
      <tbody>`;
    let totalAvailable = 0;
    for (let m = startMonth; m < 12; m++) {
      let current = new Date(year, m, 1);
      let monthlyExpenses = 0;
      expenseList.forEach(expense => {
        if (expenseOccursInMonth(expense, current)) {
          monthlyExpenses += expense.cost;
        }
      });
      const available = monthlySalary - monthlyExpenses;
      totalAvailable += available;
      const monthStr = current.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
      table += `<tr>
        <td>${monthStr}</td>
        <td>${formatter.format(monthlyExpenses)} €</td>
        <td>${formatter.format(monthlySalary)} €</td>
        <td>${formatter.format(available)} €</td>
      </tr>`;
    }
    table += `</tbody>
      <tfoot>
        <tr class="total-row">
          <th colspan="3">Gesamt Verfügbar (€)</th>
          <th>${formatter.format(totalAvailable)} €</th>
        </tr>
      </tfoot>
    </table></div>`;
    html += `<div class="year-section">${table}</div>`;
  }
  document.getElementById("overview").innerHTML = html;
}
function clearAll() {
  if (confirm("Möchtest Du wirklich alle Daten löschen?")) {
    localStorage.clear();
    monthlySalary = null;
    expenseList = [];
    document.getElementById("overview").innerHTML = "";
    document.getElementById("salaryDisplay").innerHTML = `<p>Keine Einnahmen gespeichert.</p>`;
    document.getElementById("expenseListDisplay").innerHTML = "";
    document.getElementById("loan").disabled = false;
  }
}
