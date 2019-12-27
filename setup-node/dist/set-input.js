"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function setInput(name, value) {
    process.env[`INPUT_${name.replace(/ /g, "_").toUpperCase()}`] = value;
}
exports.setInput = setInput;
//# sourceMappingURL=set-input.js.map