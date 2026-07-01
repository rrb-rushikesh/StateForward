/**
 * StateForward IDE — app.js v2
 * Complete interaction system: tabs, activity bar, canvas, nodes, sync, guide
 */
'use strict';

/* ================================================================
   STATE
================================================================ */
const State = {
  currentTab: 'frontend',
  activePanels: { frontend: 'layers', backend: 'node-palette', database: 'db-tables', code: 'code-explorer', settings: 'set-editor' },
  canvasZoom: 75,
  nodeCanvasZoom: 100,
  nodeCanvasOffset: { x: 0, y: 0 },
  selectedNode: null,
  selectedEl: null,
  draggingNode: null,
  synced: true,
  activeConnectionSource: null,
  backendConnections: [
    { from: 'p-trigger-out', to: 'p-validate-in', color: '#f97316' },
    { from: 'p-validate-out', to: 'p-db-in', color: '#eab308' },
    { from: 'p-validate-out', to: 'p-email-in', color: '#eab308' },
    { from: 'p-db-out', to: 'p-resp-ok', color: '#22c55e' },
    { from: 'p-db-err', to: 'p-resp-err', color: '#ef4444' },
  ]
};

/* ================================================================
   INIT
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initMainTabs();
  initActivityBar();
  initCanvasToolbar();
  initPropsPanel();
  initNodeCanvas();
  initDatabaseViews();
  initCodeEditor();
  initSettingsPanel();
  initBottomPanel();
  initCommandPalette();
  initResizeHandle();
  initContextMenu();
  initGuide();
  initSyncSystem();
  initTerminalSimulation();
  buildDataTable();
  buildQueryLineNumbers();
  buildCodeGutter();
  initToggles();
  showToast('StateForward IDE loaded', 'success', 'ri-rocket-line');
});

/* ================================================================
   MAIN TABS
================================================================ */
function initMainTabs() {
  const tabs = document.querySelectorAll('.main-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      switchTab(target);
    });
  });
}

function switchTab(tab) {
  State.currentTab = tab;

  // Tab buttons
  document.querySelectorAll('.main-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));

  // Workspaces
  document.querySelectorAll('.tab-workspace').forEach(ws => ws.classList.toggle('active', ws.id === `ws-${tab}`));

  // Activity bar sets
  document.querySelectorAll('.ab-set').forEach(set => {
    set.style.display = set.dataset.ab === tab ? 'flex' : 'none';
  });

  // Restore active panel for this tab
  const savedPanel = State.activePanels[tab];
  if (savedPanel) showPanel(savedPanel, tab);

  flashSync();
}

/* ================================================================
   ACTIVITY BAR
================================================================ */
function initActivityBar() {
  document.querySelectorAll('.ab-btn[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = State.currentTab;
      const panel = btn.dataset.panel;

      // Toggle: click active panel = close
      const currentSet = document.querySelector(`.ab-set[data-ab="${tab}"]`);
      const wasActive = btn.classList.contains('active');

      currentSet?.querySelectorAll('.ab-btn').forEach(b => b.classList.remove('active'));

      if (wasActive) {
        // Close sidebar
        document.getElementById('sidebar').style.width = '0';
        document.getElementById('sidebar').style.minWidth = '0';
        return;
      }

      btn.classList.add('active');
      document.getElementById('sidebar').style.width = '';
      document.getElementById('sidebar').style.minWidth = '';
      showPanel(panel, tab);
      State.activePanels[tab] = panel;
    });
  });
}

function showPanel(panelId, tab) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(`panel-${panelId}`);
  if (panel) panel.classList.add('active');

  // Sync ab-btn active state
  const set = document.querySelector(`.ab-set[data-ab="${tab}"]`);
  set?.querySelectorAll('.ab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.panel === panelId);
  });
}

