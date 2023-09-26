'use strict';

import { NONAME } from 'dns';
// src/extension.ts

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            {scheme: "file", language: "ConTeXt"}, 
            new ConTeXtDocumentSymbolProvider()
        )
    );
}

class ConTeXtDocumentSymbolProvider implements vscode.DocumentSymbolProvider {

    public provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken): Promise<vscode.DocumentSymbol[]> {
            return new Promise((resolve, reject) => {
                const symbols: vscode.DocumentSymbol[] = [];
                const nodes = [symbols]

                const symbolkind_marker = vscode.SymbolKind.Field
                const symbolkind_run = vscode.SymbolKind.Event
                const symbolkind_cmd = vscode.SymbolKind.Function
                const titleTextRegEx = /(?<=\{).*?(?=\})/
                // 最大支持7级标题
                const titles = ["part", "chapter", "section",
                                "subsection", "subsubsection",
                                "subsubsubsection", "subsubsubsubsection"]
                // const titleRegEx = /^\\(part|chapter)|title|(sub)*(section|subject)/
                let preTitleLevel = undefined
                let rootTitleLevel = undefined

                for (let i = 0; i < document.lineCount; i++) {
                    const line = document.lineAt(i);
                    const lineText = line.text;
                    const titleText =  lineText.match(titleTextRegEx)
                    // const tokens = lineText.split(/[\s\\\{\}\[\]]+/)
                    const titleName = lineText.split(/[^a-zA-Z]+/)[1]
                    const titleLevel = titles.indexOf(titleName);
                    if (titleLevel > -1 && titleText) {
                        const marker_symbol = new vscode.DocumentSymbol(
                            titleLevel.toString() + " " + titleText[0],
                            titleName,
                            symbolkind_marker,
                            line.range,
                            line.range
                        )
                        nodes[nodes.length-1].push(marker_symbol)
                        nodes.push(marker_symbol.children) //嵌套
                        // if (!rootTitleLevel){
                        //     rootTitleLevel = titleLevel;
                        // }

                        // if (!preTitleLevel || preTitleLevel == titleLevel) {
                        //     nodes[nodes.length-1].push(marker_symbol)
                        // }
                        // else if(titleLevel > preTitleLevel){
                        //     nodes[nodes.length-1].push(marker_symbol)
                        //     nodes.push(marker_symbol.children) //嵌套
                        // }
                        // else {
                        //     nodes[nodes.length-1].push(marker_symbol)
                        //     nodes.push(marker_symbol.children) //嵌套
                        // }
                        
                        // preTitleLevel = titleLevel;
                    }
                }
            resolve(symbols);
        });
    }
}
