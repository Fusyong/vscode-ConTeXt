
a VSCode extension for syntax highlighting and outline for ConTeXt documents

based on https://github.com/JulianGmp/vscode-context-syntax
and https://github.com/svaberg/SWMF-grammar/tree/master 
and https://github.com/pgundlach/context.tmbundle/tree/master

## TODO

+ [x] show outline
    + [x] support `\define[mytitle][title]`
        + [ ] parse the imported files and environments

## Build the extension

1. Clone the repository and enter into the folder
2. Install the required packages with `npm`

    ```bash
    npm install
    ```

3. Compile with `npm`

    ```bash
    npm run compile
    ```

## debug in the Extension Development Host:

```bash
code .
```

followed by the `Run/Start Debugging` dropdown (or the `F5` key) .

To set a breakpoint in the first Code, you should first open the file `demo.lmtx` in the second Code (the Extension Development Host). Otherwise, the control will not return to the first Code automatically and your breakpoint will not be bound.

## Package and install the extension

4. Create a package using `vsce`

    ```bash
    vsce package
    ```

    This should generate a `context-grammar-?.?.?.vsix` file in the current directory.

5. Manually install the extension in VS Code

    To observe the extension in action, view the file `demo.lmtx`.

