// Globale Variablen
let monthlySalary = null;  // Einmaliger, monatlicher Lohn
let expenseList = [];      // Array für alle Ausgaben

// Initialisierung: Lohn und Ausgaben aus localStorage laden und Anzeigen aktualisieren
function init() {
  const storedSalary = localStorage.getItem("monthlySalary");
  monthlySalary = storedSalary ? parseFloat(storedSalary) : null;
  
  const storedExpenses = JSON.parse(localStorage.getItem("expenseList"));
  expenseList = storedExpenses ? storedExpenses : [];
  
  updateSalaryDisplay();
  updateExpenseList();
}

// Formatierer für Beträge nach deutschem Standard (z.B. 1.234,56)
const formatter = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

// Hilfsfunktion: Transformiert Eingabewerte (Entfernt Tausenderpunkte, ersetzt Komma durch Punkt)
function transformInputValue(value) {
  return value.replace(/\./g, "").replace(",", ".");
}

// Aktualisiert die Lohnanzeige
function updateSalaryDisplay() {
  const salaryDisplay = document.getElementById("salaryDisplay");
  if (monthlySalary !== null) {
    salaryDisplay.innerHTML = `<p>Gespeicherter monatlicher Lohn: €${formatter.format(monthlySalary)}</p>`;
    document.getElementById("loan").disabled = true;
    document.getElementById("editSalaryBtn").style.display = "inline-block";
  } else {
    salaryDisplay.innerHTML = `<p>Kein Lohn gespeichert.</p>`;
    document.getElementById("loan").disabled = false;
    document.getElementById("editSalaryBtn").style.display = "none";
  }
}

// Speichert den eingegebenen Lohn im localStorage
function saveSalary() {
  const inputLoan = document.getElementById("loan");
  let loanValue = inputLoan.value.trim();
  if (loanValue === "" || isNaN(transformInputValue(loanValue))) {
    alert("Bitte einen gültigen monatlichen Lohn in € eingeben.");
    return;
  }
  monthlySalary = parseFloat(transformInputValue(loanValue));
  localStorage.setItem("monthlySalary", monthlySalary);
  updateSalaryDisplay();
  inputLoan.value = "";
}

// Ermöglicht das Bearbeiten des gespeicherten Lohns
function editSalary() {
  document.getElementById("loan").disabled = false;
  document.getElementById("editSalaryBtn").style.display = "none";
  document.getElementById("loan").value = monthlySalary;
}

// Fügt eine neue Ausgabe hinzu und aktualisiert die Liste
function addExpense() {
  const inputCostName = document.getElementById("costName");
  const inputCostType = document.getElementById("costType");
  const inputRate = document.getElementById("rate");
  const inputCosts = document.getElementById("costsEuro");
  const inputDueDate = document.getElementById("dueDate");
  const inputLastRate = document.getElementById("lastRate");
  
  // Prüfen, ob alle Felder ausgefüllt sind
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
  
  const expense = {
    costName: inputCostName.value.trim(),
    costType: inputCostType.value,   // "fixed" oder "var"
    rate: inputRate.value,           // "monthly", "quarterly", etc.
    cost: parseFloat(costValue),
    dueDate: inputDueDate.value,     // Erster Zahlungstermin
    lastRate: inputLastRate.value      // Letzte Rate
  };
  
  expenseList.push(expense);
  localStorage.setItem("expenseList", JSON.stringify(expenseList));
  
  // Felder zurücksetzen
  inputCostName.value = "";
  inputCostType.value = "";
  inputRate.value = "";
  inputCosts.value = "";
  inputDueDate.value = "";
  inputLastRate.value = "";
  
  updateExpenseList();
}

