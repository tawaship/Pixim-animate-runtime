import { Content, IManifestOption, ManifestBase } from '@tawaship/pixim.js';
import { IContent } from '@tawaship/pixi-animate-runtime';
import { AnimateContentLoader, AnimateContentLoaderResource, IAnimateContentLoaderTarget } from './AnimateContentLoader';
/** The key of the contents in a Pixim content's resources: `$.resources.animateContents` */
export declare const ANIMATE_CONTENTS = "animateContents";
export declare class AnimateContentManifest extends ManifestBase<IAnimateContentLoaderTarget, IContent | null, AnimateContentLoaderResource> {
    protected _createLoader(): AnimateContentLoader;
}
/**
 * Defines contents for a Pixim content class: each is loaded with the class's
 * other assets and given as `$.resources.animateContents[name]`.
 */
export declare function defineAnimateContentsTo(PiximContent: typeof Content, targets: Record<string, IAnimateContentLoaderTarget>, options?: IManifestOption): typeof Content;
/**
 * Adds contents to a Pixim content instance (loaded with its other assets).
 */
export declare function addAnimateContentsTo(content: Content, targets: Record<string, IAnimateContentLoaderTarget>, options?: IManifestOption): Content;
