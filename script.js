/* ============================================================
   ELLE AZGHARI — INFINITE SPIRAL
   Vanilla JavaScript; no dependencies or build step.

   QUICK EDITS:
   - PROJECTS: images and fictional titles
   - SPIRAL: shape, number of turns and width/height
   - VISIBLE_PIECES: how many images are on screen at once
   - SCROLL_SPEED / DRAG_SPEED: interaction sensitivity
   ============================================================ */

// Images live in /assets. Add a new object to add a project.
// Titles are fictional placeholders, not official project names.
const PROJECTS = [
  { title: 'Ferdou$', category: 'art', slug: 'ferdou', image: 'project_01.webp', gallery: ['project_01.webp'], source: 'https://www.elleisunbelievable.com/work/ferdou' },
  { title: 'Ambro$ia', category: 'art', slug: 'ambrosia', image: 'project_02.webp', gallery: ['project_02.webp'], source: 'https://www.elleisunbelievable.com/work/ambrosia' },
  { title: 'Afterlyfe', category: 'art', slug: 'afterlyfe', image: 'project_03.webp', gallery: ['project_03.webp'], source: 'https://www.elleisunbelievable.com/work/afterlyfe' },
  { title: 'Nirvana', category: 'art', slug: 'nirvana', image: 'project_04.webp', gallery: ['project_04.webp'], source: 'https://www.elleisunbelievable.com/work/nirvana' },
  { title: 'Liljevalchs Vårsalongen 2025', category: 'art', slug: 'liljevalchs-varsalongen-2025', image: 'project_05.webp', gallery: ['project_05.webp'], source: 'https://www.elleisunbelievable.com/work/liljevalchs-varsalongen-2025' },
  { title: 'Nationalmuseum', category: 'commission', slug: 'nationalmuseum', image: 'project_06.webp', gallery: ['project_06.webp'], source: 'https://www.elleisunbelievable.com/work/nationalmuseum' },
  { title: 'HM Group Din Din', category: 'commission', slug: 'hm-group-din-din', image: 'project_07.webp', gallery: ['project_07.webp'], source: 'https://www.elleisunbelievable.com/work/hm-group-din-din' },
  { title: 'Avavav x Adidas', category: 'commission', slug: 'avavav-x-adidas', image: 'project_08.webp', gallery: ['project_08.webp'], source: 'https://www.elleisunbelievable.com/work/avavav-x-adidas' },
  { title: 'Jelly', category: 'art', slug: 'jelly', image: 'project_09.webp', gallery: ['project_09.webp'], source: 'https://www.elleisunbelievable.com/work/jelly' },
  { title: 'Commi$$ioned', category: 'commission', slug: 'commissioned', image: 'project_10.webp', gallery: ['project_10.webp'], source: 'https://www.elleisunbelievable.com/work/commissioned' },
  { title: 'Unbelievable Celebrations', category: 'commission', slug: 'unbelievable-celebrations', image: 'project_11.webp', gallery: ['project_11.webp'], source: 'https://www.elleisunbelievable.com/work/unbelievable-celebrations' },
  { title: 'Realm', category: 'art', slug: 'realm', image: 'project_12.webp', gallery: ['project_12.webp'], source: 'https://www.elleisunbelievable.com/work/realm' }
];


// The coordinate system matches the SVG viewBox in index.html.
const SPIRAL = {
  centerX: 800,
  centerY: 450,
  radiusX: 720,       // horizontal spread; increase for a wider spiral
  radiusY: 325,       // vertical spread; decrease for a flatter spiral
  turns: 2.36,
  startAngle: -0.20
};

const VISIBLE_PIECES = 10;
const SCROLL_SPEED = 0.003;
const DRAG_SPEED = 0.008;
const SVG_WIDTH = 1600;
const SVG_HEIGHT = 900;

const spiralPath = document.querySelector("#spiral");
const piecesContainer = document.querySelector("#pieces");
const overlay = document.querySelector("#overlay");
const previewImage = document.querySelector("#large");
const gallery = document.querySelector("#projectGallery");
const projectTitle = document.querySelector("#projectTitle");
const projectCategory = document.querySelector("#projectCategory");
const closeButton = document.querySelector("#close");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
let activeFilter = "all";
let lastFocusedElement = null;

