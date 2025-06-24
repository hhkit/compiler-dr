import * as vscode from 'vscode';
import { FileManager } from '../util/FileManager';
import { PassProvider } from '../views/PassProvider';
import { createWorkdir } from '../util/os';


export async function LoadTrace() {
    const uris = await vscode.window.showOpenDialog({
        canSelectMany: false,
    });
    if (!uris) { throw new Error("no file selected!"); }

    const wd = await createWorkdir();
    const fm = new FileManager(wd);
    const uri = uris[0];

    const pipeline = await fm.loadTraceZip(uri.path);
    console.log("hello");

    vscode.window.createTreeView('mlir-doctor', {
        treeDataProvider: new PassProvider(pipeline)
    });
}