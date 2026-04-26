<!-- Joystick.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';

  let container;
  let thumb;
  let hintElement;

  let activeDrag = false;
  let containerActive = false;  // controls the 'active' class via Svelte
  let currentPointerId = null;
  let hasInteracted = false;

  let startPointerRel = { x: 0, y: 0 };
  let startDisplacement = { x: 0, y: 0 };
  let currentDisplacement = { x: 0, y: 0 };

  let baseCenterX = 0, baseCenterY = 0;
  let maxRadius = 0;
  let thumbRadius = 0;

  // Logging helper
  function logJoystickState(dispX, dispY) {
    const distance = Math.hypot(dispX, dispY);
    const maxR = maxRadius;
    let force = 0;
    let normX = 0, normY = 0;
    let angleDeg = 0;
    if (maxR > 0.001) {
      force = Math.min(1, distance / maxR);
      if (distance > 0.001) {
        normX = dispX / maxR;
        normY = dispY / maxR;
        const angleRad = Math.atan2(dispY, dispX);
        angleDeg = (angleRad * 180 / Math.PI).toFixed(1);
      }
    }
    console.log(`🎮 Joystick | force: ${force.toFixed(3)} | angle: ${angleDeg}° | norm: (${normX.toFixed(2)}, ${normY.toFixed(2)})`);
  }

  function updateGeometry() {
    if (!container || !thumb) return;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const thumbWidth = thumb.clientWidth;
    const thumbHeight = thumb.clientHeight;
    thumbRadius = thumbWidth / 2;
    baseCenterX = containerWidth / 2;
    baseCenterY = containerHeight / 2;
    const baseRadius = Math.min(containerWidth, containerHeight) / 2;
    maxRadius = Math.max(0, baseRadius - thumbRadius);
    console.log(`📐 Geometry: maxRadius=${maxRadius}, thumbRadius=${thumbRadius}, baseCenter=(${baseCenterX},${baseCenterY})`);
  }

  function setThumbPositionFromDisplacement(dx, dy) {
    const left = baseCenterX + dx - thumbRadius;
    const top = baseCenterY + dy - thumbRadius;
    thumb.style.left = `${left}px`;
    thumb.style.top = `${top}px`;
  }

  function getCurrentDisplacement() {
    const left = parseFloat(thumb.style.left);
    const top = parseFloat(thumb.style.top);
    if (isNaN(left) || isNaN(top)) {
      const offLeft = thumb.offsetLeft;
      const offTop = thumb.offsetTop;
      const thumbCenterX = offLeft + thumbRadius;
      const thumbCenterY = offTop + thumbRadius;
      return { x: thumbCenterX - baseCenterX, y: thumbCenterY - baseCenterY };
    }
    const thumbCenterX = left + thumbRadius;
    const thumbCenterY = top + thumbRadius;
    return { x: thumbCenterX - baseCenterX, y: thumbCenterY - baseCenterY };
  }

  function clampDisplacement(dx, dy, maxR) {
    const dist = Math.hypot(dx, dy);
    if (dist > maxR && maxR > 0) {
      const ratio = maxR / dist;
      return { x: dx * ratio, y: dy * ratio };
    }
    return { x: dx, y: dy };
  }

  function resetThumbToCenter() {
    const targetLeft = baseCenterX - thumbRadius;
    const targetTop = baseCenterY - thumbRadius;
    thumb.style.left = `${targetLeft}px`;
    thumb.style.top = `${targetTop}px`;
    currentDisplacement = { x: 0, y: 0 };
  }

  function hideJoystick() {
    if (!containerActive) return;
    containerActive = false;
    activeDrag = false;
    currentPointerId = null;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerUp);
    if (thumb.hasPointerCapture && currentPointerId !== null) {
      try { thumb.releasePointerCapture(currentPointerId); } catch(e) {}
    }
    resetThumbToCenter();
    console.log("👻 Joystick hidden (containerActive = false)");
  }

  function showAndStartDrag(clientX, clientY, pointerId) {
    updateGeometry();
    if (maxRadius <= 0) {
      console.warn("⚠️ maxRadius <= 0, cannot start drag");
      return false;
    }

    container.style.left = `${clientX}px`;
    container.style.top = `${clientY}px`;

    resetThumbToCenter();
    containerActive = true;
    console.log("🟢 containerActive set to true, active class should appear");

    thumb.classList.add('no-transition');

    const rect = container.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    let currDisp = getCurrentDisplacement();
    const safeDisp = clampDisplacement(currDisp.x, currDisp.y, maxRadius);
    if (safeDisp.x !== currDisp.x || safeDisp.y !== currDisp.y) {
      setThumbPositionFromDisplacement(safeDisp.x, safeDisp.y);
      currDisp = safeDisp;
    }
    currentDisplacement = currDisp;

    startPointerRel.x = relX;
    startPointerRel.y = relY;
    startDisplacement.x = currentDisplacement.x;
    startDisplacement.y = currentDisplacement.y;

    activeDrag = true;
    currentPointerId = pointerId;

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);

    thumb.setPointerCapture(pointerId);
    console.log(`🕹️ Joystick shown at (${clientX}, ${clientY})`);
    return true;
  }

  function onPointerMove(e) {
    if (!activeDrag || !containerActive) return;
    if (currentPointerId !== null && e.pointerId !== currentPointerId) return;
    e.preventDefault();

    const rect = container.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;

    const deltaX = relX - startPointerRel.x;
    const deltaY = relY - startPointerRel.y;

    let rawDispX = startDisplacement.x + deltaX;
    let rawDispY = startDisplacement.y + deltaY;

    const clamped = clampDisplacement(rawDispX, rawDispY, maxRadius);
    setThumbPositionFromDisplacement(clamped.x, clamped.y);
    currentDisplacement = clamped;

    logJoystickState(currentDisplacement.x, currentDisplacement.y);
  }

  function onPointerUp(e) {
    if (!activeDrag || !containerActive) return;
    if (currentPointerId !== null && e.pointerId !== currentPointerId) return;
    e.preventDefault();

    activeDrag = false;

    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerUp);

    if (thumb.hasPointerCapture && currentPointerId !== null) {
      try { thumb.releasePointerCapture(currentPointerId); } catch(e) {}
    }
    currentPointerId = null;

    thumb.classList.remove('no-transition');
    resetThumbToCenter();
    logJoystickState(0, 0);

    setTimeout(() => {
      if (!activeDrag) hideJoystick();
    }, 80);
  }

  function onGlobalPointerDown(e) {
    e.preventDefault();
    if (!hasInteracted && hintElement) {
      hasInteracted = true;
      hintElement.style.opacity = '0';
      setTimeout(() => {
        if (hintElement) hintElement.style.display = 'none';
      }, 300);
    }
    if (containerActive) hideJoystick();
    showAndStartDrag(e.clientX, e.clientY, e.pointerId);
  }

  function onThumbPointerDown(e) {
    if (activeDrag) return;
    if (!containerActive) return;
    e.preventDefault();

    const rect = container.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;

    let currDisp = getCurrentDisplacement();
    const safeDisp = clampDisplacement(currDisp.x, currDisp.y, maxRadius);
    if (safeDisp.x !== currDisp.x || safeDisp.y !== currDisp.y) {
      setThumbPositionFromDisplacement(safeDisp.x, safeDisp.y);
      currDisp = safeDisp;
    }
    currentDisplacement = currDisp;

    startPointerRel.x = relX;
    startPointerRel.y = relY;
    startDisplacement.x = currentDisplacement.x;
    startDisplacement.y = currentDisplacement.y;

    activeDrag = true;
    currentPointerId = e.pointerId;

    thumb.classList.add('no-transition');

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);

    thumb.setPointerCapture(e.pointerId);
  }

  function onWindowResize() {
    if (containerActive) hideJoystick();
  }

  function preventContextMenu(e) {
    e.preventDefault();
  }

  onMount(() => {
    updateGeometry();
    thumb.classList.add('no-transition');
    resetThumbToCenter();
    thumb.classList.remove('no-transition');
    containerActive = false;  // start hidden

    document.addEventListener('pointerdown', onGlobalPointerDown);
    window.addEventListener('resize', onWindowResize);
    document.body.addEventListener('contextmenu', preventContextMenu);

    console.log("✅ Joystick mounted – tap anywhere");
  });

  onDestroy(() => {
    document.removeEventListener('pointerdown', onGlobalPointerDown);
    window.removeEventListener('resize', onWindowResize);
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerCancel);
    document.body.removeEventListener('contextmenu', preventContextMenu);
    if (containerActive) hideJoystick();
  });