/* ================================================================
   CANVAS TOOLBAR
================================================================ */
function initCanvasToolbar() {
  // Tool selection
  const ctBtns = document.querySelectorAll('.ct-btn[data-tool]');
  ctBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      ctBtns.forEach(b => b.classList.remove('ct-active'));
      btn.classList.add('ct-active');
      const tool = btn.dataset.tool;
      const canvasScroll = document.getElementById('canvas-scroll-area');
      if (canvasScroll) {
        canvasScroll.style.cursor = tool === 'select' ? 'default' : tool === 'text' ? 'text' : 'crosshair';
      }
    });
  });

  // Viewport buttons
  const vpBtns = document.querySelectorAll('.vp-btn');
  vpBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      vpBtns.forEach(b => b.classList.remove('vp-active'));
      btn.classList.add('vp-active');
      const w = parseInt(btn.dataset.vp);
      const wrap = document.getElementById('canvas-frame-wrap');
      const widthInput = document.getElementById('ct-width');
      if (wrap) { wrap.style.width = `${w}px`; }
      if (widthInput) widthInput.value = w;
      setCanvasZoom(State.canvasZoom);
      showToast(`Viewport: ${w}px`, 'info', 'ri-computer-line');
    });
  });

  // Zoom controls
  const zoomIn = document.getElementById('zoom-in-btn');
  const zoomOut = document.getElementById('zoom-out-btn');
  const zoomFit = document.getElementById('zoom-fit-btn');
  const zoomVal = document.getElementById('canvas-zoom');

  if (zoomIn) zoomIn.addEventListener('click', () => { State.canvasZoom = Math.min(200, State.canvasZoom + 10); setCanvasZoom(State.canvasZoom); });
  if (zoomOut) zoomOut.addEventListener('click', () => { State.canvasZoom = Math.max(20, State.canvasZoom - 10); setCanvasZoom(State.canvasZoom); });
  if (zoomFit) zoomFit.addEventListener('click', () => { State.canvasZoom = 65; setCanvasZoom(State.canvasZoom); });
  if (zoomVal) zoomVal.addEventListener('click', () => { State.canvasZoom = 100; setCanvasZoom(State.canvasZoom); });

  // Preview
  const previewBtn = document.getElementById('preview-btn');
  if (previewBtn) previewBtn.addEventListener('click', () => showToast('Live preview opened at localhost:3000', 'info', 'ri-play-circle-line'));

  // Publish
  const publishBtn = document.getElementById('publish-btn');
  if (publishBtn) publishBtn.addEventListener('click', () => {
    showToast('Building production bundle…', 'info', 'ri-rocket-line');
    setTimeout(() => showToast('Deployed successfully! 🚀', 'success', 'ri-checkbox-circle-line'), 2400);
  });

  // Deploy
  const deployBtn = document.getElementById('global-deploy-btn');
  if (deployBtn) deployBtn.addEventListener('click', () => {
    showToast('Initiating deployment…', 'info', 'ri-rocket-line');
    setTimeout(() => showToast('All routes deployed ✓', 'success', 'ri-checkbox-circle-line'), 2000);
  });

  // Canvas element selection (visual builder) using event delegation
  const pageFrame = document.getElementById('page-frame');
  if (pageFrame) {
    pageFrame.addEventListener('click', e => {
      const el = e.target.closest('.canvas-el');
      if (el) {
        e.stopPropagation();
        document.querySelectorAll('.canvas-el').forEach(item => item.classList.remove('selected-el'));
        el.classList.add('selected-el');
        State.selectedEl = el;
        updatePropsHeader(el);
        updatePropsPanelFromElement(el);

        // Highlight layer
        const id = el.dataset.elId;
        document.querySelectorAll('.layer-row').forEach(r => r.classList.remove('selected-layer'));
        const matchLayer = document.querySelector(`.layer-row[data-id="${id}"]`);
        if (matchLayer) matchLayer.classList.add('selected-layer');
      } else {
        // Clicked outside elements -> deselect
        document.querySelectorAll('.canvas-el').forEach(item => item.classList.remove('selected-el'));
        State.selectedEl = null;
      }
    });
  }

  // Canvas drop zone & scroll area clicks
  const canvasScroll = document.getElementById('canvas-scroll-area');
  if (canvasScroll) {
    canvasScroll.addEventListener('click', e => {
      if (e.target === canvasScroll || e.target.id === 'canvas-outer') {
        document.querySelectorAll('.canvas-el').forEach(el => el.classList.remove('selected-el'));
        State.selectedEl = null;
      }
    });

    canvasScroll.addEventListener('dragover', e => e.preventDefault());
    canvasScroll.addEventListener('drop', e => {
      e.preventDefault();
      const comp = e.dataTransfer.getData('text/plain');
      if (!comp) return;

      const newId = `el-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const wrapper = document.createElement('div');
      wrapper.className = `canvas-el el-${comp}`;
      wrapper.dataset.elId = newId;
      wrapper.dataset.elType = getElementTypeFromTag(comp);

      // Label element
      const label = document.createElement('div');
      label.className = 'el-label';
      label.textContent = capitalize(comp);
      wrapper.appendChild(label);

      // Element handles (only for selection display)
      const handles = document.createElement('div');
      handles.className = 'el-handles';
      handles.innerHTML = `
        <div class="handle tl"></div><div class="handle tr"></div>
        <div class="handle bl"></div><div class="handle br"></div>
        <div class="handle tm"></div><div class="handle bm"></div>
        <div class="handle ml"></div><div class="handle mr"></div>
      `;
      wrapper.appendChild(handles);

      // Actual HTML content element based on dropped component type
      let contentEl;
      if (comp === 'section') {
        contentEl = document.createElement('section');
        contentEl.style.cssText = 'padding:60px 20px;background:#1a1a1a;text-align:center;min-height:120px;display:flex;flex-direction:column;justify-content:center;align-items:center';
        contentEl.innerHTML = '<h3 style="color:#ececec">New Section</h3><p style="color:#666;font-size:12px">Drag elements here</p>';
      } else if (comp === 'div') {
        contentEl = document.createElement('div');
        contentEl.style.cssText = 'padding:20px;border:1px dashed rgba(255,255,255,0.1);min-height:50px';
      } else if (comp === 'grid') {
        contentEl = document.createElement('div');
        contentEl.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:20px';
        contentEl.innerHTML = `
          <div style="background:#252525;padding:12px;border-radius:4px">Grid Item 1</div>
          <div style="background:#252525;padding:12px;border-radius:4px">Grid Item 2</div>
          <div style="background:#252525;padding:12px;border-radius:4px">Grid Item 3</div>
        `;
      } else if (comp === 'columns') {
        contentEl = document.createElement('div');
        contentEl.style.cssText = 'display:flex;gap:20px;padding:20px';
        contentEl.innerHTML = `
          <div style="flex:1;background:#252525;padding:12px;border-radius:4px">Left Column</div>
          <div style="flex:1;background:#252525;padding:12px;border-radius:4px">Right Column</div>
        `;
      } else if (comp === 'flex') {
        contentEl = document.createElement('div');
        contentEl.style.cssText = 'display:flex;gap:12px;align-items:center;padding:12px';
        contentEl.innerHTML = '<span>Item 1</span><span>Item 2</span>';
      } else if (comp === 'container') {
        contentEl = document.createElement('div');
        contentEl.style.cssText = 'max-width:1200px;margin:0 auto;padding:20px;border:1px dashed rgba(255,255,255,0.1)';
      } else if (comp === 'h1' || comp === 'h2' || comp === 'h3') {
        contentEl = document.createElement(comp);
        contentEl.style.cssText = 'font-size:32px;font-weight:700;margin-bottom:12px;color:#fff';
        contentEl.textContent = 'Heading';
      } else if (comp === 'p') {
        contentEl = document.createElement('p');
        contentEl.style.cssText = 'font-size:14px;color:#9a9a9a;line-height:1.6;margin-bottom:8px';
        contentEl.textContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
      } else if (comp === 'span') {
        contentEl = document.createElement('span');
        contentEl.style.cssText = 'color:var(--accent-2)';
        contentEl.textContent = 'Text Span';
      } else if (comp === 'link') {
        contentEl = document.createElement('a');
        contentEl.href = '#';
        contentEl.style.cssText = 'color:var(--accent);text-decoration:underline';
        contentEl.textContent = 'Link Text';
      } else if (comp === 'button') {
        contentEl = document.createElement('button');
        contentEl.style.cssText = 'background:var(--accent);color:#fff;border:none;padding:10px 20px;border-radius:6px;font-weight:600;cursor:pointer';
        contentEl.textContent = 'Button';
      } else if (comp === 'input') {
        contentEl = document.createElement('input');
        contentEl.type = 'text';
        contentEl.placeholder = 'Enter text...';
        contentEl.style.cssText = 'background:#1f1f1f;border:1px solid var(--border);color:#fff;padding:8px 12px;border-radius:6px;width:100%';
      } else if (comp === 'checkbox') {
        contentEl = document.createElement('div');
        contentEl.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px';
        contentEl.innerHTML = '<input type="checkbox" style="accent-color:var(--accent)"/><label>Checkbox label</label>';
      } else if (comp === 'toggle') {
        contentEl = document.createElement('div');
        contentEl.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px';
        contentEl.innerHTML = `
          <div class="toggle-sw" style="width:36px;height:20px;background:#333;border-radius:10px;position:relative;cursor:pointer">
            <div style="width:16px;height:16px;background:#fff;border-radius:50%;position:absolute;left:2px;top:2px;transition:0.2s"></div>
          </div>
          <span>Toggle switch</span>
        `;
      } else if (comp === 'img') {
        contentEl = document.createElement('img');
        contentEl.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80';
        contentEl.style.cssText = 'max-width:100%;height:auto;border-radius:8px';
      } else if (comp === 'video') {
        contentEl = document.createElement('div');
        contentEl.style.cssText = 'background:#000;aspect-ratio:16/9;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#666';
        contentEl.innerHTML = '<i class="ri-play-circle-fill" style="font-size:48px;color:var(--accent)"></i>';
      } else if (comp === 'divider') {
        contentEl = document.createElement('hr');
        contentEl.style.cssText = 'border:none;border-top:1px solid var(--border);margin:12px 0';
      } else {
        // Pre-built section fallback
        contentEl = document.createElement('section');
        contentEl.style.cssText = 'padding:60px 80px;background:#141414;text-align:center';
        contentEl.innerHTML = `<h3 style="font-size:24px;margin-bottom:8px">${capitalize(comp.replace('-', ' '))}</h3><p style="color:#666">Visual Component Placeholder</p>`;
      }

      wrapper.appendChild(contentEl);

      // Append to selected element if drop is in div/section/container, otherwise to pageFrame
      if (State.selectedEl && ['section', 'div', 'container'].includes(State.selectedEl.dataset.elType)) {
        // Find the inner element inside the selected wrapper
        const innerContent = [...State.selectedEl.children].find(c => !c.classList.contains('el-label') && !c.classList.contains('el-handles'));
        if (innerContent) {
          innerContent.appendChild(wrapper);
        } else {
          State.selectedEl.appendChild(wrapper);
        }
      } else {
        const dropZone = document.getElementById('canvas-drop-zone');
        if (dropZone) {
          pageFrame.insertBefore(wrapper, dropZone);
        } else {
          pageFrame.appendChild(wrapper);
        }
      }

      // Re-trigger selection of new element
      wrapper.click();

      // Update layers and code view
      updateLayersPanel();
      updateCodeFromVisual();

      showToast(`Added: ${capitalize(comp)}`, 'success', 'ri-add-circle-line');
      flashSync(true);
    });
  }

  // Component cards & preset items drag
  document.querySelectorAll('.comp-card, .preset-item').forEach(card => {
    card.addEventListener('dragstart', e => {
      const name = card.dataset.comp || 'component';
      e.dataTransfer.setData('text/plain', name);
      const dz = document.getElementById('canvas-drop-zone');
      if (dz) dz.classList.add('drag-active');
    });
    card.addEventListener('dragend', () => {
      const dz = document.getElementById('canvas-drop-zone');
      if (dz) dz.classList.remove('drag-active');
    });
  });

  // Initialize dynamic layers
  updateLayersPanel();
}

function setCanvasZoom(zoom) {
  State.canvasZoom = zoom;
  const wrap = document.getElementById('canvas-frame-wrap');
  const val = document.getElementById('canvas-zoom');
  if (wrap) wrap.style.transform = `scale(${zoom / 100})`;
  if (val) val.textContent = `${zoom}%`;
}

function updatePropsHeader(el) {
  const nameEl = document.getElementById('selected-el-name');
  const tagEl = document.getElementById('selected-el-tag');
  const iconEl = document.querySelector('.pp-el-tag i');
  if (!nameEl || !tagEl) return;
  const type = el.dataset.elType || 'div';
  const id = el.dataset.elId || 'element';
  nameEl.textContent = el.querySelector('.el-label')?.textContent || id;
  tagEl.textContent = type;
  const typeColors = { section: '#f97316', div: '#64748b', text: '#eab308', button: '#7c5cfc', image: '#22c55e' };
  if (iconEl) iconEl.style.color = typeColors[type] || '#64748b';
}

/* ================================================================
   PROPERTIES PANEL
================================================================ */
function initPropsPanel() {
  // Helper to apply styles
  function applyStyleToSelected(property, value) {
    if (!State.selectedEl) return;
    const inner = [...State.selectedEl.children].find(c => !c.classList.contains('el-label') && !c.classList.contains('el-handles'));
    if (inner) {
      inner.style[property] = value;
      updateCodeFromVisual();
      flashSync(true);
    }
  }

  // PP tabs
  const ppTabs = document.querySelectorAll('.pp-tab');
  const ppContents = document.querySelectorAll('.pp-content');
  ppTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      ppTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      ppContents.forEach(c => c.classList.remove('active'));
      const target = document.getElementById(`pp-${tab.dataset.pp}`);
      if (target) target.classList.add('active');
    });
  });

  // Prop group collapse
  document.querySelectorAll('.prop-group-hdr').forEach(hdr => {
    hdr.addEventListener('click', () => {
      const group = hdr.closest('.prop-group');
      const icon = hdr.querySelector('i');
      const isOpen = !group.classList.contains('collapsed');
      group.classList.toggle('collapsed', isOpen);
      if (icon) icon.style.transform = isOpen ? 'rotate(-90deg)' : '';
      // Hide body
      const sibs = [...group.children].filter(c => c !== hdr);
      sibs.forEach(s => s.style.display = isOpen ? 'none' : '');
    });
  });

  // Size and typography input bindings
  document.querySelector('.prop-width-input')?.addEventListener('input', e => {
    applyStyleToSelected('width', e.target.value);
  });
  document.querySelector('.prop-height-input')?.addEventListener('input', e => {
    applyStyleToSelected('height', e.target.value);
  });
  document.querySelector('.prop-font-family-select')?.addEventListener('change', e => {
    applyStyleToSelected('fontFamily', e.target.value);
  });
  document.querySelector('.prop-font-size-input')?.addEventListener('input', e => {
    applyStyleToSelected('fontSize', e.target.value + 'px');
  });
  document.querySelector('.prop-font-weight-select')?.addEventListener('change', e => {
    applyStyleToSelected('fontWeight', e.target.value);
  });
  document.querySelector('.prop-line-height-input')?.addEventListener('input', e => {
    applyStyleToSelected('lineHeight', e.target.value);
  });
  document.querySelector('.prop-color-input')?.addEventListener('input', e => {
    applyStyleToSelected('color', e.target.value);
  });
  document.querySelector('.prop-bg-color-input')?.addEventListener('input', e => {
    applyStyleToSelected('backgroundColor', e.target.value);
  });

  // Fill type toggle
  document.querySelectorAll('.ftt').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.fill-type-toggle').querySelectorAll('.ftt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Text align
  document.querySelectorAll('.ta-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.text-align-row').querySelectorAll('.ta-btn').forEach(b => b.classList.remove('ta-active'));
      btn.classList.add('ta-active');
      const align = btn.getAttribute('title').toLowerCase();
      applyStyleToSelected('textAlign', align);
      showToast(`Text align: ${btn.title}`, 'info', 'ri-text');
    });
  });

  // Display toggle
  document.querySelectorAll('.dt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.display-toggle').querySelectorAll('.dt-btn').forEach(b => b.classList.remove('dt-active'));
      btn.classList.add('dt-active');
      const display = btn.dataset.display;
      const flexOptions = document.getElementById('flex-options');
      if (flexOptions) flexOptions.style.display = display === 'flex' ? '' : 'none';
      applyStyleToSelected('display', display);
    });
  });

  // Flex direction
  document.querySelectorAll('.fdt').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.flex-dir-toggle').querySelectorAll('.fdt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const dir = btn.textContent.toLowerCase();
      applyStyleToSelected('flexDirection', dir);
    });
  });

  // Position toggle
  document.querySelectorAll('.pos-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.position-toggle').querySelectorAll('.pos-btn').forEach(b => b.classList.remove('pos-active'));
      btn.classList.add('pos-active');
      applyStyleToSelected('position', btn.dataset.pos);
    });
  });

  // Bind — backend node select
  document.querySelectorAll('.bns-item').forEach(item => {
    item.addEventListener('click', () => {
      item.closest('.be-node-select').querySelectorAll('.bns-item').forEach(i => i.classList.remove('bns-active'));
      item.classList.add('bns-active');
    });
  });

  // Apply binding
  const applyBind = document.querySelector('.apply-bind-btn');
  if (applyBind) {
    applyBind.addEventListener('click', () => {
      showToast('Binding applied: #hero-cta → POST /api/join', 'success', 'ri-link-m');
      flashSync(true);
    });
  }

  // Spacing model editable values
  document.querySelectorAll('.sm-val.editable').forEach(val => {
    val.addEventListener('click', () => {
      const orig = val.textContent;
      const input = document.createElement('input');
      input.type = 'number';
      input.value = parseInt(orig) || 0;
      input.style.cssText = 'width:36px;font-size:11px;background:#252525;border:1px solid #7c5cfc;border-radius:3px;color:#ececec;text-align:center;font-family:monospace;padding:0 2px';
      val.textContent = '';
      val.appendChild(input);
      input.focus();
      input.select();
      const finish = () => {
        const valNum = input.value || '0';
        val.textContent = valNum;
        const propName = val.dataset.prop;
        const camelProp = propName.replace(/-([a-z])/g, g => g[1].toUpperCase());
        applyStyleToSelected(camelProp, valNum + 'px');
        flashSync(true);
      };
      input.addEventListener('blur', finish);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') finish(); });
    });
  });

  // Effect toggles
  document.querySelectorAll('.ei-toggle').forEach(tog => {
    tog.addEventListener('click', () => {
      tog.classList.toggle('active-toggle');
      flashSync(true);
    });
  });

  // PP collapse button
  const ppToggle = document.getElementById('pp-toggle');
  const propsPanel = document.getElementById('props-panel');
  if (ppToggle && propsPanel) {
    ppToggle.addEventListener('click', () => {
      const collapsed = propsPanel.style.width === '0px';
      propsPanel.style.width = collapsed ? '' : '0px';
      propsPanel.style.overflow = collapsed ? '' : 'hidden';
    });
  }

  // Props inputs — flash sync on change
  document.querySelectorAll('.pf-input, .pf-select').forEach(input => {
    input.addEventListener('change', () => flashSync(true));
  });
}

/* ================================================================
   NODE CANVAS (IcePlane-style)
================================================================ */
function initNodeCanvas() {
  const canvas = document.getElementById('node-canvas');
  const wrap = document.getElementById('node-canvas-wrap');
  if (!canvas || !wrap) return;

  let isPanning = false;
  let panStart = { x: 0, y: 0 };
  let canvasOffset = { x: 0, y: 0 };

  // Draw initial connections
  setTimeout(() => drawConnections(), 100);

  // Canvas pan
  canvas.addEventListener('mousedown', e => {
    if (e.target === canvas || e.target.classList.contains('node-grid-svg') || e.target.tagName === 'rect' || e.target.tagName === 'svg') {
      isPanning = true;
      panStart = { x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y };
      canvas.style.cursor = 'grabbing';
      // Deselect nodes
      document.querySelectorAll('.nc-node').forEach(n => n.classList.remove('node-selected'));
      document.getElementById('node-props-panel').style.opacity = '0.4';
      State.selectedNode = null;
    }
  });

  document.addEventListener('mousemove', e => {
    if (!isPanning) return;
    canvasOffset.x = e.clientX - panStart.x;
    canvasOffset.y = e.clientY - panStart.y;
    canvas.style.transform = `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`;
    drawConnections();
  });

  document.addEventListener('mouseup', () => {
    if (isPanning) {
      isPanning = false;
      canvas.style.cursor = 'grab';
    }
  });

  // Node drag
  document.querySelectorAll('.nc-node').forEach(node => {
    makeDraggableNode(node, canvas, drawConnections);

    // Node click — select
    node.addEventListener('click', e => {
      e.stopPropagation();
      document.querySelectorAll('.nc-node').forEach(n => n.classList.remove('node-selected'));
      node.classList.add('node-selected');
      State.selectedNode = node;
      document.getElementById('node-props-panel').style.opacity = '1';
      updateNodeProps(node);
    });

    // Node header delete
    const deleteBtn = node.querySelector('.nc-delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (confirm(`Delete node "${node.querySelector('span')?.textContent}"?`)) {
          node.style.opacity = '0';
          node.style.transform += ' scale(0.8)';
          node.style.transition = 'all 0.2s ease';
          setTimeout(() => node.remove(), 200);
          drawConnections();
          showToast('Node deleted', 'warn', 'ri-delete-bin-line');
        }
      });
    }

    // Port hover tooltips & connection start
    node.querySelectorAll('.nc-port').forEach(port => {
      port.addEventListener('mouseenter', () => port.style.transform = 'scale(1.5)');
      port.addEventListener('mouseleave', () => port.style.transform = '');
      port.addEventListener('click', e => {
        e.stopPropagation();
        const isOutput = port.classList.contains('output-port');
        if (isOutput) {
          State.activeConnectionSource = port.id;
          showToast('Connection started. Click an input port to connect.', 'info', 'ri-share-line');
        } else {
          if (State.activeConnectionSource) {
            const exists = State.backendConnections.some(c => c.from === State.activeConnectionSource && c.to === port.id);
            if (!exists) {
              const fromColor = document.getElementById(State.activeConnectionSource)?.style.borderColor || '#7c5cfc';
              State.backendConnections.push({
                from: State.activeConnectionSource,
                to: port.id,
                color: fromColor
              });
              drawConnections();
              showToast('Ports connected successfully!', 'success', 'ri-checkbox-circle-line');
            }
            State.activeConnectionSource = null;
          } else {
            showToast('Click an output port first.', 'warn', 'ri-error-warning-line');
          }
        }
      });
    });

    // Editable fields
    node.querySelectorAll('.ncf-editable').forEach(field => {
      field.addEventListener('dblclick', () => {
        const orig = field.textContent;
        field.contentEditable = 'true';
        field.focus();
        field.style.outline = '1px solid var(--accent)';
        field.style.borderRadius = '3px';
        const done = () => {
          field.contentEditable = 'false';
          field.style.outline = '';
          flashSync(true);
        };
        field.addEventListener('blur', done, { once: true });
        field.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); done(); } }, { once: true });
      });
    });
  });

  // Node palette items — drag to canvas
  document.querySelectorAll('.node-palette-item').forEach(item => {
    item.addEventListener('dragstart', e => {
      e.dataTransfer.setData('node-type', item.dataset.node);
      e.dataTransfer.setData('node-color', item.dataset.color);
    });
  });

  canvas.addEventListener('dragover', e => e.preventDefault());
  canvas.addEventListener('drop', e => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('node-type');
    if (!nodeType) return;
    const color = e.dataTransfer.getData('node-color') || '#7c5cfc';
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvasOffset.x;
    const y = e.clientY - rect.top - canvasOffset.y;
    addNode(nodeType, color, x, y);
  });

  // Canvas zoom controls
  const ccZoomIn = document.getElementById('cc-zoom-in');
  const ccZoomOut = document.getElementById('cc-zoom-out');
  const ccFit = document.getElementById('cc-fit');
  const ccZoomVal = document.getElementById('cc-zoom-val');

  if (ccZoomIn) ccZoomIn.addEventListener('click', () => { State.nodeCanvasZoom = Math.min(200, State.nodeCanvasZoom + 10); updateNodeCanvasZoom(); });
  if (ccZoomOut) ccZoomOut.addEventListener('click', () => { State.nodeCanvasZoom = Math.max(30, State.nodeCanvasZoom - 10); updateNodeCanvasZoom(); });
  if (ccFit) ccFit.addEventListener('click', () => { State.nodeCanvasZoom = 100; canvasOffset = { x: 0, y: 0 }; updateNodeCanvasZoom(); canvas.style.transform = ''; });
  if (ccZoomVal) ccZoomVal.addEventListener('click', () => { State.nodeCanvasZoom = 100; updateNodeCanvasZoom(); });

  function updateNodeCanvasZoom() {
    const val = document.getElementById('cc-zoom-val');
    if (val) val.textContent = `${State.nodeCanvasZoom}%`;
    canvas.style.transformOrigin = 'top left';
  }

  // Backend toolbar buttons
  const btBtns = document.querySelectorAll('.bt-btn[data-btool]');
  btBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      btBtns.forEach(b => b.classList.remove('bt-active'));
      btn.classList.add('bt-active');
    });
  });

  const viewCodeBtn = document.getElementById('view-generated-code');
  if (viewCodeBtn) {
    viewCodeBtn.addEventListener('click', () => {
      switchTab('code');
      showToast('Viewing generated code for selected route', 'info', 'ri-code-s-slash-line');
    });
  }

  // Route list
  document.querySelectorAll('.route-row').forEach(row => {
    row.addEventListener('click', () => {
      document.querySelectorAll('.route-row').forEach(r => r.classList.remove('active-route'));
      row.classList.add('active-route');
      const [method, path] = row.dataset.route?.split(' ') || ['GET', '/'];
      const crumb = document.querySelector('.route-crumb');
      if (crumb) {
        const m = crumb.querySelector('.rc-method');
        const p = crumb.querySelector('.rc-path');
        if (m) { m.textContent = method; m.className = `rc-method ${method.toLowerCase()}`; }
        if (p) p.textContent = path;
      }
    });
  });

  // New route button
  const addRouteBtn = document.getElementById('add-route-btn');
  if (addRouteBtn) {
    addRouteBtn.addEventListener('click', () => {
      showToast('Opening route creator…', 'info', 'ri-add-circle-line');
    });
  }

  // Minimap
  const minimap = document.getElementById('nc-minimap');
  if (minimap) {
    minimap.addEventListener('click', e => {
      const rect = minimap.getBoundingClientRect();
      const xRatio = (e.clientX - rect.left) / rect.width;
      const yRatio = (e.clientY - rect.top) / rect.height;
      canvasOffset.x = -xRatio * 600 + 200;
      canvasOffset.y = -yRatio * 400 + 100;
      canvas.style.transform = `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`;
      drawConnections();
    });
  }
}

function makeDraggableNode(el, container, onMove) {
  let isDragging = false;
  let startX, startY, origLeft, origTop;

  el.addEventListener('mousedown', e => {
    if (e.target.classList.contains('nc-port') || e.target.classList.contains('ncf-editable') || e.target.closest('.nc-hdr-btn')) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    origLeft = parseInt(el.style.left) || 0;
    origTop  = parseInt(el.style.top) || 0;
    el.style.zIndex = '100';
    el.style.cursor = 'grabbing';
    e.stopPropagation();
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    el.style.left = `${origLeft + e.clientX - startX}px`;
    el.style.top  = `${origTop + e.clientY - startY}px`;
    if (onMove) onMove();
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      el.style.cursor = '';
      el.style.zIndex = '';
    }
  });
}

function drawConnections() {
  const svg = document.getElementById('connections-svg');
  if (!svg) return;

  // Clear existing paths
  svg.querySelectorAll('path.conn-path').forEach(p => p.remove());

  State.backendConnections.forEach(({ from, to, color }) => {
    const fromEl = document.getElementById(from);
    const toEl = document.getElementById(to);
    if (!fromEl || !toEl) return;

    const svgRect = svg.getBoundingClientRect();
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();

    const x1 = fromRect.left + fromRect.width / 2 - svgRect.left;
    const y1 = fromRect.top + fromRect.height / 2 - svgRect.top;
    const x2 = toRect.left + toRect.width / 2 - svgRect.left;
    const y2 = toRect.top + toRect.height / 2 - svgRect.top;

    const cx = (x1 + x2) / 2;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`);
    path.setAttribute('stroke', color);
    path.classList.add('conn-path');
    svg.appendChild(path);

    // Delete connection on click
    path.addEventListener('click', e => {
      e.stopPropagation();
      if (confirm('Delete this connection?')) {
        State.backendConnections = State.backendConnections.filter(c => c.from !== from || c.to !== to);
        drawConnections();
        showToast('Connection removed', 'info', 'ri-delete-bin-line');
      }
    });

    // Mark ports as connected
    fromEl.classList.add('connected');
    toEl.classList.add('connected');
    fromEl.style.background = color;
    toEl.style.background = color;
  });
}

