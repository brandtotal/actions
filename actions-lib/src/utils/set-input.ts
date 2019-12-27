/**
 * Sets an input for the step.
 * Useful for running an external action as part of this step.
 *
 * @warning This is an undocumented API by GitHub and may change.
 *
 * @param name The name of the input
 * @param value The value for the input
 */
export function setInput(name: string, value: string) {
	process.env[`INPUT_${name.replace(/ /g, "_").toUpperCase()}`] = value;
}
