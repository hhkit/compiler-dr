import { PathLike } from "fs";
import { LoadResponse, OpIdentifier, PassPipeline } from "../types";
import { FileLoadState, R2D2 } from "./r2d2";
import Stream from "stream";
import unzipper from "unzipper";

type FileLoadStateChangeHandler = (currState: FileLoadState) => void;


function validateZip(file: PathLike): boolean {
    if (!file.toString().endsWith(".zip")) { return false; }

    return true;
}

function streamToString (stream: Stream.Readable): Promise<string> {
  const chunks: Buffer<ArrayBuffer>[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

export class FileManager {
    private fileLoadStateChangeHandler: FileLoadStateChangeHandler | undefined;
    private snapshots: Record<string, string>;
    private snapshotOrder: string[];
    private fileLoadState: FileLoadState = "unloaded";
    private r2d2: R2D2 = new R2D2();

    constructor() {
        // placeholder values
        this.snapshots = {
            test: "unloaded mlir",
            test2: "also unloaded mlir"
        };
        this.snapshotOrder = ["test", "test2"];
    }

    public get loadState(): FileLoadState {
        return this.fileLoadState;
    }

    public get pipeline(): PassPipeline {
        const retval = {
            passes: this.snapshotOrder,
            snapshots: this.snapshotOrder.map((snapshot) => {
                return {
                    filename: snapshot,
                    mlirCode: this.snapshots[snapshot]
                };
            })
        };
        return retval;
    }

    public setLoadStateChangeHandler(handler: FileLoadStateChangeHandler): void {
        this.fileLoadStateChangeHandler = handler;
    }

    public async loadTraceZip(zipPath: PathLike): Promise<void> {
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
                    const rs = (await entry.stream());
                    const result = await streamToString(rs);

                    if (filename.endsWith("trace.r2d2.mlir")) 
                        {await this.loadR2D2(result);}
                    else 
                        {await this.loadSnapshot(filename, result);}
                    
                }
            }
        }
        catch (e) {
            // handle stuff 
            console.error(e);
        }

        this.changeState("loaded");
    }

    public async traceOp(op: OpIdentifier): Promise<OpIdentifier[]> {
        const traceResponse = await this.r2d2.trace({
            filename: op.snapshot.filename,
            line: op.line,
        }, 'back');

        return traceResponse.status === "success" ? traceResponse.locations.map((flc: any) => ({
            snapshot: {
                filename: flc.filename,
                mlirCode: this.snapshots[flc.filename]
            },
            line: flc.line
        }))
            : [];
    }

    private async loadR2D2(r2d2text: string): Promise<void> {
        const loadResult: LoadResponse = await this.r2d2.load(r2d2text);
        if (loadResult.status === "failure") {
            console.log(`failed: ${loadResult.errorMessage} `);
        }
        else {
            this.snapshotOrder = loadResult.snapshots;
            console.log(`success: ${loadResult.snapshots}`);
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