// Individual commissions: verified image mapping from supplied filenames.
const COMMISSIONED_JOBS = [
  { title: 'CHIMI', image: "commission_01.webp" },
  { title: 'MUGLER', image: "commission_02.webp" },
  { title: 'BYREDO x NORDISKA KOMPANIET', image: "commission_03.webp" },
  { title: 'NORDISKA GALLERIET ARCHIVE x SIMON SKINNER', image: "commission_04.webp" },
  { title: 'PUMA', image: "commission_05.webp" },
  { title: 'SWAROVSKI x ROSENTHAL', image: "commission_06.webp" },
  { title: 'PRIVATE CLIENT', image: "commission_07.webp" },
  { title: 'NORDISKA KOMPANIET', image: "commission_08.webp" },
  { title: 'HBO', image: "commission_09.webp" },
  { title: 'KLARNA', image: "commission_10.webp" },
  { title: 'NORDISKA MUSEET', image: "commission_11.webp" },
  { title: 'RÖRSTRAND', image: "commission_12.webp" },
  { title: 'HM BEAUTY', image: "commission_13.webp" },
  { title: 'FOTOGRAFISKA SWEDEN', image: "commission_14.webp" },
  { title: 'LÄNNA', image: "commission_15.webp" }
];

const COMMISSION_ARCHIVE = PROJECTS.find(p => p.slug === "commissioned");
const COMMISSION_ENTRIES = COMMISSIONED_JOBS.map((job, i) => ({
  title: job.title, category: "commission", slug: `commissioned-${i+1}`,
  image: job.image, gallery: [job.image], source: COMMISSION_ARCHIVE.source, archiveEntry: true
}));
function filteredProjects() {
  if (activeFilter === "all") return PROJECTS;
  if (activeFilter === "art") return PROJECTS.filter(p => p.category === "art");
  return COMMISSION_ENTRIES;
}



const maxAngle = SPIRAL.turns * Math.PI * 2;
// Spacing adapts to the selected category, without repeating a project.

let phase = 0;
let dragging = false;
let lastPointerX = 0;
let lastPointerY = 0;

// Returns a point on an elliptical Archimedean spiral.
// angle = 0 is the center; angle = maxAngle is the outer edge.
function spiralPoint(angle) {
  const radius = angle / maxAngle;
  const theta = angle + SPIRAL.startAngle;

  if (window.innerWidth <= 700) {
    // Portrait geometry in the SAME SVG coordinates as the artwork.
    // No independent clamping: each image center stays exactly on the dotted path.
    const w=window.innerWidth,h=window.innerHeight;
    const cx=w*.49, cy=h*.465;
    // Wider portrait spiral; the same coordinates draw both the dotted path
    // and the image centers. A gentler radial curve opens the inner turns.
    const rx=w*.395, ry=Math.min(h*.355,(h-240)*.50);
    const mobileRadius=Math.pow(Math.max(0,radius),.82);
    return {
      x:(cx + rx*mobileRadius*Math.cos(theta))*SVG_WIDTH/w,
      y:(cy + ry*mobileRadius*Math.sin(theta))*SVG_HEIGHT/h
    };
  }
  return {
    x: SPIRAL.centerX + SPIRAL.radiusX * radius * Math.cos(theta),
    y: SPIRAL.centerY + SPIRAL.radiusY * radius * Math.sin(theta)
  };
}

