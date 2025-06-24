import * as vscode from 'vscode';
import { FileManager } from '../util/FileManager';
import { PassProvider } from '../views/PassProvider';


export async function LoadTrace() {
    const uris = await vscode.window.showOpenDialog({
        canSelectMany: false,
    });
    if (!uris) { throw new Error("no file selected!"); }

    const fm = new FileManager();
    const uri = uris[0];

    await fm.loadTraceZip(uri.path);

    vscode.window.createTreeView('mlir-doctor', {
        treeDataProvider: new PassProvider(fm.pipeline)
    });
}