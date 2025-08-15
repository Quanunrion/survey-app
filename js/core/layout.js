/* layout.js — floors/rooms UI, tabs, summary */

(function(){
  window.addFloor = function(name){
    const fid = uid();
    const f = { id: fid, name: name || `Floor ${state.floors.length + 1}`, rooms: [] };
    state.floors.push(f);
    addRoom(fid, "Room 1");
    selectRoom(fid, f.rooms[0].id);
    renderLeft(); renderTabs(); renderMain(); renderSummary();
  };

  window.addRoom = function(fid, name){
    const f = state.floors.find(x => x.id === fid); if (!f) return;
    const rid = uid();
    const room = {
      id: rid, name: name || "New Room", notes: "", photos: [], isEquipmentRoom: false,
      control4: { videoStreams: 0, videoNotes: "",
        audio: { enabled: false, wired: false, speakers: 0, distribution: "Stereo", notes: "" },
        keypads: [], touchscreens: [], remotes: [] },
      lighting: { banks: [] },
      cameras: [],
      security: { zones: [], panel: { present: false, type: "primary" } },
      networking: { banks: [] }
    };
    f.rooms.push(room);
  };

  window.copyFloor = function(fid){
    if (!confirm("Copy floor and its rooms?")) return;
    const f = state.floors.find(x => x.id === fid);
    const nf = JSON.parse(JSON.stringify(f));
    nf.id = uid(); nf.name = f.name + " (copy)";
    nf.rooms.forEach(r => r.id = uid());
    state.floors.push(nf);
    renderLeft();
  };

  window.deleteFloor = function(fid){
    if (!confirm("Delete floor?")) return;
    state.floors = state.floors.filter(f => f.id !== fid);
    const first = state.floors[0];
    state.selectedFloorId = first ? first.id : null;
    state.selectedRoomId  = first && first.rooms[0] ? first.rooms[0].id : null;
    renderLeft(); renderMain(); renderSummary();
  };

  window.copyRoom = function(fid, rid){
    if (!confirm("Copy room?")) return;
    const f = state.floors.find(x => x.id === fid);
    const r = f.rooms.find(x => x.id === rid);
    const nr = JSON.parse(JSON.stringify(r));
    nr.id = uid(); nr.name = r.name + " (copy)";
    f.rooms.push(nr);
    renderLeft();
  };

  window.deleteRoom = function(fid, rid){
    if (!confirm("Delete room?")) return;
    const f = state.floors.find(x => x.id === fid);
    f.rooms = f.rooms.filter(r => r.id !== rid);
    if (state.selectedRoomId === rid) {
      state.selectedRoomId = f.rooms[0] ? f.rooms[0].id : null;
    }
    renderLeft(); renderMain(); renderSummary();
  };

  window.selectRoom = function(fid, rid){
    state.selectedFloorId = fid;
    state.selectedRoomId  = rid;
    renderLeft(); renderMain();
  };

  window.renderLeft = function(){
    const floorsList = document.getElementById("floorsList");
    if (!floorsList) return;
    floorsList.innerHTML = "";

    state.floors.forEach(f => {
      const card = document.createElement("div"); card.className = "floorCard";

      const header = document.createElement("div"); header.className = "floorHeader";
      const name = document.createElement("input");
      name.value = f.name;
      name.oninput = (e) => { f.name = e.target.value; renderSummary(); };

      const btns = document.createElement("div"); btns.className = "inline";
      const copy = document.createElement("button"); copy.className = "btn-sm"; copy.textContent = "Copy";
      copy.onclick = () => copyFloor(f.id);
      const del  = document.createElement("button"); del.className = "btn-sm"; del.textContent = "Del";
      del.onclick = () => deleteFloor(f.id);

      header.appendChild(name);
      btns.appendChild(copy); btns.appendChild(del);
      header.appendChild(btns);
      card.appendChild(header);

      const rooms = document.createElement("div"); rooms.className = "rooms";
      f.rooms.forEach(r => {
        const row = document.createElement("div");
        row.className = "roomBtn" + (state.selectedRoomId === r.id ? " active" : "");

        const left = document.createElement("div"); left.className = "inline";
        const rn = document.createElement("input");
        rn.value = r.name;
        rn.oninput = (e) => { r.name = e.target.value; renderSummary(); };
        left.appendChild(rn);

        const tools = document.createElement("div"); tools.className = "inline";
        const c = document.createElement("button"); c.className = "btn-sm"; c.textContent = "Copy";
        c.onclick = (ev) => { ev.stopPropagation(); copyRoom(f.id, r.id); };
        const d = document.createElement("button"); d.className = "btn-sm"; d.textContent = "Del";
        d.onclick = (ev) => { ev.stopPropagation(); deleteRoom(f.id, r.id); };
        tools.appendChild(c); tools.appendChild(d);

        row.onclick = () => selectRoom(f.id, r.id);
        row.appendChild(left);
        row.appendChild(tools);
        rooms.appendChild(row);
      });

      const add = document.createElement("button");
      add.className = "btn-sm btn-wide";
      add.textContent = "+ Add Room";
      add.onclick = () => { addRoom(f.id); renderLeft(); };

      card.appendChild(rooms);
      card.appendChild(add);
      floorsList.appendChild(card);
    });
  };

  window.renderTabs = function(){
    const systemTabs = document.getElementById("systemTabs");
    if (!systemTabs) return;
    systemTabs.innerHTML = "";
    SYSTEM_TABS.forEach(t => {
      const e = document.createElement("div");
      e.className = "tab" + (state.selectedTab === t ? " active" : "");
      e.textContent = t;
      e.onclick = () => { state.selectedTab = t; renderTabs(); renderMain(); };
      systemTabs.appendChild(e);
    });
  };

  window.getSelected = function(){
    const f = state.floors.find(x => x.id === state.selectedFloorId);
    if (!f) return {};
    const r = f.rooms.find(x => x.id === state.selectedRoomId);
    return { f, r };
  };

  window.markEquipmentRoom = function(room){
    state.floors.forEach(ff => ff.rooms.forEach(rr => rr.isEquipmentRoom = false));
    room.isEquipmentRoom = true;
  };

  window.renderMain = function(){
    const mainContent = document.getElementById("mainContent");
    if (!mainContent) return;
    const { f, r } = getSelected();
    mainContent.innerHTML = "";

    if (!r) {
      mainContent.innerHTML = '<div class="muted">Select a floor & room.</div>';
      return;
    }

    const header = document.createElement("div");
    header.className = "systemSummary";
    header.innerHTML = `<strong>${escapeHTML(f.name)} — ${escapeHTML(r.name)}</strong>`;
    mainContent.appendChild(header);

    const tab = state.selectedTab;
    if (tab === "Control4" && typeof window.renderControl4 === "function") window.renderControl4(r);
    else if (tab === "Lighting" && typeof window.renderLighting === "function") window.renderLighting(r);
    else if (tab === "Cameras" && typeof window.renderCameras === "function") window.renderCameras(r);
    else if (tab === "Security" && typeof window.renderSecurity === "function") window.renderSecurity(r);
    else if (tab === "Structured Wiring" && typeof window.renderStructured === "function") window.renderStructured(r);
  };

  window.renderSummary = function(){
    const summaryArea = document.getElementById("summaryArea");
    if (!summaryArea) return;

    const totals = { cams:0, keypads:0, touch:0, jacks:0, loads:0, poe:0 };
    state.floors.forEach(f => f.rooms.forEach(r => {
      totals.cams += (r.cameras || []).length;
      totals.keypads += (r.control4.keypads || []).length;
      totals.touch += (r.control4.touchscreens || []).length;
      (r.lighting.banks || []).forEach(b => (b.gangs || []).forEach(() => totals.loads += 1));
      (r.networking.banks || []).forEach(b => totals.jacks += Number(b.jacks || 0));
    }));
    totals.poe = autoPoECount();

    // storage capacity + retention
    const camsTotal = totalCameras();
    const plan = nvrPlan();
    const totalTB = plan.length * (window.NVR_TB_PER_UNIT || 2);
    const perCamMbps = state.settings.cameraBitrateMbps * (state.settings.motionDuty || 0.05);
    const days = camsTotal > 0
      ? ((totalTB * 1e12 * 8) / (camsTotal * perCamMbps * 1e6 * 24 * 3600))
      : 0;

    // switch summary
    const portsNeeded = computePortsNeeded();
    const swPlan = portsNeeded > 0 ? planSwitches(portsNeeded) : [];
    const grouped = swPlan.reduce((m, s) => { m[s.model] = (m[s.model] || 0) + 1; return m; }, {});
    const swText = Object.entries(grouped).map(([m,q]) => `${q}×${m.split('-').pop()}`).join(" + ") || "0";

    // panels
    const panelsNeeded = Math.ceil(computeEthernetRuns()/24) || 0;

    summaryArea.innerHTML =
      `<div class='chip'>Cameras: ${totals.cams}</div>` +
      `<div class='chip'>Touchscreens: ${totals.touch}</div>` +
      `<div class='chip'>Keypads: ${totals.keypads}</div>` +
      `<div class='chip'>Jacks: ${totals.jacks}</div>` +
      `<div class='chip'>Lighting Loads: ${totals.loads}</div>` +
      `<div class='chip'>PoE: ${totals.poe}</div>` +
      `<div class='chip'>Cap: ${totalTB} TB; Retention≈ ${days.toFixed(1)}d</div>` +
      `<div class='chip'>Switches: ${swText}</div>` +
      `<div class='chip'>Patch Panels: ${panelsNeeded}×24</div>`;
  };
})();
