/**
 * Tidal Mini Player – main plugin entry for TidaLuna
 *
 * Features
 * ────────
 * • Album artwork fills the player (static image + animated video cover)
 * • Playback controls revealed on hover (prev / play-pause / next + progress bar)
 * • Mouse wheel / trackpad vertical scroll → volume control with visual feedback
 * • Trackpad horizontal scroll → skip previous / next track
 * • Heart button to like/unlike the current track
 * • Playback quality pill (toggle via right-click settings)
 * • Lyrics display synced to playback (toggle via right-click settings)
 * • Draggable, resizable, position saved to plugin storage
 */

// ─── Luna imports (resolved at runtime by TidaLuna's module system) ──────────
// @ts-expect-error – these are runtime-resolved Luna modules
import { Tracer, ReactiveStore, findModuleByProperty, type LunaUnload } from "@luna/core";
// @ts-expect-error
import { PlayState, MediaItem, StyleTag, ContentBase, Quality, ContextMenu, redux, observe, observePromise } from "@luna/lib";

import { currentLyricIndex, parseLrc, type LyricLine } from "./lyrics";

// ─── Plugin bookkeeping ───────────────────────────────────────────────────────
export const unloads = new Set<LunaUnload>();
export const { trace, errSignal } = Tracer("[MiniPlayer]");

// ─── Persistent settings ──────────────────────────────────────────────────────
export const settings = await ReactiveStore.getPluginStorage("MiniPlayer", {
	/** Show the playback quality badge (HiRes, LOSSLESS …) */
	showQualityPill: true as boolean,
	/** Lyrics display mode */
	lyricsMode: "line" as "off" | "line",
	/** What vertical scroll does: change volume or seek */
	scrollAction: "volume" as "volume" | "seek",
	/** Last saved player position (px from viewport edges) */
	playerRight: 20 as number,
	playerBottom: 20 as number,
});