// Sortiert die expenseList basierend auf dem ausgewählten Kriterium und ruft updateExpenseList() auf
function sortExpenses() {
  const sortSelect = document.getElementById("sortSelect");
  const sortOption = sortSelect.value; // Format: field_direction, z.B. "name_asc"
  
  if (!sortOption) return;
  
  const [field, direction] = sortOption.split("_");  
  expenseList.sort((a, b) => {
    let valA, valB;
    switch(field) {
      case "name":
        valA = a.costName.toLowerCase();
        valB = b.costName.toLowerCase();
        break;
      case "costType":
        valA = a.costType.toLowerCase();
        valB = b.costType.toLowerCase();
        break;
      case "rate":
        // Optional: Definiere eine Reihenfolge für Intervalle
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

// Aktualisiert die Anzeige der monatlichen Kosten (Liste) in einer kompakten, inline Darstellung
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
    
    // Datumsformatierung im deutschen Format (z. B. "15. August 2025")
    const dueDateFormatted = new Date(expense.dueDate)
      .toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
    const lastRateFormatted = new Date(expense.lastRate)
      .toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
    
    listItem.innerHTML =
      `<span class="expense-name"><strong>${expense.costName}</strong></span>` +
      `<span class="expense-type">${expense.costType === "fixed" ? "Fixkosten" : "Variable Kosten"}</span>` +
      `<span class="expense-interval">${translateInterval(expense.rate)}</span>` +
      `<span class="expense-cost">${formatter.format(expense.cost)} €</span>` +
      `<span class="expense-dates">Fällig ab: ${dueDateFormatted} bis ${lastRateFormatted}</span>`;
    
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");
    
    const editButton = document.createElement("button");
    editButton.textContent = "Bearbeiten";
    editButton.classList.add("small-button");
    editButton.onclick = () => { editExpense(index); };
    
    const delButton = document.createElement("button");
    delButton.textContent = "Löschen";
    delButton.classList.add("small-button");
    delButton.onclick = () => { deleteExpense(index); };
    
    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(delButton);
    listItem.appendChild(buttonContainer);
    list.appendChild(listItem);
  });
  
  expenseDisplay.appendChild(list);
}

// Übersetzt das Intervall ins Deutsche
function translateInterval(rate) {
  switch(rate) {
    case "monthly": return "Monatlich";
    case "quarterly": return "Vierteljährlich";
    case "semiAnnualy": return "Halbjährlich";
    case "annualy": return "Jährlich";
    default: return rate;
  }
}

// Löscht einen Eintrag aus der expenseList
function deleteExpense(index) {
  expenseList.splice(index, 1);
  localStorage.setItem("expenseList", JSON.stringify(expenseList));
  updateExpenseList();
}

// Bearbeitet einen Eintrag: Entfernt ihn, überträgt die Daten in das Formular und aktualisiert die Anzeige
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

// Berechnet eine Übersichtstabelle für das angegebene Jahr (nur Monat und Jahr, ohne Tag)
function calculateYearOverview(year) {
  let html = `<table border="1">
    <tr>
      <th>Monat und Jahr</th>
      <th>Gesamte Kosten (€)</th>
      <th>Monatlicher Lohn (€)</th>
      <th>Verfügbar (€)</th>
    </tr>`;
  
  let totalAvailable = 0;
  // Iteration von Januar (0) bis Dezember (11)
  for (let m = 0; m < 12; m++) {
    const currentMonthDate = new Date(year, m, 1);
    let monthlyExpenses = 0;
    
    expenseList.forEach(expense => {
      if (expenseOccursInMonth(expense, currentMonthDate)) {
        monthlyExpenses += expense.cost;
      }
    });
    
    const available = monthlySalary - monthlyExpenses;
    totalAvailable += available;
    
    const monthStr = currentMonthDate.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
    html += `<tr>
      <td>${monthStr}</td>
      <td>${formatter.format(monthlyExpenses)} €</td>
      <td>${formatter.format(monthlySalary)} €</td>
      <td>${formatter.format(available)} €</td>
    </tr>`;
  }
  
  html += `<tr class="total-row">
      <th colspan="3">Gesamt Verfügbar (€)</th>
      <th>${formatter.format(totalAvailable)} €</th>
    </tr>`;
  html += `</table>`;
  return html;
}

// Berechnet die Übersichten für das aktuelle Jahr und für das Jahr 2026
function calculateOverview() {
  if (monthlySalary === null) {
    alert("Bitte speichere zuerst Deinen monatlichen Lohn.");
    return;
  }
  
  // Übersicht für aktuelles Jahr basierend auf frühester Fälligkeit (falls vorhanden)
  let currentYear = new Date().getFullYear();
  let startMonth = 0;
  if (expenseList.length > 0) {
    let earliest = new Date(expenseList[0].dueDate);
    expenseList.forEach(expense => {
      let d = new Date(expense.dueDate);
      if (d < earliest) {
        earliest = d;
      }
    });
    if (earliest.getFullYear() === currentYear) {
      startMonth = earliest.getMonth();
    } else if (earliest.getFullYear() > currentYear) {
      currentYear = earliest.getFullYear();
      startMonth = earliest.getMonth();
    } else {
      startMonth = 0;
    }
  }
  
  let overviewHTML = `<h3>Übersicht für ${currentYear}</h3>`;
  overviewHTML += calculateYearOverview(currentYear);
  
  overviewHTML += `<h3>Übersicht für 2026</h3>`;
  overviewHTML += calculateYearOverview(2026);
  
  document.getElementById("overview").innerHTML = overviewHTML;
}

// Prüft, ob ein Eintrag in dem angegebenen Monat (1. Tag) anfällt
function expenseOccursInMonth(expense, monthDate) {
  let dueDate = new Date(expense.dueDate);
  let lastRate = new Date(expense.lastRate);
  
  let monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  let monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  
  if (monthEnd < dueDate || monthStart > lastRate) {
    return false;
  }
  
  let monthsDiff = (monthDate.getFullYear() - dueDate.getFullYear()) * 12 +
                   (monthDate.getMonth() - dueDate.getMonth());
  
  if (monthsDiff < 0) return false;
  
  switch(expense.rate) {
    case "monthly": return true;
    case "quarterly": return (monthsDiff % 3 === 0);
    case "semiAnnualy": return (monthsDiff % 6 === 0);
    case "annualy": return (monthsDiff % 12 === 0);
    default: return false;
  }
}

// Löscht alle Daten (Lohn und Kosten) und leert den localStorage
function clearAll() {
  if (confirm("Möchtest Du wirklich alle Daten löschen?")) {
    localStorage.clear();
    monthlySalary = null;
    expenseList = [];
    document.getElementById("overview").innerHTML = "";
    document.getElementById("salaryDisplay").innerHTML = `<p>Kein Lohn gespeichert.</p>`;
    document.getElementById("expenseListDisplay").innerHTML = "";
    document.getElementById("loan").disabled = false;
  }
}
