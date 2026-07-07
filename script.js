const expressionElement = document.querySelector("#expression");
const resultElement = document.querySelector("#result");
const keysElement = document.querySelector(".keys");

const state = {
  displayValue: "0",
  firstOperand: null,
  operator: null,
  waitingForSecondOperand: false,
  lastExpression: "",
  hasError: false,
};

const operatorLabels = {
  "+": "+",
  "-": "-",
  "*": "x",
  "/": "/",
};

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  const rounded = Number.parseFloat(value.toPrecision(12));
  return rounded.toLocaleString("ru-RU", {
    maximumFractionDigits: 10,
  });
}

function formatDisplayValue(value) {
  if (value.endsWith(".")) {
    return value.replace(".", ",");
  }

  return formatNumber(toNumber(value));
}

function toNumber(value) {
  return Number(String(value).replace(/\s/g, "").replace(",", "."));
}

function resetCalculator() {
  state.displayValue = "0";
  state.firstOperand = null;
  state.operator = null;
  state.waitingForSecondOperand = false;
  state.lastExpression = "";
  state.hasError = false;
}

function inputDigit(digit) {
  if (state.hasError) {
    resetCalculator();
  }

  if (state.waitingForSecondOperand) {
    state.displayValue = digit;
    state.waitingForSecondOperand = false;
    return;
  }

  state.displayValue = state.displayValue === "0" ? digit : state.displayValue + digit;
}

function inputDecimal() {
  if (state.hasError) {
    resetCalculator();
  }

  if (state.waitingForSecondOperand) {
    state.displayValue = "0.";
    state.waitingForSecondOperand = false;
    return;
  }

  if (!state.displayValue.includes(".")) {
    state.displayValue += ".";
  }
}

function deleteLastDigit() {
  if (state.hasError || state.waitingForSecondOperand) {
    resetCalculator();
    return;
  }

  state.displayValue = state.displayValue.length > 1
    ? state.displayValue.slice(0, -1)
    : "0";
}

function calculate(first, second, operator) {
  switch (operator) {
    case "+":
      return first + second;
    case "-":
      return first - second;
    case "*":
      return first * second;
    case "/":
      return second === 0 ? NaN : first / second;
    default:
      return second;
  }
}

function handleOperator(nextOperator) {
  if (state.hasError) {
    resetCalculator();
  }

  const inputValue = toNumber(state.displayValue);

  if (state.operator && state.waitingForSecondOperand) {
    state.operator = nextOperator;
    updateExpression();
    return;
  }

  if (state.firstOperand === null) {
    state.firstOperand = inputValue;
  } else if (state.operator) {
    const result = calculate(state.firstOperand, inputValue, state.operator);

    if (!Number.isFinite(result)) {
      state.displayValue = "Error";
      state.firstOperand = null;
      state.operator = null;
      state.waitingForSecondOperand = true;
      state.hasError = true;
      state.lastExpression = "";
      return;
    }

    state.displayValue = String(result);
    state.firstOperand = result;
  }

  state.operator = nextOperator;
  state.waitingForSecondOperand = true;
  updateExpression();
}

function performEquals() {
  if (!state.operator || state.firstOperand === null || state.hasError) {
    return;
  }

  const secondOperand = toNumber(state.displayValue);
  const result = calculate(state.firstOperand, secondOperand, state.operator);

  state.lastExpression = `${formatNumber(state.firstOperand)} ${operatorLabels[state.operator]} ${formatNumber(secondOperand)} =`;

  if (!Number.isFinite(result)) {
    state.displayValue = "Error";
    state.hasError = true;
  } else {
    state.displayValue = String(result);
  }

  state.firstOperand = null;
  state.operator = null;
  state.waitingForSecondOperand = true;
}

function toggleSign() {
  if (state.hasError || state.displayValue === "0") {
    return;
  }

  state.displayValue = state.displayValue.startsWith("-")
    ? state.displayValue.slice(1)
    : `-${state.displayValue}`;
}

function applyPercent() {
  if (state.hasError) {
    return;
  }

  state.displayValue = String(toNumber(state.displayValue) / 100);
}

function updateExpression() {
  if (state.operator && state.firstOperand !== null) {
    state.lastExpression = `${formatNumber(state.firstOperand)} ${operatorLabels[state.operator]}`;
  }
}

function updateDisplay() {
  expressionElement.textContent = state.lastExpression || "\u00a0";
  resultElement.textContent = state.hasError ? "Error" : formatDisplayValue(state.displayValue);
}

function flashKey(button) {
  button.classList.add("is-active");
  window.setTimeout(() => button.classList.remove("is-active"), 120);
}

function handleButtonClick(button) {
  if (button.dataset.number) {
    inputDigit(button.dataset.number);
  } else if (button.dataset.operator) {
    handleOperator(button.dataset.operator);
  } else {
    const action = button.dataset.action;

    if (action === "clear") resetCalculator();
    if (action === "decimal") inputDecimal();
    if (action === "equals") performEquals();
    if (action === "toggle-sign") toggleSign();
    if (action === "percent") applyPercent();
    if (action === "delete") deleteLastDigit();
  }

  flashKey(button);
  updateDisplay();
}

keysElement.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  handleButtonClick(button);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Backspace") {
    event.preventDefault();
    deleteLastDigit();
    updateDisplay();
    return;
  }

  const keyMap = {
    Enter: "[data-action='equals']",
    "=": "[data-action='equals']",
    Escape: "[data-action='clear']",
    ".": "[data-action='decimal']",
    ",": "[data-action='decimal']",
    "+": "[data-operator='+']",
    "-": "[data-operator='-']",
    "*": "[data-operator='*']",
    "/": "[data-operator='/']",
    "%": "[data-action='percent']",
  };

  const selector = /^\d$/.test(event.key)
    ? `[data-number='${event.key}']`
    : keyMap[event.key];

  if (!selector) return;

  event.preventDefault();
  const button = document.querySelector(selector);
  if (button) {
    handleButtonClick(button);
  }
});

updateDisplay();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js");
  });
}