// ─── CSS injection ────────────────────────────────────────────────────────────
const CSS = `
#luna-mini-player {
	position: fixed;
	z-index: 99999;
	width: 280px;
	height: 280px;
	border-radius: 16px;
	overflow: hidden;
	box-shadow: 0 8px 32px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.08);
	cursor: default;
	user-select: none;
	transition: box-shadow .2s;
	background: #111;
	font-family: inherit;
}
#luna-mini-player:hover {
	box-shadow: 0 12px 40px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.15);
}

/* ── artwork layer ─────────────────────────────────────────────────── */
#luna-mini-player .lmp-art {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	transition: opacity .4s;
	pointer-events: none; /* prevent browser native image drag */
	user-select: none;
	-webkit-user-drag: none;
}
#luna-mini-player .lmp-art-video {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
}

/* ── gradient overlays ────────────────────────────────────────────── */
#luna-mini-player .lmp-overlay-top {
	position: absolute;
	inset: 0 0 auto 0;
	height: 60px;
	background: linear-gradient(to bottom, rgba(0,0,0,.55) 0%, transparent 100%);
	pointer-events: none;
}
#luna-mini-player .lmp-overlay-bottom {
	position: absolute;
	inset: auto 0 0 0;
	height: 130px;
	background: linear-gradient(to top, rgba(0,0,0,.75) 0%, transparent 100%);
	pointer-events: none;
}

/* ── drag handle ──────────────────────────────────────────────────── */
#luna-mini-player .lmp-drag {
	position: absolute;
	inset: 0 0 auto 0;
	height: 44px;
	cursor: move;
}

/* ── top-right meta (quality + close) ────────────────────────────── */
#luna-mini-player .lmp-topbar {
	position: absolute;
	top: 10px;
	right: 10px;
	display: flex;
	gap: 6px;
	align-items: center;
}
#luna-mini-player .lmp-quality {
	font-size: 10px;
	font-weight: 700;
	letter-spacing: .04em;
	padding: 2px 7px;
	border-radius: 100px;
	background: rgba(255,255,255,.12);
	backdrop-filter: blur(6px);
	color: #fff;
	border: 1px solid rgba(255,255,255,.15);
	white-space: nowrap;
}
#luna-mini-player .lmp-close {
	width: 22px;
	height: 22px;
	border-radius: 50%;
	background: rgba(255,255,255,.12);
	border: 1px solid rgba(255,255,255,.15);
	backdrop-filter: blur(6px);
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	color: rgba(255,255,255,.7);
	font-size: 13px;
	line-height: 1;
	transition: background .15s, color .15s;
}
#luna-mini-player .lmp-close:hover {
	background: rgba(255,255,255,.25);
	color: #fff;
}

/* ── track info ───────────────────────────────────────────────────── */
#luna-mini-player .lmp-info {
	position: absolute;
	bottom: 56px;
	left: 12px;
	right: 12px;
}
#luna-mini-player .lmp-title {
	font-size: 14px;
	font-weight: 700;
	color: #fff;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	text-shadow: 0 1px 4px rgba(0,0,0,.5);
}
#luna-mini-player .lmp-artist {
	font-size: 12px;
	color: rgba(255,255,255,.7);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	margin-top: 2px;
	text-shadow: 0 1px 4px rgba(0,0,0,.5);
}

/* ── controls ─────────────────────────────────────────────────────── */
#luna-mini-player .lmp-controls {
	position: absolute;
	bottom: 12px;
	left: 12px;
	right: 12px;
	display: flex;
	flex-direction: column;
	gap: 6px;
	opacity: 0;
	transition: opacity .2s;
}
#luna-mini-player:hover .lmp-controls {
	opacity: 1;
}
#luna-mini-player .lmp-btns {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16px;
}
#luna-mini-player .lmp-btn {
	background: none;
	border: none;
	padding: 0;
	cursor: pointer;
	color: rgba(255,255,255,.85);
	display: flex;
	align-items: center;
	justify-content: center;
	transition: color .15s, transform .1s;
	line-height: 1;
}
#luna-mini-player .lmp-btn:hover {
	color: #fff;
	transform: scale(1.1);
}
#luna-mini-player .lmp-btn.lmp-btn-play {
	width: 38px;
	height: 38px;
	background: rgba(255,255,255,.15);
	backdrop-filter: blur(8px);
	border-radius: 50%;
	font-size: 18px;
	transition: background .15s, transform .1s;
}
#luna-mini-player .lmp-btn.lmp-btn-play:hover {
	background: rgba(255,255,255,.25);
	transform: scale(1.05);
}
#luna-mini-player .lmp-btn svg {
	display: block;
}

/* ── progress bar ─────────────────────────────────────────────────── */
#luna-mini-player .lmp-progress-wrap {
	position: relative;
	height: 4px;
	border-radius: 2px;
	background: rgba(255,255,255,.2);
	cursor: pointer;
}
#luna-mini-player .lmp-progress-fill {
	height: 100%;
	border-radius: 2px;
	background: #fff;
	pointer-events: none;
	transition: width .5s linear;
}
#luna-mini-player .lmp-progress-wrap:hover .lmp-progress-fill {
	background: #1db954;
}

/* ── heart (like) button ──────────────────────────────────────────── */
#luna-mini-player .lmp-heart {
	position: absolute;
	top: 10px;
	left: 10px;
	width: 28px;
	height: 28px;
	background: rgba(0,0,0,.35);
	backdrop-filter: blur(6px);
	border: 1px solid rgba(255,255,255,.12);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	color: rgba(255,255,255,.6);
	opacity: 0;
	transition: opacity .2s, background .15s, transform .1s;
}
#luna-mini-player:hover .lmp-heart {
	opacity: 1;
}
#luna-mini-player .lmp-heart:hover {
	background: rgba(255,255,255,.2);
	transform: scale(1.1);
}
#luna-mini-player .lmp-heart.liked {
	color: #ff4466;
}

/* ── volume feedback ──────────────────────────────────────────────── */
#luna-mini-player .lmp-volume-toast {
	position: absolute;
	inset: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 10px;
	background: rgba(0,0,0,.55);
	backdrop-filter: blur(6px);
	border-radius: inherit;
	opacity: 0;
	pointer-events: none;
	transition: opacity .2s;
}
#luna-mini-player .lmp-volume-toast.visible {
	opacity: 1;
}
#luna-mini-player .lmp-volume-text {
	font-size: 28px;
	font-weight: 700;
	color: #fff;
	letter-spacing: -.01em;
}
#luna-mini-player .lmp-volume-bar-wrap {
	width: 140px;
	height: 6px;
	background: rgba(255,255,255,.2);
	border-radius: 3px;
	overflow: hidden;
}
#luna-mini-player .lmp-volume-bar-fill {
	height: 100%;
	border-radius: 3px;
	background: #fff;
	transition: width .1s;
}

/* ── lyrics ───────────────────────────────────────────────────────── */
#luna-mini-player.lmp-has-lyrics {
	height: 360px;
}
#luna-mini-player .lmp-lyrics {
	position: absolute;
	inset: auto 0 0 0;
	height: 80px;
	overflow: hidden;
	display: flex;
	align-items: flex-end;
	padding: 0 12px 10px;
	background: linear-gradient(to top, rgba(0,0,0,.75) 60%, transparent 100%);
}
#luna-mini-player .lmp-lyric-line {
	font-size: 13px;
	font-weight: 600;
	color: rgba(255,255,255,.9);
	text-align: center;
	width: 100%;
	line-height: 1.35;
	text-shadow: 0 1px 6px rgba(0,0,0,.6);
	transition: opacity .3s;
}

/* ── swipe navigation hint ────────────────────────────────────────── */
#luna-mini-player .lmp-swipe-hint {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	pointer-events: none;
	opacity: 0;
	border-radius: inherit;
	color: #fff;
	font-size: 28px;
	text-shadow: 0 2px 10px rgba(0,0,0,.7);
	transition: opacity .1s;
}
#luna-mini-player .lmp-swipe-hint.lmp-swipe-next {
	justify-content: flex-end;
	padding-right: 20px;
	background: linear-gradient(to left, rgba(0,0,0,.45) 0%, transparent 65%);
}
#luna-mini-player .lmp-swipe-hint.lmp-swipe-prev {
	justify-content: flex-start;
	padding-left: 20px;
	background: linear-gradient(to right, rgba(0,0,0,.45) 0%, transparent 65%);
}

/* ── context menu ─────────────────────────────────────────────────── */
.lmp-ctx-menu {
	position: fixed;
	z-index: 100000;
	background: rgba(24,24,28,.96);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(255,255,255,.1);
	border-radius: 10px;
	padding: 4px;
	min-width: 200px;
	box-shadow: 0 8px 32px rgba(0,0,0,.6);
	font-size: 13px;
}
.lmp-ctx-item {
	padding: 8px 12px;
	border-radius: 7px;
	cursor: pointer;
	color: rgba(255,255,255,.85);
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	transition: background .1s;
}
.lmp-ctx-item:hover {
	background: rgba(255,255,255,.1);
}
.lmp-ctx-separator {
	height: 1px;
	background: rgba(255,255,255,.08);
	margin: 4px 0;
}
.lmp-ctx-check {
	color: #1db954;
	font-size: 16px;
}
.lmp-ctx-item .lmp-ctx-label {
	flex: 1;
}

/* ── playback bar / full-screen player toggle button ──────────────── */
.lmp-toggle-btn {
	all: unset;
	box-sizing: border-box;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border-radius: 50%;
	cursor: pointer;
	color: rgba(255, 255, 255, 0.5);
	flex-shrink: 0;
	transition: color 0.15s, background 0.15s;
}
.lmp-toggle-btn:hover {
	color: #fff;
	background: rgba(255, 255, 255, 0.1);
}
.lmp-toggle-btn.lmp-active {
	color: #32f4ff;
}
`;

