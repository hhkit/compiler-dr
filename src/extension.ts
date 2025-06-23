// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { FileManager } from './util/FileManager';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('mlir.loadTrace', () => {
		vscode.window.showOpenDialog({
		}).then((uris: vscode.Uri[] | undefined) => {
			const fm = new FileManager();
			if (uris) {
				for (const uri of uris) { fm.loadTraceZip(uri.path); }
			}
		});
	}));
}

// This method is called when your extension is deactivated
export function deactivate() { }
