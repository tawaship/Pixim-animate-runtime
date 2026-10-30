# @tawaship/pixim-animate-runtime

Plays content made in Adobe Animate (published for HTML5 Canvas) in [Pixim.js](https://github.com/tawaship/Pixim.js)
applications, without CreateJS.

- **Convert once, at development time**: the command of
  [@tawaship/pixi-animate-runtime](https://github.com/tawaship/pixi-animate-runtime) turns the files Animate
  publishes into an optimized *runtime content* file
- **Load it as an asset of a Pixim content and play it in a Pixim container**: the runtime content loads with
  the content's other assets, and plays as CreateJS would, without CreateJS and without the published files
- **What it brings**: the player of pixi-animate-runtime (light instance creation, even playback, checked frame
  by frame against CreateJS), included in this package

Coming from [@tawaship/pixim-animate-container](https://github.com/tawaship/Pixim-animate-container)? It plays the
same content and is used the same way; see [Coming from pixim-animate-container](#coming-from-pixim-animate-container).

**Status: under development.**

API reference: https://tawaship.github.io/Pixim-animate-runtime/docs/

Samples (content published from Animate, played by this package or by CreateJS): https://tawaship.github.io/Pixim-animate-runtime/samples/

**Convert only content you trust.** Converting (with pixi-animate-runtime's command) runs the published
JavaScript, frame scripts included. It runs in a sandbox that is given nothing of your machine, but running code
is never without risk: convert content published by you or by people you trust, and treat content you receive as
code you would run (see [the note in its README](https://github.com/tawaship/pixi-animate-runtime#readme)).

## Quick start

The published files are needed only to convert. Your application ships the runtime content (and the images it
uses), not the published files. This example keeps them apart:

```
my-project/
├─ animate/          what Animate publishes (read when converting; not shipped)
└─ public/           what the application ships
   ├─ animates/      the runtime content, written by the command
   ├─ lib/           PixiJS, Pixim.js and this package
   └─ index.html
```

1. **Publish from Animate.** In Adobe Animate, publish the document for HTML5 Canvas into `animate/` (you get
   `title.js`, `title.html` and an `images/` directory).

2. **Install.** In the project (Node.js 18 or later):

   ```
   npm install pixi.js@5 @tawaship/pixim.js @tawaship/pixim-animate-runtime
   npm install --save-dev @tawaship/pixi-animate-runtime
   ```

   pixi-animate-runtime brings the command that converts (the player itself is in this package). Copy
   `node_modules/pixi.js/dist/pixi.min.js`, `node_modules/@tawaship/pixim.js/dist/Pixim.min.js` and
   `node_modules/@tawaship/pixim-animate-runtime/dist/pixim-animate-runtime.js` into `public/lib/` (or import them
   with a bundler).

3. **Convert.** From the project's root:

   ```
   npx --no-install @tawaship/pixi-animate-runtime animate --out-dir public/animates
   ```

   It lists what it will write and asks; answer `y`. This writes `public/animates/title.js` (the runtime
   content) and copies the images it uses into `public/animates/images/`. The list shows the content's
   **composition id**, which the next step needs.

4. **Play.** In `public/index.html`, load PixiJS, Pixim.js and this package, define the content as an asset of
   a Pixim content, and put the symbol the published HTML showed (named after the published file, here `title`)
   on an `AnimateContainer`:

   ```html
   <script src="lib/pixi.min.js"></script>
   <script src="lib/Pixim.min.js"></script>
   <script src="lib/pixim-animate-runtime.js"></script>
   <script>
   const { defineAnimateContentsTo, AnimateContainer } = Pixim.animateRuntime;

   const Game = Pixim.Content.create();
   defineAnimateContentsTo(Game, {
   	title: { id: '<composition id>', basepath: 'animates/', filepath: 'title.js' }
   });
   Game.defineLibraries({
   	root: class Root extends Pixim.Container {
   		constructor($) {
   			super();
   			const container = new AnimateContainer();
   			this.addChild(container);
   			container.addCreatejs($.resources.animateContents.title.create('title'));
   		}
   	}
   });

   const app = new Pixim.Application({ width: 550, height: 400 });
   app.attachAsync(new Game()).then(() => app.play());
   </script>
   ```

   The runtime content and its images load with the Pixim content's other assets, and the content plays at the
   frame rate it was published with.

5. **After publishing again from Animate, run step 3 again.** The player plays the runtime content, never the
   published files: a change made in Animate shows only once the runtime content is made again.

The sections below explain [defining contents](#playing-content), the [options](#options-of-the-pixim-content)
of the Pixim content and the [container](#playing). Converting is explained in
[pixi-animate-runtime's README](https://github.com/tawaship/pixi-animate-runtime#converting-published-content).

## What you need

- PixiJS 5.3 (`pixi.js` ^5.3.2) and Pixim.js 1.15 (`@tawaship/pixim.js` ^1.15.2) in your application
- Runtime content files, made from the published content with the command line tool of pixi-animate-runtime
  (`npx --no-install @tawaship/pixi-animate-runtime <published directory>`)

## Supported versions

- Content published by **Adobe Animate 24.0.15** for HTML5 Canvas. What this package reads is the form of the published
  JavaScript, which depends on the version of Animate; content published by other versions has not been checked
- PixiJS 5.3 (`pixi.js` ^5.3.2). Checked with 5.3.9
- Pixim.js 1.15 (`@tawaship/pixim.js` ^1.15.2). Checked with 1.15.2

## Playing content

Load this package after Pixi.js and Pixim.js. It includes the player: do not load pixi-animate-runtime as well.
What the player does (the objects and their PixiJS nodes, what is supported, the current limits) is as described in
[pixi-animate-runtime's README](https://github.com/tawaship/pixi-animate-runtime#readme).

```html
<script src="pixi.js"></script>
<script src="Pixim.js"></script>
<script src="pixim-animate-runtime.js"></script>
```

Define the contents a Pixim content uses, by name, and take them from `$.resources.animateContents` in its
classes:

```js
const { defineAnimateContentsTo, AnimateContainer } = Pixim.animateRuntime;

const Game = Pixim.Content.create();

defineAnimateContentsTo(Game, {
	title: { id: '2FA8E0C7230941478CE2CA3DB82DBEDF', basepath: 'assets/animates/', filepath: 'title.js' }
});

class Root extends Pixim.Container {
	constructor($) {
		super();
		const content = $.resources.animateContents.title;
		const container = new AnimateContainer();
		this.addChild(container);
		container.addCreatejs(content.create('title'));   // the symbol the published HTML used as its root
	}
}

Game.defineLibraries({ root: Root });
```

When the application attaches the content, the runtime content file and the content's images are loaded with
the content's other assets, and the `title` symbol plays at the frame rate it was published with while the
container is on the display tree.

- `id` is the composition id (the command line tool prints it, and it is written at the top of the runtime
  content file)
- `basepath` is the directory the runtime content file and the content's images are in, relative to the base
  path of the Pixim content (its `basepath` option)
- `filepath` is the runtime content file, relative to `basepath`. Without it, the file has to be loaded
  already (by a script tag, for example)
- `options` takes what pixi-animate-runtime's `loadContentAsync` takes: `crossOrigin: false` loads the images
  without CORS, and `handleManifest(manifest)` is called with the content's images (`{ id, src }`) before they are
  loaded, so that their `src` can be changed for this load (to a `data:` URL, for example)
- `defineAnimateContentsTo(Game, targets, { unrequired: true })` gives `null` for a content that could not be
  loaded instead of failing the whole Pixim content. `addAnimateContentsTo(game, targets)` adds contents to
  one instance of a Pixim content

What `$.resources.animateContents.title` holds is the content as pixi-animate-runtime's `loadContentAsync`
gives it: `id`, `lib`, `properties` and `create(id)`.

### Options of the Pixim content

The options a Pixim content is created with apply as they do to its other assets:

```js
new Game({
	basepath: 'https://example.com/',
	version: 12,
	xhr: { requestOptions: { credentials: 'include' } },
	typeOptions: { animateContents: { fileVersion: 3, assetVersion: 5 } }
});
```

- `version` adds `_fv=<version>` to the URLs of the runtime content files and the images (the query Animate
  adds to each image path on every publish stays). `fileVersion` and `assetVersion` under
  `typeOptions.animateContents` set it for the files and for the images separately
- With `xhr`, the runtime content files and the images are fetched with its request options. The images are
  fetched after the target's `handleManifest` is called, so an image it gives a `data:` URL is not fetched

### Playing

`AnimateContainer` is a Pixim container. While it is on the display tree of a running application, every
frame of the application plays the roots put on it with `addCreatejs`, at their content's frame rate.

- `taskEnabled = false` stops playing; the container's `task` is free for your own use (clearing it does not
  stop playing)
- `speed` changes the playback speed (`1` is the published frame rate, `0` stops). `overSpeed = false` plays at
  most one frame per frame of the application
- `smooth` (`true` by default) keeps the playing even when the time between frames of the application varies a
  little, while keeping to the real time, as described for pixi-animate-runtime. `false` plays by the time of
  each frame as it is
- `removeCreatejs(instance)` takes an instance off; a movie clip put on again starts from its first frame

Everything pixi-animate-runtime exports is in `Pixim.animateRuntime` too (`loadContentAsync`, `tick`, the
CreateJS-compatible classes, `VERSION` and so on), except that `AnimateContainer` is the Pixim container.
With a bundler, import from `@tawaship/pixim-animate-runtime`.

## Coming from pixim-animate-container

pixim-animate-container loads CreateJS and the published JavaScript as assets of a Pixim content and runs them
in the browser. This package loads runtime content files instead, generated from the published JavaScript at
development time: CreateJS is not loaded, and after publishing again from Animate the runtime content has to
be generated again. How the content is played otherwise changes as described for pixi-animate-runtime
(see its README).

Contents are defined and used the same way, under new names:

| pixim-animate-container | pixim-animate-runtime |
|---|---|
| A `<script>` tag for CreateJS | None |
| `Pixim.animate` | `Pixim.animateRuntime` |
| `defineAnimatesTo(Game, { name: { id, basepath, filepath } })`, `filepath` being the published `.js` | `defineAnimateContentsTo(Game, { name: { id, basepath, filepath } })`, `filepath` being the runtime content file |
| `addAnimatesTo` | `addAnimateContentsTo` |
| `$.resources.animates.name`, the `lib` of the content | `$.resources.animateContents.name`, the content (its classes are in `content.lib`) |
| `new $.resources.animates.name.game()` | `$.resources.animateContents.name.create('game')` |
| `Pixim.animate.Container` | `AnimateContainer` |
| `createjsSpeed` | `speed` |
| `createjsOverSpeed` | `overSpeed` |
| (none) | `smooth` (on by default; `false` plays as pixim-animate-container does) |

Not available: `replaceInstance()` on movie clips and `replaceTexture()` on sprites and bitmaps, besides what
pixi-animate-runtime does not have.

## Claude Code skills

The package comes with skills for Claude Code (Anthropic's AI coding tool) in `dist-skills/`: `pixim-animate-runtime-guide`, which tells it how to load and play runtime content in Pixim.js, and the skills of the packages it builds on (`pixi-animate-runtime-guide`, `animate-data-converter-guide`). To
let Claude Code use them in your project, copy them into the project's `.claude/skills/`:

```
mkdir -p .claude/skills
cp -r node_modules/@tawaship/pixim-animate-runtime/dist-skills/* .claude/skills/
```

Copy them again after updating the package. Each skill names the versions it was written for; with another
version, it tells Claude Code to follow the type definitions in `node_modules` where they disagree.

## How correctness is checked

This package was developed with Claude (Anthropic's AI assistant). Its correctness rests on testing rather
than on trust in the author: it is run with Pixim.js, and what it loads (URLs, versions, request options,
images fetched into blob: URLs and released) and how its container plays (frame by frame, against the player
of pixi-animate-runtime given the same frame times) are compared with what is expected. Known faults are put
into the package on purpose to confirm that the comparison notices them.

## Change log

### 0.1.0

- First release: loads runtime content as an asset of a Pixim content (`defineAnimateContentsTo`, `addAnimateContentsTo`,
  with the Pixim content's `version` and `xhr`) and plays it in a Pixim container (`AnimateContainer`, with `speed`,
  `overSpeed` and `smooth`)
- Claude Code skills in `dist-skills/`, published with the package

## License

MIT
