/**
 * Checks out the code from the repository and branch where the action has been called
 *
 * @important ***Remember to call `await cleanup()` in your `cleanup` script.**
 */
export declare function runExternalAction(uses: string, inputs?: Record<string, string>): Promise<void>;