// ─── SVG icon helpers ─────────────────────────────────────────────────────────
const svg = (path: string, viewBox = "0 0 24 24", size = 20) =>
	`<svg width="${size}" height="${size}" viewBox="${viewBox}" fill="currentColor" xmlns="http://www.w3.org/2000/svg">${path}</svg>`;

const ICON_PREV = svg(
	'<path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6L9.5 12z"/>',
);
const ICON_NEXT = svg(
	'<path d="M6 18l8.5-6L6 6v12zm10.5-12v12h2V6h-2z"/>',
);
const ICON_PLAY = svg(
	'<path d="M8 5v14l11-7L8 5z"/>',
);
const ICON_PAUSE = svg(
	'<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>',
);
const ICON_HEART_EMPTY = svg(
	'<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill-opacity=".3"/><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="currentColor" stroke-width="1.5"/>',
	"0 0 24 24",
	18,
);
const ICON_HEART_FILLED = svg(
	'<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',
	"0 0 24 24",
	18,
);
const ICON_CLOSE = `<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M9 1L5 5l4 4-1 1-4-4-4 4-1-1 4-4-4-4 1-1 4 4 4-4 1 1z"/></svg>`;
const ICON_VOLUME = svg(
	'<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>',
	"0 0 24 24",
	22,
);
const ICON_PIP = svg(
	'<path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3C1.9 3 1 3.88 1 4.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z"/>',
	"0 0 24 24",
	20,
);

// ─── Mini-player class ────────────────────────────────────────────────────────
class MiniPlayer {
	private readonly el: HTMLDivElement;
	private artImg: HTMLImageElement;
	private artVideo: HTMLVideoElement;
	private titleEl: HTMLElement;
	private artistEl: HTMLElement;
	private heartEl: HTMLElement;
	private qualityEl: HTMLElement;
	private progressFill: HTMLDivElement;
	private playBtn: HTMLButtonElement;
	private volumeToast: HTMLDivElement;
	private volumeText: HTMLElement;
	private volumeBarFill: HTMLDivElement;
	private lyricsEl: HTMLElement;

	/** Listeners notified whenever show() or hide() is invoked (supports multiple buttons). */
	public readonly onVisibilityChange = new Set<(visible: boolean) => void>();

	// State
	private currentTrackId: string | number | undefined;
	private currentDuration = 0;
	private volumeTimeout: ReturnType<typeof setTimeout> | null = null;
	private progressTimeout: ReturnType<typeof setTimeout> | null = null;
	private lyricsLines: LyricLine[] | null = null;
	private lyricsInterval: ReturnType<typeof setInterval> | null = null;
	// Drag state
	private dragging = false;
	private dragStartX = 0;
	private dragStartY = 0;
	private dragStartRight = 0;
	private dragStartBottom = 0;
	// Horizontal swipe state (trackpad gestures)
	private swipeAccumX = 0;
	private swipeFired = false;
	private swipeResetTimer: ReturnType<typeof setTimeout> | null = null;
	private swipeHintEl: HTMLElement | null = null;
	// Vertical scroll accumulator (volume / seek)
	private volAccumY = 0;
	// Lyrics retry
	private lyricsRetryTimer: ReturnType<typeof setTimeout> | null = null;
	private lyricsTrackId: string | number | undefined;
	private static readonly SWIPE_THRESHOLD = 80; // px of accumulated horizontal scroll to trigger skip
	private static readonly VOL_STEP = 5; // volume % per scroll notch
	private static readonly SEEK_STEP_SECONDS = 5; // seconds per scroll notch when in seek mode

	constructor(private readonly playerUnloads: Set<LunaUnload>) {
		this.el = document.createElement("div");
		this.el.id = "luna-mini-player";

		// Position
		this.el.style.right = `${settings.playerRight}px`;
		this.el.style.bottom = `${settings.playerBottom}px`;

		this.el.innerHTML = this.buildHTML();

		// Cache references
		this.artImg = this.el.querySelector(".lmp-art")!;
		this.artVideo = this.el.querySelector(".lmp-art-video")!;
		this.titleEl = this.el.querySelector(".lmp-title")!;
		this.artistEl = this.el.querySelector(".lmp-artist")!;
		this.heartEl = this.el.querySelector(".lmp-heart")!;
		this.qualityEl = this.el.querySelector(".lmp-quality")!;
		this.progressFill = this.el.querySelector(".lmp-progress-fill")!;
		this.playBtn = this.el.querySelector(".lmp-btn-play")!;
		this.volumeToast = this.el.querySelector(".lmp-volume-toast")!;
		this.volumeText = this.el.querySelector(".lmp-volume-text")!;
		this.volumeBarFill = this.el.querySelector(".lmp-volume-bar-fill")!;
		this.lyricsEl = this.el.querySelector(".lmp-lyric-line")!;
		this.swipeHintEl = this.el.querySelector(".lmp-swipe-hint") as HTMLElement;

		document.body.appendChild(this.el);

		this.bindEvents();
		this.startProgressLoop();

		// Reflect initial playback state
		this.updatePlayButton(PlayState.playing);
		this.updateVolumeFeedback(PlayState.playbackControls?.volume ?? 100, false);
	}

