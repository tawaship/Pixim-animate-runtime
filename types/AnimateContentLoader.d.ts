import { ILoaderOption, LoaderBase, LoaderResource, TLoaderResourceVersion } from '@tawaship/pixim.js';
import { IContent, IContentTarget } from '@tawaship/pixi-animate-runtime';
/** A content to load: what loadContentAsync takes, and the runtime content file to load first */
export interface IAnimateContentLoaderTarget extends IContentTarget {
    /**
     * The runtime content file, relative to `basepath`. Loaded (as a script) before
     * the content when given; otherwise it has to be loaded already.
     */
    filepath?: string;
}
export interface IAnimateContentLoaderOption extends ILoaderOption {
    /** The version added to the runtime content file's URL (`version` when omitted) */
    fileVersion?: TLoaderResourceVersion;
    /** The version added to the image URLs (`version` when omitted) */
    assetVersion?: TLoaderResourceVersion;
}
export declare class AnimateContentLoaderResource extends LoaderResource<IContent | null> {
    destroy(): void;
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
export declare class AnimateContentLoader extends LoaderBase<IAnimateContentLoaderTarget, IContent | null, AnimateContentLoaderResource> {
    protected _loadAsync(target: IAnimateContentLoaderTarget, options?: IAnimateContentLoaderOption): Promise<AnimateContentLoaderResource>;
    private _loadFileAsync;
    private _loadContentAsync;
    /** The images fetched into blob: URLs, which then stand for their files */
    private _fetchImagesAsync;
}
