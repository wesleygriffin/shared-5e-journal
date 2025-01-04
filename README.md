# custom-5e-compendium

Shared world-agnostic D&D 5e Journal for Foundry VTT

## Installation

This project has some hard-coded values to the main repository which must 
be changed to point to your repository before it can be used.

First, either fork this repository or clone it and then push it to a new 
repository you control.

Next, you *must* edit `module.json` and change several lines at the top of 
the file:
```json
{
  "version": "1.0.0",
  "download": "https://github.com/wesleygriffin/shared-5e-journal/archive/v1.0.0.zip",
  "url": "https://github.com/wesleygriffin/shared-5e-journal",
  "manifest": "https://raw.githubusercontent.com/wesleygriffin/shared-5e-journal/refs/heads/main/module.json",
  "bugs": "https://github.com/wesleygriffin/shared-5e-journal/-/issues",
  "authors": [
    {
      "name": "Wesley Griffin"
    }
  ],
```

You need to change the `download`, `url`, and `manifest` links to point to 
your repository. You can delete the `bugs` line. You need to change the 
`authors` as well.

## Release Steps

There are a few steps to update the published module with a new release 
that can then be updated in Foundry.

- Update version in module.json on the first two lines
- Update version in package.json on the first line
- Check in all files
- Create a tag
- Push the changes and tag
