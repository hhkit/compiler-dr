import { FileLine, LoadResponse, OpIdentifier, PassPipeline, R2D2ServerInterface, TraceDirection, TraceResponse } from "../types";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { createMessageConnection, MessageConnection } from "vscode-jsonrpc";
import { StreamMessageReader, StreamMessageWriter } from "vscode-jsonrpc/node";
import assert from "assert";
import * as vscode from 'vscode';

export type FileLoadState = "unloaded" | "loading" | "loaded";

type R2D2Process = ChildProcessWithoutNullStreams;


export class R2D2 implements R2D2ServerInterface {
    r2d2process: R2D2Process;
    connection: MessageConnection;

    constructor() {
        const config = vscode.workspace.getConfiguration("r2d2");
        const r2d2path = config.get<string>("serverPath");
        console.log(`test ${r2d2path}`);

        assert(r2d2path);

        this.r2d2process = spawn(r2d2path);

        this.connection = createMessageConnection(
            new StreamMessageReader(this.r2d2process.stdout),
            new StreamMessageWriter(this.r2d2process.stdin)
        );

        this.connection.listen();
    }

    public load(r2d2File: string): Promise<LoadResponse> {
        assert(this.connection);
        return this.connection.sendRequest('r2d2/load', { str: r2d2File });
    }

    public trace(loc: FileLine, dir: TraceDirection): Promise<TraceResponse> {
        assert(this.connection);
        return this.connection.sendRequest('r2d2/trace', {
            source: loc,
            traceDirection: dir,
            maxDepth: 1
        });
    }
}