	// ─── HTML template ────────────────────────────────────────────────────────
	private buildHTML(): string {
		return `
			<!-- artwork -->
			<img class="lmp-art" src="" alt="" draggable="false" />
			<video class="lmp-art-video" muted autoplay loop playsinline style="display:none"></video>

			<!-- gradient overlays -->
			<div class="lmp-overlay-top"></div>
			<div class="lmp-overlay-bottom"></div>

			<!-- drag area -->
			<div class="lmp-drag"></div>

			<!-- top bar: heart (left) + quality + close (right) -->
			<button class="lmp-heart" title="Like/Unlike">${ICON_HEART_EMPTY}</button>
			<div class="lmp-topbar">
				<span class="lmp-quality" style="display:none"></span>
				<button class="lmp-close" title="Close mini player">${ICON_CLOSE}</button>
			</div>

			<!-- track info -->
			<div class="lmp-info">
				<div class="lmp-title">—</div>
				<div class="lmp-artist">—</div>
			</div>

			<!-- playback controls -->
			<div class="lmp-controls">
				<div class="lmp-progress-wrap">
					<div class="lmp-progress-fill" style="width:0%"></div>
				</div>
				<div class="lmp-btns">
					<button class="lmp-btn lmp-btn-prev" title="Previous">${ICON_PREV}</button>
					<button class="lmp-btn lmp-btn-play" title="Play/Pause">${ICON_PLAY}</button>
					<button class="lmp-btn lmp-btn-next" title="Next">${ICON_NEXT}</button>
				</div>
			</div>

			<!-- volume overlay -->
			<div class="lmp-volume-toast">
				${ICON_VOLUME}
				<span class="lmp-volume-text">100%</span>
				<div class="lmp-volume-bar-wrap">
					<div class="lmp-volume-bar-fill" style="width:100%"></div>
				</div>
			</div>

			<!-- swipe navigation hint -->
			<div class="lmp-swipe-hint"></div>

			<!-- lyrics line -->
			<div class="lmp-lyrics" style="display:none">
				<div class="lmp-lyric-line"></div>
			</div>
		`;
	}

	// ─── Event binding ────────────────────────────────────────────────────────
	private bindEvents() {
		// Close button
		this.el.querySelector(".lmp-close")!.addEventListener("click", (e) => {
			e.stopPropagation();
			this.hide();
		});

		// Prev / play-pause / next
		this.el.querySelector(".lmp-btn-prev")!.addEventListener("click", (e) => {
			e.stopPropagation();
			PlayState.previous();
		});
		this.el.querySelector(".lmp-btn-play")!.addEventListener("click", (e) => {
			e.stopPropagation();
			PlayState.playing ? PlayState.pause() : PlayState.play();
		});
		this.el.querySelector(".lmp-btn-next")!.addEventListener("click", (e) => {
			e.stopPropagation();
			PlayState.next();
		});

		// Heart / like
		this.heartEl.addEventListener("click", (e) => {
			e.stopPropagation();
			this.toggleLike();
		});

		// Progress bar – click to seek
		const progressWrap = this.el.querySelector(".lmp-progress-wrap")!;
		progressWrap.addEventListener("click", (e) => {
			e.stopPropagation();
			const rect = (progressWrap as HTMLElement).getBoundingClientRect();
			const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
			PlayState.seek(ratio * this.currentDuration);
		});

		// Scroll: vertical → volume/seek  |  horizontal → skip track (one skip per gesture)
		this.el.addEventListener("wheel", (e: WheelEvent) => {
			e.preventDefault();
			e.stopPropagation();
			const dx = e.deltaX;
			const dy = e.deltaY;
			if (Math.abs(dx) >= Math.abs(dy)) {
				this.handleHorizontalSwipe(dx);
			} else {
				this.handleVerticalScroll(dy, e.deltaMode);
			}
		}, { passive: false });

		// Drag
		const dragHandle = this.el.querySelector(".lmp-drag") as HTMLElement;
		dragHandle.addEventListener("mousedown", (e) => {
			if (e.button !== 0) return;
			this.dragging = true;
			this.dragStartX = e.clientX;
			this.dragStartY = e.clientY;
			const rect = this.el.getBoundingClientRect();
			this.dragStartRight = window.innerWidth - rect.right;
			this.dragStartBottom = window.innerHeight - rect.bottom;
			e.preventDefault();
		});
		const onMouseMove = (e: MouseEvent) => {
			if (!this.dragging) return;
			const dx = e.clientX - this.dragStartX;
			const dy = e.clientY - this.dragStartY;
			const newRight = Math.max(0, this.dragStartRight - dx);
			const newBottom = Math.max(0, this.dragStartBottom - dy);
			this.el.style.right = `${newRight}px`;
			this.el.style.bottom = `${newBottom}px`;
		};
		const onMouseUp = () => {
			if (!this.dragging) return;
			this.dragging = false;
			const rect = this.el.getBoundingClientRect();
			settings.playerRight = window.innerWidth - rect.right;
			settings.playerBottom = window.innerHeight - rect.bottom;
		};
		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", onMouseUp);
		this.playerUnloads.add(() => {
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
		});

		// Right-click context menu
		this.el.addEventListener("contextmenu", (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.showContextMenu(e.clientX, e.clientY);
		});

		// TidaLuna event hooks
		const unTrack = MediaItem.onMediaTransition(this.playerUnloads, (item: any) => this.onTrackChange(item));
		const unState = PlayState.onState(this.playerUnloads, () => this.updatePlayButton(PlayState.playing));

		this.playerUnloads.add(unTrack);
		this.playerUnloads.add(unState);

		// Kick off current track info
		void MediaItem.fromPlaybackContext().then((item: any) => {
			if (item) this.onTrackChange(item);
		});
	}

