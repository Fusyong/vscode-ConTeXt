// src/extension.ts
'use strict';

import * as vscode from 'vscode';

// 激活扩展
export function activate(context: vscode.ExtensionContext) {
    // 注册文档符号提供器
    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            {scheme: "file", language: "ConTeXt"},
            new ConTeXtDocumentSymbolProvider()
        )
    );
    
    // // 注册自定义命令
    // const disposable = vscode.commands.registerCommand('context.gotoSymbol', (symbol: vscode.DocumentSymbol) => {
    //     // 跳转到符号所在的行
    //     console.log(symbol.range)
    //     if (symbol.range) {
    //         const editor = vscode.window.activeTextEditor;
    //         if (editor) {
    //             // 确保编辑器组获得焦点 focus active editor group TODO 无效
    //             vscode.window.showTextDocument(editor.document, editor.viewColumn);
                
    //             const lineRange = new vscode.Range(symbol.range.start.line, 0, symbol.range.start.line, 0);
    //             editor.selection = new vscode.Selection(lineRange.start, lineRange.start);
    //             editor.revealRange(lineRange);
    //         }
    //     }
    // });
    // context.subscriptions.push(disposable);

}

// 文档符号提供器
class ConTeXtDocumentSymbolProvider implements vscode.DocumentSymbolProvider {

    // 提供文档符号
    public provideDocumentSymbols(
        document: vscode.TextDocument
    ): Promise<vscode.DocumentSymbol[]> {
            return new Promise((resolve) => {
                const symbols: vscode.DocumentSymbol[] = [];
                const current_branch:[number, vscode.DocumentSymbol][] = []

                // 标题正则 TODO 用循环代替正则表达式解决括号嵌套问题
                const titleTextRegEx = /(?:\[.*?\])?(?:\{.*?\})?(?:title=)?\{(.*?)\}/;
                // 标题名称正则
                const titleNameRegEx = /(?<=\\)(?:start)?([a-zA-Z]+)/;

                // 添加节点
                function add_node(marker_symbol: vscode.DocumentSymbol,
                                current_branch: [number, vscode.DocumentSymbol][],
                                titleLevel: number) {
                    const lastnode = current_branch[current_branch.length-1]
                    const preTitleLevel = lastnode ? lastnode[0] : undefined
                    if (preTitleLevel === undefined){
                        symbols.push(marker_symbol)
                        current_branch.push([titleLevel, marker_symbol])
                    } else if (titleLevel <= preTitleLevel) {
                        current_branch.pop()
                        add_node(marker_symbol, current_branch, titleLevel)
                    } else if(titleLevel > preTitleLevel) {
                        lastnode[1].children.push(marker_symbol)
                        current_branch.push([titleLevel, marker_symbol])
                    }
                }

                // 标题字典 最大支持7级标题
                const titles:{[key:string]:number} = {
                    // 系统默认标题
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
                    // 从用户设置中获取自定义标题
                    ...vscode.workspace.getConfiguration('ConTeXt').get('customTitles', {
                        "bu": 0,
                        "zhang": 1,
                        "jie": 2,
                        "xiaojie": 3,
                        "xxiaojie": 4,
                        "xxxiaojie": 5,
                        "xxxxxiaojie": 6,
                        "ce": 0 ,
                        "danyuan": 1,
                        "kewen": 2,
                        "xiaoti": 3,
                        "xxiaoti": 4,
                        "xxxiaoti": 5,
                        "xxxxxiaoti": 6,
                    }),
                }

                // 遍历文档，生成符号
                for (let i = 0; i < document.lineCount; i++) {
                    const line = document.lineAt(i);
                    const lineText = line.text;

                    const titleTextMatch =  lineText.match(titleTextRegEx);
                    const titleNameMatch = lineText.match(titleNameRegEx)

                    if (titleNameMatch) {
                        const titleName = titleNameMatch[1];
                        const titleLevel = titles[titleName];
                        if (titleLevel >= 0 && titleTextMatch) {
                            // Find the end range - scan forward until we find next title of same or higher level
                            let endLine = document.lineCount - 1;
                            for (let j = i + 1; j < document.lineCount; j++) {
                                const nextLine = document.lineAt(j);
                                const nextTitleMatch = nextLine.text.match(titleNameRegEx);
                                if (nextTitleMatch) {
                                    const nextTitleLevel = titles[nextTitleMatch[1]];
                                    if (nextTitleLevel !== undefined && nextTitleLevel <= titleLevel) {
                                        endLine = j - 1;
                                        break;
                                    }
                                }
                            }

                            const titleRange = new vscode.Range(
                                line.range.start,
                                document.lineAt(endLine).range.end
                            );

                            const marker_symbol = new vscode.DocumentSymbol(
                                titleTextMatch[1].replace("title={","").trim(),
                                titleLevel.toString(),
                                vscode.SymbolKind.String,
                                titleRange, // Full range including content
                                new vscode.Range(line.range.start, line.range.end)  // 只选择行首位置
                            );
                            add_node(marker_symbol, current_branch, titleLevel);
                        }
                    }
                }
            // // 添加 command 属性来自定义点击行为
            // symbols.forEach(symbol => {
            //     (symbol as any).command = {
            //         command: 'context.gotoSymbol',
            //         title: 'Click Symbol',
            //         arguments: [symbol]
            //     };
            // });
                resolve(symbols);
        });
    }
}