// Draw the dotted path as a single SVG element.
function drawSpiral() {
  const segments = 900;
  const commands = [];

  for (let i = 0; i <= segments; i++) {
    const point = spiralPoint((i / segments) * maxAngle);
    const command = i === 0 ? "M" : "L";
    commands.push(`${command}${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
  }

  spiralPath.setAttribute("d", commands.join(" "));
  // Keep the visible path endpoint aligned with where recycled images enter.
  // An extension past maxAngle made new artwork appear midway along the line.
  const extension=document.querySelector("#spiral-extension");
  if(extension)extension.setAttribute("d","");

}

function openProject(project, updateHistory = true) {
 if(!project)return;
 lastFocusedElement=document.activeElement;
 projectTitle.textContent=project.title;
 projectCategory.textContent=project.category;
 gallery.replaceChildren();
 if(project.slug==="commissioned"){
   const archive=document.createElement("div");archive.className="commission-archive";
   COMMISSION_ENTRIES.forEach(entry=>{
     const button=document.createElement("button");button.type="button";button.className="commission-item";
     const img=document.createElement("img");img.src=`assets/${entry.image}`;img.alt=entry.title;img.loading="lazy";
     const label=document.createElement("span");label.textContent=entry.title;
     button.append(img,label);button.addEventListener("click",()=>openProject(entry));archive.append(button);
   });
   gallery.append(archive);
 }else{
   (project.gallery||[project.image]).forEach((filename,index)=>{
     const figure=document.createElement("figure"),img=document.createElement("img");
     img.src=`assets/${filename}`;img.alt=`${project.title} — image ${index+1}`;
     img.loading=index===0?"eager":"lazy";figure.append(img);gallery.append(figure);
   });
 }
 overlay.classList.add("open");overlay.setAttribute("aria-hidden","false");
 overlay.inert=false;overlay.scrollTop=0;closeButton.focus();
 if(updateHistory)history.pushState({project:project.slug},"",`#project/${project.slug}`);
}
function closeProject(updateHistory = true) {
  if (!overlay.classList.contains("open")) return;
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
  overlay.inert = true;
  if (updateHistory) history.pushState({}, "", location.pathname + location.search);
  if (lastFocusedElement?.isConnected) lastFocusedElement.focus();
}

function syncFromURL() {
  const slug = location.hash.startsWith("#project/") ? location.hash.slice(9) : "";
  const project = [...PROJECTS,...COMMISSION_ENTRIES].find(p => p.slug === slug);
  if (project) openProject(project, false);
  else closeProject(false);
}

// Create a fixed number of reusable DOM nodes. Their images change
// when they pass through the spiral's center, creating an endless loop.
const pieces = Array.from({ length: VISIBLE_PIECES }, () => {
  const button = document.createElement("button");
  button.className = "piece";
  button.type = "button";

  const image = document.createElement("img");
  image.alt = "Artwork by Elle Azhdari";
  image.draggable = false;
  image.addEventListener("load",render);

  const label = document.createElement("span");
  label.className = "piece-label";

  button.append(image, label);
  piecesContainer.appendChild(button);

  const piece = { button, image, label, projectIndex: -1 };
  button.addEventListener("click", () => {
    openProject(filteredProjects()[piece.projectIndex]);
  });

  return piece;
});

function render() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scaleX = viewportWidth / SVG_WIDTH;
  const scaleY = viewportHeight / SVG_HEIGHT;

  const currentProjects = filteredProjects();
  const mobile=viewportWidth<=700;
  const visibleCount=Math.min(mobile?6:VISIBLE_PIECES,currentProjects.length);
  const pieceSpacing=maxAngle/visibleCount;
  // Assign projects globally across the visible slots. The old per-slot
  // modulo calculation could collide when some slots had wrapped and others
  // had not. Reserve every ID once before updating any artwork.
  const usedProjects = new Set();
  const assignments = [];
  const desired = [];
  for(let index=0;index<visibleCount;index++){
    const progress=phase+index*pieceSpacing;
    const lap=Math.floor(progress/maxAngle);
    desired.push(((index+lap*visibleCount)%currentProjects.length+currentProjects.length)%currentProjects.length);
  }
  // First preserve each piece's current project where possible. This avoids
  // unnecessary image changes as the spiral moves.
  for(let index=0;index<visibleCount;index++){
    const piece=pieces[index];
    const lap=Math.floor((phase+index*pieceSpacing)/maxAngle);
    const previous=(piece.filter===activeFilter && piece.lastLap===lap)?piece.projectIndex:-1;
    if(previous>=0 && previous<currentProjects.length && !usedProjects.has(previous)){
      assignments[index]=previous;usedProjects.add(previous);
    }
  }
  // Assign an unused project to every unfilled slot. Never duplicate an ID.
  for(let index=0;index<visibleCount;index++){
    if(assignments[index]!==undefined)continue;
    let candidate=desired[index];
    for(let offset=0;offset<currentProjects.length;offset++){
      const id=(candidate+offset)%currentProjects.length;
      if(!usedProjects.has(id)){assignments[index]=id;usedProjects.add(id);break;}
    }
  }
  pieces.forEach((piece, index) => {
    if(index>=visibleCount){piece.button.style.display="none";return;}
    piece.button.style.display="block";
    const progress=phase+index*pieceSpacing;
    const lap=Math.floor(progress/maxAngle);
    const along=progress-lap*maxAngle;
    const angle=maxAngle-along;
    const projectIndex=assignments[index];
    piece.lastLap=lap;

    if (piece.projectIndex !== projectIndex || piece.filter !== activeFilter) {
      const project = currentProjects[projectIndex];
      piece.image.src = `assets/${project.image}`;
      piece.label.textContent = project.title;
      piece.button.setAttribute("aria-label", `Open ${project.title}`);
      piece.projectIndex = projectIndex;
      piece.filter = activeFilter;
    }

    const point = spiralPoint(angle);
    const depth = angle / maxAngle;
    const baseSize = mobile ? Math.min(viewportWidth * 0.31, 166) : Math.min(viewportWidth * 0.115, 165);
    const width = mobile ? Math.max(86, baseSize * (0.78 + 0.22 * depth)) : Math.max(42, baseSize * (0.48 + 0.52 * depth));
    // Match the actual artwork ratio so its label sits right under the image.
    const naturalRatio=piece.image.naturalWidth>0
      ?piece.image.naturalHeight/piece.image.naturalWidth:1;
    const aspectRatio=naturalRatio;
    const height = width * aspectRatio;

    piece.button.style.width = `${width}px`;
    piece.button.style.height = `${height}px`;
    // Path and artwork use the identical spiralPoint() coordinates.
    piece.button.style.left = `${point.x * scaleX}px`;
    piece.button.style.top = `${point.y * scaleY}px`;
    piece.button.style.zIndex = Math.round(3 + depth * 10);

    // Recycled artwork enters at the OUTER endpoint (angle=maxAngle).
    // Fade it in there, rather than letting it pop into an extended path.
    const innerFade=Math.min(1,Math.max(0,(angle-0.12)/0.48));
    const outerFade=Math.min(1,Math.max(0,(maxAngle-angle)/0.72));
    piece.button.style.opacity=innerFade*outerFade;
    piece.button.style.pointerEvents = angle < 0.3 || maxAngle-angle < 0.35 ? "none" : "auto";
  });
}

let momentum=0;
let momentumFrame=0;
const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
function continueMotion(){
  momentumFrame=0;
  if(overlay.classList.contains("open")){momentum=0;return;}
  momentum*=.89;
  if(Math.abs(momentum)<.00008){momentum=0;return;}
  moveSpiral(momentum);
  momentumFrame=requestAnimationFrame(continueMotion);
}
function gentlySettle(delta){
  moveSpiral(delta);
  if(reduceMotion.matches)return;
  momentum=Math.max(-.035,Math.min(.035,delta*.22));
  if(!momentumFrame)momentumFrame=requestAnimationFrame(continueMotion);
}
function dismissScrollHint(){document.body.classList.add("has-explored");}
function moveSpiral(delta) {
  phase += delta;
  render();
}

// Scroll anywhere on the page to move the artwork through the spiral.
window.addEventListener("wheel", (event) => {
  if (overlay.classList.contains("open")) return;
  event.preventDefault();
  dismissScrollHint();
  gentlySettle(event.deltaY * SCROLL_SPEED);
}, { passive: false });

// Drag on empty space. Clicking a project does not start a drag.
window.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button, a")) return;
  dragging = true;
  momentum=0;
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
});