	// ─── Track change handler ─────────────────────────────────────────────────
	private async onTrackChange(item: any) {
		if (!item) return;
		this.currentTrackId = item.tidalItem?.id ?? item.id;
		this.currentDuration = item.tidalItem?.duration ?? 0;

		// Title & artist
		const title: string = item.tidalItem?.title ?? "Unknown";
		const artist: string =
			item.tidalItem?.artist?.name ??
			item.tidalItem?.artists?.map((a: any) => a.name).join(", ") ??
			"";
		this.titleEl.textContent = title;
		this.artistEl.textContent = artist;

		// Album artwork
		const album = item.tidalItem?.album;
		if (album) {
			// Try animated cover first
			const videoUrl: string | undefined = ContentBase.getAlbumCoverUrl(album, { type: "video", fallback: false });
			if (videoUrl) {
				this.artVideo.style.display = "";
				this.artImg.style.opacity = "0";
				if (this.artVideo.src !== videoUrl) {
					this.artVideo.src = videoUrl;
					await this.artVideo.play().catch(() => {});
				}
			} else {
				this.artVideo.style.display = "none";
				this.artImg.style.opacity = "1";
			}
			const imageUrl: string | undefined = ContentBase.getAlbumCoverUrl(album, { res: "640" });
			if (imageUrl && this.artImg.src !== imageUrl) {
				this.artImg.style.opacity = "0";
				this.artImg.src = imageUrl;
				this.artImg.onload = () => {
					this.artImg.style.opacity = videoUrl ? "0" : "1";
				};
			}

			// Apply vibrant colour as accent
			if (album.vibrantColor) {
				this.progressFill.style.background = album.vibrantColor;
			} else {
				this.progressFill.style.background = "#fff";
			}
		}

		// Quality pill
		this.updateQualityPill(item);

		// Like state
		this.updateLikeState();

		// Lyrics
		this.loadLyrics();
	}

	// ─── Quality pill ─────────────────────────────────────────────────────────
	private updateQualityPill(item: any) {
		if (!settings.showQualityPill) {
			this.qualityEl.style.display = "none";
			return;
		}
		const ctx = PlayState.playbackContext;
		const aq = ctx?.actualAudioQuality ?? item.tidalItem?.audioQuality;
		const q = Quality.fromAudioQuality(aq);
		if (q) {
			this.qualityEl.textContent = q.name;
			this.qualityEl.style.color = q.color;
			this.qualityEl.style.display = "";
		} else {
			this.qualityEl.style.display = "none";
		}
	}

	// ─── Play button state ────────────────────────────────────────────────────
	private updatePlayButton(isPlaying: boolean) {
		this.playBtn.innerHTML = isPlaying ? ICON_PAUSE : ICON_PLAY;
	}

	// ─── Progress loop ────────────────────────────────────────────────────────
	private startProgressLoop() {
		const tick = () => {
			if (!this.currentDuration) {
				this.progressFill.style.width = "0%";
				this.progressFill.style.transition = "none";
			} else {
				const pct = Math.min(100, (PlayState.playTime / this.currentDuration) * 100);
				this.progressFill.style.transition = "width .5s linear";
				this.progressFill.style.width = `${pct}%`;
			}
		};
		this.progressTimeout = setInterval(tick, 500) as unknown as ReturnType<typeof setTimeout>;
		this.playerUnloads.add(() => {
			if (this.progressTimeout != null) clearInterval(this.progressTimeout);
		});
	}

	// ─── Volume control ───────────────────────────────────────────────────────
	private adjustVolume(delta: number) {
		const current: number = PlayState.playbackControls?.volume ?? 100;
		const next = Math.max(0, Math.min(100, current + delta));
		// Dispatch Redux action – the action name may vary; this is the standard Luna one
		try {
			redux.actions["playbackControls/SET_VOLUME"](next);
		} catch {
			// Fallback: try to set volume on the active audio element
			const audio = document.querySelector<HTMLAudioElement>("audio");
			if (audio) audio.volume = next / 100;
		}
		this.updateVolumeFeedback(next, true);
	}

	private updateVolumeFeedback(vol: number, show: boolean) {
		this.volumeText.textContent = `${Math.round(vol)}%`;
		this.volumeBarFill.style.width = `${vol}%`;
		if (show) {
			this.volumeToast.classList.add("visible");
			if (this.volumeTimeout != null) clearTimeout(this.volumeTimeout);
			this.volumeTimeout = setTimeout(() => {
				this.volumeToast.classList.remove("visible");
			}, 1200);
		}
	}

	// ─── Horizontal swipe helpers ─────────────────────────────────────────────
	/**
	 * Accumulate horizontal wheel delta and fire a single track-skip action once
	 * the SWIPE_THRESHOLD is exceeded, then lock out further fires until the user
	 * lifts (300 ms of scroll inactivity resets the gesture).  A ◀/▶ arrow
	 * overlay is shown with opacity proportional to progress toward the threshold.
	 */
	private handleHorizontalSwipe(dx: number) {
		// Restart the inactivity reset timer on every event
		if (this.swipeResetTimer != null) clearTimeout(this.swipeResetTimer);

		this.swipeAccumX += dx;
		const progress = Math.min(1, Math.abs(this.swipeAccumX) / MiniPlayer.SWIPE_THRESHOLD);
		const dir: "next" | "prev" = this.swipeAccumX > 0 ? "next" : "prev";

		if (!this.swipeFired) {
			this.showSwipeHint(dir, progress);
			if (Math.abs(this.swipeAccumX) >= MiniPlayer.SWIPE_THRESHOLD) {
				// Fire exactly once per gesture
				this.swipeFired = true;
				this.showSwipeHint(dir, 1.0);
				if (this.swipeAccumX > 0) {
					PlayState.next();
				} else {
					PlayState.previous();
				}
			}
		}

		// Reset gesture state after 300 ms of no scroll events
		this.swipeResetTimer = setTimeout(() => {
			this.swipeAccumX = 0;
			this.swipeFired = false;
			this.swipeResetTimer = null;
			this.hideSwipeHint();
		}, 300);
	}

