# hydra-file-navigator

Simple extension to allow clicking on file paths in YAML files of hydra defaults
define via:
```
defaults:
    - /path/to/dir: /path/to/file.yaml
```
 to open them in the editor to avoid time-consuming manual search in the directory tree.

# Installation
Currently, the extension is not published to the marketplace. To install it, clone the repository and run:
```
npm install -g @vscode/vsce
vsce package
```
This will create the `hydra-file-navigator-<version>.vsix` file in the current directory.
Then, in VSCode, go to the Extensions view, click on the three-dot menu in the top right corner, and select "Install from VSIX..." to install the generated `.vsix` file.

Create a .env file (if not already present) in the root of your workspace with the following content:
```
HYDRA_CONF_DIR=<path_to_your_hydra_conf_directory>
```
Note: for the env variable to take effect, you need to restart VSCode after creating or modifying the .env file.

 # TODO:
 - test the used regEx against possible syntax
 - Test python path resolution with .env