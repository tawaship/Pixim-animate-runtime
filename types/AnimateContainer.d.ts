import { Container, ITickerData } from '@tawaship/pixim.js';
import { DisplayObject } from '@tawaship/pixi-animate-runtime';
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
export declare class AnimateContainer extends Container {
    private readonly _controller;
    constructor();
    /** Playback speed (1 is the content's own frame rate) */
    get speed(): number;
    set speed(value: number);
    /** Whether one frame of the application may play more than one frame of a root (when the display runs slower than the content) */
    get overSpeed(): boolean;
    set overSpeed(value: boolean);
    updateTask(e: ITickerData): void;
    /** Plays the roots by hand, as one frame of the application with this delta does */
    handleTick(delta: number): void;
    /** Puts a content object on this container; a MovieClip plays from then on */
    addCreatejs<T extends DisplayObject>(obj: T): T;
    addCreatejsAt<T extends DisplayObject>(obj: T, index: number): T;
    removeCreatejs<T extends DisplayObject>(obj: T): T;
}
