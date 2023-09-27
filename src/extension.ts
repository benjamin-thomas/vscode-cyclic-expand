import * as vscode from 'vscode'
import {CyclicExpand} from './CyclicExpand'

export const cyclicExpand = new CyclicExpand()

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('cyclicExpand.next', cyclicExpand.next),
    vscode.commands.registerTextEditorCommand('cyclicExpand.prev', cyclicExpand.prev),
    vscode.window.onDidChangeTextEditorSelection(cyclicExpand.reset),
    vscode.workspace.onDidChangeTextDocument(cyclicExpand.reset),
  )
}