function addNode(type, color, x, y) {
  const canvas = document.getElementById('node-canvas');
  const labels = {
    'http-trigger': 'HTTP Request', 'route': 'Route Handler', 'jwt-auth': 'JWT Auth',
    'db-query': 'DB Query', 'db-insert': 'DB Insert', 'response': 'Send Response',
    'email': 'Send Email', 'condition': 'Condition', 'transform': 'Transform',
    'validate': 'Validate', 'schedule': 'Schedule', 'webhook': 'Webhook',
    'rate-limit': 'Rate Limit', 'cors': 'CORS', 'loop': 'Loop',
    'merge': 'Merge', 'log': 'Log', 'redirect': 'Redirect', 'router': 'Router',
    'db-update': 'DB Update', 'db-delete': 'DB Delete',
  };
  const icons = {
    'http-trigger': 'ri-global-line', 'route': 'ri-route-line', 'jwt-auth': 'ri-shield-check-line',
    'db-query': 'ri-database-line', 'db-insert': 'ri-database-2-line', 'response': 'ri-send-plane-line',
    'email': 'ri-mail-send-line', 'condition': 'ri-git-branch-line', 'transform': 'ri-code-s-slash-line',
    'validate': 'ri-checkbox-circle-line', 'schedule': 'ri-time-line', 'webhook': 'ri-webhook-line',
    'rate-limit': 'ri-speed-line', 'cors': 'ri-global-line', 'loop': 'ri-loop-left-line',
    'merge': 'ri-merge-cells-horizontal', 'log': 'ri-file-list-3-line', 'redirect': 'ri-arrow-right-line',
    'router': 'ri-git-merge-line', 'db-update': 'ri-edit-2-line', 'db-delete': 'ri-delete-bin-line',
  };

  const id = `node-${Date.now()}`;
  const node = document.createElement('div');
  node.className = 'nc-node';
  node.id = id;
  node.dataset.type = type;
  node.dataset.color = color;
  node.style.left = `${x - 105}px`;
  node.style.top = `${y - 20}px`;
  node.style.setProperty('--node-color', color);
  node.innerHTML = `
    <div class="nc-node-header" style="--node-color:${color}">
      <div class="nc-color-bar"></div>
      <i class="${icons[type] || 'ri-node-tree'}" style="color:${color}"></i>
      <span>${labels[type] || type}</span>
      <div class="nc-node-badge">${type.split('-')[0].toUpperCase()}</div>
      <div class="nc-node-hdr-actions">
        <button class="nc-hdr-btn"><i class="ri-subtract-line"></i></button>
        <button class="nc-hdr-btn nc-delete-btn"><i class="ri-close-line"></i></button>
      </div>
    </div>
    <div class="nc-node-body">
      <div class="nc-field"><span class="ncf-label">Type</span><span class="ncf-val">${type}</span></div>
      <div class="nc-field"><span class="ncf-label">Status</span><span class="ncf-val" style="color:${color}">Active</span></div>
    </div>
    <div class="nc-ports nc-inputs">
      <div class="nc-port-row">
        <div class="nc-port input-port" id="p-${id}-in" style="border-color:${color}"></div>
        <span class="nc-port-label">In</span>
      </div>
    </div>
    <div class="nc-ports nc-outputs">
      <div class="nc-port-row">
        <span class="nc-port-label">Out</span>
        <div class="nc-port output-port" id="p-${id}-out" style="border-color:${color}"></div>
      </div>
    </div>
  `;

  // Animate in
  node.style.opacity = '0';
  node.style.transform = 'scale(0.8)';
  node.style.transition = 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';

  // Find the connection SVG and insert node before it
  const svg = canvas.querySelector('.connections-svg');
  canvas.insertBefore(node, svg);

  requestAnimationFrame(() => {
    node.style.opacity = '1';
    node.style.transform = '';
  });

  setTimeout(() => { node.style.transition = ''; }, 250);

  // Init dragging for new node
  makeDraggableNode(node, canvas, drawConnections);

  node.addEventListener('click', e => {
    e.stopPropagation();
    document.querySelectorAll('.nc-node').forEach(n => n.classList.remove('node-selected'));
    node.classList.add('node-selected');
    State.selectedNode = node;
    document.getElementById('node-props-panel').style.opacity = '1';
    updateNodeProps(node);
  });

  const del = node.querySelector('.nc-delete-btn');
  if (del) {
    del.addEventListener('click', e => {
      e.stopPropagation();
      node.style.opacity = '0'; node.style.transform = 'scale(0.8)'; node.style.transition = 'all 0.2s ease';
      setTimeout(() => node.remove(), 200);
      State.backendConnections = State.backendConnections.filter(c => c.from !== `p-${id}-out` && c.to !== `p-${id}-in`);
      drawConnections();
      showToast('Node deleted', 'warn', 'ri-delete-bin-line');
    });
  }

  node.querySelectorAll('.nc-port').forEach(port => {
    port.addEventListener('mouseenter', () => port.style.transform = 'scale(1.5)');
    port.addEventListener('mouseleave', () => port.style.transform = '');
    port.addEventListener('click', e => {
      e.stopPropagation();
      const isOutput = port.classList.contains('output-port');
      if (isOutput) {
        State.activeConnectionSource = port.id;
        showToast('Connection started. Click an input port to connect.', 'info', 'ri-share-line');
      } else {
        if (State.activeConnectionSource) {
          const exists = State.backendConnections.some(c => c.from === State.activeConnectionSource && c.to === port.id);
          if (!exists) {
            State.backendConnections.push({
              from: State.activeConnectionSource,
              to: port.id,
              color: color
            });
            drawConnections();
            showToast('Connected!', 'success', 'ri-checkbox-circle-line');
          }
          State.activeConnectionSource = null;
        } else {
          showToast('Click an output port first.', 'warn', 'ri-error-warning-line');
        }
      }
    });
  });

  showToast(`Added: ${labels[type] || type}`, 'success', icons[type] || 'ri-add-circle-line');
  flashSync(true);
}

