"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Sets an input for the step.
 * Useful for running an external action as part of this step.
 *
 * @warning This is an undocumented API by GitHub and may change.
 *
 * @param name The name of the input
 * @param value The value for the input
 */
function setInput(name, value) {
    process.env[`INPUT_${name.replace(/ /g, "_").toUpperCase()}`] = value;
}
exports.setInput = setInput;
//# sourceMappingURL=set-input.js.map