import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
} from "vscode-languageclient/node";
import * as vscode from "vscode";
import { format } from "path";
import { BlueprintCompiler } from "./compiler";
import { BlueprintFormatter } from "./formatter";

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext): void {
    let compiler = new BlueprintCompiler();
    
    BlueprintFormatter.register(context, compiler);

    const serverOptions: ServerOptions = {
        command: compiler.command,
        args: [...compiler.args, "lsp"],
    };
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: "file", language: "blueprint-gtk" }],
    };
    client = new LanguageClient("blueprint-gtk", serverOptions, clientOptions);
    client.start();
}

export function deactivate(): Thenable<void> | void {
    return client?.stop();
}
