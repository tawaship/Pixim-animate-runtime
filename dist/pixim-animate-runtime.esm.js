/*!
 * @tawaship/pixim-animate-runtime - v0.1.0
 * 
 * @require pixi.js ^5.3.2
 * @require @tawaship/pixim.js ^1.15.2
 * @author tawaship (makazu.mori@gmail.com)
 * @license MIT
 */

import { AnimateController, resolveContentUrl, loadContentAsync } from '@tawaship/pixi-animate-runtime';
export * from '@tawaship/pixi-animate-runtime';
import { Container, JsLoader, BlobLoader, LoaderBase, LoaderResource, Content, ManifestBase } from '@tawaship/pixim.js';

/**
 * A Pixim container that plays the content roots put on it at their
 * content's frame rate (the rate the content was published with), while it is
 * on the display tree of a running Pixim application.
 *
 * Each frame of the application plays `delta x speed x fps / 60` frames of every
 * root (delta being the application ticker's), one frame being createjs's tick
 * phase followed by its resolve phase; the first frame after a root is put on
 * only settles it on its first frame. Playing stops while `taskEnabled` is
 * false. The container's own `task` is free for the application: what it holds
 * does not change the playing.
 */
var AnimateContainer = /*@__PURE__*/(function (Container) {
    function AnimateContainer() {
        Container.call(this);
        this._controller = new AnimateController(this);
    }

    if ( Container ) AnimateContainer.__proto__ = Container;
    AnimateContainer.prototype = Object.create( Container && Container.prototype );
    AnimateContainer.prototype.constructor = AnimateContainer;

    var prototypeAccessors = { speed: { configurable: true },overSpeed: { configurable: true },smooth: { configurable: true } };
    /** Playback speed (1 is the content's own frame rate) */
    prototypeAccessors.speed.get = function () { return this._controller.speed; };
    prototypeAccessors.speed.set = function (value) { this._controller.speed = value; };
    /** Whether one frame of the application may play more than one frame of a root (when the display runs slower than the content) */
    prototypeAccessors.overSpeed.get = function () { return this._controller.overSpeed; };
    prototypeAccessors.overSpeed.set = function (value) { this._controller.overSpeed = value; };
    /** Whether frames are played by a steady clock, so that small changes of the delta do not make the playing uneven */
    prototypeAccessors.smooth.get = function () { return this._controller.smooth; };
    prototypeAccessors.smooth.set = function (value) { this._controller.smooth = value; };
    AnimateContainer.prototype.updateTask = function updateTask (e) {
        Container.prototype.updateTask.call(this, e);
        if (!this.taskEnabled) {
            return;
        }
        this._controller.handleTick(e.delta);
    };
    /** Plays the roots by hand, as one frame of the application with this delta does */
    AnimateContainer.prototype.handleTick = function handleTick (delta) {
        this._controller.handleTick(delta);
    };
    /** Puts a content object on this container; a MovieClip plays from then on */
    AnimateContainer.prototype.addCreatejs = function addCreatejs (obj) {
        return this._controller.addCreatejs(obj);
    };
    AnimateContainer.prototype.addCreatejsAt = function addCreatejsAt (obj, index) {
        return this._controller.addCreatejsAt(obj, index);
    };
    AnimateContainer.prototype.removeCreatejs = function removeCreatejs (obj) {
        return this._controller.removeCreatejs(obj);
    };

    Object.defineProperties( AnimateContainer.prototype, prototypeAccessors );

    return AnimateContainer;
}(Container));

var AnimateContentLoaderResource = /*@__PURE__*/(function (LoaderResource) {
    function AnimateContentLoaderResource () {
        LoaderResource.apply(this, arguments);
    }

    if ( LoaderResource ) AnimateContentLoaderResource.__proto__ = LoaderResource;
    AnimateContentLoaderResource.prototype = Object.create( LoaderResource && LoaderResource.prototype );
    AnimateContentLoaderResource.prototype.constructor = AnimateContentLoaderResource;

    AnimateContentLoaderResource.prototype.destroy = function destroy () {
        this._data = null;
    };

    return AnimateContentLoaderResource;
}(LoaderResource));
function isUrl(src) {
    return src.indexOf('data:') !== 0 && src.indexOf('blob:') !== 0;
}
/**
 * Loads a content as a Pixim asset: its runtime content file (when a filepath
 * is given), then the content with loadContentAsync, the base path being the
 * Pixim content's and the target's together.
 *
 * With the Pixim content's `xhr` option, the images are fetched (with its
 * request options) into blob: URLs first, after the target's own
 * handleManifest; the blob: URLs are released once the content is loaded.
 */
