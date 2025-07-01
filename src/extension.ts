import * as vscode from 'vscode';
import path from 'path';
import * as dotenv from 'dotenv';

async function resolveDefaultPath(parsedText: string): Promise<vscode.Uri | undefined>
{
    const regex = /-\s*.*?(\/[A-Za-z0-9_\/-]+):\s+(.*)/; // skip any 'override' etc., then resolve form /path/to/dir: path/to/file
    const yamlMatch = parsedText.match(regex);

    if (!yamlMatch) 
    {
        return;
    }

    const folderName = yamlMatch[1];
    const filePath = yamlMatch[2] + ".yaml";
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    const defaultRoot = path.join(workspaceRoot,'conf');
    const basePaths = [defaultRoot];

    // Check if the HYDRA_CONFIG_PATH environment variable is set
    const envConfPath = process.env['HYDRA_CONFIG_PATH'];
    if (envConfPath) 
    {
        basePaths.push(envConfPath);
    }

    for(const basePath of basePaths)
    {
        const fullFilePath = path.join(basePath,folderName,filePath);
        const uri = vscode.Uri.file(fullFilePath);
        let exists = false;
        try 
        {
            await vscode.workspace.fs.stat(uri);
            exists = true;  
        } catch 
        {
            exists = false;
        }

        if (exists) 
        {
            return uri;
        }
    }
}


async function resolvePythonModulePath(parsedText: string): Promise<vscode.Uri | undefined> 
{
    const regex = /_target_:\s+([A-Za-z0-9_.]+)/;
    const targetMatch = parsedText.match(regex);

    console.log("Parsed text:", parsedText);
    console.log("Target match:", targetMatch);

    if (!targetMatch) 
    {
        return;
    }

    const filePath = targetMatch[1].split('.').slice(0, -1).join(path.sep) + '.py'; // Get the module name without the class

    // Try to resolve the absolute path.
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    const basePaths = [workspaceRoot];

    dotenv.config({ path: path.join(workspaceRoot, '.env') });
    const envPythonPath = process.env['PYTHONPATH']; 
    if (envPythonPath) 
    {
        const resolvedPythonPath = path.isAbsolute(envPythonPath) ? envPythonPath : path.join(workspaceRoot, envPythonPath);
        basePaths.push(resolvedPythonPath);
    }

    const fullFilePaths = [];

    for(const basePath of basePaths)
    {
        const fullFilePath = path.join(basePath, filePath);
        fullFilePaths.push(fullFilePath);
        const uri = vscode.Uri.file(fullFilePath);
        let exists = false;
        try {
            await vscode.workspace.fs.stat(uri);
            exists = true;
        } catch 
        {
            exists = false;
        }

        if(exists)
        {
            return uri;
        }
    }
    vscode.window.showErrorMessage(`Could not resolve Python module path from either ${fullFilePaths.join(', ')}`);
}


export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('hydra-file-navigator.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from hydra-file-navigator!');
	});

	context.subscriptions.push(disposable);

    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    dotenv.config({ path: path.join(workspaceRoot, '.env') });

    vscode.languages.registerDefinitionProvider('yaml',
        {
            async provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):
            Promise<vscode.Location | vscode.Location[] | undefined>{
                const line = document.lineAt(position);
                const yamlUri = await resolveDefaultPath(line.text);
                if (yamlUri)
                {
                    return new vscode.Location(yamlUri, new vscode.Position(0, 0));
                }

                const pythonUri = await resolvePythonModulePath(line.text);
                if (pythonUri)
                {
                    return new vscode.Location(pythonUri, new vscode.Position(0, 0));
                }
            }
        }
    );

    vscode.languages.registerHoverProvider('yaml',
        {
            async provideHover(document, position) {
                const line = document.lineAt(position);
                const yamlPath = await resolveDefaultPath(line.text);

                if(!yamlPath)
                {
                    return;
                }
                
                return new vscode.Hover(`File path: ${yamlPath.path}`);
            }
        }
    );
}

export function deactivate() {}
