import * as vscode from 'vscode';
import { PassPipeline, Snapshot } from '../types';

type T = number;

export class PassProvider implements vscode.TreeDataProvider<SnapshotNode> {
    passPipeline: PassPipeline;

    constructor(private pipeline: PassPipeline) {
        this.passPipeline = pipeline;
    }

    getChildren(element: SnapshotNode): vscode.ProviderResult<SnapshotNode[]> {
        if (!element) {
            // root
            // return all snapshots
            return this.passPipeline.snapshots.map((snapshot) => {
                return new SnapshotNode(
                    snapshot,
                    vscode.TreeItemCollapsibleState.None
                );
            });
        }
        else {
            // todo: return rewrites in the pass
            return [];
        }
    }

    getTreeItem(_element: SnapshotNode): vscode.TreeItem {
        return _element;
    }
}

class SnapshotNode extends vscode.TreeItem {
    constructor(
        public readonly values: Snapshot,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(values.filename, collapsibleState);
    }

    // iconPath = {
    //     light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    //     dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    // };
}