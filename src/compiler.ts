import { execSync } from "child_process";
import * as vscode from "vscode";

export class BlueprintCompiler implements vscode.Disposable {
    private readonly _command: string;
    private readonly _args: string[];

    private _evalVars(str: string) {
        const workspaceFolder = vscode.workspace.workspaceFolders![0].uri.path;
        return str.replace("${workspaceFolder}", workspaceFolder);
    }

    constructor() {
        const config = vscode.workspace.getConfiguration("blueprint-gtk");
        this._command = config.get("command") ?? "blueprint-compiler";
        this._args = config.get("arguments") ?? [];
        this._command = this._evalVars(this._command);
        this._args = this._args.map(this._evalVars);
    }

    public get command(): string {
        return this._command;
    }

    public get args(): string[] {
        return this._args;
    }

    public checkVersion(targetVersion: string): boolean {
        let version = execSync(`${this.command} --version`).toString().trim();
        if (!version) {
            throw new Error("Failed to get compiler version");
        }
        const [major, minor, patch] = version.split(".").map((x) => parseInt(x));
        
        const [targetMajor, targetMinor, targetPatch] = targetVersion
            .split(".")
            .map((x) => parseInt(x));
        return (
            major > targetMajor || minor > targetMinor || patch >= targetPatch
        );

    }


    dispose() { }
}