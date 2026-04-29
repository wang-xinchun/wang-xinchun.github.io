const canvas = document.getElementById("perceptionCanvas");
const ctx = canvas.getContext("2d");
const stageLabel = document.getElementById("stageLabel");
const cursorShell = document.getElementById("cursorShell");
const cursorLabel = document.getElementById("cursorLabel");
const revealItems = document.querySelectorAll(".reveal");
const storyCards = document.querySelectorAll(".story-card");
const interactiveCards = document.querySelectorAll(".interactive-card");
const pageRailNumber = document.getElementById("pageRailNumber");
const pageRailNodes = document.querySelectorAll("[data-rail-target]");
const supportsCustomCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const stageNames = ["Weak Signals", "Controlled Adjustment", "Publication Track", "Enterprise 3D"];
const pointer = {
  x: window.innerWidth * 0.5,
  y: window.innerHeight * 0.4,
  fx: window.innerWidth * 0.5,
  fy: window.innerHeight * 0.4,
  inside: false
};

const state = {
  width: 0,
  height: 0,
  dpr: Math.min(window.devicePixelRatio || 1, 2),
  time: 0,
  stageProgress: 0,
  currentStage: 0,
  grid: []
};

const pageRailSections = Array.from(pageRailNodes)
  .map((node) => ({
    node,
    page: node.dataset.railPage || "01",
    section: document.getElementById(node.dataset.railTarget)
  }))
  .filter((item) => item.section);

if (supportsCustomCursor) {
  document.body.classList.add("has-custom-cursor");
}

function resizeCanvas() {
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  state.dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(state.width * state.dpr);
  canvas.height = Math.floor(state.height * state.dpr);
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  buildGrid();
}

function buildGrid() {
  const spacing = window.innerWidth < 760 ? 34 : 28;
  const cols = Math.ceil(state.width / spacing) + 2;
  const rows = Math.ceil(state.height / spacing) + 2;
  state.grid = [];

  for (let y = -1; y < rows; y += 1) {
    for (let x = -1; x < cols; x += 1) {
      const px = x * spacing;
      const py = y * spacing;
      state.grid.push({
        x: px,
        y: py,
        ox: px,
        oy: py,
        seed: Math.random() * Math.PI * 2
      });
    }
  }
}

