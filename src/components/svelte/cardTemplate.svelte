<script>
  import { onMount, onDestroy } from 'svelte';

  export let cardCount = 5;

  let canvasContainer;
  let cards = [];
  let activeCard = null;
  let dragOffsetX = 0, dragOffsetY = 0;
  let globalZCounter = 10;
  let cardPositions = [];
  let cardZIndices = [];

  // Generate card data with unique IDs
  $: cardsData = Array.from({ length: cardCount }, (_, i) => ({
    id: i, // original id, will stay with card when reordered
    emoji: ["🃖", "🃈", "🃊", "🃝", "🃞", "🂭", "🂮", "🃟", "🃠", "🃡"][i % 10],
    title: `CARD ${i + 1}`,
    desc: `drag & stack`,
    badge: `✨ #${i + 1}`,
    suit: ["♠️", "♣️", "♥️", "♦️", "⭐"][i % 5]
  }));

  // Smart positioning: distributes cards evenly, allows overlap if needed
  function computeBottomPositions(order = null) {
    if (!canvasContainer || cards.length === 0) return [];
    const containerWidth = canvasContainer.clientWidth;
    const containerHeight = canvasContainer.clientHeight;
    if (containerWidth === 0) return [];

    let cardWidth = 128, cardHeight = 178;
    if (cards[0]) {
      cardWidth = cards[0].offsetWidth;
      cardHeight = cards[0].offsetHeight;
    }

    const count = cards.length;
    const minGap = -20;
    const preferredGap = 14;
    
    let totalWidth = count * cardWidth + (count - 1) * preferredGap;
    let actualGap = preferredGap;
    
    if (totalWidth > containerWidth - 20) {
      const availableWidth = containerWidth - 20;
      actualGap = (availableWidth - count * cardWidth) / (count - 1);
      actualGap = Math.max(minGap, actualGap);
      totalWidth = count * cardWidth + (count - 1) * actualGap;
    }
    
    let startX = (containerWidth - totalWidth) / 2;
    startX = Math.max(8, startX);
    const rightmost = startX + totalWidth;
    if (rightmost > containerWidth - 8) {
      startX = containerWidth - totalWidth - 8;
    }
    
    const bottomMargin = 24;
    const topPos = Math.max(8, containerHeight - cardHeight - bottomMargin);
    
    const positions = [];
    for (let i = 0; i < count; i++) {
      let leftPos = startX + i * (cardWidth + actualGap);
      leftPos = Math.min(Math.max(2, leftPos), containerWidth - cardWidth - 2);
      positions.push({ left: leftPos, top: topPos });
    }
    return positions;
  }

  // Reset with reordering based on current X positions
  function resetToBottom() {
    if (activeCard) endDrag();

    // Get current left positions and sort card indices by X
    const currentLefts = cards.map((card, idx) => ({
      idx,
      left: parseFloat(card.style.left) || cardPositions[idx]?.left || 0
    }));
    currentLefts.sort((a, b) => a.left - b.left);
    const newOrderIndices = currentLefts.map(item => item.idx);
    
    // Reorder cardsData according to new order
    const newCardsData = newOrderIndices.map(i => cardsData[i]);
    // Update cardsData reactively
    cardsData.length = 0;
    cardsData.push(...newCardsData);
    
    // Compute bottom positions for the reordered cards
    const positions = computeBottomPositions();
    if (positions.length) {
      cardPositions = positions;
      cardZIndices = cards.map((_, i) => 10 + i);
      globalZCounter = 10 + cards.length;
    }
  }

  function clampPosition(card, left, top) {
    const cardWidth = card.offsetWidth;
    const cardHeight = card.offsetHeight;
    const containerWidth = canvasContainer.clientWidth;
    const containerHeight = canvasContainer.clientHeight;
    let newLeft = Math.min(Math.max(0, left), containerWidth - cardWidth);
    let newTop = Math.min(Math.max(0, top), containerHeight - cardHeight);
    return { left: newLeft, top: newTop };
  }

  // Drag handlers
  function startDrag(e, index) {
    if (activeCard) return;
    const card = cards[index];
    const clientX = e.clientX ?? e.touches[0].clientX;
    const clientY = e.clientY ?? e.touches[0].clientY;
    const cardRect = card.getBoundingClientRect();
    const canvasRect = canvasContainer.getBoundingClientRect();
    dragOffsetX = clientX - cardRect.left;
    dragOffsetY = clientY - cardRect.top;
    activeCard = { index, card };
    const newZ = ++globalZCounter;
    cardZIndices[index] = newZ;
    cardZIndices = [...cardZIndices];
    card.style.transition = 'none';
    card.classList.add('dragging');
    document.body.style.userSelect = 'none';
    document.body.style.touchAction = 'none';
  }

  function onDrag(clientX, clientY) {
    if (!activeCard) return;
    const canvasRect = canvasContainer.getBoundingClientRect();
    let desiredLeft = clientX - dragOffsetX - canvasRect.left;
    let desiredTop = clientY - dragOffsetY - canvasRect.top;
    const clamped = clampPosition(activeCard.card, desiredLeft, desiredTop);
    cardPositions[activeCard.index] = { left: clamped.left, top: clamped.top };
    cardPositions = [...cardPositions];
  }

  function endDrag() {
    if (activeCard) {
      activeCard.card.style.transition = '';
      activeCard.card.classList.remove('dragging');
      activeCard = null;
    }
    document.body.style.userSelect = '';
    document.body.style.touchAction = '';
  }

  function onMouseMove(e) {
    e.preventDefault();
    onDrag(e.clientX, e.clientY);
  }
  function onMouseUp() {
    endDrag();
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }
  function onTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) onDrag(touch.clientX, touch.clientY);
  }
  function onTouchEnd() {
    endDrag();
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchEnd);
  }

  function handleMouseDown(e, index) {
    e.preventDefault();
    if (e.button !== 0) return;
    startDrag(e, index);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }
  function handleTouchStart(e, index) {
    e.preventDefault();
    startDrag(e, index);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
  }

  function handleResize() {
    if (activeCard) return;
    if (!cards.length) return;
    let changed = false;
    for (let i = 0; i < cards.length; i++) {
      const current = cardPositions[i];
      if (current) {
        const clamped = clampPosition(cards[i], current.left, current.top);
        if (clamped.left !== current.left || clamped.top !== current.top) {
          cardPositions[i] = clamped;
          changed = true;
        }
      }
    }
    if (changed) cardPositions = [...cardPositions];
  }

  function initPositions() {
    const positions = computeBottomPositions();
    if (positions.length) {
      cardPositions = positions;
      cardZIndices = cards.map((_, i) => 10 + i);
      globalZCounter = 10 + cards.length;
    }
  }

  $: if (cards.length && cards.length === cardCount) {
    setTimeout(() => initPositions(), 30);
  }

  let resizeObserver;
  onMount(() => {
    setTimeout(() => initPositions(), 20);
    window.addEventListener('resize', handleResize);
    if (canvasContainer) {
      resizeObserver = new ResizeObserver(() => handleResize());
      resizeObserver.observe(canvasContainer);
    }
  });

  onDestroy(() => {
    window.removeEventListener('resize', handleResize);
    if (resizeObserver) resizeObserver.disconnect();
    endDrag();
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchEnd);
  });
