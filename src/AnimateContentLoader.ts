import { BlobLoader, BlobLoaderResource, ILoaderOption, JsLoader, LoaderBase, LoaderResource, TLoaderResourceVersion } from '@tawaship/pixim.js';
import { IContent, IContentManifestEntry, IContentTarget, loadContentAsync, resolveContentUrl } from '@tawaship/pixi-animate-runtime';

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

export class AnimateContentLoaderResource extends LoaderResource<IContent | null> {
	destroy(): void {
		this._data = null;
	}
}

function isUrl(src: string): boolean {
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
export class AnimateContentLoader extends LoaderBase<IAnimateContentLoaderTarget, IContent | null, AnimateContentLoaderResource> {
	protected _loadAsync(target: IAnimateContentLoaderTarget, options: IAnimateContentLoaderOption = {}): Promise<AnimateContentLoaderResource> {
		const basepath = resolveContentUrl(options.basepath || '', target.basepath || '');
		return this._loadFileAsync(target, basepath, options)
			.then(() => this._loadContentAsync(target, basepath, options))
			.then(content => new AnimateContentLoaderResource(content, null))
			.catch((e: Error) => new AnimateContentLoaderResource(null, e));
	}

	private _loadFileAsync(target: IAnimateContentLoaderTarget, basepath: string, options: IAnimateContentLoaderOption): Promise<void> {
		if (!target.filepath) {
			return Promise.resolve();
		}
		return new JsLoader().loadAsync(resolveContentUrl(basepath, target.filepath), { version: options.fileVersion || options.version, xhr: options.xhr })
			.then(resource => {
				if (resource.error) {
					throw resource.error;
				}
				resource.ref();
			});
	}

	private _loadContentAsync(target: IAnimateContentLoaderTarget, basepath: string, options: IAnimateContentLoaderOption): Promise<IContent> {
		const version = options.assetVersion || options.version;
		const blobs: BlobLoaderResource[] = [];
		const release = (): void => {
			blobs.forEach(blob => blob.destroy());
		};
		const own = target.options && target.options.handleManifest;
		const contentTarget: IContentTarget = {
			id: target.id,
			basepath,
			options: {
				crossOrigin: target.options ? target.options.crossOrigin : undefined,
				handleManifest: (manifest: IContentManifestEntry[]) => {
					return Promise.resolve(own ? own(manifest) : undefined)
						.then(() => options.xhr ? this._fetchImagesAsync(manifest, basepath, version, options, blobs) : undefined);
				}
			}
		};
		return loadContentAsync(contentTarget, { version })
			.then(content => {
				release();
				return content;
			}, (e: Error) => {
				release();
				throw e;
			});
	}

	/** The images fetched into blob: URLs, which then stand for their files */
	private _fetchImagesAsync(manifest: IContentManifestEntry[], basepath: string, version: TLoaderResourceVersion | undefined, options: IAnimateContentLoaderOption, blobs: BlobLoaderResource[]): Promise<void> {
		const targets: Record<string, string> = {};
		manifest.forEach((entry, i) => {
			if (isUrl(entry.src)) {
				targets[i] = resolveContentUrl(basepath, entry.src);
			}
		});
		return new BlobLoader().loadAllAsync(targets, { version, xhr: options.xhr })
			.then(resources => {
				Object.keys(resources).forEach(i => {
					blobs.push(resources[i]);
				});
				Object.keys(resources).forEach(i => {
					const resource = resources[i];
					if (resource.error) {
						throw resource.error;
					}
					manifest[Number(i)].src = resource.data;
				});
			});
	}
}