window.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  dismissScrollHint();
  const delta=window.innerWidth<=700 ? (lastPointerY-event.clientY)*DRAG_SPEED : (lastPointerX-event.clientX)*DRAG_SPEED;
  moveSpiral(delta);
  momentum=reduceMotion.matches?0:Math.max(-.028,Math.min(.028,delta*.18));
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
  lastPointerY = event.clientY;
});

window.addEventListener("pointerup", () => { if(dragging && momentum && !momentumFrame)momentumFrame=requestAnimationFrame(continueMotion); dragging = false; });
window.addEventListener("pointercancel", () => { dragging = false; });
window.addEventListener("resize", () => { drawSpiral(); render(); });

// Filter without changing page or resetting spiral position.
filterButtons.forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  filterButtons.forEach(b => {
    const active = b === button;
    b.classList.toggle("active", active);
    b.setAttribute("aria-pressed", String(active));
  });
  render();
}));

closeButton.addEventListener("click", () => closeProject());
window.addEventListener("popstate", syncFromURL);
window.addEventListener("hashchange", syncFromURL);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeProject();
  if (event.key === "Tab" && overlay.classList.contains("open")) {
    // The only focusable control in the demo project view is Close.
    event.preventDefault();
    closeButton.focus();
  }
});

// Initial render.
drawSpiral();
render();
syncFromURL();
