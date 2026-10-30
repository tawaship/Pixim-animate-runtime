import { Container, ITickerData } from '@tawaship/pixim.js';
import { AnimateController, DisplayObject } from '@tawaship/pixi-animate-runtime';

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
export class AnimateContainer extends Container {
	private readonly _controller: AnimateController;

	constructor() {
		super();
		this._controller = new AnimateController(this);
	}

	/** Playback speed (1 is the content's own frame rate) */
	get speed(): number { return this._controller.speed; }
	set speed(value: number) { this._controller.speed = value; }

	/** Whether one frame of the application may play more than one frame of a root (when the display runs slower than the content) */
	get overSpeed(): boolean { return this._controller.overSpeed; }
	set overSpeed(value: boolean) { this._controller.overSpeed = value; }

	/** Whether frames are played by a steady clock, so that small changes of the delta do not make the playing uneven */
	get smooth(): boolean { return this._controller.smooth; }
	set smooth(value: boolean) { this._controller.smooth = value; }

	updateTask(e: ITickerData): void {
		super.updateTask(e);
		if (!this.taskEnabled) {
			return;
		}
		this._controller.handleTick(e.delta);
	}

	/** Plays the roots by hand, as one frame of the application with this delta does */
	handleTick(delta: number): void {
		this._controller.handleTick(delta);
	}

	/** Puts a content object on this container; a MovieClip plays from then on */
	addCreatejs<T extends DisplayObject>(obj: T): T {
		return this._controller.addCreatejs(obj);
	}

	addCreatejsAt<T extends DisplayObject>(obj: T, index: number): T {
		return this._controller.addCreatejsAt(obj, index);
	}

	removeCreatejs<T extends DisplayObject>(obj: T): T {
		return this._controller.removeCreatejs(obj);
	}
}