function updateNodeProps(node) {
  const panel = document.getElementById('node-props-panel');
  if (!panel) return;
  const type = node.dataset.type;
  const color = node.dataset.color;
  const nppType = panel.querySelector('.npp-type');
  if (nppType) {
    nppType.style.color = color;
    nppType.querySelector('i').className = `ri-node-tree`;
    nppType.querySelector('i').style.color = color;
    const span = nppType.querySelector('span') || document.createElement('span');
    span.textContent = node.querySelector('.nc-node-header span')?.textContent || type;
    if (!nppType.querySelector('span')) nppType.appendChild(span);
  }
}

/* ================================================================
   DATABASE VIEWS
================================================================ */
function initDatabaseViews() {
  // DB tab buttons
  const dbtTabs = document.querySelectorAll('.dbt-tab');
  const dbViews = document.querySelectorAll('.db-view');
  dbtTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      dbtTabs.forEach(t => t.classList.remove('dbt-active'));
      tab.classList.add('dbt-active');
      dbViews.forEach(v => v.classList.remove('active'));
      const target = document.getElementById(`db-view-${tab.dataset.dbt}`);
      if (target) target.classList.add('active');
    });
  });

  // Table list selection
  document.querySelectorAll('.dbt-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.dbt-item').forEach(i => i.classList.remove('active-table'));
      item.classList.add('active-table');
      const table = item.dataset.table;
      buildDataTable(table);
      showToast(`Table: ${table}`, 'info', 'ri-table-line');
    });
  });

  // New table button
  const newTableBtn = document.getElementById('new-table-btn');
  if (newTableBtn) newTableBtn.addEventListener('click', () => showToast('Table creator opening…', 'info', 'ri-add-circle-line'));

  // Run query
  const runBtn = document.getElementById('run-query-btn');
  if (runBtn) {
    runBtn.addEventListener('click', () => {
      showToast('Query executed: 4 rows in 0.3ms', 'success', 'ri-play-fill');
    });
  }

  // Query editor ctrl+enter
  const qe = document.getElementById('qe-content');
  if (qe) {
    qe.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        showToast('Query executed', 'success', 'ri-play-fill');
      }
    });
  }
}

