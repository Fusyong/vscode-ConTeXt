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
                let current_branch:[number, vscode.DocumentSymbol][] = []

                const symbolkind_marker = vscode.SymbolKind.Field
                const titleTextRegEx = /(?<=\{).*?(?=\})/
                // 支持自定义标题 \definehead [Title] [title]
                const definedTitleTextRegEx = RegExp(/\\definehead\s*\[(.+?)\]\s*\[(.+?)\]/);
                // 最大支持7级标题
                const titles:{[key:string]:number} = {
                    "part":0,
                    "chapter":1,
                    "section":2,
                    "subsection":3,
                    "subsubsection":4,
                    "subsubsubsection":5,
                    "subsubsubsubsection":6,
                    "title":1,
                    "subject":2,
                    "subsubject":3,
                    "subsubsubject":4,
                    "subsubsubsubject":5,
                    "subsubsubsubsubject":6,
                }
                
                for (let i = 0; i < document.lineCount; i++) {
                    const line = document.lineAt(i);
                    const lineText = line.text;

                    const titleText =  lineText.match(titleTextRegEx);
                    // const tokens = lineText.split(/[\s\\\{\}\[\]]+/)
                    const titleName = lineText.split(/[^a-zA-Z]+/)[1]
                    const titleLevel = titles[titleName];
                    function add_node(marker_symbol:vscode.DocumentSymbol,
                                    current_branch:[number, vscode.DocumentSymbol][]){
                        const lastnode =current_branch[current_branch.length-1]
                        let preTitleLevel = lastnode ? lastnode[0] : undefined
                        if (preTitleLevel === undefined){
                            symbols.push(marker_symbol)
                            current_branch.push([titleLevel, marker_symbol])
                        } else if (titleLevel <= preTitleLevel) {
                            current_branch.pop()
                            add_node(marker_symbol, current_branch)
                        } else if(titleLevel > preTitleLevel) {
                            lastnode[1].children.push(marker_symbol)
                            current_branch.push([titleLevel, marker_symbol])
                        }
                    }

                    // 增加自定义标题
                    const catchGroup = definedTitleTextRegEx.exec(lineText)
                    if (catchGroup && catchGroup.length !== 0) {
                        const level = titles[catchGroup[2].trim()];
                        const name = catchGroup[1].trim();
                        if (level && name) {
                            titles[name] = level
                        }
                    }

                    if (titleLevel >= 0 && titleText) {
                        const marker_symbol = new vscode.DocumentSymbol(
                            titleText[0].trim(),
                            titleLevel.toString(),
                            symbolkind_marker,
                            line.range,
                            line.range
                        )
                        add_node(marker_symbol,current_branch)
                    }
                }
            resolve(symbols);
        });
    }
}
