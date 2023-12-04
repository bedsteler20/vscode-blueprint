import * as vscode from "vscode";
import { spawn } from "child_process";
import { BlueprintCompiler } from "./compiler";

export class BlueprintFormatter implements vscode.DocumentFormattingEditProvider {
    private readonly _compiler: BlueprintCompiler;

    provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions
    ): vscode.ProviderResult<vscode.TextEdit[]> {
        if (document.isDirty) document.save();
        if (document.isUntitled) return [];
        const path = document.uri.fsPath;
        const compilerPath = this._compiler.command;
        const tabSize = options.tabSize ?? 4;
        const useSpaces = options.insertSpaces ?? false;

        return new Promise((resolve, reject) => {
            const process = spawn(compilerPath, [
                "format",
                "--fix",
                !useSpaces ? "--tabs" : "",
                "--spaces-num",
                tabSize.toString(),
                path,
            ]);
            process.on("error", reject);
            process.on("exit", (code) => {
                if (code !== 0) {
                    reject(
                        new Error(
                            `Blueprint compiler exited with code ${code}`
                        )
                    );
                } else {
                    resolve([]);
                }
            });
        });    
    }

    constructor(compiler: BlueprintCompiler) {
        this._compiler = compiler;
    }

    public static register(context: vscode.ExtensionContext, compiler: BlueprintCompiler): void {
        if (!compiler.checkVersion("0.10.1")) {
            vscode.window.showErrorMessage(
                "Blueprint compiler version is too old. Formatting will not work. Please update to version 0.10.1 or newer."
            );
            return;
        } else {
            context.subscriptions.push(
                vscode.languages.registerDocumentFormattingEditProvider(
                    { scheme: "file", language: "blueprint-gtk" },
                    new BlueprintFormatter(compiler)
                )
            );
        }
    }
}