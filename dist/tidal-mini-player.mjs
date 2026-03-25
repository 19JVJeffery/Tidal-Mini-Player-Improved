var v=(typeof luna<"u"&&luna?.core?.modules?.["@luna/core"])??{},S=v.Tracer,M=v.ReactiveStore,j=v.ftch,Q=v.interceptors,X=v.buildActions,Y=v.reduxStore,W=v.findModuleByProperty;var u=(typeof luna<"u"&&luna?.core?.modules?.["@luna/lib"])??{},o=u.PlayState,x=u.MediaItem,G=u.MediaItems,I=u.StyleTag,w=u.ContentBase,J=u.Album,Z=u.Artist,C=u.Quality,T=u.ContextMenu,tt=u.Playlist,et=u.Tidal,it=u.observe,rt=u.observePromise,st=u.getPlaybackInfo,lt=u.parseDate,nt=u.safeTimeout,y=u.redux,at=u.ipcRenderer,ot=u.errSignal,ct=u.unloads;function L(s){if(!s)return null;let t=[],i=/\[(\d{1,2}):(\d{2})[.:](\d{1,3})\]\s*(.*)/g,e,l=!1;for(;(e=i.exec(s))!==null;){l=!0;let n=parseInt(e[1],10),c=parseInt(e[2],10),p=parseInt(e[3].padEnd(3,"0"),10),a=n*60+c+p/1e3,r=e[4].trim();r&&t.push({time:a,text:r})}return l?(t.sort((n,c)=>n.time-c.time),t):null}function P(s,t){let i=0;for(let e=0;e<s.length&&s[e].time<=t;e++)i=e;return i}var b=new Set,{trace:R,errSignal:bt}=S("[MiniPlayer]"),d=await M.getPluginStorage("MiniPlayer",{showQualityPill:!0,lyricsMode:"line",scrollAction:"volume",playerRight:20,playerBottom:20}),B=`
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
`,g=(s,t="0 0 24 24",i=20)=>`<svg width="${i}" height="${i}" viewBox="${t}" fill="currentColor" xmlns="http://www.w3.org/2000/svg">${s}</svg>`,F=g('<path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6L9.5 12z"/>'),O=g('<path d="M6 18l8.5-6L6 6v12zm10.5-12v12h2V6h-2z"/>'),H=g('<path d="M8 5v14l11-7L8 5z"/>'),z=g('<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'),f=g('<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill-opacity=".3"/><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="currentColor" stroke-width="1.5"/>',"0 0 24 24",18),E=g('<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',"0 0 24 24",18),N='<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M9 1L5 5l4 4-1 1-4-4-4 4-1-1 4-4-4-4 1-1 4 4 4-4 1 1z"/></svg>',_=g('<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>',"0 0 24 24",22),V=g('<path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3C1.9 3 1 3.88 1 4.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z"/>',"0 0 24 24",20),k=class s{constructor(t){this.playerUnloads=t;this.el=document.createElement("div"),this.el.id="luna-mini-player",this.el.style.right=`${d.playerRight}px`,this.el.style.bottom=`${d.playerBottom}px`,this.el.innerHTML=this.buildHTML(),this.artImg=this.el.querySelector(".lmp-art"),this.artVideo=this.el.querySelector(".lmp-art-video"),this.titleEl=this.el.querySelector(".lmp-title"),this.artistEl=this.el.querySelector(".lmp-artist"),this.heartEl=this.el.querySelector(".lmp-heart"),this.qualityEl=this.el.querySelector(".lmp-quality"),this.progressFill=this.el.querySelector(".lmp-progress-fill"),this.playBtn=this.el.querySelector(".lmp-btn-play"),this.volumeToast=this.el.querySelector(".lmp-volume-toast"),this.volumeText=this.el.querySelector(".lmp-volume-text"),this.volumeBarFill=this.el.querySelector(".lmp-volume-bar-fill"),this.lyricsEl=this.el.querySelector(".lmp-lyric-line"),this.swipeHintEl=this.el.querySelector(".lmp-swipe-hint"),document.body.appendChild(this.el),this.bindEvents(),this.startProgressLoop(),this.updatePlayButton(o.playing),this.updateVolumeFeedback(o.playbackControls?.volume??100,!1)}el;artImg;artVideo;titleEl;artistEl;heartEl;qualityEl;progressFill;playBtn;volumeToast;volumeText;volumeBarFill;lyricsEl;onVisibilityChange=new Set;currentItem=null;currentTrackId;currentDuration=0;volumeTimeout=null;progressTimeout=null;lyricsLines=null;lyricsInterval=null;dragging=!1;dragStartX=0;dragStartY=0;dragStartRight=0;dragStartBottom=0;swipeAccumX=0;swipeFired=!1;swipeResetTimer=null;swipeHintEl=null;volAccumY=0;lyricsRetryTimer=null;lyricsTrackId;static SWIPE_THRESHOLD=80;static VOL_STEP=5;static SEEK_STEP_SECONDS=5;buildHTML(){return`
			<!-- artwork -->
			<img class="lmp-art" src="" alt="" draggable="false" />
			<video class="lmp-art-video" muted autoplay loop playsinline style="display:none"></video>

			<!-- gradient overlays -->
			<div class="lmp-overlay-top"></div>
			<div class="lmp-overlay-bottom"></div>

			<!-- drag area -->
			<div class="lmp-drag"></div>

			<!-- top bar: heart (left) + quality + close (right) -->
			<button class="lmp-heart" title="Like/Unlike">${f}</button>
			<div class="lmp-topbar">
				<span class="lmp-quality" style="display:none"></span>
				<button class="lmp-close" title="Close mini player">${N}</button>
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
					<button class="lmp-btn lmp-btn-prev" title="Previous">${F}</button>
					<button class="lmp-btn lmp-btn-play" title="Play/Pause">${H}</button>
					<button class="lmp-btn lmp-btn-next" title="Next">${O}</button>
				</div>
			</div>

			<!-- volume overlay -->
			<div class="lmp-volume-toast">
				${_}
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
		`}bindEvents(){this.el.querySelector(".lmp-close").addEventListener("click",r=>{r.stopPropagation(),this.hide()}),this.el.querySelector(".lmp-btn-prev").addEventListener("click",r=>{r.stopPropagation(),o.previous()}),this.el.querySelector(".lmp-btn-play").addEventListener("click",r=>{r.stopPropagation(),o.playing?o.pause():o.play()}),this.el.querySelector(".lmp-btn-next").addEventListener("click",r=>{r.stopPropagation(),o.next()}),this.heartEl.addEventListener("click",r=>{r.stopPropagation(),this.toggleLike()});let t=this.el.querySelector(".lmp-progress-wrap");t.addEventListener("click",r=>{r.stopPropagation();let m=t.getBoundingClientRect(),h=Math.max(0,Math.min(1,(r.clientX-m.left)/m.width));o.seek(h*this.currentDuration)}),this.el.addEventListener("wheel",r=>{r.preventDefault(),r.stopPropagation();let m=r.deltaX,h=r.deltaY;Math.abs(m)>=Math.abs(h)?this.handleHorizontalSwipe(m):this.handleVerticalScroll(h,r.deltaMode)},{passive:!1}),this.el.querySelector(".lmp-drag").addEventListener("mousedown",r=>{if(r.button!==0)return;this.dragging=!0,this.dragStartX=r.clientX,this.dragStartY=r.clientY;let m=this.el.getBoundingClientRect();this.dragStartRight=window.innerWidth-m.right,this.dragStartBottom=window.innerHeight-m.bottom,r.preventDefault()});let e=r=>{if(!this.dragging)return;let m=r.clientX-this.dragStartX,h=r.clientY-this.dragStartY,A=Math.max(0,this.dragStartRight-m),q=Math.max(0,this.dragStartBottom-h);this.el.style.right=`${A}px`,this.el.style.bottom=`${q}px`},l=()=>{if(!this.dragging)return;this.dragging=!1;let r=this.el.getBoundingClientRect();d.playerRight=window.innerWidth-r.right,d.playerBottom=window.innerHeight-r.bottom};document.addEventListener("mousemove",e),document.addEventListener("mouseup",l),this.playerUnloads.add(()=>{document.removeEventListener("mousemove",e),document.removeEventListener("mouseup",l)}),this.el.addEventListener("contextmenu",r=>{r.preventDefault(),r.stopPropagation(),this.showContextMenu(r.clientX,r.clientY)});let n=x.onMediaTransition(this.playerUnloads,r=>this.onTrackChange(r)),c=o.onState(this.playerUnloads,()=>{this.updatePlayButton(o.playing),this.currentDuration||(this.currentDuration=o.playbackContext?.duration??0),this.currentTrackId&&this.updateQualityPill(this.currentItem)});this.playerUnloads.add(n),this.playerUnloads.add(c);let p,a=y.store?.subscribe?.(()=>{if(!this.currentTrackId)return;let r=y.store?.getState(),m=r?.favorites?.tracks??r?.userCollection?.favoriteTracks?.ids??r?.user?.favorites?.tracks;m!==p&&(p=m,this.updateLikeState())});typeof a=="function"&&this.playerUnloads.add(a),x.fromPlaybackContext().then(r=>{r&&this.onTrackChange(r)})}async onTrackChange(t){if(!t)return;this.currentItem=t,this.currentTrackId=t.tidalItem?.id??t.id,this.currentDuration=t.tidalItem?.duration??o.playbackContext?.duration??0;let i=t.tidalItem?.title??"Unknown",e=t.tidalItem?.artist?.name??t.tidalItem?.artists?.map(n=>n.name).join(", ")??"";this.titleEl.textContent=i,this.artistEl.textContent=e;let l=t.tidalItem?.album;if(l){let n=w.getAlbumCoverUrl(l,{type:"video",fallback:!1});n?(this.artVideo.style.display="",this.artImg.style.opacity="0",this.artVideo.src!==n&&(this.artVideo.src=n,await this.artVideo.play().catch(()=>{}))):(this.artVideo.style.display="none",this.artImg.style.opacity="1");let c=w.getAlbumCoverUrl(l,{res:"640"});c&&this.artImg.src!==c&&(this.artImg.style.opacity="0",this.artImg.src=c,this.artImg.onload=()=>{this.artImg.style.opacity=n?"0":"1"}),l.vibrantColor?this.progressFill.style.background=l.vibrantColor:this.progressFill.style.background="#fff"}this.updateQualityPill(t),this.updateLikeState(),this.loadLyrics()}updateQualityPill(t){if(!d.showQualityPill){this.qualityEl.style.display="none";return}let e=o.playbackContext?.actualAudioQuality??t.tidalItem?.audioQuality,l=C.fromAudioQuality(e);l?(this.qualityEl.textContent=l.name,this.qualityEl.style.color=l.color,this.qualityEl.style.display=""):this.qualityEl.style.display="none"}updatePlayButton(t){this.playBtn.innerHTML=t?z:H}startProgressLoop(){let t=()=>{if(!this.currentDuration)this.progressFill.style.width="0%",this.progressFill.style.transition="none";else{let i=o.playTime??0,e=Math.min(100,i/this.currentDuration*100);this.progressFill.style.transition=o.playing?"width .5s linear":"none",this.progressFill.style.width=`${e}%`}};this.progressTimeout=setInterval(t,500),this.playerUnloads.add(()=>{this.progressTimeout!=null&&clearInterval(this.progressTimeout)})}adjustVolume(t){let i=o.playbackControls?.volume??100,e=Math.max(0,Math.min(100,i+t));try{y.actions["playbackControls/SET_VOLUME"](e)}catch{let l=document.querySelector("audio");l&&(l.volume=e/100)}this.updateVolumeFeedback(e,!0)}updateVolumeFeedback(t,i){this.volumeText.textContent=`${Math.round(t)}%`,this.volumeBarFill.style.width=`${t}%`,i&&(this.volumeToast.classList.add("visible"),this.volumeTimeout!=null&&clearTimeout(this.volumeTimeout),this.volumeTimeout=setTimeout(()=>{this.volumeToast.classList.remove("visible")},1200))}handleHorizontalSwipe(t){this.swipeResetTimer!=null&&clearTimeout(this.swipeResetTimer),this.swipeAccumX+=t;let i=Math.min(1,Math.abs(this.swipeAccumX)/s.SWIPE_THRESHOLD),e=this.swipeAccumX>0?"next":"prev";this.swipeFired||(this.showSwipeHint(e,i),Math.abs(this.swipeAccumX)>=s.SWIPE_THRESHOLD&&(this.swipeFired=!0,this.showSwipeHint(e,1),this.swipeAccumX>0?o.next():o.previous())),this.swipeResetTimer=setTimeout(()=>{this.swipeAccumX=0,this.swipeFired=!1,this.swipeResetTimer=null,this.hideSwipeHint()},300)}handleVerticalScroll(t,i){if(i===1){d.scrollAction==="volume"?this.adjustVolume(-Math.sign(t)*s.VOL_STEP):o.seek(Math.max(0,(o.playTime??0)+-Math.sign(t)*s.SEEK_STEP_SECONDS));return}if(this.volAccumY+=t,Math.abs(this.volAccumY)>=25){let e=Math.sign(this.volAccumY);this.volAccumY=0,d.scrollAction==="volume"?this.adjustVolume(-e*s.VOL_STEP):o.seek(Math.max(0,(o.playTime??0)+-e*s.SEEK_STEP_SECONDS))}}showSwipeHint(t,i){this.swipeHintEl&&(this.swipeHintEl.className=`lmp-swipe-hint lmp-swipe-${t}`,this.swipeHintEl.textContent=t==="next"?"\u25B6":"\u25C0",this.swipeHintEl.style.opacity=String(Math.min(.95,i*.8+.15)))}hideSwipeHint(){this.swipeHintEl&&(this.swipeHintEl.style.opacity="0",this.swipeHintEl.className="lmp-swipe-hint")}getFavTracks(){let t=y.store?.getState();return t?.favorites?.tracks??t?.userCollection?.favoriteTracks?.ids??t?.user?.favorites?.tracks??[]}updateLikeState(){if(this.currentTrackId===void 0)return;let t=this.getFavTracks().some(i=>String(i)===String(this.currentTrackId));this.heartEl.innerHTML=t?E:f,this.heartEl.classList.toggle("liked",t)}toggleLike(){if(this.currentTrackId===void 0)return;let t=this.getFavTracks().some(a=>String(a)===String(this.currentTrackId)),i=!t;this.heartEl.innerHTML=i?E:f,this.heartEl.classList.toggle("liked",i);let e={ids:[this.currentTrackId],type:"TRACK"},c=t?["favorites/REMOVE_FAVORITES","favorites/removeFavorite","favorites/remove"]:["favorites/ADD_FAVORITES","favorites/addFavorite","favorites/add"],p=!1;for(let a of c)try{if(typeof y.actions?.[a]=="function"){y.actions[a](e),p=!0;break}}catch{}p||(R.warn("Could not toggle favourite \u2013 no compatible action found."),this.heartEl.innerHTML=t?E:f,this.heartEl.classList.toggle("liked",t)),setTimeout(()=>this.updateLikeState(),500)}loadLyrics(){this.lyricsRetryTimer!=null&&(clearTimeout(this.lyricsRetryTimer),this.lyricsRetryTimer=null),this.lyricsLines=null,this.stopLyricsInterval();let t=this.el.querySelector(".lmp-lyrics");if(d.lyricsMode==="off"){t.style.display="none",this.el.classList.remove("lmp-has-lyrics");return}if(this.currentTrackId){if(this.lyricsTrackId=this.currentTrackId,this.currentItem&&typeof this.currentItem.lyrics=="function"){let i=this.lyricsTrackId;this.currentItem.lyrics().then(e=>{if(this.lyricsTrackId!==i)return;let l=e?.subtitles??e?.lyrics??e?.text,n=L(l);if(n&&n.length>0){this.applyLyricsLines(n);return}this.tryLoadLyricsFromState(0)}).catch(()=>{this.lyricsTrackId===i&&this.tryLoadLyricsFromState(0)});return}this.tryLoadLyricsFromState(0)}}applyLyricsLines(t){let i=this.el.querySelector(".lmp-lyrics");this.lyricsLines=t,i.style.display="",this.el.classList.add("lmp-has-lyrics"),this.startLyricsInterval()}tryLoadLyricsFromState(t){if(this.lyricsTrackId!==this.currentTrackId||d.lyricsMode==="off")return;let i=this.currentTrackId;if(!i)return;let e=y.store?.getState(),l=String(i),n=e?.content?.lyrics?.[l]??e?.content?.lyrics?.[i]??e?.lyrics?.[l]??e?.lyrics?.[i]??e?.player?.lyrics,c=n?.subtitles??n?.lyrics??n?.text,p=L(c);if(p&&p.length>0){this.applyLyricsLines(p);return}let a=this.el.querySelector(".lmp-lyrics");a.style.display="none",this.el.classList.remove("lmp-has-lyrics");let r=[1500,3e3,5e3];t<r.length&&(this.lyricsRetryTimer=setTimeout(()=>{this.lyricsRetryTimer=null,this.tryLoadLyricsFromState(t+1)},r[t]))}startLyricsInterval(){this.lyricsInterval=setInterval(()=>{if(!this.lyricsLines)return;let t=P(this.lyricsLines,o.playTime??0),i=this.lyricsLines[t]?.text??"";this.lyricsEl.textContent!==i&&(this.lyricsEl.style.opacity="0",setTimeout(()=>{this.lyricsEl.textContent=i,this.lyricsEl.style.opacity="1"},150))},200),this.playerUnloads.add(()=>this.stopLyricsInterval())}stopLyricsInterval(){this.lyricsInterval!=null&&(clearInterval(this.lyricsInterval),this.lyricsInterval=null)}showContextMenu(t,i){document.querySelector(".lmp-ctx-menu")?.remove();let e=document.createElement("div");e.className="lmp-ctx-menu";let l=(a,r,m)=>{let h=document.createElement("div");return h.className="lmp-ctx-item",h.innerHTML=`<span class="lmp-ctx-label">${a}</span>${r!==null?`<span class="lmp-ctx-check">${r?"\u2713":""}</span>`:""}`,h.addEventListener("click",()=>{m(),e.remove()}),h},n=()=>{let a=document.createElement("div");return a.className="lmp-ctx-separator",a};e.appendChild(l("Quality badge",d.showQualityPill,()=>{d.showQualityPill=!d.showQualityPill,this.updateQualityPill({tidalItem:o.playbackControls?.playbackContext})})),e.appendChild(n()),e.appendChild(l("Lyrics: off",d.lyricsMode==="off",()=>{d.lyricsMode="off",this.loadLyrics()})),e.appendChild(l("Lyrics: line",d.lyricsMode==="line",()=>{d.lyricsMode="line",this.loadLyrics()})),e.appendChild(n()),e.appendChild(l("Scroll: volume",d.scrollAction==="volume",()=>{d.scrollAction="volume"})),e.appendChild(l("Scroll: seek",d.scrollAction==="seek",()=>{d.scrollAction="seek"})),e.appendChild(n()),e.appendChild(l("Close mini player",null,()=>this.hide())),document.body.appendChild(e);let c=e.getBoundingClientRect();e.style.left=`${Math.min(t,window.innerWidth-c.width-8)}px`,e.style.top=`${Math.min(i,window.innerHeight-c.height-8)}px`;let p=a=>{e.contains(a.target)||(e.remove(),document.removeEventListener("mousedown",p,!0))};document.addEventListener("mousedown",p,!0)}show(){this.el.style.display="",this.onVisibilityChange.forEach(t=>t(!0))}hide(){this.el.style.display="none",this.onVisibilityChange.forEach(t=>t(!1))}get isVisible(){return this.el.style.display!=="none"}destroy(){this.el.remove(),this.stopLyricsInterval(),this.progressTimeout!=null&&clearInterval(this.progressTimeout),this.volumeTimeout!=null&&clearTimeout(this.volumeTimeout),this.swipeResetTimer!=null&&clearTimeout(this.swipeResetTimer),this.lyricsRetryTimer!=null&&clearTimeout(this.lyricsRetryTimer)}};function D(s){let t="lmp-bar-btn";document.getElementById(t)?.remove();let i=document.createElement("button");i.id=t,i.className="lmp-toggle-btn",i.title="Toggle Mini Player",i.setAttribute("aria-label","Toggle Mini Player"),i.innerHTML=V;let e=a=>i.classList.toggle("lmp-active",a);e(s.isVisible),i.addEventListener("click",()=>{s.isVisible?s.hide():s.show()}),s.onVisibilityChange.add(e);let l=['[class*="footerPlayer"] [class*="rightColumn"]','[class*="footerPlayer"] [class*="rightSection"]','[class*="footerPlayer"] [class*="right"]','[class*="playbackControls"] [class*="right"]','[class*="footerPlayer"]',"footer"],n=!1,c=()=>{if(!(n&&document.getElementById(t))){n=!1;for(let a of l){let r=document.querySelector(a);if(r){r.appendChild(i),n=!0;return}}}};c();let p=new MutationObserver(c);return p.observe(document.body,{childList:!0,subtree:!0}),()=>{p.disconnect(),i.remove(),s.onVisibilityChange.delete(e)}}function U(s){let t="lmp-fs-btn";document.getElementById(t)?.remove();let i=document.createElement("button");i.id=t,i.className="lmp-toggle-btn",i.title="Toggle Mini Player",i.setAttribute("aria-label","Toggle Mini Player"),i.innerHTML=V;let e=a=>i.classList.toggle("lmp-active",a);e(s.isVisible),i.addEventListener("click",()=>{s.isVisible?s.hide():s.show()}),s.onVisibilityChange.add(e);let l=['[class*="fullscreenPlayer"] [class*="rightSection"]','[class*="fullscreenPlayer"] [class*="rightControls"]','[class*="fullscreenPlayer"] [class*="topBar"]','[class*="fullscreenPlayer"] [class*="controls"]','[class*="fullscreenPlayer"] [class*="buttons"]','[class*="fullscreenPlayer"]','[class*="videoPlayer"] [class*="controls"]','[class*="videoPlayer"]','[class*="nowPlayingView"] [class*="controls"]','[class*="nowPlayingView"] [class*="topActions"]','[class*="nowPlayingView"]','[class*="npv"] [class*="controls"]','[class*="npv"]'],n=!1,c=()=>{if(!(n&&document.getElementById(t))){n=!1;for(let a of l){let r=document.querySelector(a);if(r){r.appendChild(i),n=!0;return}}}};c();let p=new MutationObserver(c);return p.observe(document.body,{childList:!0,subtree:!0}),()=>{p.disconnect(),i.remove(),s.onVisibilityChange.delete(e)}}var ft=new I("luna-mini-player-styles",b,B),$=async()=>{await new Promise(i=>{if(document.body)return i();let e=new MutationObserver(()=>{document.body&&(e.disconnect(),i())});e.observe(document.documentElement,{childList:!0})});let s=new k(b);b.add(()=>s.destroy()),b.add(D(s)),b.add(U(s));let t=T.addButton(b);t.text="Mini Player",t.onClick(()=>{s.isVisible?s.hide():s.show()}),T.onOpen(b,async({event:i,contextMenu:e})=>{i.type==="USER_PROFILE"&&await t.show(e)})};$().catch(s=>{R.err.withContext("init")(s)});export{bt as errSignal,d as settings,R as trace,b as unloads};
