import { Content, IManifestOption, ManifestBase } from '@tawaship/pixim.js';
import { IContent } from '@tawaship/pixi-animate-runtime';
import { AnimateContentLoader, AnimateContentLoaderResource, IAnimateContentLoaderTarget } from './AnimateContentLoader';

/** The key of the contents in a Pixim content's resources: `$.resources.animateContents` */
export const ANIMATE_CONTENTS = 'animateContents';

export class AnimateContentManifest extends ManifestBase<IAnimateContentLoaderTarget, IContent | null, AnimateContentLoaderResource> {
	protected _createLoader(): AnimateContentLoader {
		return new AnimateContentLoader();
	}
}

Content.registerManifest(ANIMATE_CONTENTS, AnimateContentManifest);

/**
 * Defines contents for a Pixim content class: each is loaded with the class's
 * other assets and given as `$.resources.animateContents[name]`.
 */
export function defineAnimateContentsTo(PiximContent: typeof Content, targets: Record<string, IAnimateContentLoaderTarget>, options: IManifestOption = {}): typeof Content {
	return PiximContent.defineTargets(ANIMATE_CONTENTS, targets, options);
}

/**
 * Adds contents to a Pixim content instance (loaded with its other assets).
 */
export function addAnimateContentsTo(content: Content, targets: Record<string, IAnimateContentLoaderTarget>, options: IManifestOption = {}): Content {
	return content.addTargets(ANIMATE_CONTENTS, targets, options);
}