	/**
	 * Handle a vertical scroll event for volume or seek.
	 * @param dy    - Raw wheel deltaY (pixels or lines depending on `mode`).
	 * @param mode  - WheelEvent.deltaMode: 0 = pixels (trackpad / Chrome mouse),
	 *                1 = lines (Firefox / Linux mouse wheel), 2 = pages (rare).
	 *
	 * For pixel mode the delta is accumulated in a 25 px bucket; each time the
	 * bucket fills, exactly one step is fired and the bucket is hard-reset to
	 * avoid double-firing (a single mouse-wheel notch of ~120 px fires once).
	 * For line mode each event is treated as exactly one step immediately.
	 */
	private handleVerticalScroll(dy: number, mode: number) {
		// deltaMode 1 = lines (discrete mouse wheel on Firefox/Linux): 1 event = 1 step
		if (mode === 1) {
			if (settings.scrollAction === "volume") {
				this.adjustVolume(-Math.sign(dy) * MiniPlayer.VOL_STEP);
			} else {
				PlayState.seek(Math.max(0, PlayState.playTime + (-Math.sign(dy) * MiniPlayer.SEEK_STEP_SECONDS)));
			}
			return;
		}
		// deltaMode 0 = pixels (trackpad / smooth scroll / mouse wheel on Chrome):
		// accumulate into 25 px buckets so one mouse-wheel notch (deltaY≈120) fires
		// exactly 1 step and a slow trackpad scroll requires several events.
		this.volAccumY += dy;
		if (Math.abs(this.volAccumY) >= 25) {
			const sign = Math.sign(this.volAccumY);
			this.volAccumY = 0; // hard-reset to avoid double-firing
			if (settings.scrollAction === "volume") {
				this.adjustVolume(-sign * MiniPlayer.VOL_STEP);
			} else {
				PlayState.seek(Math.max(0, PlayState.playTime + (-sign * MiniPlayer.SEEK_STEP_SECONDS)));
			}
		}
	}

	private showSwipeHint(dir: "next" | "prev", progress: number) {
		if (!this.swipeHintEl) return;
		this.swipeHintEl.className = `lmp-swipe-hint lmp-swipe-${dir}`;
		this.swipeHintEl.textContent = dir === "next" ? "▶" : "◀";
		this.swipeHintEl.style.opacity = String(Math.min(0.95, progress * 0.8 + 0.15));
	}

	private hideSwipeHint() {
		if (!this.swipeHintEl) return;
		this.swipeHintEl.style.opacity = "0";
		this.swipeHintEl.className = "lmp-swipe-hint";
	}

	// ─── Like / favorite ──────────────────────────────────────────────────────
	/**
	 * Returns the current user's favourite track IDs by probing multiple Redux
	 * state paths, covering different Tidal / TidaLuna versions.
	 */
	private getFavTracks(): (string | number)[] {
		const state = redux.store?.getState() as any;
		// Try multiple Redux state paths used in different Tidal versions
		return (
			state?.favorites?.tracks ??
			state?.userCollection?.favoriteTracks?.ids ??
			state?.user?.favorites?.tracks ??
			[]
		);
	}

	private updateLikeState() {
		if (this.currentTrackId === undefined) return;
		const isLiked = this.getFavTracks().some((id) => String(id) === String(this.currentTrackId));
		this.heartEl.innerHTML = isLiked ? ICON_HEART_FILLED : ICON_HEART_EMPTY;
		this.heartEl.classList.toggle("liked", isLiked);
	}

	private toggleLike() {
		if (this.currentTrackId === undefined) return;
		const isLiked = this.getFavTracks().some((id) => String(id) === String(this.currentTrackId));

		// Optimistic UI update – show new state immediately
		const optimisticLiked = !isLiked;
		this.heartEl.innerHTML = optimisticLiked ? ICON_HEART_FILLED : ICON_HEART_EMPTY;
		this.heartEl.classList.toggle("liked", optimisticLiked);

		const payload = { ids: [this.currentTrackId], type: "TRACK" };
		const addNames = ["favorites/ADD_FAVORITES", "favorites/addFavorite", "favorites/add"];
		const removeNames = ["favorites/REMOVE_FAVORITES", "favorites/removeFavorite", "favorites/remove"];
		const candidates = isLiked ? removeNames : addNames;

		let dispatched = false;
		for (const name of candidates) {
			try {
				if (typeof redux.actions?.[name] === "function") {
					redux.actions[name](payload);
					dispatched = true;
					break;
				}
			} catch { /* try next */ }
		}

		if (!dispatched) {
			trace.warn("Could not toggle favourite – no compatible action found.");
			// Revert optimistic update
			this.heartEl.innerHTML = isLiked ? ICON_HEART_FILLED : ICON_HEART_EMPTY;
			this.heartEl.classList.toggle("liked", isLiked);
		}

		// Re-sync with ground truth after Redux has processed
		setTimeout(() => this.updateLikeState(), 500);
	}

	// ─── Lyrics ───────────────────────────────────────────────────────────────
	private loadLyrics() {
		// Cancel any pending retry from a previous track
		if (this.lyricsRetryTimer != null) {
			clearTimeout(this.lyricsRetryTimer);
			this.lyricsRetryTimer = null;
		}
		this.lyricsLines = null;
		this.stopLyricsInterval();

		const lyricsContainer = this.el.querySelector(".lmp-lyrics") as HTMLElement;

		if (settings.lyricsMode === "off") {
			lyricsContainer.style.display = "none";
			this.el.classList.remove("lmp-has-lyrics");
			return;
		}

		if (!this.currentTrackId) return;
		this.lyricsTrackId = this.currentTrackId;
		this.tryLoadLyricsFromState(0);
	}

