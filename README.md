# @tawaship/pixim-animate-runtime

Plays content published from Adobe Animate for HTML5 Canvas (CreateJS) in [Pixim.js](https://github.com/tawaship/Pixim.js)
applications.

It is the player of [@tawaship/pixi-animate-runtime](https://github.com/tawaship/pixi-animate-runtime), with
what a Pixim application needs: contents are loaded as assets of a Pixim content, and a Pixim container plays
them. Everything else (converting the published content, what is supported, the objects and their PixiJS
nodes) is as described in the pixi-animate-runtime README.

**Status: under development.**

## What you need

- PixiJS 5.3 (`pixi.js` ^5.3.2) and Pixim.js 1.15 (`@tawaship/pixim.js` ^1.15.2) in your application
- Runtime content files, made from the published content with the command line tool of pixi-animate-runtime
  (`npx pixi-animate-runtime <published directory>`)

## Playing content

Load this package after Pixi.js and Pixim.js. It includes the player: do not load pixi-animate-runtime as well.

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
- `removeCreatejs(instance)` takes an instance off; a movie clip put on again starts from its first frame

Everything pixi-animate-runtime exports is in `Pixim.animateRuntime` too (`loadContentAsync`, `tick`, the
CreateJS-compatible classes, `VERSION` and so on), except that `AnimateContainer` is the Pixim container.
With a bundler, import from `@tawaship/pixim-animate-runtime`.

## How correctness is checked

This package was developed with Claude (Anthropic's AI assistant). Its correctness rests on testing rather
than on trust in the author: it is run with Pixim.js, and what it loads (URLs, versions, request options,
images fetched into blob: URLs and released) and how its container plays (frame by frame, against the player
of pixi-animate-runtime given the same frame times) are compared with what is expected. Known faults are put
into the package on purpose to confirm that the comparison notices them.

## License

MIT
