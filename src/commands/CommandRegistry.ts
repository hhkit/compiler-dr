import { commands, ExtensionContext, Uri, ViewColumn, window, workspace } from "vscode";
import { R2D2 } from "../util/r2d2";
import { createWorkdir } from "../util/os";
import { FileManager } from "../util/FileManager";
import { PassProvider } from "../providers/PassProvider";
import { SnapshotDecorator } from "../util/SnapshotDecorator";

export class CommandRegistry {
    r2d2: R2D2 = new R2D2();

    activate(context: ExtensionContext) {
        const disposables = [
            commands.registerCommand('mlir.loadTrace', this.LoadTrace, this),
            commands.registerCommand('mlir.openSnapshot', this.OpenSnapshotEditor, this),
        ];
        context.subscriptions.push(...disposables);
    }

    public async LoadTrace() {
        const uris = await window.showOpenDialog({
            canSelectMany: false,
        });
        if (!uris) { throw new Error("no file selected!"); }

        const wd = await createWorkdir();
        const fm = new FileManager(this.r2d2, wd);
        const uri = uris[0];

        const pipeline = await fm.loadTraceZip(uri.path);

        window.createTreeView('mlir-doctor', {
            treeDataProvider: new PassProvider(pipeline)
        });
    }

    public async OpenSnapshotEditor(snapshotFile: Uri): Promise<void> {
        const document = await workspace.openTextDocument(snapshotFile);
        const editor = await window.showTextDocument(document);

        const decorator = new SnapshotDecorator(this.r2d2);
        decorator.decorate(document.lineCount, editor);
    }

    public async OpenSnapshotDiffViewer(focusedSnapshot: Uri, comparedSnapshot: Uri): Promise<void> {
        const focusedDoc = await workspace.openTextDocument(focusedSnapshot);
        const comparedDoc = await workspace.openTextDocument(comparedSnapshot);

        const focusedEditor = await window.showTextDocument(focusedDoc);
        const comparedEditor = await window.showTextDocument(comparedDoc, ViewColumn.Beside);
    }
}