function buildDataTable(tableName = 'users') {
  const tbody = document.getElementById('data-table-body');
  if (!tbody) return;

  const tables = {
    users: [
      [1, 'alice@example.com', 'Alice Johnson', 'admin', '2024-01-15', true],
      [2, 'bob@example.com', 'Bob Smith', 'user', '2024-01-16', true],
      [4, 'dan@example.com', 'Dan Wilson', 'mod', '2024-01-18', false],
      [5, 'eva@example.com', 'Eva Martinez', 'user', '2024-01-20', true],
      [6, 'frank@example.com', 'Frank Lee', 'user', '2024-01-22', true],
    ],
    waitlist: [
      [1, 'sarah@example.com', 'Sarah Connor', '-', '2024-01-10', true],
      [2, 'john@example.com', 'John Doe', '-', '2024-01-11', true],
      [3, 'jane@example.com', 'Jane Smith', '-', '2024-01-12', true],
    ],
    sessions: [
      [1, 'abc123', 'user_1', '-', '2024-01-15', true],
      [2, 'def456', 'user_2', '-', '2024-01-16', false],
    ],
    logs: [
      [1, 'GET /api/users', 'system', '200', '2024-01-15', true],
      [2, 'POST /api/join', 'system', '201', '2024-01-15', true],
    ],
    settings: [
      [1, 'app_name', 'My App', 'admin', '2024-01-10', true],
      [2, 'theme', 'dark', 'admin', '2024-01-10', true],
    ],
  };

  const rows = tables[tableName] || tables.users;
  tbody.innerHTML = rows.map(([id, email, name, role, date, active]) => `
    <tr>
      <td><input type="checkbox"/></td>
      <td class="td-pk">${id}</td>
      <td>${email}</td>
      <td>${name}</td>
      <td><span class="role-badge ${role}">${role}</span></td>
      <td class="td-date">${date}</td>
      <td class="${active ? 'td-bool-t' : 'td-bool-f'}">${active ? '✓ true' : '✗ false'}</td>
      <td class="row-act">
        <i class="ri-edit-line" title="Edit"></i>
        <i class="ri-delete-bin-line" title="Delete"></i>
      </td>
    </tr>
  `).join('');
}

function buildQueryLineNumbers() {
  const qe = document.getElementById('qe-content');
  const lines = document.getElementById('qe-lines');
  if (!qe || !lines) return;

  const update = () => {
    const count = qe.textContent.split('\n').length;
    lines.innerHTML = Array.from({ length: count }, (_, i) => `<div>${i + 1}</div>`).join('');
  };
  update();
  qe.addEventListener('input', update);
}

/* ================================================================
   CODE EDITOR
================================================================ */
function initCodeEditor() {
  // Editor tabs
  const etbTabs = document.querySelectorAll('.etb-tab');
  etbTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      etbTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
    const close = tab.querySelector('.etb-close');
    if (close) {
      close.addEventListener('click', e => {
        e.stopPropagation();
        tab.remove();
      });
    }
  });

  // File tree clicks
  document.querySelectorAll('.ft-item.ft-file').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.ft-item').forEach(i => i.classList.remove('active-file'));
      item.classList.add('active-file');
      const filename = item.dataset.file;
      const eb = document.querySelector('.eb-current');
      if (eb) eb.textContent = filename?.split('/').pop() || filename;
      showToast(`Opened: ${filename}`, 'info', 'ri-file-code-line');
    });
  });

  document.querySelectorAll('.ft-item.ft-folder').forEach(folder => {
    folder.addEventListener('click', () => {
      folder.classList.toggle('open');
      const icon = folder.querySelector('i');
      if (icon) icon.className = folder.classList.contains('open') ? 'ri-folder-open-line' : 'ri-folder-line';
      const children = folder.nextElementSibling;
      if (children && children.classList.contains('ft-children')) {
        children.style.display = folder.classList.contains('open') ? '' : 'none';
      }
    });
  });

  buildCodeGutter();
}

function buildCodeGutter() {
  const gutter = document.getElementById('code-gutter');
  if (!gutter) return;
  gutter.innerHTML = Array.from({ length: 26 }, (_, i) => `<div>${i + 1}</div>`).join('');
}

/* ================================================================
   SETTINGS
================================================================ */
function initSettingsPanel() {
  const navItems = document.querySelectorAll('.sn-item');
  const sections = document.querySelectorAll('.sc-section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(i => i.classList.remove('active-sn'));
      item.classList.add('active-sn');
      const sn = item.dataset.sn;
      sections.forEach(s => s.classList.remove('active-sc'));
      const target = document.getElementById(`sc-${sn}`);
      if (target) target.classList.add('active-sc');
    });
  });
}