function ease(value, target, factor) {
  return value + (target - value) * factor;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getStageFromScroll(scrollValue = window.scrollY) {
  const doc = document.documentElement;
  const scrollable = Math.max(doc.scrollHeight - window.innerHeight, 1);
  const progress = scrollValue / scrollable;
  const staged = clamp(progress * 3.85, 0, 3.999);
  state.stageProgress = staged;
  state.currentStage = Math.floor(staged);
  document.documentElement.style.setProperty("--stage-progress", staged.toFixed(3));
  stageLabel.textContent = `Stage 0${state.currentStage + 1} / ${stageNames[state.currentStage]}`;
  updateActiveStoryCard();
  updatePageRail();
}

function updateActiveStoryCard() {
  storyCards.forEach((card, index) => {
    card.classList.toggle("is-active", index === state.currentStage);
  });
}

function updatePageRail() {
  if (!pageRailSections.length) {
    return;
  }

  const activationY = window.innerHeight * 0.42;
  let activeItem = pageRailSections[0];

  pageRailSections.forEach((item) => {
    if (item.section.getBoundingClientRect().top <= activationY) {
      activeItem = item;
    }
  });

  pageRailSections.forEach((item) => {
    item.node.classList.toggle("is-active", item === activeItem);
  });

  if (pageRailNumber) {
    pageRailNumber.textContent = activeItem.page;
  }
}

function drawBackground() {
  const { width, height, time } = state;
  const scrollGlow = state.stageProgress / 4;

  const baseGradient = ctx.createLinearGradient(0, 0, width, height);
  baseGradient.addColorStop(0, `rgba(255,255,255,${0.08 + scrollGlow * 0.04})`);
  baseGradient.addColorStop(0.5, "rgba(0,87,255,0.02)");
  baseGradient.addColorStop(1, `rgba(16,33,48,${0.06 + scrollGlow * 0.06})`);
  ctx.fillStyle = baseGradient;
  ctx.fillRect(0, 0, width, height);

  const haloX = pointer.x;
  const haloY = pointer.y;
  const halo = ctx.createRadialGradient(haloX, haloY, 0, haloX, haloY, width * 0.28);
  halo.addColorStop(0, "rgba(215,255,79,0.16)");
  halo.addColorStop(0.22, "rgba(0,87,255,0.11)");
  halo.addColorStop(1, "rgba(0,87,255,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = "rgba(16,33,48,0.35)";
  const lineGap = 88;
  for (let x = 0; x < width; x += lineGap) {
    const offset = Math.sin(time * 0.0005 + x * 0.01) * 16;
    ctx.beginPath();
    ctx.moveTo(x + offset, 0);
    ctx.lineTo(x - offset, height);
    ctx.stroke();
  }
  ctx.restore();
}

function drawGrid() {
  const { time } = state;
  const stage = state.stageProgress;
  const pixelWeight = clamp(1 - stage / 1.2, 0, 1);
  const patternWeight = clamp(1 - Math.abs(stage - 1.15), 0, 1);
  const tokenWeight = clamp(1 - Math.abs(stage - 2.15), 0, 1);
  const semanticWeight = clamp((stage - 2.5) / 1.1, 0, 1);

  for (let i = 0; i < state.grid.length; i += 1) {
    const node = state.grid[i];
    const dx = node.ox - pointer.fx;
    const dy = node.oy - pointer.fy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const influence = clamp(1 - dist / 280, 0, 1);
    const wave = Math.sin(time * 0.0018 + node.seed + node.ox * 0.01 + node.oy * 0.008);
    const ripple = Math.cos(time * 0.0012 + node.seed * 1.2 - dist * 0.035);
    const semanticField = Math.sin(node.ox * 0.008 + time * 0.0007) + Math.cos(node.oy * 0.012 - time * 0.0009);

    node.x = node.ox + wave * (2 + patternWeight * 4) + dx * influence * -0.04;
    node.y = node.oy + ripple * (2 + tokenWeight * 6) + dy * influence * -0.04;

    const semanticShiftX = semanticField * semanticWeight * 12;
    const semanticShiftY = Math.sin(node.seed + time * 0.0015) * semanticWeight * 8;

    const px = node.x + semanticShiftX;
    const py = node.y + semanticShiftY;

    if (pixelWeight > 0.03) {
      const intensity = clamp(0.25 + wave * 0.18 + influence * 0.72, 0.05, 1);
      const size = 2 + pixelWeight * 6 + influence * 9;
      ctx.fillStyle = `rgba(16,33,48,${0.04 + intensity * 0.18})`;
      ctx.fillRect(px - size * 0.5, py - size * 0.5, size, size);
    }

    if (patternWeight > 0.06 && i % 2 === 0) {
      const lineLength = 7 + patternWeight * 16 + influence * 20;
      ctx.strokeStyle = `rgba(0,87,255,${0.02 + patternWeight * 0.16 + influence * 0.18})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px - lineLength * 0.5, py - lineLength * 0.15);
      ctx.lineTo(px + lineLength * 0.5, py + lineLength * 0.15);
      ctx.stroke();
    }

    if (tokenWeight > 0.08 && i % 3 === 0) {
      const tokenSize = 10 + tokenWeight * 14;
      ctx.strokeStyle = `rgba(215,255,79,${0.02 + tokenWeight * 0.18 + influence * 0.2})`;
      ctx.strokeRect(px - tokenSize * 0.5, py - tokenSize * 0.5, tokenSize, tokenSize);
    }

    if (semanticWeight > 0.06 && i % 5 === 0) {
      const radius = 6 + semanticWeight * 10 + influence * 14;
      const semanticAlpha = clamp(0.04 + semanticWeight * 0.18 + influence * 0.12, 0, 0.28);
      const semanticGradient = ctx.createRadialGradient(px, py, 0, px, py, radius);
      semanticGradient.addColorStop(0, `rgba(0,87,255,${semanticAlpha})`);
      semanticGradient.addColorStop(0.6, `rgba(215,255,79,${semanticAlpha * 0.8})`);
      semanticGradient.addColorStop(1, "rgba(215,255,79,0)");
      ctx.fillStyle = semanticGradient;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawSemanticContours() {
  const weight = clamp((state.stageProgress - 2.2) / 1.25, 0, 1);
  if (weight <= 0.01) {
    return;
  }

  const rings = 3;
  for (let ring = 0; ring < rings; ring += 1) {
    const radiusX = state.width * (0.16 + ring * 0.08) + Math.sin(state.time * 0.0008 + ring) * 20;
    const radiusY = state.height * (0.1 + ring * 0.06) + Math.cos(state.time * 0.0007 + ring) * 18;
    const cx = state.width * (0.55 + Math.sin(state.time * 0.0005 + ring) * 0.08);
    const cy = state.height * (0.38 + Math.cos(state.time * 0.0004 + ring) * 0.06);

    ctx.strokeStyle = ring % 2 === 0
      ? `rgba(0,87,255,${0.04 + weight * 0.16})`
      : `rgba(215,255,79,${0.03 + weight * 0.14})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let angle = 0; angle <= Math.PI * 2 + 0.1; angle += 0.08) {
      const variance = Math.sin(angle * 4 + state.time * 0.0015 + ring) * 14 * weight;
      const x = cx + Math.cos(angle) * (radiusX + variance);
      const y = cy + Math.sin(angle) * (radiusY + variance * 0.7);
      if (angle === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();
  }
}

function animate() {
  state.time += 16;
  const followDistance = Math.hypot(pointer.x - pointer.fx, pointer.y - pointer.fy);
  const followFactor = clamp(0.2 + followDistance / 1200, 0.2, 0.42);
  pointer.fx = ease(pointer.fx, pointer.x, followFactor);
  pointer.fy = ease(pointer.fy, pointer.y, followFactor);

  getStageFromScroll(window.scrollY);

  ctx.clearRect(0, 0, state.width, state.height);
  drawBackground();
  drawGrid();
  drawSemanticContours();

  requestAnimationFrame(animate);
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
    }
  });
}, {
  threshold: 0.16
});