</script>

<!-- Using Svelte's class directive for reliability -->
<div class="joystick-container" class:active={containerActive} bind:this={container}>
  <div class="joystick-base"></div>
  <div class="joystick-thumb" bind:this={thumb} on:pointerdown={onThumbPointerDown}></div>
</div>

<div class="hint" bind:this={hintElement}>✨ Tap anywhere to start joystick ✨</div>

<style>
  :global(body) {
    background: radial-gradient(circle at 30% 20%, #1e2b32, #0f171f);
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    touch-action: none;
  }

  .joystick-container {
    position: fixed;
    left: 0;
    top: 0;
    width: 220px;
    height: 220px;
    transform: translate(-50%, -50%);
    opacity: 0;
    pointer-events: none;
    z-index: 1000;
    transition: opacity 0.15s ease;
  }

  .joystick-container.active {
    opacity: 1;
    pointer-events: auto;
  }

  .joystick-base {
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 35% 35%, #2c3f44, #1b2a2f);
    border-radius: 50%;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.15),
      inset 0 -4px 8px rgba(0, 0, 0, 0.3);
    cursor: default;
    touch-action: none;
  }

  .joystick-thumb {
    position: absolute;
    width: 80px;
    height: 80px;
    background: radial-gradient(circle at 35% 35%, #f0f4fa, #cbdae6);
    border-radius: 50%;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.9);
    cursor: grab;
    touch-action: none;
    will-change: left, top;
    transition: left 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.1), top 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  }

  .joystick-thumb:active {
    cursor: grabbing;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.6);
  }

  .no-transition {
    transition: none !important;
  }

  .hint {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    color: #ccdeee;
    padding: 8px 18px;
    border-radius: 40px;
    font-family: system-ui, monospace;
    font-size: 0.85rem;
    pointer-events: none;
    z-index: 1001;
    white-space: nowrap;
    transition: opacity 0.3s ease;
    opacity: 1;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 480px) {
    .joystick-container {
      width: 180px;
      height: 180px;
    }
    .joystick-thumb {
      width: 68px;
      height: 68px;
    }
    .hint {
      font-size: 0.7rem;
      bottom: 20px;
    }
  }
</style>