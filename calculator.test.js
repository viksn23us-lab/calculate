const fs = require("fs");
const vm = require("vm");

const elements = {
  expression: { textContent: "" },
  result: { textContent: "" },
  keys: { addEventListener() {} },
};

const context = {
  document: {
    querySelector(selector) {
      if (selector === "#expression") return elements.expression;
      if (selector === "#result") return elements.result;
      if (selector === ".keys") return elements.keys;
      return null;
    },
  },
  window: {
    addEventListener() {},
    setTimeout(callback) {
      callback();
    },
  },
  console,
};

vm.runInNewContext(fs.readFileSync("script.js", "utf8"), context);

function makeButton(dataset) {
  return {
    dataset,
    classList: {
      add() {},
      remove() {},
    },
  };
}

function press(dataset) {
  context.handleButtonClick(makeButton(dataset));
}

function expectResult(expected, message) {
  if (elements.result.textContent !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${elements.result.textContent}`);
  }
}

press({ number: "2" });
press({ operator: "+" });
press({ number: "3" });
press({ action: "equals" });
expectResult("5", "addition");

press({ action: "clear" });
press({ number: "8" });
press({ operator: "/" });
press({ number: "0" });
press({ action: "equals" });
expectResult("Ошибка", "division by zero");

press({ action: "clear" });
press({ number: "1" });
press({ action: "decimal" });
expectResult("1,", "decimal input");

press({ number: "5" });
press({ action: "percent" });
expectResult("0,015", "percent");

console.log("logic checks passed");
