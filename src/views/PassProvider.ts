import * as vscode from 'vscode';
import { PassSnapshot, PassPipeline } from '../types';

type T = number;

export class PassProvider implements vscode.TreeDataProvider<PassTreeNode> {
    constructor(private readonly passPipeline: PassPipeline) {
        console.log(JSON.stringify(passPipeline));
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
        public readonly pass: PassSnapshot,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(pass.passName, collapsibleState);
        this.description = pass.snapshotFileName;
        this.command = {
            "title": "Open",
            "command": "vscode.openWith",
            "arguments": [vscode.Uri.file(pass.snapshotFileName), "default"],
        };
    }

    // iconPath = {
    //     light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    //     dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    // };
}