/* ================================================================
   BOTTOM PANEL
================================================================ */
function initBottomPanel() {
  const bpTabs = document.querySelectorAll('.bp-tab[data-bpt]');
  const bpViews = document.querySelectorAll('.bp-view');

  bpTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      bpTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      bpViews.forEach(v => v.classList.remove('active'));
      const target = document.getElementById(`bpv-${tab.dataset.bpt}`);
      if (target) target.classList.add('active');
    });
  });

  // Close
  const closeBtn = document.getElementById('bp-close');
  const bottomPanel = document.getElementById('bottom-panel');
  if (closeBtn && bottomPanel) {
    closeBtn.addEventListener('click', () => { bottomPanel.style.display = 'none'; });
  }

  // Maximize
  const maxBtn = document.getElementById('bp-maximize');
  if (maxBtn && bottomPanel) {
    let maximized = false;
    maxBtn.addEventListener('click', () => {
      maximized = !maximized;
      bottomPanel.style.height = maximized ? '380px' : '';
      maxBtn.querySelector('i').className = maximized ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line';
    });
  }
}

/* ================================================================
   COMMAND PALETTE
================================================================ */
function initCommandPalette() {
  const overlay = document.getElementById('cmd-overlay');
  const input = document.getElementById('cmd-input');
  const cmdBtn = document.getElementById('cmd-palette-btn');
  const results = document.getElementById('cmd-results');

  const open = () => { overlay.classList.add('active'); setTimeout(() => input?.focus(), 50); };
  const close = () => { overlay.classList.remove('active'); if (input) input.value = ''; };

  if (cmdBtn) cmdBtn.addEventListener('click', open);
  if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') { e.preventDefault(); open(); }
    if (e.key === 'Escape' && overlay?.classList.contains('active')) close();

    // Arrow navigation
    if (overlay?.classList.contains('active') && results) {
      const items = results.querySelectorAll('.cmd-item');
      const active = results.querySelector('.cmd-item.cmd-active');
      let idx = [...items].indexOf(active);
      if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(idx + 1, items.length - 1); items.forEach(i => i.classList.remove('cmd-active')); items[idx]?.classList.add('cmd-active'); }
      if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(idx - 1, 0); items.forEach(i => i.classList.remove('cmd-active')); items[idx]?.classList.add('cmd-active'); }
      if (e.key === 'Enter') { results.querySelector('.cmd-item.cmd-active')?.click(); }
    }
  });

  // Filter
  if (input) {
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase();
      results?.querySelectorAll('.cmd-item').forEach(item => {
        const text = item.querySelector('span')?.textContent?.toLowerCase() || '';
        item.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  // Item click
  results?.querySelectorAll('.cmd-item').forEach(item => {
    item.addEventListener('click', () => {
      const label = item.querySelector('span')?.textContent;
      close();
      showToast(`Running: ${label}`, 'info', 'ri-command-line');
    });
    item.addEventListener('mouseenter', () => {
      results.querySelectorAll('.cmd-item').forEach(i => i.classList.remove('cmd-active'));
      item.classList.add('cmd-active');
    });
  });
}

/* ================================================================
   RESIZE HANDLE
================================================================ */
function initResizeHandle() {
  const handle = document.getElementById('resize-handle');
  const sidebar = document.getElementById('sidebar');
  if (!handle || !sidebar) return;

  let isResizing = false;
  let startX, startW;

  handle.addEventListener('mousedown', e => {
    isResizing = true;
    startX = e.clientX;
    startW = sidebar.offsetWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    handle.classList.add('dragging');
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!isResizing) return;
    const newW = Math.max(160, Math.min(460, startW + e.clientX - startX));
    sidebar.style.width = `${newW}px`;
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      handle.classList.remove('dragging');
    }
  });
}

/* ================================================================
   CONTEXT MENU
================================================================ */
function initContextMenu() {
  const menu = document.getElementById('context-menu');
  const canvasArea = document.getElementById('page-frame');

  if (canvasArea && menu) {
    canvasArea.addEventListener('contextmenu', e => {
      e.preventDefault();
      menu.style.left = `${Math.min(e.clientX, window.innerWidth - 200)}px`;
      menu.style.top = `${Math.min(e.clientY, window.innerHeight - 260)}px`;
      menu.style.display = 'block';
    });
  }

  document.addEventListener('click', () => { if (menu) menu.style.display = 'none'; });

  menu?.querySelectorAll('.ctx-item').forEach(item => {
    item.addEventListener('click', () => {
      showToast(`${item.textContent.trim()}`, 'info', 'ri-scissors-line');
    });
  });
}

/* ================================================================
   GUIDE / ONBOARDING
================================================================ */
function initGuide() {
  // Show guide for first time
  const seen = localStorage.getItem('sf-guide-seen');
  if (!seen) {
    setTimeout(() => {
      document.getElementById('guide-overlay').style.display = 'flex';
    }, 1000);
  }

  let step = 1;
  const maxSteps = 4;

  const setStep = (n) => {
    step = Math.max(1, Math.min(maxSteps, n));
    document.querySelectorAll('.guide-step').forEach((s, i) => s.classList.toggle('active', i + 1 === step));
    document.querySelectorAll('.gd').forEach((d, i) => d.classList.toggle('active', i + 1 === step));
    document.getElementById('guide-prev').disabled = step === 1;
    document.getElementById('guide-next').textContent = step === maxSteps ? 'Get Started' : 'Next →';
  };

  document.getElementById('guide-next')?.addEventListener('click', () => {
    if (step === maxSteps) {
      document.getElementById('guide-overlay').style.display = 'none';
      localStorage.setItem('sf-guide-seen', '1');
    } else {
      setStep(step + 1);
    }
  });

  document.getElementById('guide-prev')?.addEventListener('click', () => setStep(step - 1));
  document.getElementById('guide-close')?.addEventListener('click', () => {
    document.getElementById('guide-overlay').style.display = 'none';
    localStorage.setItem('sf-guide-seen', '1');
  });

  document.querySelectorAll('.gd').forEach((dot, i) => {
    dot.addEventListener('click', () => setStep(i + 1));
  });

  // Guide button in activity bar
  document.querySelectorAll('[data-panel$="guide"]').forEach(btn => {
    btn.addEventListener('click', () => {
      step = 1;
      setStep(1);
      document.getElementById('guide-overlay').style.display = 'flex';
    });
  });
}

/* ================================================================
   SYNC SYSTEM
================================================================ */
function initSyncSystem() {
  // Periodically flash
  setInterval(() => flashSync(false), 9000);
}

function flashSync(strong = false) {
  const dot = document.getElementById('sync-dot');
  const label = document.getElementById('sync-label');
  const badge = document.getElementById('sync-badge');
  if (!badge) return;

  if (strong) {
    badge.style.background = 'rgba(234,179,8,0.15)';
    badge.style.borderColor = 'rgba(234,179,8,0.3)';
    badge.style.color = '#eab308';
    if (label) label.textContent = 'Syncing…';
    if (dot) dot.style.background = '#eab308';
    setTimeout(resetSync, 1200);
  } else {
    badge.style.background = 'rgba(34,197,94,0.18)';
    setTimeout(resetSync, 500);
  }
}

function resetSync() {
  const dot = document.getElementById('sync-dot');
  const label = document.getElementById('sync-label');
  const badge = document.getElementById('sync-badge');
  if (!badge) return;
  badge.style.background = '';
  badge.style.borderColor = '';
  badge.style.color = '';
  if (label) label.textContent = 'Synced';
  if (dot) dot.style.background = '';
}

/* ================================================================
   TERMINAL SIMULATION
================================================================ */
function initTerminalSimulation() {
  const terminal = document.getElementById('terminal-output');
  if (!terminal) return;

  const messages = [
    { text: '→ Visual builder: Hero Section styles updated', class: 'to' },
    { text: '✓ CSS synced to styles.css (18 properties)', class: 'to ts' },
    { text: '→ Binding #hero-cta → POST /api/join detected', class: 'to' },
    { text: '✓ Route handler regenerated from node canvas', class: 'to ts' },
    { text: '→ Schema change in users.created_at detected', class: 'to' },
    { text: '✓ Migration 004_add_logs.sql ready to run', class: 'to ts' },
    { text: '→ HMR update pushed to browser', class: 'to' },
  ];
  let i = 0;

  const addLine = () => {
    const msg = messages[i % messages.length];
    i++;
    const line = document.createElement('div');
    line.className = `tl ${msg.class}`;
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    line.innerHTML = `<span class="td">[${time}]</span> <span>${msg.text}</span>`;
    // Insert before cursor line
    const cursor = terminal.querySelector('.tl:last-child');
    if (cursor) terminal.insertBefore(line, cursor);
    else terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
    flashSync(false);
  };

  setInterval(addLine, 7000);
}

/* ================================================================
   TOGGLE SWITCHES
================================================================ */
function initToggles() {
  document.querySelectorAll('.toggle-sw').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active-toggle-sw');
    });
  });

  document.querySelectorAll('.mw-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
    });
  });
}

