// src/extension.ts
'use strict';

import * as vscode from 'vscode';

/**
 * 激活扩展
 * @param context VSCode扩展上下文
 */
export function activate(context: vscode.ExtensionContext): void {
    // 注册文档符号提供器
    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            { scheme: "file", language: "ConTeXt" },
            new ConTeXtDocumentSymbolProvider()
        )
    );
}

/**
 * ConTeXt文档符号提供器
 * 提供ConTeXt文档的大纲视图功能
 */
class ConTeXtDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    private readonly titleTextRegex = /(?:\[.*?\])?(?:\{.*?\})?(?:title=)?\{(.*?)\}/;
    private readonly titleNameRegex = /(?<=\\)(?:start)?([a-zA-Z]+)/;

    /**
     * 提供文档符号
     * @param document 要分析的文档
     * @returns 文档符号数组的Promise
     */
    public provideDocumentSymbols(
        document: vscode.TextDocument
    ): Promise<vscode.DocumentSymbol[]> {
        return new Promise((resolve) => {
            try {
                const symbols: vscode.DocumentSymbol[] = [];
                const currentBranch: [number, vscode.DocumentSymbol][] = [];
                const titles = this.getTitleConfiguration();

                // 遍历文档，生成符号
                for (let i = 0; i < document.lineCount; i++) {
                    const line = document.lineAt(i);
                    const lineText = line.text;

                    const titleTextMatch = lineText.match(this.titleTextRegex);
                    const titleNameMatch = lineText.match(this.titleNameRegex);

                    if (titleNameMatch && titleTextMatch) {
                        const titleName = titleNameMatch[1];
                        const titleLevel = titles[titleName];
                        
                        if (titleLevel !== undefined && titleLevel >= 0) {
                            const endLine = this.findEndLine(document, i, titleLevel, titles);
                            const titleRange = new vscode.Range(
                                line.range.start,
                                document.lineAt(endLine).range.end
                            );

                            const markerSymbol = new vscode.DocumentSymbol(
                                this.extractTitleText(titleTextMatch[1]),
                                titleLevel.toString(),
                                vscode.SymbolKind.String,
                                titleRange,
                                new vscode.Range(line.range.start, line.range.end)
                            );
                            
                            this.addNode(markerSymbol, currentBranch, titleLevel, symbols);
                        }
                    }
                }
                
                resolve(symbols);
            } catch (error) {
                console.error('Error parsing ConTeXt document:', error);
                resolve([]);
            }
        });
    }

    /**
     * 获取标题配置
     * @returns 标题名称到级别的映射
     */
    private getTitleConfiguration(): { [key: string]: number } {
        const defaultTitles = {
            // 系统默认标题
            "part": 0,
            "chapter": 1,
            "section": 2,
            "subsection": 3,
            "subsubsection": 4,
            "subsubsubsection": 5,
            "subsubsubsubsection": 6,
            "title": 1,
            "subject": 2,
            "subsubject": 3,
            "subsubsubject": 4,
            "subsubsubsubject": 5,
            "subsubsubsubsubject": 6,
            // 默认自定义标题
            "bu": 0,
            "zhang": 1,
            "jie": 2,
            "xiaojie": 3,
            "xxiaojie": 4,
            "xxxiaojie": 5,
            "xxxxxiaojie": 6,
            "ce": 0,
            "danyuan": 1,
            "kewen": 2,
            "xiaoti": 3,
            "xxiaoti": 4,
            "xxxiaoti": 5,
            "xxxxxiaoti": 6,
        };

        const customTitles = vscode.workspace.getConfiguration('ConTeXt').get('customTitles', {});
        return { ...defaultTitles, ...customTitles };
    }

    /**
     * 查找标题的结束行
     * @param document 文档
     * @param startLine 开始行
     * @param titleLevel 标题级别
     * @param titles 标题配置
     * @returns 结束行号
     */
    private findEndLine(
        document: vscode.TextDocument,
        startLine: number,
        titleLevel: number,
        titles: { [key: string]: number }
    ): number {
        let endLine = document.lineCount - 1;
        
        for (let j = startLine + 1; j < document.lineCount; j++) {
            const nextLine = document.lineAt(j);
            const nextTitleMatch = nextLine.text.match(this.titleNameRegex);
            
            if (nextTitleMatch) {
                const nextTitleLevel = titles[nextTitleMatch[1]];
                if (nextTitleLevel !== undefined && nextTitleLevel <= titleLevel) {
                    endLine = j - 1;
                    break;
                }
            }
        }
        
        return endLine;
    }

    /**
     * 提取标题文本
     * @param titleText 原始标题文本
     * @returns 清理后的标题文本
     */
    private extractTitleText(titleText: string): string {
        return titleText.replace("title={", "").trim();
    }

    /**
     * 添加节点到符号树
     * @param markerSymbol 要添加的符号
     * @param currentBranch 当前分支
     * @param titleLevel 标题级别
     * @param symbols 符号数组
     */
    private addNode(
        markerSymbol: vscode.DocumentSymbol,
        currentBranch: [number, vscode.DocumentSymbol][],
        titleLevel: number,
        symbols: vscode.DocumentSymbol[]
    ): void {
        const lastNode = currentBranch[currentBranch.length - 1];
        const preTitleLevel = lastNode ? lastNode[0] : undefined;
        
        if (preTitleLevel === undefined) {
            symbols.push(markerSymbol);
            currentBranch.push([titleLevel, markerSymbol]);
        } else if (titleLevel <= preTitleLevel) {
            currentBranch.pop();
            this.addNode(markerSymbol, currentBranch, titleLevel, symbols);
        } else if (titleLevel > preTitleLevel) {
            lastNode[1].children.push(markerSymbol);
            currentBranch.push([titleLevel, markerSymbol]);
        }
    }
}
