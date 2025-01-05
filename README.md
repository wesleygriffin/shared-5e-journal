# custom-5e-compendium

Shared world-agnostic D&D 5e Journal for Foundry VTT

## Installation

This project has some hard-coded values to the main repository which must
be changed to point to your repository before it can be used.

First, either fork this repository or clone it and then push it to a new
repository you control.

**NOTE:** The release script mentioned below will currently only work with GitHub hosted repositories.

Next, you *should* change the `authors` list at the top of the `module.json.in` file:

```json
{
  "authors": [
    {
      "name": "Wesley Griffin"
    }
  ]
}
```

If you want, you can freely change the `title` and `description`.

If you change the `id`, then you **must** also change the `module` line inside `packs`.

**Do not** remove `version` from the end of the file.

## Editing journal entries

TODO. Ideally this will parse markdown files and update the json files.

## Creating a release

Before making a release, you will need to create
a [GitHub personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).

When creating the fine-grained token, choose *Only select repositories* and select the repository you have chosen for
this project. Then scroll down to *Contents* and change the *Access* to
**Read and write**.

After clicking *Generate token* copy the token and then replace `<YOUR_TOKEN_HERE>` in `env.example` and rename
`env.example` to `.env`. **DO NOT**, under any circumstances, commit the
`.env` file - it contains the secret key that grants access to your
repository.

Once you have made your changes to the journal entries, you can create a release like so:

```shell
$ npm run push-release
```

You should then be able to either:

- install your module into Foundry using the manifest link printed out after the script runs, or
- update the already installed module in Foundry.

You can run

```shell
$ npm run push-release-dry-run
```

To see the set of steps that the script would perform.

### Script details

The `push-release.mjs` script performs the following steps:

- Create module.json from `module.json.in` setting the version and necessary links for Foundry to use the module.
- Check in all files
- Create a tag
- Push the changes and tag to the repository
- Create a release

The tag is created by reading `version` from `module.json.in` and incrementing the minor number.