	/**
	 * Attempt to parse lyrics from the Redux store.
	 * If not yet available, schedules up to 3 retries with increasing delays
	 * (1.5 s / 3 s / 5 s) so lyrics loaded asynchronously by Tidal are picked up.
	 */
	private tryLoadLyricsFromState(attempt: number) {
		// Abort if the track changed since we started
		if (this.lyricsTrackId !== this.currentTrackId) return;
		if (settings.lyricsMode === "off") return;

		const trackId = this.currentTrackId;
		if (!trackId) return;

		const lyricsContainer = this.el.querySelector(".lmp-lyrics") as HTMLElement;
		const state = redux.store?.getState() as any;
		const id = String(trackId);

		// Probe multiple Redux state paths used across different Tidal/TidaLuna versions
		const lyricsEntry =
			state?.content?.lyrics?.[id] ??
			state?.content?.lyrics?.[trackId] ??
			state?.lyrics?.[id] ??
			state?.lyrics?.[trackId] ??
			state?.player?.lyrics;

		const subtitles: string | undefined =
			lyricsEntry?.subtitles ??
			lyricsEntry?.lyrics ??
			lyricsEntry?.text;

		const lines = parseLrc(subtitles);
		if (lines && lines.length > 0) {
			this.lyricsLines = lines;
			lyricsContainer.style.display = "";
			this.el.classList.add("lmp-has-lyrics");
			this.startLyricsInterval();
			return;
		}

		// Not found yet – hide and maybe retry
		lyricsContainer.style.display = "none";
		this.el.classList.remove("lmp-has-lyrics");

		const retryDelays = [1500, 3000, 5000];
		if (attempt < retryDelays.length) {
			this.lyricsRetryTimer = setTimeout(() => {
				this.lyricsRetryTimer = null;
				this.tryLoadLyricsFromState(attempt + 1);
			}, retryDelays[attempt]);
		}
	}

	private startLyricsInterval() {
		this.lyricsInterval = setInterval(() => {
			if (!this.lyricsLines) return;
			const idx = currentLyricIndex(this.lyricsLines, PlayState.playTime);
			const text = this.lyricsLines[idx]?.text ?? "";
			if (this.lyricsEl.textContent !== text) {
				this.lyricsEl.style.opacity = "0";
				setTimeout(() => {
					this.lyricsEl.textContent = text;
					this.lyricsEl.style.opacity = "1";
				}, 150);
			}
		}, 200);
		this.playerUnloads.add(() => this.stopLyricsInterval());
	}

	private stopLyricsInterval() {
		if (this.lyricsInterval != null) {
			clearInterval(this.lyricsInterval);
			this.lyricsInterval = null;
		}
	}

	// ─── Context (right-click) menu ───────────────────────────────────────────
	private showContextMenu(x: number, y: number) {
		// Remove any existing menu
		document.querySelector(".lmp-ctx-menu")?.remove();

		const menu = document.createElement("div");
		menu.className = "lmp-ctx-menu";

		const makeItem = (label: string, checked: boolean | null, onClick: () => void) => {
			const item = document.createElement("div");
			item.className = "lmp-ctx-item";
			item.innerHTML = `<span class="lmp-ctx-label">${label}</span>${checked !== null ? `<span class="lmp-ctx-check">${checked ? "✓" : ""}</span>` : ""}`;
			item.addEventListener("click", () => {
				onClick();
				menu.remove();
			});
			return item;
		};
		const makeSep = () => {
			const s = document.createElement("div");
			s.className = "lmp-ctx-separator";
			return s;
		};

		menu.appendChild(makeItem("Quality badge", settings.showQualityPill, () => {
			settings.showQualityPill = !settings.showQualityPill;
			this.updateQualityPill({ tidalItem: PlayState.playbackControls?.playbackContext });
		}));

		menu.appendChild(makeSep());

		menu.appendChild(makeItem("Lyrics: off", settings.lyricsMode === "off", () => {
			settings.lyricsMode = "off";
			this.loadLyrics();
		}));
		menu.appendChild(makeItem("Lyrics: line", settings.lyricsMode === "line", () => {
			settings.lyricsMode = "line";
			this.loadLyrics();
		}));

		menu.appendChild(makeSep());

		menu.appendChild(makeItem("Scroll: volume", settings.scrollAction === "volume", () => {
			settings.scrollAction = "volume";
		}));
		menu.appendChild(makeItem("Scroll: seek", settings.scrollAction === "seek", () => {
			settings.scrollAction = "seek";
		}));

		menu.appendChild(makeSep());

		menu.appendChild(makeItem("Close mini player", null, () => this.hide()));

		// Position the menu, keeping it in viewport
		document.body.appendChild(menu);
		const rect = menu.getBoundingClientRect();
		menu.style.left = `${Math.min(x, window.innerWidth - rect.width - 8)}px`;
		menu.style.top = `${Math.min(y, window.innerHeight - rect.height - 8)}px`;

		// Close on any outside click
		const close = (e: MouseEvent) => {
			if (!menu.contains(e.target as Node)) {
				menu.remove();
				document.removeEventListener("mousedown", close, true);
			}
		};
		document.addEventListener("mousedown", close, true);
	}

	// ─── Show / hide ──────────────────────────────────────────────────────────
	public show() {
		this.el.style.display = "";
		this.onVisibilityChange.forEach(fn => fn(true));
	}

	public hide() {
		this.el.style.display = "none";
		this.onVisibilityChange.forEach(fn => fn(false));
	}

	public get isVisible() {
		return this.el.style.display !== "none";
	}

	// ─── Cleanup ──────────────────────────────────────────────────────────────
	public destroy() {
		this.el.remove();
		this.stopLyricsInterval();
		if (this.progressTimeout != null) clearInterval(this.progressTimeout);
		if (this.volumeTimeout != null) clearTimeout(this.volumeTimeout);
		if (this.swipeResetTimer != null) clearTimeout(this.swipeResetTimer);
		if (this.lyricsRetryTimer != null) clearTimeout(this.lyricsRetryTimer);
	}
}

// ─── Playback-bar toggle button ──────────────────────────────────────────────
/**
 * Inject a mini-player toggle button into Tidal's native footer playback bar.
 * Returns a cleanup function that removes the button and stops the observer.
 */