/* ================================================================
   KEYBOARD SHORTCUTS
================================================================ */
document.addEventListener('keydown', e => {
  // Ctrl+S
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    flashSync(true);
    showToast('Saved and synced', 'success', 'ri-save-line');
  }
  // Ctrl+B — toggle sidebar
  if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
    e.preventDefault();
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      const closed = sidebar.style.width === '0px' || sidebar.style.width === '0';
      sidebar.style.width = closed ? '' : '0px';
    }
  }
  // Ctrl+` — toggle terminal
  if ((e.ctrlKey || e.metaKey) && e.key === '`') {
    e.preventDefault();
    const bp = document.getElementById('bottom-panel');
    if (bp) bp.style.display = bp.style.display === 'none' ? '' : 'none';
  }
  // Ctrl+Shift+G — toggle guide
  if (e.ctrlKey && e.shiftKey && e.key === 'G') {
    const g = document.getElementById('guide-overlay');
    if (g) g.style.display = g.style.display === 'none' ? 'flex' : 'none';
  }
  // F to fit canvas
  if (e.key === 'f' || e.key === 'F') {
    if (State.currentTab === 'frontend') {
      setCanvasZoom(65);
    }
  }
  // Tab switching
  if (e.altKey) {
    const map = { '1': 'frontend', '2': 'backend', '3': 'database', '4': 'code', '5': 'settings' };
    if (map[e.key]) { e.preventDefault(); switchTab(map[e.key]); }
  }
});

/* ================================================================
   TOAST NOTIFICATIONS
================================================================ */
function showToast(message, type = 'info', icon = 'ri-information-line') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const colors = {
    success: '#22c55e', info: '#7c5cfc', warn: '#eab308', error: '#ef4444',
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="toast-icon ${icon}" style="color:${colors[type]}"></i>
    <span class="toast-msg">${message}</span>
    <button class="toast-close"><i class="ri-close-line"></i></button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => { toast.classList.add('show'); });

  const dismiss = () => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 250);
  };

  toast.querySelector('.toast-close').addEventListener('click', dismiss);
  setTimeout(dismiss, 3500);
}

/* ================================================================
   WINDOW RESIZE
================================================================ */
window.addEventListener('resize', () => {
  setTimeout(drawConnections, 100);
});

/* ================================================================
   CONSOLE BRANDING
================================================================ */
console.log('%c   StateForward IDE v2   ', 'background:linear-gradient(135deg,#7c5cfc,#00d4aa);color:white;font-weight:800;font-size:16px;padding:6px 12px;border-radius:6px');
console.log('%c✦ Visual ↔ Code sync: active', 'color:#00d4aa;font-size:12px');
console.log('%c✦ Node canvas: ready', 'color:#7c5cfc;font-size:12px');
console.log('%c✦ Press Alt+1-5 to switch tabs', 'color:#a0a0a0;font-size:11px');

/* ================================================================
   STATEFORWARD SYNC & LAYERS CORE IMPLEMENTATION
================================================================ */

function updateLayersPanel() {
  const tree = document.getElementById('layer-tree');
  const pageFrame = document.getElementById('page-frame');
  if (!tree || !pageFrame) return;

  tree.innerHTML = '';
  
  function buildLayerNode(el, depth = 0) {
    if (!el.classList.contains('canvas-el')) return;
    const id = el.dataset.elId;
    const type = el.dataset.elType;
    const innerContent = [...el.children].find(c => !c.classList.contains('el-label') && !c.classList.contains('el-handles'));
    const name = el.querySelector('.el-label')?.textContent || id;

    const row = document.createElement('div');
    row.className = `layer-row${State.selectedEl === el ? ' selected-layer' : ''}`;
    row.dataset.id = id;
    row.style.paddingLeft = `${depth * 16 + 8}px`;

    const typeColors = { section: '#f97316', div: '#64748b', text: '#eab308', button: '#7c5cfc', image: '#22c55e' };
    const dotColor = typeColors[type] || '#64748b';

    // check if it has child canvas-els inside the inner content
    const hasChildren = innerContent && innerContent.querySelector('.canvas-el') !== null;
    const toggleHtml = hasChildren 
      ? `<span class="lr-toggle"><i class="ri-arrow-down-s-line"></i></span>`
      : `<span class="lr-toggle lr-leaf"></span>`;

    const typeIcons = { section: 'ri-layout-2-line', div: 'ri-stop-line', text: 'ri-text', button: 'ri-toggle-line', image: 'ri-image-line' };
    const icon = typeIcons[type] || 'ri-code-box-line';

    row.innerHTML = `
      ${toggleHtml}
      <span class="lr-type-dot" style="--dot:${dotColor}"></span>
      <i class="${icon} lr-icon"></i>
      <span class="lr-name">${name}</span>
      <span class="lr-actions">
        <i class="ri-eye-line lr-visibility" title="Toggle visibility"></i>
        <i class="ri-delete-bin-line lr-delete" title="Delete element"></i>
      </span>
    `;

    row.addEventListener('click', (e) => {
      if (e.target.closest('.lr-delete')) {
        e.stopPropagation();
        if (confirm(`Delete element "${name}"?`)) {
          el.remove();
          updateLayersPanel();
          updateCodeFromVisual();
          showToast('Element deleted', 'warn', 'ri-delete-bin-line');
        }
        return;
      }
      if (e.target.closest('.lr-visibility')) {
        e.stopPropagation();
        const icon = e.target.closest('.lr-visibility');
        const isHidden = el.style.opacity === '0';
        el.style.opacity = isHidden ? '' : '0';
        icon.className = isHidden ? 'ri-eye-line lr-visibility' : 'ri-eye-off-line lr-visibility';
        return;
      }
      document.querySelectorAll('.layer-row').forEach(r => r.classList.remove('selected-layer'));
      row.classList.add('selected-layer');
      document.querySelectorAll('.canvas-el').forEach(item => item.classList.remove('selected-el'));
      el.classList.add('selected-el');
      State.selectedEl = el;
      updatePropsHeader(el);
      updatePropsPanelFromElement(el);
    });

    tree.appendChild(row);

    if (innerContent) {
      const childWrapperEls = innerContent.querySelectorAll(':scope > .canvas-el');
      childWrapperEls.forEach(c => buildLayerNode(c, depth + 1));
    }
  }

  const rootCanvasEls = pageFrame.querySelectorAll(':scope > .canvas-el');
  rootCanvasEls.forEach(el => buildLayerNode(el, 0));
}

function updateCodeFromVisual() {
  const pageFrame = document.getElementById('page-frame');
  if (!pageFrame) return;

  const cleanBodyHTML = getCleanHTML(pageFrame);

  const fullCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>My App — StateForward</title>
  <!-- Tailwind CSS 4.3 -->
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-950 text-white">

${cleanBodyHTML}

</body>
</html>`;

  const codeContent = document.getElementById('code-content');
  if (codeContent) {
    const pre = codeContent.querySelector('.code-pre') || codeContent;
    pre.textContent = fullCode;
    highlightEditorCode(pre);
  }
}

function getCleanHTML(container) {
  let html = '';
  const canvasEls = container.querySelectorAll(':scope > .canvas-el');
  canvasEls.forEach(wrapper => {
    const children = [...wrapper.children].filter(c => !c.classList.contains('el-label') && !c.classList.contains('el-handles'));
    children.forEach(child => {
      const clone = child.cloneNode(true);
      const nestedWrappers = clone.querySelectorAll('.canvas-el');
      nestedWrappers.forEach(nestedWrapper => {
        const nestedContent = [...nestedWrapper.children].filter(c => !c.classList.contains('el-label') && !c.classList.contains('el-handles'));
        const fragment = document.createDocumentFragment();
        nestedContent.forEach(nc => fragment.appendChild(nc.cloneNode(true)));
        nestedWrapper.replaceWith(fragment);
      });
      html += formatHTML(clone.outerHTML, 2) + '\n';
    });
  });
  return html.trim();
}

function formatHTML(html, indent = 2) {
  let formatted = '';
  let reg = /(<\/?[a-zA-Z0-9]+[^>]*>)/g;
  let matches = html.split(reg);
  let pad = 0;
  matches.forEach(chunk => {
    chunk = chunk.trim();
    if (!chunk) return;
    if (chunk.match(/^<\/\w/)) {
      pad -= indent;
    }
    formatted += ' '.repeat(Math.max(0, pad)) + chunk + '\n';
    if (chunk.match(/^<\w[^>]*[^\/]>$/) && !chunk.match(/^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)/)) {
      pad += indent;
    }
  });
  return formatted.trim();
}

function highlightEditorCode(container) {
  const code = container.textContent;
  // Simple syntax high-lighting simulation
  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // highlight tags
    .replace(/(&lt;\/?[a-zA-Z0-9\-]+)(&gt;|\s)/g, '<span class="sy-tag">$1</span>$2')
    // highlight attribute keys
    .replace(/\s([a-zA-Z\-]+)=/g, ' <span class="sy-attr">$1</span>=')
    // highlight strings
    .replace(/("[^"]*")/g, '<span class="sy-str">$1</span>')
    // highlight comments
    .replace(/(&lt;!--.*?--&gt;)/g, '<span class="sy-comment">$1</span>');
  container.innerHTML = highlighted;
}

function updateVisualFromCode(fullCode) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fullCode, 'text/html');
  const body = doc.body;

  const pageFrame = document.getElementById('page-frame');
  if (!pageFrame) return;

  const dropZone = document.getElementById('canvas-drop-zone');
  pageFrame.innerHTML = '';
  
  [...body.children].forEach(child => {
    const wrapper = createVisualWrapper(child);
    pageFrame.appendChild(wrapper);
  });

  if (dropZone) pageFrame.appendChild(dropZone);
  updateLayersPanel();
  showToast('Synced from code to visual canvas', 'success', 'ri-refresh-line');
}

function createVisualWrapper(el) {
  const type = el.tagName.toLowerCase();
  const id = el.id || `el-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  const wrapper = document.createElement('div');
  wrapper.className = `canvas-el el-${type}`;
  wrapper.dataset.elId = id;
  wrapper.dataset.elType = getElementTypeFromTag(type);
  
  const label = document.createElement('div');
  label.className = 'el-label';
  label.textContent = capitalize(type) + (el.id ? ` #${el.id}` : '');
  wrapper.appendChild(label);

  const handles = document.createElement('div');
  handles.className = 'el-handles';
  handles.innerHTML = `
    <div class="handle tl"></div><div class="handle tr"></div>
    <div class="handle bl"></div><div class="handle br"></div>
    <div class="handle tm"></div><div class="handle bm"></div>
    <div class="handle ml"></div><div class="handle mr"></div>
  `;
  wrapper.appendChild(handles);

  const clonedEl = el.cloneNode(true);
  processNestedElements(clonedEl);
  wrapper.appendChild(clonedEl);
  return wrapper;
}

