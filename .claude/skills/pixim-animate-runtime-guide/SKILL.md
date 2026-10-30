---
name: pixim-animate-runtime-guide
description: Use this skill whenever the user asks to create, edit, or debug content using @tawaship/pixim-animate-runtime — a plugin that plays Adobe Animate HTML5 Canvas (CreateJS) content in Pixim.js applications from runtime content files generated at development time, without CreateJS. Trigger on any mention of 'pixim-animate-runtime', 'Animate コンテンツ', 'Adobe Animate' or 'createjs' in a Pixim.js project that has @tawaship/pixim-animate-runtime installed, or on concepts like defineAnimateContentsTo, addAnimateContentsTo, $.resources.animateContents, Pixim.animateRuntime, or AnimateContainer in a Pixim.js project. If the project uses @tawaship/pixim-animate-container instead (CreateJS at run time, defineAnimatesTo), use the pixim-animate-container-guide skill.
---

# @tawaship/pixim-animate-runtime development skill

Supported versions: **`^0.1.0`** (written against `0.1.0`).

First determine the installed version (`node_modules/@tawaship/pixim-animate-runtime/package.json`). If it is outside the supported range, **treat the type definitions in node_modules as authoritative** and follow them wherever they disagree with this skill.

The content is assumed to be published by **Adobe Animate 24.0.15** for HTML5 Canvas, the only version checked: this package depends on the form of the published JavaScript. If the user's content comes from another version of Animate and something does not work, mention this before looking for other causes.

## Dependencies

Read these skills first, then apply this one:

- **pixi-animate-runtime-guide** — this package is the player of `@tawaship/pixi-animate-runtime` with Pixim.js loading and playing. Generating runtime content, creating instances, the objects and their PixiJS nodes, and the current limits are all described there and apply unchanged
- A Pixim.js v1.15 skill (such as pixim-js-dev) and a PixiJS v5.3 skill, if available

## Overview

This package bundles the player of pixi-animate-runtime (do not load pixi-animate-runtime as well) and adds what a Pixim application needs:

- Contents are **assets of a Pixim content**: defined with `defineAnimateContentsTo`, loaded with the content's other assets, and given as `$.resources.animateContents[name]`
- `AnimateContainer` is a **Pixim container** that plays the instances put on it through its task, while it is on the display tree of a running application

As with pixi-animate-runtime, **runtime content files are generated at development time** (`npx pixi-animate-runtime <published directory>`) and must be generated again after publishing again from Animate. CreateJS and the published `.js` are never loaded.

## Type definition files

**Before writing code that uses a class, method, or property of this package, check the corresponding type definition file** in the installed package (`node_modules/@tawaship/pixim-animate-runtime/types/`). Everything of pixi-animate-runtime is re-exported; its types are in `node_modules/@tawaship/pixi-animate-runtime/types/player/` (see pixi-animate-runtime-guide).

| What | Type definition file |
|---|---|
| Everything exported | `types/index.d.ts` |
| `defineAnimateContentsTo`, `addAnimateContentsTo`, `ANIMATE_CONTENTS` | `types/AnimateContentManifest.d.ts` |
| The target of each content (`id`, `basepath`, `filepath`, `options`) | `types/AnimateContentLoader.d.ts` |
| `AnimateContainer` (Pixim) | `types/AnimateContainer.d.ts` |

## Basic usage

### 1. Loading the scripts

```html
<script src="pixi.js"></script>
<script src="Pixim.js"></script>
<script src="pixim-animate-runtime.js"></script>
```

In a browser setup the module is `Pixim.animateRuntime`. With a bundler: `import { defineAnimateContentsTo, AnimateContainer } from '@tawaship/pixim-animate-runtime'`.

### 2. Defining contents and playing them

```javascript
const { defineAnimateContentsTo, AnimateContainer } = Pixim.animateRuntime;

const Game = Pixim.Content.create();

defineAnimateContentsTo(Game, {
  title: { id: 'COMPOSITION_ID', basepath: 'assets/animates/', filepath: 'title.js' }
});

class Root extends Pixim.Container {
  constructor($) {
    super();
    const content = $.resources.animateContents.title;
    const container = new AnimateContainer();
    this.addChild(container);
    container.addCreatejs(content.create('title')); // the symbol the published HTML used as its root
  }
}

Game.defineLibraries({ root: Root });
```

- `id`: the composition id (printed by `npx pixi-animate-runtime`, and written at the top of the runtime content file)
- `basepath`: the directory of the runtime content file and its images, relative to the Pixim content's `basepath` option
- `filepath`: the runtime content file, relative to `basepath`. Without it, the file has to be loaded already (by a script tag)
- `options`: as pixi-animate-runtime's `loadContentAsync` (`crossOrigin`, `handleManifest`)
- `defineAnimateContentsTo(Game, targets, { unrequired: true })` gives `null` for a content that failed to load instead of failing the whole Pixim content
- `addAnimateContentsTo(game, targets)` adds contents to one instance of a Pixim content
- `$.resources.animateContents.title` is the content as `loadContentAsync` gives it: `id`, `lib`, `properties`, `create(id)`

**No ticker wiring is needed**: unlike pixi-animate-runtime's container, the Pixim `AnimateContainer` plays through its own task while it is on the display tree of a running application.

### 3. Options of the Pixim content

The Pixim content's own options apply to runtime content files and images as to its other assets:

- `version` adds `_fv=<version>` to the URLs. `typeOptions.animateContents.fileVersion` / `assetVersion` set it for the files / the images separately
- `xhr` fetches the runtime content files and the images with its request options

### 4. AnimateContainer

- `addCreatejs(instance)` / `addCreatejsAt(instance, index)` / `removeCreatejs(instance)`; a movie clip put on again starts from its first frame
- `speed` (`1` = published frame rate, `0` stops), `overSpeed` (default `true`; `false` plays at most one frame per application frame), `smooth` (default `true`; even playing when the frame time varies a little, as in pixi-animate-runtime-guide)
- `taskEnabled = false` stops playing. The container's `task` is free for your own use: clearing it does not stop playing

## Coming from pixim-animate-container

| pixim-animate-container | pixim-animate-runtime |
|---|---|
| Script tag for CreateJS | None |
| `Pixim.animate` | `Pixim.animateRuntime` |
| `defineAnimatesTo(Game, {...})`, `filepath` = published `.js` | `defineAnimateContentsTo(Game, {...})`, `filepath` = runtime content file |
| `addAnimatesTo` | `addAnimateContentsTo` |
| `$.resources.animates.name` (`lib`) → `new ...game()` | `$.resources.animateContents.name` (content) → `.create('game')` |
| `Pixim.animate.Container` | `AnimateContainer` |
| `createjsSpeed` / `createjsOverSpeed` | `speed` / `overSpeed` |

Not available: `replaceInstance()`, `replaceTexture()`, and what pixi-animate-runtime does not have (`listenFrameEvents`, `useSound`, CreateJS mouse events).
