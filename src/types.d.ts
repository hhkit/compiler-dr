export interface PassSnapshot {
  passName: string;
  snapshotFileName: string;
}
export interface LoadedPassSnapshot extends PassSnapshot {
  passName: string;
  snapshotFileName: string;
  snapshotLocation: string;
}

export interface PassPipeline {
  passes: LoadedPassSnapshot[]
}

export interface OpIdentifier {
  snapshotFileName: string,
  line: number,
}

export interface FileLine {
  filename: string;
  line: number;
}

export type TraceDirection = 'back' | 'fwd';

export interface TraceRequest {
  source: FileLine;
  traceDirection: TraceDirection;
  maxDepth: number;
}

export interface TraceSuccessResponse {
  status: "success";
  locations: FileLine[];
}

export interface TraceFailureResponse {
  status: "failure",
  errorMessage: string,
}

export type TraceResponse = TraceSuccessResponse | TraceFailureResponse;

export interface LoadSuccessResponse {
  status: "success",
  passes: PassSnapshot[],
}

export interface LoadFailureResponse {
  status: "failure",
  errorMessage: string,
}

export type LoadResponse = LoadSuccessResponse | LoadFailureResponse;

export interface R2D2ServerInterface {
  load: (r2d2File: string) => Promise<LoadResponse>
  loadFile: (r2d2File: string) => Promise<LoadResponse>
  trace: (loc: FileLine, dir: TraceDirection) => Promise<TraceResponse>
}