var AnimateContentLoader = /*@__PURE__*/(function (LoaderBase) {
    function AnimateContentLoader () {
        LoaderBase.apply(this, arguments);
    }

    if ( LoaderBase ) AnimateContentLoader.__proto__ = LoaderBase;
    AnimateContentLoader.prototype = Object.create( LoaderBase && LoaderBase.prototype );
    AnimateContentLoader.prototype.constructor = AnimateContentLoader;

    AnimateContentLoader.prototype._loadAsync = function _loadAsync (target, options) {
        var this$1$1 = this;
        if ( options === void 0 ) options = {};

        var basepath = resolveContentUrl(options.basepath || '', target.basepath || '');
        return this._loadFileAsync(target, basepath, options)
            .then(function () { return this$1$1._loadContentAsync(target, basepath, options); })
            .then(function (content) { return new AnimateContentLoaderResource(content, null); })
            .catch(function (e) { return new AnimateContentLoaderResource(null, e); });
    };
    AnimateContentLoader.prototype._loadFileAsync = function _loadFileAsync (target, basepath, options) {
        if (!target.filepath) {
            return Promise.resolve();
        }
        return new JsLoader().loadAsync(resolveContentUrl(basepath, target.filepath), { version: options.fileVersion || options.version, xhr: options.xhr })
            .then(function (resource) {
            if (resource.error) {
                throw resource.error;
            }
            resource.ref();
        });
    };
    AnimateContentLoader.prototype._loadContentAsync = function _loadContentAsync (target, basepath, options) {
        var this$1$1 = this;

        var version = options.assetVersion || options.version;
        var blobs = [];
        var release = function () {
            blobs.forEach(function (blob) { return blob.destroy(); });
        };
        var own = target.options && target.options.handleManifest;
        var contentTarget = {
            id: target.id,
            basepath: basepath,
            options: {
                crossOrigin: target.options ? target.options.crossOrigin : undefined,
                handleManifest: function (manifest) {
                    return Promise.resolve(own ? own(manifest) : undefined)
                        .then(function () { return options.xhr ? this$1$1._fetchImagesAsync(manifest, basepath, version, options, blobs) : undefined; });
                }
            }
        };
        return loadContentAsync(contentTarget, { version: version })
            .then(function (content) {
            release();
            return content;
        }, function (e) {
            release();
            throw e;
        });
    };
    /** The images fetched into blob: URLs, which then stand for their files */
    AnimateContentLoader.prototype._fetchImagesAsync = function _fetchImagesAsync (manifest, basepath, version, options, blobs) {
        var targets = {};
        manifest.forEach(function (entry, i) {
            if (isUrl(entry.src)) {
                targets[i] = resolveContentUrl(basepath, entry.src);
            }
        });
        return new BlobLoader().loadAllAsync(targets, { version: version, xhr: options.xhr })
            .then(function (resources) {
            Object.keys(resources).forEach(function (i) {
                blobs.push(resources[i]);
            });
            Object.keys(resources).forEach(function (i) {
                var resource = resources[i];
                if (resource.error) {
                    throw resource.error;
                }
                manifest[Number(i)].src = resource.data;
            });
        });
    };

    return AnimateContentLoader;
}(LoaderBase));

/** The key of the contents in a Pixim content's resources: `$.resources.animateContents` */
var ANIMATE_CONTENTS = 'animateContents';
var AnimateContentManifest = /*@__PURE__*/(function (ManifestBase) {
    function AnimateContentManifest () {
        ManifestBase.apply(this, arguments);
    }

    if ( ManifestBase ) AnimateContentManifest.__proto__ = ManifestBase;
    AnimateContentManifest.prototype = Object.create( ManifestBase && ManifestBase.prototype );
    AnimateContentManifest.prototype.constructor = AnimateContentManifest;

    AnimateContentManifest.prototype._createLoader = function _createLoader () {
        return new AnimateContentLoader();
    };

    return AnimateContentManifest;
}(ManifestBase));
Content.registerManifest(ANIMATE_CONTENTS, AnimateContentManifest);
/**
 * Defines contents for a Pixim content class: each is loaded with the class's
 * other assets and given as `$.resources.animateContents[name]`.
 */
function defineAnimateContentsTo(PiximContent, targets, options) {
    if ( options === void 0 ) options = {};

    return PiximContent.defineTargets(ANIMATE_CONTENTS, targets, options);
}
/**
 * Adds contents to a Pixim content instance (loaded with its other assets).
 */
function addAnimateContentsTo(content, targets, options) {
    if ( options === void 0 ) options = {};

    return content.addTargets(ANIMATE_CONTENTS, targets, options);
}

export { ANIMATE_CONTENTS, AnimateContainer, AnimateContentLoader, AnimateContentLoaderResource, AnimateContentManifest, addAnimateContentsTo, defineAnimateContentsTo };
//# sourceMappingURL=pixim-animate-runtime.esm.js.map
