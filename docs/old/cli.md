Installation
---

`sudo npm install rad-cli -g`

`sudo` is required for creating folders and files.

Commands
---

Usage: `rad <command> [options]`

- `rad -h` - global help.
- `rad <command> -h` - command help.
- `rad -V` - CLI version.
- `rad create <name-of-project>` - create a project with specific `name-of-project`.
- `rad update` - apply all changes to the project.
- `rad add [options] <type-of-abstraction> <name-of-abstraction>` - add view, service or model to the project. `<type-of-abstraction>` should be from `view`, `scrollable`, `service`, `model`, `collection`, `external`. Options of `add`:
	- `-h, --help` - display help info.
	- `-u, --update` - update index.js, write all views and models to index.js.
	- `-m, --model <name>` - add model to view.
	- `-c, --collection <name>` - add collection to view.
- `rad remove [options] <type-of-abstraction> <name-of-abstraction>` - remove view, service or model from the project. Options of `remove`:
	- `-h, --help` - display help info.
	- `-u, --update` - update index.js, write all views and models to index.js.
- `rad ext [options] <name> [source]` - work with a file from an external source`.

> Any other command is invalid.

Create project
---
`rad create <name-of-project>` - create a new folder with RAD.js project.

**example:**
```bush
>rad create rad-project
>cd rad-project
```

This project will contain the following:
- `index.html`
- `index.js`
- `radproject.json`
- folder `source`
	- `application`
	- `assets`
	- `external`
	- `lib`
	- `models`
	- `rad`
	- `service`
	- `views` 

Add application parts
---
`add [options] <type-of-abstraction> <name-of-abstraction>` - create and/or add other application parts.
You can add the following:
- `view` - application part with visual presentation.
- `scrollable` - same as `view` but with scrollable content or a part of it.
- `service` - application part without view.
- `model` - data model.
- `collection` - data collection.
- `external` - external dependency of the application. You can create a local reference to a file or link to `url` to any external source. Or you can just place an external lib in `external` folder and run `rad update` command. In this case the external lib will be added to your project automatically.

>You can also manually add view/service sources in a custom directory inside the `source` folder, and after the execution of `rad update` command they will be added to the project. Or you can generate view/service automatically and then move it to a specified directory inside `source`. But in this case, instead the `remove` command you should remove this `view` manually.

The specified directory in the `source` folder depends on the type of application part.

>After you add an application part, you should run `rad update` command to update applications `index.html` and/or `index.js`.

**example**
```bash
>rad add view screen.main
>rad update
```

Remove application parts
---
`remove [options] <type-of-abstraction> <name-of-abstraction>` - remove application parts.

The opposite command to `add`. You can remove: `view`, `scrollable`, `service`, `model`, `collection`, `external`. Options:
 - `-h`, `--help`  display help info.
 - `-u`, `--update`  update index.js, link all views and models.

**example**
```bash
>rad remove view screen.main
>rad update
```

Updating the application
---
`rad update` - apply all changes to the project.


External dependencies
---
`rad ext [options] <name> [source]` - work with a file from an external source`.

Options:
- `-h`, `--help` display help info.
- `-r`, `--remove`  remove external item.
 