</script>

<div class="table">
  <div class="card-canvas" bind:this={canvasContainer}>
    {#each cardsData as card, i (card.id)}
      <div
        class="card"
        bind:this={cards[i]}
        style="left: {cardPositions[i]?.left ?? 0}px; top: {cardPositions[i]?.top ?? 0}px; z-index: {cardZIndices[i] ?? 10 + i};"
        on:mousedown={(e) => handleMouseDown(e, i)}
        on:touchstart={(e) => handleTouchStart(e, i)}
      >
        <div class="card-emoji">{card.emoji}</div>
        <div class="card-title">{card.title}</div>
        <div class="card-desc">{card.desc}</div>
        <div class="suit-icon">{card.suit}</div>
        <div class="card-badge">{card.badge}</div>
      </div>
    {/each}
  </div>
  <div class="controls">
    <button on:click={resetToBottom}>🃟 RESET & REORDER BY X POSITION 🃟</button>
  </div>
  <div class="status">
    <div class="info">
      ✨ Drag cards to change their order → reset will rearrange them left-to-right ✨<br />
      🃟 Cards keep their content when reordered 🃟<br />
      📊 Current card count: <strong>{cardCount}</strong>
    </div>
  </div>
</div>

<style>
  * {
    user-select: none;
    box-sizing: border-box;
  }

  .card-canvas {
    position: relative;
    width: 100%;
    min-height: 560px;
    background: radial-gradient(ellipse at 30% 40%, rgba(40, 80, 45, 0.3), rgba(20, 45, 20, 0.5));
    border-radius: 2.5rem;
    overflow: visible;
    touch-action: none;
  }

  .card {
    position: absolute;
    width: 128px;
    height: 178px;
    background: linear-gradient(145deg, #fff9ef, #fff0df);
    border-radius: 16px;
    box-shadow: 0 12px 22px -6px rgba(0, 0, 0, 0.4), 0 1px 0 0 rgba(255, 255, 200, 0.6) inset;
    cursor: grab;
    will-change: left, top;
    padding: 12px 8px;
    display: flex;
    flex-direction: column;
    font-weight: 600;
    color: #2c2418;
    transition: left 0.28s cubic-bezier(0.2, 0.9, 0.4, 1.1), top 0.28s cubic-bezier(0.2, 0.9, 0.4, 1.1);
    border: 1px solid rgba(220, 190, 120, 0.7);
  }

  .card.dragging {
    transition: none !important;
    cursor: grabbing;
    box-shadow: 0 20px 30px -8px black, 0 0 0 3px rgba(255, 215, 120, 0.8);
    z-index: 9999 !important;
  }

  .card-emoji {
    font-size: 2.6rem;
    text-align: center;
    margin: 8px 0 4px 0;
  }
  .card-title {
    font-size: 1.1rem;
    font-weight: 800;
    text-align: center;
    background: linear-gradient(135deg, #b45f2b, #6b3e1a);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    margin: 4px 0;
  }
  .card-desc {
    font-size: 0.65rem;
    text-align: center;
    color: #5a4a32;
    margin-top: 6px;
  }
  .suit-icon {
    font-size: 0.9rem;
    text-align: center;
    opacity: 0.7;
  }
  .card-badge {
    margin-top: auto;
    font-size: 0.6rem;
    background: #e9dbc9;
    width: fit-content;
    align-self: center;
    padding: 3px 10px;
    border-radius: 30px;
    color: #4a2e18;
    font-weight: 600;
  }

  .controls {
    display: flex;
    justify-content: center;
    padding: 16px 20px 20px;
    gap: 20px;
  }
  button {
    background: #2c2118;
    border: none;
    padding: 10px 28px;
    border-radius: 60px;
    font-weight: bold;
    font-size: 1rem;
    color: #ffefcf;
    cursor: pointer;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.4);
    transition: 0.12s linear;
    border: 1px solid rgba(230, 200, 120, 0.6);
  }
  button:active {
    transform: scale(0.96);
  }
  .info {
    text-align: center;
    font-size: 0.8rem;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(8px);
    color: #f2e3c9;
    padding: 6px 20px;
    border-radius: 40px;
    display: inline-block;
    margin-bottom: 12px;
  }
  .status {
    text-align: center;
    margin-bottom: 8px;
  }

  @media (max-width: 700px) {
    .card { width: 106px; height: 152px; padding: 8px 5px; }
    .card-emoji { font-size: 2rem; }
    .card-title { font-size: 0.9rem; }
    .card-desc { font-size: 0.55rem; }
  }
  @media (max-width: 550px) {
    .card { width: 90px; height: 132px; }
    .card-emoji { font-size: 1.7rem; }
  }

  .card:nth-child(1) { transform: rotate(-1deg); }
  .card:nth-child(2) { transform: rotate(0.5deg); }
  .card:nth-child(3) { transform: rotate(-0.5deg); }
  .card:nth-child(4) { transform: rotate(1deg); }
  .card:nth-child(5) { transform: rotate(0deg); }
  .card.dragging { transform: rotate(0deg) !important; }

  :global(.table) {
    width: 1200px;
    max-width: 95vw;
    background: rgba(30, 60, 35, 0.4);
    backdrop-filter: blur(3px);
    border-radius: 3rem;
    box-shadow: 0 25px 40px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(210, 180, 110, 0.5);
    margin: 0 auto;
  }
  :global(body) {
    background: radial-gradient(circle at 20% 30%, #1a472a, #0e2a1a);
    font-family: 'Segoe UI', 'Quicksand', system-ui, sans-serif;
    margin: 0;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }
</style>