function processNestedElements(parent) {
  const children = [...parent.children];
  parent.innerHTML = '';
  children.forEach(child => {
    const childWrapper = createVisualWrapper(child);
    parent.appendChild(childWrapper);
  });
}

function getElementTypeFromTag(tag) {
  if (['section', 'header', 'footer', 'main', 'nav'].includes(tag)) return 'section';
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span'].includes(tag)) return 'text';
  if (tag === 'button') return 'button';
  if (tag === 'img') return 'image';
  if (tag === 'input') return 'input';
  return 'div';
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function updatePropsPanelFromElement(el) {
  const type = el.dataset.elType;
  const inner = [...el.children].find(c => !c.classList.contains('el-label') && !c.classList.contains('el-handles'));
  if (!inner) return;

  const style = inner.style;

  const wInput = document.querySelector('.prop-width-input');
  if (wInput) wInput.value = style.width || '100%';

  const hInput = document.querySelector('.prop-height-input');
  if (hInput) hInput.value = style.height || 'auto';

  const fontSelect = document.querySelector('.prop-font-family-select');
  if (fontSelect) fontSelect.value = style.fontFamily || 'Inter';

  const sizeInput = document.querySelector('.prop-font-size-input');
  if (sizeInput) sizeInput.value = parseInt(style.fontSize) || 16;

  const colorInput = document.querySelector('.prop-color-input');
  if (colorInput) colorInput.value = style.color || '#f0f0f0';

  const bgColorInput = document.querySelector('.prop-bg-color-input');
  if (bgColorInput) bgColorInput.value = style.backgroundColor || '#0d0d0d';
}

/* ================================================================
   ADDITIONAL COMPONENT WORKSPACE HANDLERS (LOGS, TESTER, SETTINGS)
================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Make Code editor contenteditable
  const codeContent = document.getElementById('code-content');
  if (codeContent) {
    codeContent.contentEditable = 'true';
    codeContent.spellcheck = false;
    
    // Sync back on blur
    codeContent.addEventListener('blur', () => {
      const code = codeContent.textContent;
      updateVisualFromCode(code);
    });

    // Handle Tab key in code editor
    codeContent.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const sel = window.getSelection();
        const range = sel.getRangeAt(0);
        const tabNode = document.createTextNode('  ');
        range.insertNode(tabNode);
        range.setStartAfter(tabNode);
        range.setEndAfter(tabNode);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
  }

  // Accent Color Picker logic
  const picker = document.getElementById('accent-color-picker');
  const hexLabel = document.getElementById('accent-color-hex');
  if (picker && hexLabel) {
    picker.addEventListener('input', e => {
      const color = e.target.value;
      hexLabel.textContent = color;
      document.documentElement.style.setProperty('--accent', color);
    });
  }

  // Theme Selector settings
  const themeSel = document.getElementById('theme-selector-settings');
  if (themeSel) {
    themeSel.addEventListener('change', e => {
      const theme = e.target.value;
      showToast(`Applied Theme: ${theme}`, 'success', 'ri-paint-line');
    });
  }

  // Project settings sync
  const projInput = document.getElementById('project-name-setting');
  if (projInput) {
    projInput.addEventListener('input', e => {
      const name = e.target.value;
      document.querySelectorAll('.project-tag span').forEach(el => el.textContent = name);
    });
  }

  // API Tester Simulation
  const apiEndpoint = document.getElementById('api-test-endpoint');
  const apiBody = document.getElementById('api-test-body');
  const apiSend = document.getElementById('api-test-send-btn');
  const apiResponseSec = document.getElementById('api-test-response-section');
  const apiStatus = document.getElementById('api-test-status');
  const apiResult = document.getElementById('api-test-result');

  if (apiEndpoint && apiBody) {
    apiEndpoint.addEventListener('change', () => {
      const endpoint = apiEndpoint.value;
      if (endpoint === 'POST /api/join') {
        apiBody.value = JSON.stringify({ email: 'test@example.com', name: 'Waitlist User' }, null, 2);
      } else if (endpoint === 'GET /api/users') {
        apiBody.value = '';
      } else if (endpoint === 'GET /api/users/1') {
        apiBody.value = '';
      } else if (endpoint === 'POST /api/contact') {
        apiBody.value = JSON.stringify({ email: 'contact@example.com', name: 'John Doe', message: 'Hello' }, null, 2);
      }
    });
  }

  if (apiSend && apiResponseSec && apiStatus && apiResult) {
    apiSend.addEventListener('click', () => {
      apiSend.innerHTML = '<i class="ri-refresh-line sb-spin"></i> Sending…';
      setTimeout(() => {
        apiSend.innerHTML = '<i class="ri-send-plane-line"></i> Send Request';
        apiResponseSec.style.display = 'block';
        const endpoint = apiEndpoint.value;
        if (endpoint.startsWith('GET')) {
          apiStatus.textContent = '200 OK';
          apiStatus.style.color = '#22c55e';
          if (endpoint.includes('users/1')) {
            apiResult.textContent = JSON.stringify({ id: 1, email: 'alice@example.com', name: 'Alice Johnson', role: 'admin' }, null, 2);
          } else {
            apiResult.textContent = JSON.stringify([
              { id: 1, email: 'alice@example.com', name: 'Alice Johnson', role: 'admin' },
              { id: 2, email: 'bob@example.com', name: 'Bob Smith', role: 'user' }
            ], null, 2);
          }
        } else {
          apiStatus.textContent = '201 Created';
          apiStatus.style.color = '#22c55e';
          apiResult.textContent = JSON.stringify({ success: true, message: 'Saved successfully' }, null, 2);
        }
        showToast('API request completed', 'success', 'ri-send-plane-line');
      }, 1000);
    });
  }

  // Clear backend logs in sidebar
  const clearLogsBtn = document.getElementById('clear-be-logs');
  const logsStream = document.getElementById('be-log-stream');
  if (clearLogsBtn && logsStream) {
    clearLogsBtn.addEventListener('click', () => {
      logsStream.innerHTML = '<div style="color:var(--text-3)">[Logs Cleared]</div>';
      showToast('Logs cleared', 'info', 'ri-delete-bin-line');
    });
  }

  // Pause backend logs
  const pauseLogsBtn = document.getElementById('pause-be-logs');
  if (pauseLogsBtn) {
    let paused = false;
    pauseLogsBtn.addEventListener('click', () => {
      paused = !paused;
      pauseLogsBtn.innerHTML = paused ? '<i class="ri-play-line"></i>' : '<i class="ri-pause-line"></i>';
      pauseLogsBtn.title = paused ? 'Resume stream' : 'Pause stream';
      showToast(paused ? 'Logs stream paused' : 'Logs stream resumed', 'info', 'ri-pause-line');
    });
  }

  // Code search panel
  const searchInput = document.getElementById('code-search-input');
  const searchResults = document.getElementById('code-search-results');
  if (searchInput && searchResults) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      if (!q) {
        searchResults.innerHTML = '<span class="panel-hint" style="padding:0">Type query to search across the codebase.</span>';
        return;
      }
      
      // Simulate search results
      const mockMatches = [
        { file: 'index.html', line: 14, content: '&lt;button id="hero-cta" data-sf-bind="POST:/api/join"&gt;' },
        { file: 'app.js', line: 42, content: 'showToast(\'Binding applied: #hero-cta\', \'success\')' },
        { file: 'server/index.js', line: 8, content: 'app.post(\'/api/join\', (req, res) =&gt; {' }
      ];

      const filtered = mockMatches.filter(m => m.content.toLowerCase().includes(q) || m.file.toLowerCase().includes(q));
      
      if (filtered.length === 0) {
        searchResults.innerHTML = '<div style="color:var(--text-3);padding:10px">No results found.</div>';
      } else {
        searchResults.innerHTML = filtered.map(m => `
          <div class="search-result-item" style="border:1px solid var(--border);border-radius:4px;padding:6px;background:var(--bg-elevated);cursor:pointer">
            <div style="font-weight:600;color:var(--accent);font-size:11px">${m.file}:${m.line}</div>
            <div style="font-family:var(--font-mono);font-size:10px;color:var(--text-2);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${m.content}</div>
          </div>
        `).join('');
      }
    });
  }
});
