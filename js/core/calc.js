/* calc.js — vPP-2: cameras, switches, distributed patch panels, racks */

(function(){
  // PoE devices auto-count
  window.autoPoECount = function(){
    let c = 0;
    state.floors.forEach(f => f.rooms.forEach(r => {
      c += (r.cameras || []).length;
      c += (r.control4.touchscreens || []).length;
    }));
    return c;
  };

  window.totalCameras = function(){
    return state.floors.reduce((a, f) =>
      a + f.rooms.reduce((aa, r) => aa + (r.cameras || []).length, 0)
    , 0);
  };

  // Lutron devices/controllers
  window.countLutronDevices = function(){
    let devices = 0;
    state.floors.forEach(f => f.rooms.forEach(r =>
      (r.lighting.banks || []).forEach(b =>
        (b.gangs || []).forEach(() => devices += 1)
      )
    ));
    const controllers = Math.min(2, Math.max(1, Math.ceil(devices / 100) || 0));
    return { devices, controllers };
  };

  // NVR plan (cost-first)
  window.nvrPlan = function(){
    const n = totalCameras();
    const plan = [];
    if (n <= 0) return plan;
    let remaining = n;

    if (remaining >= 32) { plan.push({ channels: 32, model: "LUMA-NVR-32" }); remaining -= 32; }
    if (remaining > 0 && remaining <= 8) { plan.push({ channels: 8, model: "LUMA-NVR-8" }); remaining -= 8; }
    else if (remaining > 0 && remaining <= 16) { plan.push({ channels: 16, model: "LUMA-NVR-16" }); remaining -= 16; }
    else if (remaining > 16 && remaining <= 24) { plan.push({ channels: 16, model: "LUMA-NVR-16" }); remaining -= 16; plan.push({ channels: 8, model: "LUMA-NVR-8" }); remaining -= 8; }
    else if (remaining > 24 && remaining <= 32) { plan.push({ channels: 32, model: "LUMA-NVR-32" }); remaining -= 32; }

    if (n > 32 && n <= 40) {
      const i = plan.findIndex(p => p.channels === 8);
      if (i >= 0) plan.splice(i, 1, { channels: 16, model: "LUMA-NVR-16" });
    }
    return plan;
  };

  // Switch planning (Araknis 420 series)
  window.planSwitches = function planSwitches(portsNeeded){
    const out = [];
    let remaining = Math.max(0, Math.ceil(portsNeeded));
    const add = (model, ports) => { out.push({ model, ports, ru: 1 }); remaining -= ports; };

    while (remaining > 0) {
      if (remaining > 24) {
        add("ARAKNIS-420-48P", 48);
      } else if (remaining > 8) {
        add("ARAKNIS-420-24P", 24);
      } else {
        add("ARAKNIS-420-8P", 8);
      }
    }
    return out;
  };

  // Ports incl spares (switch planning uses spares)
  window.computePortsNeeded = function computePortsNeeded(){
    const jacksTotal = (state.floors || []).reduce((a, f) =>
      a + (f.rooms || []).reduce((aa, r) =>
        aa + ((r.networking && Array.isArray(r.networking.banks))
          ? r.networking.banks.reduce((s, b) => s + Number(b.jacks || 0), 0) : 0)
      , 0)
    , 0);
    return Math.ceil(jacksTotal * (1 + state.settings.sparePercent / 100));
  };

  /* ===== PATCH PANELS =====
     Ethernet home-runs = networking jacks + cameras (NO spares) */
  window.computeEthernetRuns = function computeEthernetRuns(){
    const jacksTotal = (state.floors || []).reduce((a, f) =>
      a + (f.rooms || []).reduce((aa, r) =>
        aa + ((r.networking && Array.isArray(r.networking.banks))
          ? r.networking.banks.reduce((s, b) => s + Number(b.jacks || 0), 0) : 0), 0), 0);
    const cams = totalCameras();
    return jacksTotal + cams;
  };

  // Build a payload where patch panels are DISTRIBUTED with switches.
  // Total panels = ceil(ethernetRuns/24). A 48P switch can host up to 2 panels; 24P → 1; 8P → 0.
  function buildSwitchAndPanelsPayload(){
    const portsNeeded = computePortsNeeded();     // with spares -> drives switches
    const swPlan = portsNeeded > 0 ? planSwitches(portsNeeded) : [];

    const totalRuns = computeEthernetRuns();      // no spares -> drives panels
    let panelsRemaining = Math.ceil(totalRuns / 24) || 0;

    const items = [];
    swPlan.forEach(sw => {
      const capacityPanels = Math.floor(sw.ports / 24); // 48->2, 24->1, 8->0
      const usePanels = Math.min(capacityPanels, panelsRemaining);
      for (let i = 0; i < usePanels; i++){
        items.push({ model: "WP-CAT6-HDPP-24", ru: 1, type: "panel" });
        items.push({ model: "OPEN-SPACE", ru: 1, type: "blank" }); // reserved under panel
        panelsRemaining--;
      }
      items.push({ model: sw.model, ru: 1, type: "switch" });
    });

    // Edge-case: if for some reason we still owe panels (unlikely), append them;
    // they’ll flow into the next rack. Still maintain open space under each.
    while (panelsRemaining-- > 0) {
      items.push({ model: "WP-CAT6-HDPP-24", ru: 1, type: "panel" });
      items.push({ model: "OPEN-SPACE", ru: 1, type: "blank" });
    }

    return items;
  }

  // Rack packer (per-rack WattBox, UPS-RESERVED, vents + mid-vents)
  window.computeRacks = function(){
    const equip = state.floors.flatMap(f => f.rooms.map(r => ({ f, r })))
                  .find(x => x.r.isEquipmentRoom) ||
                  (state.floors[0] ? { f: state.floors[0], r: state.floors[0].rooms[0] } : null);
    if (!equip || !equip.r) return [];

    // Build payload with DISTRIBUTED panels + switches
    const switchAndPanels = buildSwitchAndPanelsPayload();

    // NVRs (2U each)
    const nvrs = nvrPlan().map(n => ({ model: n.model, ru: 2 }));

    // Shelves for smalls (controllers/ancillary)
    let smalls = 0;
    state.floors.forEach(f => f.rooms.forEach(r => {
      if (r.control4 && (r.control4.videoStreams > 0 || (r.control4.audio && r.control4.audio.enabled))) smalls++;
    }));
    const shelves = smalls > 0 ? [{ model: "STRONG-1U-SHELF", ru: 1 }] : [];

    // Final payload order:
    //   [ panels + blanks interleaved with switches ] → NVRs → Shelves
    const payload = [
      ...switchAndPanels,
      ...nvrs,
      ...shelves
    ];

    const chooseSize = (usedRU) => usedRU <= 6 ? 6 : usedRU <= 12 ? 12 : usedRU <= 18 ? 18 : 24;

    const racks = [];
    let i = 0;
    while (i < payload.length) {
      const items = [];
      let payloadRU = 0;

      const BASE_RU_FIXED = 2 /*WB*/ + 2 /*UPS*/ + 1 /*top vent*/ + 1 /*bottom vent*/;
      const MAX_RACK_RU = 24;
      let remainingRU = MAX_RACK_RU - BASE_RU_FIXED;

      while (i < payload.length) {
        const next = payload[i];
        if (next.ru > remainingRU) break;
        items.push(next);
        payloadRU += next.ru;
        remainingRU -= next.ru;

        const midVentsNeeded = Math.floor(payloadRU / 10); // 1U per 10U payload
        const midVentsRU     = midVentsNeeded * 1;
        const totalRackRUIfFixed = BASE_RU_FIXED + payloadRU + midVentsRU;

        if (totalRackRUIfFixed > MAX_RACK_RU) {
          items.pop();
          payloadRU -= next.ru;
          remainingRU += next.ru;
          break;
        }
        i++;
      }

      const midVentsNeeded = Math.floor(payloadRU / 10);
      const midVents = Array.from({ length: midVentsNeeded }, () => ({ model: "VENT-1U", ru: 1 }));

      const rackItems = [];
      rackItems.push({ model: "VENT-1U", ru: 1 });             // top
      rackItems.push({ model: "WattBox WB-700CH", ru: 2 });     // per rack

      let ruSinceLastVent = 0;
      items.forEach((it) => {
        rackItems.push(it);
        ruSinceLastVent += it.ru;
        if (ruSinceLastVent >= 10 && midVents.length) {
          rackItems.push(midVents.shift());
          ruSinceLastVent = 0;
        }
      });

      rackItems.push({ model: "UPS-RESERVED", ru: 2 });        // reserved
      rackItems.push({ model: "VENT-1U", ru: 1 });             // bottom

      const usedRU = rackItems.reduce((sum, x) => sum + x.ru, 0);
      const size   = chooseSize(usedRU);
      const model  = `SR-WMS-${size}U`;

      racks.push({ ru: usedRU, size, model, items: rackItems });
    }

    return racks;
  };
})();
