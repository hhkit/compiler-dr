import * as vscode from 'vscode';
import { PassPipeline, LoadedPassSnapshot } from '../types';

export class PassProvider implements vscode.TreeDataProvider<PassTreeNode> {
    constructor(private readonly passPipeline: PassPipeline) {
    }

    getChildren(element: PassTreeNode): vscode.ProviderResult<PassTreeNode[]> {
        if (!element) {
            // root
            // return all snapshots
            return this.passPipeline.passes.map((pass) => {
                return new PassTreeNode(
                    pass,
                    vscode.TreeItemCollapsibleState.None
                );
            });
        }
        else {
            // todo: return rewrites in the pass
            return [];
        }
    }

    getTreeItem(_element: PassTreeNode): vscode.TreeItem {
        return _element;
    }
}

class PassTreeNode extends vscode.TreeItem {
    constructor(
        public readonly pass: LoadedPassSnapshot,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(pass.passName, collapsibleState);
        this.description = pass.snapshotFileName;

        this.command = {
            "title": "Open",
            "command": "mlir.openSnapshot",
            "arguments": [vscode.Uri.file(pass.snapshotLocation)],
        };
    }

    // iconPath = {
    //     light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    //     dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    // };
}