function mountPlaybackBarButton(player: MiniPlayer): () => void {
	const BTN_ID = "lmp-bar-btn";
	document.getElementById(BTN_ID)?.remove();

	const btn = document.createElement("button");
	btn.id = BTN_ID;
	btn.className = "lmp-toggle-btn";
	btn.title = "Toggle Mini Player";
	btn.setAttribute("aria-label", "Toggle Mini Player");
	btn.innerHTML = ICON_PIP;

	const syncActive = (visible: boolean) =>
		btn.classList.toggle("lmp-active", visible);
	syncActive(player.isVisible);

	btn.addEventListener("click", () => {
		if (player.isVisible) {
			player.hide();
		} else {
			player.show();
		}
	});

	player.onVisibilityChange.add(syncActive);

	// Ordered candidate selectors for the right-side controls of Tidal's footer bar.
	// Tidal uses obfuscated-but-readable class names so we match on substrings.
	const FOOTER_SELECTORS = [
		'[class*="footerPlayer"] [class*="rightColumn"]',
		'[class*="footerPlayer"] [class*="rightSection"]',
		'[class*="footerPlayer"] [class*="right"]',
		'[class*="playbackControls"] [class*="right"]',
		'[class*="footerPlayer"]',
		"footer",
	];

	let injected = false;
	const tryInject = () => {
		if (injected && document.getElementById(BTN_ID)) return;
		injected = false;
		for (const sel of FOOTER_SELECTORS) {
			const container = document.querySelector(sel);
			if (container) {
				container.appendChild(btn);
				injected = true;
				return;
			}
		}
	};

	tryInject();

	// Re-inject if Tidal's SPA re-renders the footer
	const obs = new MutationObserver(tryInject);
	obs.observe(document.body, { childList: true, subtree: true });

	return () => {
		obs.disconnect();
		btn.remove();
		player.onVisibilityChange.delete(syncActive);
	};
}

// ─── Fullscreen-player toggle button ─────────────────────────────────────────
/**
 * Inject a mini-player toggle button into Tidal's fullscreen / Now-Playing view.
 * Uses the same logic as mountPlaybackBarButton but targets the fullscreen player.
 * Returns a cleanup function.
 */
function mountFullscreenButton(player: MiniPlayer): () => void {
	const BTN_ID = "lmp-fs-btn";
	document.getElementById(BTN_ID)?.remove();

	const btn = document.createElement("button");
	btn.id = BTN_ID;
	btn.className = "lmp-toggle-btn";
	btn.title = "Toggle Mini Player";
	btn.setAttribute("aria-label", "Toggle Mini Player");
	btn.innerHTML = ICON_PIP;

	const syncActive = (visible: boolean) =>
		btn.classList.toggle("lmp-active", visible);
	syncActive(player.isVisible);

	btn.addEventListener("click", () => {
		if (player.isVisible) {
			player.hide();
		} else {
			player.show();
		}
	});

	player.onVisibilityChange.add(syncActive);

	// Candidate selectors for Tidal's fullscreen / Now-Playing view controls.
	// Multiple variants are listed to cover different Tidal versions.
	const FULLSCREEN_SELECTORS = [
		// Fullscreen player top-right or controls bar
		'[class*="fullscreenPlayer"] [class*="rightSection"]',
		'[class*="fullscreenPlayer"] [class*="rightControls"]',
		'[class*="fullscreenPlayer"] [class*="topBar"]',
		'[class*="fullscreenPlayer"] [class*="controls"]',
		'[class*="fullscreenPlayer"] [class*="buttons"]',
		'[class*="fullscreenPlayer"]',
		// Video / animated cover player
		'[class*="videoPlayer"] [class*="controls"]',
		'[class*="videoPlayer"]',
		// Now-playing / NPV view
		'[class*="nowPlayingView"] [class*="controls"]',
		'[class*="nowPlayingView"] [class*="topActions"]',
		'[class*="nowPlayingView"]',
		'[class*="npv"] [class*="controls"]',
		'[class*="npv"]',
	];

	let injected = false;
	const tryInject = () => {
		if (injected && document.getElementById(BTN_ID)) return;
		injected = false;
		for (const sel of FULLSCREEN_SELECTORS) {
			const container = document.querySelector(sel);
			if (container) {
				container.appendChild(btn);
				injected = true;
				return;
			}
		}
	};

	tryInject();

	// Re-inject when Tidal's SPA navigates into / out of the fullscreen view
	const obs = new MutationObserver(tryInject);
	obs.observe(document.body, { childList: true, subtree: true });

	return () => {
		obs.disconnect();
		btn.remove();
		player.onVisibilityChange.delete(syncActive);
	};
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────
const styleTag = new StyleTag("luna-mini-player-styles", unloads, CSS);

// Wait for document body to be available (Luna loads early)
const init = async () => {
	await new Promise<void>((resolve) => {
		if (document.body) return resolve();
		const obs = new MutationObserver(() => {
			if (document.body) {
				obs.disconnect();
				resolve();
			}
		});
		obs.observe(document.documentElement, { childList: true });
	});

	const player = new MiniPlayer(unloads);
	unloads.add(() => player.destroy());

	// Inject a toggle button into Tidal's native footer playback bar
	unloads.add(mountPlaybackBarButton(player));

	// Inject a toggle button into Tidal's fullscreen / Now-Playing view
	unloads.add(mountFullscreenButton(player));

	// Register a context menu button in Tidal's right-click menu
	// so the user can re-open the player via the profile menu
	const btn = ContextMenu.addButton(unloads);
	btn.text = "Mini Player";
	btn.onClick(() => {
		if (player.isVisible) {
			player.hide();
		} else {
			player.show();
		}
	});

	ContextMenu.onOpen(unloads, async ({ event, contextMenu }: { event: any; contextMenu: Element }) => {
		if (event.type === "USER_PROFILE") {
			await btn.show(contextMenu);
		}
	});
};

init().catch((err) => {
	trace.err.withContext("init")(err);
});
