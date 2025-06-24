import { PathLike } from "fs";
import { LoadResponse, OpIdentifier, PassPipeline } from "../types";
import { FileLoadState, R2D2 } from "./r2d2";
import Stream from "stream";
import unzipper from "unzipper";
import assert from "assert";

type FileLoadStateChangeHandler = (currState: FileLoadState) => void;


function validateZip(file: PathLike): boolean {
    if (!file.toString().endsWith(".zip")) { return false; }

    return true;
}

function streamToString(stream: Stream.Readable): Promise<string> {
    const chunks: Buffer<ArrayBuffer>[] = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}

export class FileManager {
    private fileLoadStateChangeHandler: FileLoadStateChangeHandler | undefined;
    private snapshots: Record<string, string> = {};
    private cachedPipeline: PassPipeline | undefined;
    private fileLoadState: FileLoadState = "unloaded";
    private r2d2: R2D2 = new R2D2();

    constructor() {
    }

    public get loadState(): FileLoadState {
        return this.fileLoadState;
    }

    public setLoadStateChangeHandler(handler: FileLoadStateChangeHandler): void {
        this.fileLoadStateChangeHandler = handler;
    }

    public async loadTraceZip(zipPath: PathLike): Promise<PassPipeline> {
        if (!validateZip(zipPath)) { throw new Error("invalid zip"); }
        this.changeState("loading");

        this.snapshots = {};

        const zip = await unzipper.Open.file(zipPath.toLocaleString());
        try {
            for (const entry of zip.files) {
                const filename = entry.path;
                if (filename.endsWith("/")) {
                    // directory
                } else {
                    const rs = entry.stream();
                    const result = await streamToString(rs);

                    if (filename.endsWith("trace.r2d2.mlir")) { await this.loadR2D2(result); }
                    else { await this.loadSnapshot(filename, result); }

                }
            }
        }
        catch (e) {
            // handle stuff 
            console.error(e);
        }

        this.changeState("loaded");
        assert(this.cachedPipeline);
        return this.cachedPipeline;
    }

    public async traceOp(op: OpIdentifier): Promise<OpIdentifier[]> {
        const traceResponse = await this.r2d2.trace({
            filename: op.snapshotFileName,
            line: op.line,
        }, 'back');

        if (traceResponse.status === "success") {
            return traceResponse.locations.map(fl => ({
                snapshotFileName: fl.filename,
                line: fl.line,
            }));
        } else {
            throw new Error(traceResponse.errorMessage);
        }
    }

    private async loadR2D2(r2d2text: string): Promise<PassPipeline> {
        const loadResult: LoadResponse = await this.r2d2.load(r2d2text);
        if (loadResult.status === "failure") {
            console.log(`failed: ${loadResult.errorMessage} `);
            throw new Error(`failed to load file with error ${loadResult.errorMessage}`);
        }
        else {
            console.log(`success: ${JSON.stringify(loadResult)}`);
            this.cachedPipeline = {
                passes: loadResult.passes
            };
            return this.cachedPipeline;
        }
    }


    private async loadSnapshot(fileName: string, snapshotFileText: string): Promise<void> {
        this.snapshots[fileName] = snapshotFileText;
    }

    private changeState(newState: FileLoadState): void {
        if (this.loadState !== newState) {
            this.fileLoadState = newState;
            this.fileLoadStateChangeHandler?.(newState);
        }
    }
}
