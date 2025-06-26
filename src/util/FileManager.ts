import { PathLike } from "fs";
import { LoadResponse, OpIdentifier, PassPipeline } from "../types";
import { FileLoadState, R2D2 } from "./r2d2";
import unzipper from "unzipper";
import assert from "assert";
import fs from "fs/promises";
import path, { join } from "path";

type FileLoadStateChangeHandler = (currState: FileLoadState) => void;

function validateZip(file: PathLike): boolean {
    if (!file.toString().endsWith(".zip")) { return false; }

    return true;
}

export class FileManager {
    private fileLoadStateChangeHandler: FileLoadStateChangeHandler | undefined;
    private cachedPipeline: PassPipeline | undefined;
    private fileLoadState: FileLoadState = "unloaded";

    constructor(
        private readonly r2d2: R2D2,
        private readonly workdir: PathLike,
    ) {
        console.info(`workdir: ${workdir}`);
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

        const zip = await unzipper.Open.file(zipPath.toLocaleString());
        await zip.extract({ path: this.workdir.toLocaleString(), });

        const tracePath = join(this.workdir.toLocaleString(), "trace.r2d2.mlir");

        const traceBuffer = await fs.readFile(tracePath);
        const str = new TextDecoder('utf-8').decode(traceBuffer);

        await this.loadR2D2(str);
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
            throw new Error(`failed to load file with error ${loadResult.errorMessage}`);
        }
        else {
            this.cachedPipeline = {
                passes: loadResult.passes.map(pass => ({
                    snapshotFileName: pass.snapshotFileName,
                    passName: pass.passName,
                    snapshotLocation: this.toWorkdir(pass.snapshotFileName),
                }))
            };
            return this.cachedPipeline;
        }
    }

    private changeState(newState: FileLoadState): void {
        if (this.loadState !== newState) {
            this.fileLoadState = newState;
            this.fileLoadStateChangeHandler?.(newState);
        }
    }

    private toWorkdir(filePath: string): string {
        return path.join(this.workdir.toString(), filePath);
    }

    private fromWorkdir(filePath: string): string {
        return path.relative(this.workdir.toString(), filePath);
    }
}
