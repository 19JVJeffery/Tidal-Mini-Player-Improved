var m=(typeof luna<"u"&&luna?.core?.modules?.["@luna/core"])??{},k=m.Tracer,E=m.ReactiveStore,U=m.ftch,$=m.interceptors,_=m.buildActions,F=m.reduxStore,N=m.findModuleByProperty;var a=(typeof luna<"u"&&luna?.core?.modules?.["@luna/lib"])??{},o=a.PlayState,x=a.MediaItem,Q=a.MediaItems,T=a.StyleTag,f=a.ContentBase,Y=a.Album,j=a.Artist,S=a.Quality,w=a.ContextMenu,W=a.Playlist,K=a.Tidal,G=a.observePromise,J=a.getPlaybackInfo,Z=a.parseDate,tt=a.safeTimeout,h=a.redux,et=a.ipcRenderer,it=a.errSignal,rt=a.unloads;function M(n){if(!n)return null;let e=[],r=/\[(\d{1,2}):(\d{2})[.:](\d{1,3})\]\s*(.*)/g,t,l=!1;for(;(t=r.exec(n))!==null;){l=!0;let p=parseInt(t[1],10),d=parseInt(t[2],10),i=parseInt(t[3].padEnd(3,"0"),10),s=p*60+d+i/1e3,u=t[4].trim();u&&e.push({time:s,text:u})}return l?(e.sort((p,d)=>p.time-d.time),e):null}function I(n,e){let r=0;for(let t=0;t<n.length&&n[t].time<=e;t++)r=t;return r}var b=new Set,{trace:A,errSignal:pt}=k("[MiniPlayer]"),c=await E.getPluginStorage("MiniPlayer",{showQualityPill:!0,lyricsMode:"line",scrollAction:"volume",playerRight:20,playerBottom:20}),H=`
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
`,y=(n,e="0 0 24 24",r=20)=>`<svg width="${r}" height="${r}" viewBox="${e}" fill="currentColor" xmlns="http://www.w3.org/2000/svg">${n}</svg>`,q=y('<path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6L9.5 12z"/>'),R=y('<path d="M6 18l8.5-6L6 6v12zm10.5-12v12h2V6h-2z"/>'),C=y('<path d="M8 5v14l11-7L8 5z"/>'),B=y('<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'),P=y('<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill-opacity=".3"/><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="currentColor" stroke-width="1.5"/>',"0 0 24 24",18),V=y('<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',"0 0 24 24",18),O='<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M9 1L5 5l4 4-1 1-4-4-4 4-1-1 4-4-4-4 1-1 4 4 4-4 1 1z"/></svg>',z=y('<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>',"0 0 24 24",22),L=class n{constructor(e){this.playerUnloads=e;this.el=document.createElement("div"),this.el.id="luna-mini-player",this.el.style.right=`${c.playerRight}px`,this.el.style.bottom=`${c.playerBottom}px`,this.el.innerHTML=this.buildHTML(),this.artImg=this.el.querySelector(".lmp-art"),this.artVideo=this.el.querySelector(".lmp-art-video"),this.titleEl=this.el.querySelector(".lmp-title"),this.artistEl=this.el.querySelector(".lmp-artist"),this.heartEl=this.el.querySelector(".lmp-heart"),this.qualityEl=this.el.querySelector(".lmp-quality"),this.progressFill=this.el.querySelector(".lmp-progress-fill"),this.playBtn=this.el.querySelector(".lmp-btn-play"),this.volumeToast=this.el.querySelector(".lmp-volume-toast"),this.volumeText=this.el.querySelector(".lmp-volume-text"),this.volumeBarFill=this.el.querySelector(".lmp-volume-bar-fill"),this.lyricsEl=this.el.querySelector(".lmp-lyric-line"),document.body.appendChild(this.el),this.bindEvents(),this.startProgressLoop(),this.updatePlayButton(o.playing),this.updateVolumeFeedback(o.playbackControls?.volume??100,!1)}el;artImg;artVideo;titleEl;artistEl;heartEl;qualityEl;progressFill;playBtn;volumeToast;volumeText;volumeBarFill;lyricsEl;currentTrackId;currentDuration=0;volumeTimeout=null;progressTimeout=null;lyricsLines=null;lyricsInterval=null;dragging=!1;dragStartX=0;dragStartY=0;dragStartRight=0;dragStartBottom=0;swipeAccumX=0;swipeAccumY=0;static SWIPE_THRESHOLD=120;static VOL_STEP=5;static SEEK_STEP_SECONDS=5;buildHTML(){return`
			<!-- artwork -->
			<img class="lmp-art" src="" alt="" />
			<video class="lmp-art-video" muted autoplay loop playsinline style="display:none"></video>

			<!-- gradient overlays -->
			<div class="lmp-overlay-top"></div>
			<div class="lmp-overlay-bottom"></div>

			<!-- drag area -->
			<div class="lmp-drag"></div>

			<!-- top bar: heart (left) + quality + close (right) -->
			<button class="lmp-heart" title="Like/Unlike">${P}</button>
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
					<button class="lmp-btn lmp-btn-prev" title="Previous">${q}</button>
					<button class="lmp-btn lmp-btn-play" title="Play/Pause">${C}</button>
					<button class="lmp-btn lmp-btn-next" title="Next">${R}</button>
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

			<!-- lyrics line -->
			<div class="lmp-lyrics" style="display:none">
				<div class="lmp-lyric-line"></div>
			</div>
		`}bindEvents(){this.el.querySelector(".lmp-close").addEventListener("click",i=>{i.stopPropagation(),this.hide()}),this.el.querySelector(".lmp-btn-prev").addEventListener("click",i=>{i.stopPropagation(),o.previous()}),this.el.querySelector(".lmp-btn-play").addEventListener("click",i=>{i.stopPropagation(),o.playing?o.pause():o.play()}),this.el.querySelector(".lmp-btn-next").addEventListener("click",i=>{i.stopPropagation(),o.next()}),this.heartEl.addEventListener("click",i=>{i.stopPropagation(),this.toggleLike()});let e=this.el.querySelector(".lmp-progress-wrap");e.addEventListener("click",i=>{i.stopPropagation();let s=e.getBoundingClientRect(),u=Math.max(0,Math.min(1,(i.clientX-s.left)/s.width));o.seek(u*this.currentDuration)}),this.el.addEventListener("wheel",i=>{i.preventDefault(),i.stopPropagation();let s=i.deltaX,u=i.deltaY;if(this.swipeAccumX+=s,this.swipeAccumY+=u,Math.abs(s)>Math.abs(u))this.swipeAccumX>n.SWIPE_THRESHOLD?(this.swipeAccumX=0,o.next()):this.swipeAccumX<-n.SWIPE_THRESHOLD&&(this.swipeAccumX=0,o.previous());else if(this.swipeAccumX=0,Math.abs(this.swipeAccumY)>=20){let g=Math.round(this.swipeAccumY/20);this.swipeAccumY%=20,c.scrollAction==="volume"?this.adjustVolume(-g*n.VOL_STEP):o.seek(Math.max(0,o.playTime+-g*n.SEEK_STEP_SECONDS))}},{passive:!1}),this.el.querySelector(".lmp-drag").addEventListener("mousedown",i=>{if(i.button!==0)return;this.dragging=!0,this.dragStartX=i.clientX,this.dragStartY=i.clientY;let s=this.el.getBoundingClientRect();this.dragStartRight=window.innerWidth-s.right,this.dragStartBottom=window.innerHeight-s.bottom,i.preventDefault()});let t=i=>{if(!this.dragging)return;let s=i.clientX-this.dragStartX,u=i.clientY-this.dragStartY,g=Math.max(0,this.dragStartRight-s),v=Math.max(0,this.dragStartBottom-u);this.el.style.right=`${g}px`,this.el.style.bottom=`${v}px`},l=()=>{if(!this.dragging)return;this.dragging=!1;let i=this.el.getBoundingClientRect();c.playerRight=window.innerWidth-i.right,c.playerBottom=window.innerHeight-i.bottom};document.addEventListener("mousemove",t),document.addEventListener("mouseup",l),this.playerUnloads.add(()=>{document.removeEventListener("mousemove",t),document.removeEventListener("mouseup",l)}),this.el.addEventListener("contextmenu",i=>{i.preventDefault(),i.stopPropagation(),this.showContextMenu(i.clientX,i.clientY)});let p=x.onMediaTransition(this.playerUnloads,i=>this.onTrackChange(i)),d=o.onState(this.playerUnloads,i=>this.updatePlayButton(i==="PLAYING"));this.playerUnloads.add(p),this.playerUnloads.add(d),x.fromPlaybackContext().then(i=>{i&&this.onTrackChange(i)})}async onTrackChange(e){if(!e)return;this.currentTrackId=e.tidalItem?.id??e.id,this.currentDuration=e.tidalItem?.duration??0;let r=e.tidalItem?.title??"Unknown",t=e.tidalItem?.artist?.name??e.tidalItem?.artists?.map(p=>p.name).join(", ")??"";this.titleEl.textContent=r,this.artistEl.textContent=t;let l=e.tidalItem?.album;if(l){let p=f.getAlbumCoverUrl(l,{type:"video",fallback:!1});p?(this.artVideo.style.display="",this.artImg.style.opacity="0",this.artVideo.src!==p&&(this.artVideo.src=p,await this.artVideo.play().catch(()=>{}))):(this.artVideo.style.display="none",this.artImg.style.opacity="1");let d=f.getAlbumCoverUrl(l,{res:"640"});d&&this.artImg.src!==d&&(this.artImg.style.opacity="0",this.artImg.src=d,this.artImg.onload=()=>{this.artImg.style.opacity=p?"0":"1"}),l.vibrantColor?this.progressFill.style.background=l.vibrantColor:this.progressFill.style.background="#fff"}this.updateQualityPill(e),this.updateLikeState(),this.loadLyrics()}updateQualityPill(e){if(!c.showQualityPill){this.qualityEl.style.display="none";return}let t=o.playbackContext?.actualAudioQuality??e.tidalItem?.audioQuality,l=S.fromAudioQuality(t);l?(this.qualityEl.textContent=l.name,this.qualityEl.style.color=l.color,this.qualityEl.style.display=""):this.qualityEl.style.display="none"}updatePlayButton(e){this.playBtn.innerHTML=e?B:C}startProgressLoop(){let e=()=>{if(!this.currentDuration)this.progressFill.style.width="0%",this.progressFill.style.transition="none";else{let r=Math.min(100,o.playTime/this.currentDuration*100);this.progressFill.style.transition="width .5s linear",this.progressFill.style.width=`${r}%`}};this.progressTimeout=setInterval(e,500),this.playerUnloads.add(()=>{this.progressTimeout!=null&&clearInterval(this.progressTimeout)})}adjustVolume(e){let r=o.playbackControls?.volume??100,t=Math.max(0,Math.min(100,r+e));try{h.actions["playbackControls/SET_VOLUME"](t)}catch{let l=document.querySelector("audio");l&&(l.volume=t/100)}this.updateVolumeFeedback(t,!0)}updateVolumeFeedback(e,r){this.volumeText.textContent=`${Math.round(e)}%`,this.volumeBarFill.style.width=`${e}%`,r&&(this.volumeToast.classList.add("visible"),this.volumeTimeout!=null&&clearTimeout(this.volumeTimeout),this.volumeTimeout=setTimeout(()=>{this.volumeToast.classList.remove("visible")},1200))}updateLikeState(){if(this.currentTrackId===void 0)return;let r=(h.store?.getState()?.favorites?.tracks??[]).some(t=>String(t)===String(this.currentTrackId));this.heartEl.innerHTML=r?V:P,this.heartEl.classList.toggle("liked",r)}toggleLike(){if(this.currentTrackId===void 0)return;let r=(h.store?.getState()?.favorites?.tracks??[]).some(t=>String(t)===String(this.currentTrackId));try{r?h.actions["favorites/REMOVE_FAVORITES"]({ids:[this.currentTrackId],type:"TRACK"}):h.actions["favorites/ADD_FAVORITES"]({ids:[this.currentTrackId],type:"TRACK"})}catch{A.warn("Could not toggle favourite \u2013 action not found.")}setTimeout(()=>this.updateLikeState(),300)}loadLyrics(){this.lyricsLines=null,this.stopLyricsInterval();let e=this.el.querySelector(".lmp-lyrics");if(c.lyricsMode==="off"){e.style.display="none",this.el.classList.remove("lmp-has-lyrics");return}let r=h.store?.getState(),t=this.currentTrackId;if(!t)return;let l=r?.content?.lyrics?.[t],p=l?.subtitles??l?.lyrics,d=M(p);d&&d.length>0?(this.lyricsLines=d,e.style.display="",this.el.classList.add("lmp-has-lyrics"),this.startLyricsInterval()):(e.style.display="none",this.el.classList.remove("lmp-has-lyrics"))}startLyricsInterval(){this.lyricsInterval=setInterval(()=>{if(!this.lyricsLines)return;let e=I(this.lyricsLines,o.playTime),r=this.lyricsLines[e]?.text??"";this.lyricsEl.textContent!==r&&(this.lyricsEl.style.opacity="0",setTimeout(()=>{this.lyricsEl.textContent=r,this.lyricsEl.style.opacity="1"},150))},200),this.playerUnloads.add(()=>this.stopLyricsInterval())}stopLyricsInterval(){this.lyricsInterval!=null&&(clearInterval(this.lyricsInterval),this.lyricsInterval=null)}showContextMenu(e,r){document.querySelector(".lmp-ctx-menu")?.remove();let t=document.createElement("div");t.className="lmp-ctx-menu";let l=(s,u,g)=>{let v=document.createElement("div");return v.className="lmp-ctx-item",v.innerHTML=`<span class="lmp-ctx-label">${s}</span>${u!==null?`<span class="lmp-ctx-check">${u?"\u2713":""}</span>`:""}`,v.addEventListener("click",()=>{g(),t.remove()}),v},p=()=>{let s=document.createElement("div");return s.className="lmp-ctx-separator",s};t.appendChild(l("Quality badge",c.showQualityPill,()=>{c.showQualityPill=!c.showQualityPill,this.updateQualityPill({tidalItem:o.playbackControls?.playbackContext})})),t.appendChild(p()),t.appendChild(l("Lyrics: off",c.lyricsMode==="off",()=>{c.lyricsMode="off",this.loadLyrics()})),t.appendChild(l("Lyrics: line",c.lyricsMode==="line",()=>{c.lyricsMode="line",this.loadLyrics()})),t.appendChild(p()),t.appendChild(l("Scroll: volume",c.scrollAction==="volume",()=>{c.scrollAction="volume"})),t.appendChild(l("Scroll: seek",c.scrollAction==="seek",()=>{c.scrollAction="seek"})),t.appendChild(p()),t.appendChild(l("Close mini player",null,()=>this.hide())),document.body.appendChild(t);let d=t.getBoundingClientRect();t.style.left=`${Math.min(e,window.innerWidth-d.width-8)}px`,t.style.top=`${Math.min(r,window.innerHeight-d.height-8)}px`;let i=s=>{t.contains(s.target)||(t.remove(),document.removeEventListener("mousedown",i,!0))};document.addEventListener("mousedown",i,!0)}show(){this.el.style.display=""}hide(){this.el.style.display="none"}get isVisible(){return this.el.style.display!=="none"}destroy(){this.el.remove(),this.stopLyricsInterval(),this.progressTimeout!=null&&clearInterval(this.progressTimeout),this.volumeTimeout!=null&&clearTimeout(this.volumeTimeout)}},ct=new T("luna-mini-player-styles",b,H),D=async()=>{await new Promise(r=>{if(document.body)return r();let t=new MutationObserver(()=>{document.body&&(t.disconnect(),r())});t.observe(document.documentElement,{childList:!0})});let n=new L(b);b.add(()=>n.destroy());let e=w.addButton(b);e.text="Mini Player",e.onClick(()=>{n.isVisible?n.hide():n.show()}),w.onOpen(b,async({event:r,contextMenu:t})=>{r.type==="USER_PROFILE"&&await e.show(t)})};D().catch(n=>{A.err.withContext("init")(n)});export{pt as errSignal,c as settings,A as trace,b as unloads};
