var vscode = require('vscode');
const datafile = 'arm-rp-list.txt';
const url_prefix = 'https://docs.microsoft.com/en-us/azure/templates/';

exports.deactivate = {};

exports.activate = (context) => {

    var fs = require('fs');
    var searchTerms = fs.readFileSync(datafile, 'utf-8').split('\n');

    var activeEditor = vscode.window.activeTextEditor;
    var timeout = null;

    var termDecorationType = vscode.window.createTextEditorDecorationType({
        borderWidth: '1px',
        borderSpacing: '2px',
        borderStyle: 'solid',
        backgroundColor: '#2572E5',
        color: 'white',
        cursor: 'pointer'
    });

    if (activeEditor) {
        triggerUpdateDecorations();
    }

    vscode.window.onDidChangeActiveTextEditor(editor => {
        activeEditor = editor;
        if (editor) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        if (activeEditor && event.document === activeEditor.document) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    function triggerUpdateDecorations() {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(updateDecorations, 500);
    }

    function updateDecorations() {
        if (!activeEditor) {
            return;
        }

        var documentText = activeEditor.document.getText();
        var regExpFromArray = new RegExp(searchTerms.join('|'), 'gi');
        var matchedStrings = [];
        var match;

        while (match = regExpFromArray.exec(documentText)) {
            const startPos = activeEditor.document.positionAt(match.index);
            const endPos = activeEditor.document.positionAt(match.index + match[0].length);
            const decoration = {
                range: new vscode.Range(startPos, endPos),
                color: '#FFFFFF', 
                hoverMessage: '[Schema Reference for ' + match[0] + '](' + url_prefix + match[0] + ')'
            };
            matchedStrings.push(decoration);
        }

        activeEditor.setDecorations(termDecorationType, matchedStrings);
    }
};