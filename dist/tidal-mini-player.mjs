var h=(typeof luna<"u"&&luna?.core?.modules?.["@luna/core"])??{},k=h.Tracer,S=h.ReactiveStore,U=h.ftch,$=h.interceptors,j=h.buildActions,X=h.reduxStore,Q=h.findModuleByProperty;var d=(typeof luna<"u"&&luna?.core?.modules?.["@luna/lib"])??{},c=d.PlayState,x=d.MediaItem,W=d.MediaItems,M=d.StyleTag,w=d.ContentBase,K=d.Album,G=d.Artist,C=d.Quality,T=d.ContextMenu,J=d.Playlist,Z=d.Tidal,tt=d.observe,et=d.observePromise,it=d.getPlaybackInfo,rt=d.parseDate,st=d.safeTimeout,v=d.redux,lt=d.ipcRenderer,nt=d.errSignal,ot=d.unloads;function I(s){if(!s)return null;let t=[],e=/\[(\d{1,2}):(\d{2})[.:](\d{1,3})\]\s*(.*)/g,i,l=!1;for(;(i=e.exec(s))!==null;){l=!0;let o=parseInt(i[1],10),a=parseInt(i[2],10),r=parseInt(i[3].padEnd(3,"0"),10),n=o*60+a+r/1e3,p=i[4].trim();p&&t.push({time:n,text:p})}return l?(t.sort((o,a)=>o.time-a.time),t):null}function P(s,t){let e=0;for(let i=0;i<s.length&&s[i].time<=t;i++)e=i;return e}var y=new Set,{trace:R,errSignal:gt}=k("[MiniPlayer]"),u=await S.getPluginStorage("MiniPlayer",{showQualityPill:!0,lyricsMode:"line",scrollAction:"volume",playerRight:20,playerBottom:20}),A=`
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

/* \u2500\u2500 artwork layer \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

/* \u2500\u2500 gradient overlays \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

/* \u2500\u2500 drag handle \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
#luna-mini-player .lmp-drag {
	position: absolute;
	inset: 0 0 auto 0;
	height: 44px;
	cursor: move;
}

/* \u2500\u2500 top-right meta (quality + close) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

/* \u2500\u2500 track info \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

/* \u2500\u2500 controls \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

/* \u2500\u2500 progress bar \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

/* \u2500\u2500 heart (like) button \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

/* \u2500\u2500 volume feedback \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

/* \u2500\u2500 lyrics \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

/* \u2500\u2500 swipe navigation hint \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

/* \u2500\u2500 context menu \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

/* \u2500\u2500 playback bar / full-screen player toggle button \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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
`,m=(s,t="0 0 24 24",e=20)=>`<svg width="${e}" height="${e}" viewBox="${t}" fill="currentColor" xmlns="http://www.w3.org/2000/svg">${s}</svg>`,B=m('<path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6L9.5 12z"/>'),q=m('<path d="M6 18l8.5-6L6 6v12zm10.5-12v12h2V6h-2z"/>'),H=m('<path d="M8 5v14l11-7L8 5z"/>'),F=m('<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'),b=m('<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill-opacity=".3"/><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="currentColor" stroke-width="1.5"/>',"0 0 24 24",18),E=m('<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',"0 0 24 24",18),O='<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M9 1L5 5l4 4-1 1-4-4-4 4-1-1 4-4-4-4 1-1 4 4 4-4 1 1z"/></svg>',z=m('<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>',"0 0 24 24",22),V=m('<path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3C1.9 3 1 3.88 1 4.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z"/>',"0 0 24 24",20),L=class s{constructor(t){this.playerUnloads=t;this.el=document.createElement("div"),this.el.id="luna-mini-player",this.el.style.right=`${u.playerRight}px`,this.el.style.bottom=`${u.playerBottom}px`,this.el.innerHTML=this.buildHTML(),this.artImg=this.el.querySelector(".lmp-art"),this.artVideo=this.el.querySelector(".lmp-art-video"),this.titleEl=this.el.querySelector(".lmp-title"),this.artistEl=this.el.querySelector(".lmp-artist"),this.heartEl=this.el.querySelector(".lmp-heart"),this.qualityEl=this.el.querySelector(".lmp-quality"),this.progressFill=this.el.querySelector(".lmp-progress-fill"),this.playBtn=this.el.querySelector(".lmp-btn-play"),this.volumeToast=this.el.querySelector(".lmp-volume-toast"),this.volumeText=this.el.querySelector(".lmp-volume-text"),this.volumeBarFill=this.el.querySelector(".lmp-volume-bar-fill"),this.lyricsEl=this.el.querySelector(".lmp-lyric-line"),this.swipeHintEl=this.el.querySelector(".lmp-swipe-hint"),document.body.appendChild(this.el),this.bindEvents(),this.startProgressLoop(),this.updatePlayButton(c.playing),this.updateVolumeFeedback(c.playbackControls?.volume??100,!1)}el;artImg;artVideo;titleEl;artistEl;heartEl;qualityEl;progressFill;playBtn;volumeToast;volumeText;volumeBarFill;lyricsEl;onVisibilityChange=new Set;currentTrackId;currentDuration=0;volumeTimeout=null;progressTimeout=null;lyricsLines=null;lyricsInterval=null;dragging=!1;dragStartX=0;dragStartY=0;dragStartRight=0;dragStartBottom=0;swipeAccumX=0;swipeFired=!1;swipeResetTimer=null;swipeHintEl=null;volAccumY=0;lyricsRetryTimer=null;lyricsTrackId;static SWIPE_THRESHOLD=80;static VOL_STEP=5;static SEEK_STEP_SECONDS=5;buildHTML(){return`
			<!-- artwork -->
			<img class="lmp-art" src="" alt="" draggable="false" />
			<video class="lmp-art-video" muted autoplay loop playsinline style="display:none"></video>

			<!-- gradient overlays -->
			<div class="lmp-overlay-top"></div>
			<div class="lmp-overlay-bottom"></div>

			<!-- drag area -->
			<div class="lmp-drag"></div>

			<!-- top bar: heart (left) + quality + close (right) -->
			<button class="lmp-heart" title="Like/Unlike">${b}</button>
			<div class="lmp-topbar">
				<span class="lmp-quality" style="display:none"></span>
				<button class="lmp-close" title="Close mini player">${O}</button>
			</div>

			<!-- track info -->
			<div class="lmp-info">
				<div class="lmp-title">\u2014</div>
				<div class="lmp-artist">\u2014</div>
			</div>

			<!-- playback controls -->
			<div class="lmp-controls">
				<div class="lmp-progress-wrap">
					<div class="lmp-progress-fill" style="width:0%"></div>
				</div>
				<div class="lmp-btns">
					<button class="lmp-btn lmp-btn-prev" title="Previous">${B}</button>
					<button class="lmp-btn lmp-btn-play" title="Play/Pause">${H}</button>
					<button class="lmp-btn lmp-btn-next" title="Next">${q}</button>
				</div>
			</div>

			<!-- volume overlay -->
			<div class="lmp-volume-toast">
				${z}
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
		`}bindEvents(){this.el.querySelector(".lmp-close").addEventListener("click",r=>{r.stopPropagation(),this.hide()}),this.el.querySelector(".lmp-btn-prev").addEventListener("click",r=>{r.stopPropagation(),c.previous()}),this.el.querySelector(".lmp-btn-play").addEventListener("click",r=>{r.stopPropagation(),c.playing?c.pause():c.play()}),this.el.querySelector(".lmp-btn-next").addEventListener("click",r=>{r.stopPropagation(),c.next()}),this.heartEl.addEventListener("click",r=>{r.stopPropagation(),this.toggleLike()});let t=this.el.querySelector(".lmp-progress-wrap");t.addEventListener("click",r=>{r.stopPropagation();let n=t.getBoundingClientRect(),p=Math.max(0,Math.min(1,(r.clientX-n.left)/n.width));c.seek(p*this.currentDuration)}),this.el.addEventListener("wheel",r=>{r.preventDefault(),r.stopPropagation();let n=r.deltaX,p=r.deltaY;Math.abs(n)>=Math.abs(p)?this.handleHorizontalSwipe(n):this.handleVerticalScroll(p,r.deltaMode)},{passive:!1}),this.el.querySelector(".lmp-drag").addEventListener("mousedown",r=>{if(r.button!==0)return;this.dragging=!0,this.dragStartX=r.clientX,this.dragStartY=r.clientY;let n=this.el.getBoundingClientRect();this.dragStartRight=window.innerWidth-n.right,this.dragStartBottom=window.innerHeight-n.bottom,r.preventDefault()});let i=r=>{if(!this.dragging)return;let n=r.clientX-this.dragStartX,p=r.clientY-this.dragStartY,f=Math.max(0,this.dragStartRight-n),g=Math.max(0,this.dragStartBottom-p);this.el.style.right=`${f}px`,this.el.style.bottom=`${g}px`},l=()=>{if(!this.dragging)return;this.dragging=!1;let r=this.el.getBoundingClientRect();u.playerRight=window.innerWidth-r.right,u.playerBottom=window.innerHeight-r.bottom};document.addEventListener("mousemove",i),document.addEventListener("mouseup",l),this.playerUnloads.add(()=>{document.removeEventListener("mousemove",i),document.removeEventListener("mouseup",l)}),this.el.addEventListener("contextmenu",r=>{r.preventDefault(),r.stopPropagation(),this.showContextMenu(r.clientX,r.clientY)});let o=x.onMediaTransition(this.playerUnloads,r=>this.onTrackChange(r)),a=c.onState(this.playerUnloads,()=>this.updatePlayButton(c.playing));this.playerUnloads.add(o),this.playerUnloads.add(a),x.fromPlaybackContext().then(r=>{r&&this.onTrackChange(r)})}async onTrackChange(t){if(!t)return;this.currentTrackId=t.tidalItem?.id??t.id,this.currentDuration=t.tidalItem?.duration??0;let e=t.tidalItem?.title??"Unknown",i=t.tidalItem?.artist?.name??t.tidalItem?.artists?.map(o=>o.name).join(", ")??"";this.titleEl.textContent=e,this.artistEl.textContent=i;let l=t.tidalItem?.album;if(l){let o=w.getAlbumCoverUrl(l,{type:"video",fallback:!1});o?(this.artVideo.style.display="",this.artImg.style.opacity="0",this.artVideo.src!==o&&(this.artVideo.src=o,await this.artVideo.play().catch(()=>{}))):(this.artVideo.style.display="none",this.artImg.style.opacity="1");let a=w.getAlbumCoverUrl(l,{res:"640"});a&&this.artImg.src!==a&&(this.artImg.style.opacity="0",this.artImg.src=a,this.artImg.onload=()=>{this.artImg.style.opacity=o?"0":"1"}),l.vibrantColor?this.progressFill.style.background=l.vibrantColor:this.progressFill.style.background="#fff"}this.updateQualityPill(t),this.updateLikeState(),this.loadLyrics()}updateQualityPill(t){if(!u.showQualityPill){this.qualityEl.style.display="none";return}let i=c.playbackContext?.actualAudioQuality??t.tidalItem?.audioQuality,l=C.fromAudioQuality(i);l?(this.qualityEl.textContent=l.name,this.qualityEl.style.color=l.color,this.qualityEl.style.display=""):this.qualityEl.style.display="none"}updatePlayButton(t){this.playBtn.innerHTML=t?F:H}startProgressLoop(){let t=()=>{if(!this.currentDuration)this.progressFill.style.width="0%",this.progressFill.style.transition="none";else{let e=Math.min(100,c.playTime/this.currentDuration*100);this.progressFill.style.transition="width .5s linear",this.progressFill.style.width=`${e}%`}};this.progressTimeout=setInterval(t,500),this.playerUnloads.add(()=>{this.progressTimeout!=null&&clearInterval(this.progressTimeout)})}adjustVolume(t){let e=c.playbackControls?.volume??100,i=Math.max(0,Math.min(100,e+t));try{v.actions["playbackControls/SET_VOLUME"](i)}catch{let l=document.querySelector("audio");l&&(l.volume=i/100)}this.updateVolumeFeedback(i,!0)}updateVolumeFeedback(t,e){this.volumeText.textContent=`${Math.round(t)}%`,this.volumeBarFill.style.width=`${t}%`,e&&(this.volumeToast.classList.add("visible"),this.volumeTimeout!=null&&clearTimeout(this.volumeTimeout),this.volumeTimeout=setTimeout(()=>{this.volumeToast.classList.remove("visible")},1200))}handleHorizontalSwipe(t){this.swipeResetTimer!=null&&clearTimeout(this.swipeResetTimer),this.swipeAccumX+=t;let e=Math.min(1,Math.abs(this.swipeAccumX)/s.SWIPE_THRESHOLD),i=this.swipeAccumX>0?"next":"prev";this.swipeFired||(this.showSwipeHint(i,e),Math.abs(this.swipeAccumX)>=s.SWIPE_THRESHOLD&&(this.swipeFired=!0,this.showSwipeHint(i,1),this.swipeAccumX>0?c.next():c.previous())),this.swipeResetTimer=setTimeout(()=>{this.swipeAccumX=0,this.swipeFired=!1,this.swipeResetTimer=null,this.hideSwipeHint()},300)}handleVerticalScroll(t,e){if(e===1){u.scrollAction==="volume"?this.adjustVolume(-Math.sign(t)*s.VOL_STEP):c.seek(Math.max(0,c.playTime+-Math.sign(t)*s.SEEK_STEP_SECONDS));return}if(this.volAccumY+=t,Math.abs(this.volAccumY)>=25){let i=Math.sign(this.volAccumY);this.volAccumY=0,u.scrollAction==="volume"?this.adjustVolume(-i*s.VOL_STEP):c.seek(Math.max(0,c.playTime+-i*s.SEEK_STEP_SECONDS))}}showSwipeHint(t,e){this.swipeHintEl&&(this.swipeHintEl.className=`lmp-swipe-hint lmp-swipe-${t}`,this.swipeHintEl.textContent=t==="next"?"\u25B6":"\u25C0",this.swipeHintEl.style.opacity=String(Math.min(.95,e*.8+.15)))}hideSwipeHint(){this.swipeHintEl&&(this.swipeHintEl.style.opacity="0",this.swipeHintEl.className="lmp-swipe-hint")}getFavTracks(){let t=v.store?.getState();return t?.favorites?.tracks??t?.userCollection?.favoriteTracks?.ids??t?.user?.favorites?.tracks??[]}updateLikeState(){if(this.currentTrackId===void 0)return;let t=this.getFavTracks().some(e=>String(e)===String(this.currentTrackId));this.heartEl.innerHTML=t?E:b,this.heartEl.classList.toggle("liked",t)}toggleLike(){if(this.currentTrackId===void 0)return;let t=this.getFavTracks().some(n=>String(n)===String(this.currentTrackId)),e=!t;this.heartEl.innerHTML=e?E:b,this.heartEl.classList.toggle("liked",e);let i={ids:[this.currentTrackId],type:"TRACK"},a=t?["favorites/REMOVE_FAVORITES","favorites/removeFavorite","favorites/remove"]:["favorites/ADD_FAVORITES","favorites/addFavorite","favorites/add"],r=!1;for(let n of a)try{if(typeof v.actions?.[n]=="function"){v.actions[n](i),r=!0;break}}catch{}r||(R.warn("Could not toggle favourite \u2013 no compatible action found."),this.heartEl.innerHTML=t?E:b,this.heartEl.classList.toggle("liked",t)),setTimeout(()=>this.updateLikeState(),500)}loadLyrics(){this.lyricsRetryTimer!=null&&(clearTimeout(this.lyricsRetryTimer),this.lyricsRetryTimer=null),this.lyricsLines=null,this.stopLyricsInterval();let t=this.el.querySelector(".lmp-lyrics");if(u.lyricsMode==="off"){t.style.display="none",this.el.classList.remove("lmp-has-lyrics");return}this.currentTrackId&&(this.lyricsTrackId=this.currentTrackId,this.tryLoadLyricsFromState(0))}tryLoadLyricsFromState(t){if(this.lyricsTrackId!==this.currentTrackId||u.lyricsMode==="off")return;let e=this.currentTrackId;if(!e)return;let i=this.el.querySelector(".lmp-lyrics"),l=v.store?.getState(),o=String(e),a=l?.content?.lyrics?.[o]??l?.content?.lyrics?.[e]??l?.lyrics?.[o]??l?.lyrics?.[e]??l?.player?.lyrics,r=a?.subtitles??a?.lyrics??a?.text,n=I(r);if(n&&n.length>0){this.lyricsLines=n,i.style.display="",this.el.classList.add("lmp-has-lyrics"),this.startLyricsInterval();return}i.style.display="none",this.el.classList.remove("lmp-has-lyrics");let p=[1500,3e3,5e3];t<p.length&&(this.lyricsRetryTimer=setTimeout(()=>{this.lyricsRetryTimer=null,this.tryLoadLyricsFromState(t+1)},p[t]))}startLyricsInterval(){this.lyricsInterval=setInterval(()=>{if(!this.lyricsLines)return;let t=P(this.lyricsLines,c.playTime),e=this.lyricsLines[t]?.text??"";this.lyricsEl.textContent!==e&&(this.lyricsEl.style.opacity="0",setTimeout(()=>{this.lyricsEl.textContent=e,this.lyricsEl.style.opacity="1"},150))},200),this.playerUnloads.add(()=>this.stopLyricsInterval())}stopLyricsInterval(){this.lyricsInterval!=null&&(clearInterval(this.lyricsInterval),this.lyricsInterval=null)}showContextMenu(t,e){document.querySelector(".lmp-ctx-menu")?.remove();let i=document.createElement("div");i.className="lmp-ctx-menu";let l=(n,p,f)=>{let g=document.createElement("div");return g.className="lmp-ctx-item",g.innerHTML=`<span class="lmp-ctx-label">${n}</span>${p!==null?`<span class="lmp-ctx-check">${p?"\u2713":""}</span>`:""}`,g.addEventListener("click",()=>{f(),i.remove()}),g},o=()=>{let n=document.createElement("div");return n.className="lmp-ctx-separator",n};i.appendChild(l("Quality badge",u.showQualityPill,()=>{u.showQualityPill=!u.showQualityPill,this.updateQualityPill({tidalItem:c.playbackControls?.playbackContext})})),i.appendChild(o()),i.appendChild(l("Lyrics: off",u.lyricsMode==="off",()=>{u.lyricsMode="off",this.loadLyrics()})),i.appendChild(l("Lyrics: line",u.lyricsMode==="line",()=>{u.lyricsMode="line",this.loadLyrics()})),i.appendChild(o()),i.appendChild(l("Scroll: volume",u.scrollAction==="volume",()=>{u.scrollAction="volume"})),i.appendChild(l("Scroll: seek",u.scrollAction==="seek",()=>{u.scrollAction="seek"})),i.appendChild(o()),i.appendChild(l("Close mini player",null,()=>this.hide())),document.body.appendChild(i);let a=i.getBoundingClientRect();i.style.left=`${Math.min(t,window.innerWidth-a.width-8)}px`,i.style.top=`${Math.min(e,window.innerHeight-a.height-8)}px`;let r=n=>{i.contains(n.target)||(i.remove(),document.removeEventListener("mousedown",r,!0))};document.addEventListener("mousedown",r,!0)}show(){this.el.style.display="",this.onVisibilityChange.forEach(t=>t(!0))}hide(){this.el.style.display="none",this.onVisibilityChange.forEach(t=>t(!1))}get isVisible(){return this.el.style.display!=="none"}destroy(){this.el.remove(),this.stopLyricsInterval(),this.progressTimeout!=null&&clearInterval(this.progressTimeout),this.volumeTimeout!=null&&clearTimeout(this.volumeTimeout),this.swipeResetTimer!=null&&clearTimeout(this.swipeResetTimer),this.lyricsRetryTimer!=null&&clearTimeout(this.lyricsRetryTimer)}};function N(s){let t="lmp-bar-btn";document.getElementById(t)?.remove();let e=document.createElement("button");e.id=t,e.className="lmp-toggle-btn",e.title="Toggle Mini Player",e.setAttribute("aria-label","Toggle Mini Player"),e.innerHTML=V;let i=n=>e.classList.toggle("lmp-active",n);i(s.isVisible),e.addEventListener("click",()=>{s.isVisible?s.hide():s.show()}),s.onVisibilityChange.add(i);let l=['[class*="footerPlayer"] [class*="rightColumn"]','[class*="footerPlayer"] [class*="rightSection"]','[class*="footerPlayer"] [class*="right"]','[class*="playbackControls"] [class*="right"]','[class*="footerPlayer"]',"footer"],o=!1,a=()=>{if(!(o&&document.getElementById(t))){o=!1;for(let n of l){let p=document.querySelector(n);if(p){p.appendChild(e),o=!0;return}}}};a();let r=new MutationObserver(a);return r.observe(document.body,{childList:!0,subtree:!0}),()=>{r.disconnect(),e.remove(),s.onVisibilityChange.delete(i)}}function _(s){let t="lmp-fs-btn";document.getElementById(t)?.remove();let e=document.createElement("button");e.id=t,e.className="lmp-toggle-btn",e.title="Toggle Mini Player",e.setAttribute("aria-label","Toggle Mini Player"),e.innerHTML=V;let i=n=>e.classList.toggle("lmp-active",n);i(s.isVisible),e.addEventListener("click",()=>{s.isVisible?s.hide():s.show()}),s.onVisibilityChange.add(i);let l=['[class*="fullscreenPlayer"] [class*="rightSection"]','[class*="fullscreenPlayer"] [class*="rightControls"]','[class*="fullscreenPlayer"] [class*="topBar"]','[class*="fullscreenPlayer"] [class*="controls"]','[class*="fullscreenPlayer"] [class*="buttons"]','[class*="fullscreenPlayer"]','[class*="videoPlayer"] [class*="controls"]','[class*="videoPlayer"]','[class*="nowPlayingView"] [class*="controls"]','[class*="nowPlayingView"] [class*="topActions"]','[class*="nowPlayingView"]','[class*="npv"] [class*="controls"]','[class*="npv"]'],o=!1,a=()=>{if(!(o&&document.getElementById(t))){o=!1;for(let n of l){let p=document.querySelector(n);if(p){p.appendChild(e),o=!0;return}}}};a();let r=new MutationObserver(a);return r.observe(document.body,{childList:!0,subtree:!0}),()=>{r.disconnect(),e.remove(),s.onVisibilityChange.delete(i)}}var vt=new M("luna-mini-player-styles",y,A),D=async()=>{await new Promise(e=>{if(document.body)return e();let i=new MutationObserver(()=>{document.body&&(i.disconnect(),e())});i.observe(document.documentElement,{childList:!0})});let s=new L(y);y.add(()=>s.destroy()),y.add(N(s)),y.add(_(s));let t=T.addButton(y);t.text="Mini Player",t.onClick(()=>{s.isVisible?s.hide():s.show()}),T.onOpen(y,async({event:e,contextMenu:i})=>{e.type==="USER_PROFILE"&&await t.show(i)})};D().catch(s=>{R.err.withContext("init")(s)});export{gt as errSignal,u as settings,R as trace,y as unloads};
