// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext } from 'vscode';
import { CommandRegistry } from './commands/CommandRegistry';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	const registry = new CommandRegistry();
	registry.activate(context);
}

// This method is called when your extension is deactivated
export function deactivate() { }
