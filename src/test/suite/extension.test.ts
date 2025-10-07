import * as assert from 'assert';
import * as vscode from 'vscode';

suite('ConTeXt Extension Test Suite', () => {
	test('Extension should be activated', async () => {
		const extension = vscode.extensions.getExtension('HuangFusyong.context-syntax-plus');
		assert.ok(extension);
		
		await extension.activate();
		assert.ok(extension.isActive);
	});

	test('Document symbol provider should be registered', async () => {
		const extension = vscode.extensions.getExtension('HuangFusyong.context-syntax-plus');
		assert.ok(extension);
		
		await extension.activate();
		
		// 创建一个测试文档
		const testDoc = await vscode.workspace.openTextDocument({
			content: '\\chapter{Test Chapter}\n\\section{Test Section}',
			language: 'ConTeXt'
		});
		
		// 获取文档符号
		const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
			'vscode.executeDocumentSymbolProvider',
			testDoc.uri
		);
		
		assert.ok(symbols);
		assert.ok(symbols.length > 0);
	});
});
