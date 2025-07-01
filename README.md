# hydra-file-navigator

# - Heavily WIP! -

Simple extension to allow clicking on file paths in YAML files of hydra defaults
define via:
```
defaults:
    - /path/to/dir: /path/to/file.yaml
```
 to open them in the editor to avoid time-consuming manual search in the directory tree.

 # TODO:
 - test the used regEx against possible syntax
 - Test python path resolution with .env
 - Package everything and install locally to test 