revealItems.forEach((item) => {
  revealObserver.observe(item);
});

function setCursorTarget(target) {
  if (!supportsCustomCursor || !cursorShell || !cursorLabel) {
    return;
  }

  const nextLabel = target?.dataset.cursor?.trim() || "";
  cursorShell.classList.toggle("is-targeting", Boolean(nextLabel));
  cursorLabel.textContent = nextLabel;
}

function resetCardMotion(card) {
  card.style.setProperty("--card-rotate-x", "0deg");
  card.style.setProperty("--card-rotate-y", "0deg");
  card.style.setProperty("--glow-x", "50%");
  card.style.setProperty("--glow-y", "50%");
  card.style.setProperty("--scan-shift", "0%");
}

function updateCardMotion(card, clientX, clientY) {
  const rect = card.getBoundingClientRect();
  const relX = clamp((clientX - rect.left) / rect.width, 0, 1);
  const relY = clamp((clientY - rect.top) / rect.height, 0, 1);
  const centeredX = relX - 0.5;
  const centeredY = relY - 0.5;

  let rotateRange = 8;
  const style = card.dataset.cardStyle || "";

  if (card.classList.contains("interactive-panel")) {
    rotateRange = 5.5;
  } else if (style === "story") {
    rotateRange = 10;
  } else if (style === "stream") {
    rotateRange = 7;
  } else if (style === "timeline") {
    rotateRange = 7.5;
  }

  card.style.setProperty("--card-rotate-x", `${(-centeredY * rotateRange).toFixed(2)}deg`);
  card.style.setProperty("--card-rotate-y", `${(centeredX * rotateRange).toFixed(2)}deg`);
  card.style.setProperty("--glow-x", `${(relX * 100).toFixed(2)}%`);
  card.style.setProperty("--glow-y", `${(relY * 100).toFixed(2)}%`);
  card.style.setProperty("--scan-shift", `${(centeredX * 60).toFixed(2)}%`);
}

function onPointerMove(event) {
  if (!supportsCustomCursor || !cursorShell) {
    return;
  }

  if (!pointer.inside) {
    pointer.fx = event.clientX;
    pointer.fy = event.clientY;
  }

  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.inside = true;

  cursorShell.classList.add("is-visible");
  cursorShell.style.setProperty("--cursor-x", `${event.clientX}px`);
  cursorShell.style.setProperty("--cursor-y", `${event.clientY}px`);
}

function onPointerLeave() {
  pointer.inside = false;
  if (!supportsCustomCursor || !cursorShell) {
    return;
  }

  setCursorTarget(null);
  cursorShell.classList.remove("is-visible");
  cursorShell.classList.remove("is-pressed");
  cursorShell.classList.remove("is-targeting");
}

if (supportsCustomCursor && cursorShell) {
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseleave", onPointerLeave);

  window.addEventListener("mousedown", () => {
    cursorShell.classList.add("is-pressed");
  });

  window.addEventListener("mouseup", () => {
    cursorShell.classList.remove("is-pressed");
  });

  document.addEventListener("mouseover", (event) => {
    const nextTarget = event.target.closest("[data-cursor]");
    setCursorTarget(nextTarget);
  });

  document.addEventListener("mouseout", (event) => {
    const nextTarget = event.relatedTarget instanceof Element
      ? event.relatedTarget.closest("[data-cursor]")
      : null;
    setCursorTarget(nextTarget);
  });
}

if (supportsCustomCursor) {
  interactiveCards.forEach((card) => {
    resetCardMotion(card);

    card.addEventListener("mouseenter", (event) => {
      card.classList.add("is-hovered");
      updateCardMotion(card, event.clientX, event.clientY);
    });

    card.addEventListener("mousemove", (event) => {
      updateCardMotion(card, event.clientX, event.clientY);
    });

    card.addEventListener("mouseleave", () => {
      card.classList.remove("is-hovered");
      resetCardMotion(card);
    });
  });
}

window.addEventListener("resize", () => {
  resizeCanvas();
  getStageFromScroll(window.scrollY);
});
window.addEventListener("scroll", () => {
  getStageFromScroll(window.scrollY);
}, { passive: true });

resizeCanvas();
getStageFromScroll(window.scrollY);
animate();
