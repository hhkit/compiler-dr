import { window, Color, TextEditor, Range, ThemeColor, DecorationRenderOptions } from "vscode";
import { R2D2 } from "./r2d2";
import { LoadedPassSnapshot } from "../types";



export class SnapshotDecorator {
    constructor(private readonly r2d2: R2D2) { }

    colorize(count: number): string[] {
        const retval: string[] = [
            "hsla(0, 50%, 50%, 0.25)",
        ];

        var hue = 349.5;
        for (var i = 0; i < count; ++i) {
            hue += 137.508; // golden angle
            if (hue > 360) { hue -= 360; }
            retval.push(`hsla(${hue}, 50%, 50%, 0.25)`);
        }

        return retval;
    }

    decorate(lineCount: number, editor: TextEditor) {
        // todo: get count from snapshot?
        const colorMap = this.colorize(lineCount);

        // apply colorMap
        for (const [line, color] of colorMap.entries()) {
            const decorationDescription: DecorationRenderOptions = {
                isWholeLine: true,
                backgroundColor: color,
            };
            const deco = window.createTextEditorDecorationType(decorationDescription);
            editor.setDecorations(deco, [new Range(line, 1, line, 1)]);
        }
    }
}