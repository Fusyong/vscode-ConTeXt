based on https://github.com/svaberg/SWMF-grammar/tree/master
and https://github.com/JulianGmp/vscode-context-syntax

资料 https://github.com/pgundlach/context.tmbundle/tree/master


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

At this point the extension may be debugged in the Extension Development Host:

```bash
code .
```

followed by the `Run/Start Debugging` dropdown (or the `F5` key). To observe the extension in action, view the file `demo.in`.

To complete the manual installation, follow the remaining steps to manually create and install the package:

## Package and install the extension

4. Create a package using `vsce`

    ```bash
    vsce package
    ```

    This should generate a `ConTeXt-grammar-?.?.?.vsix` file in the current directory.
5. Manually install the extension in VS Code (you may want to replace the wildcards in the version number)

    ```bash
    code --install-extension ConTeXt-grammar-?.?.?.vsix
    ```

To test the installation, open the current folder in VS Code

```bash
code .
```


