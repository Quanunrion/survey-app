/* js/tabs/cameras.js
 * Cameras tab renderer
 * - Types: Dome, Bullet, Turret, PTZ
 * - Per camera: Type, Color swatch (W/B with code), Name, Notes, Delete
 * - Realtime storage panel: total cams, NVR plan, total TB (2TB/NVR), est. retention days @ 5% motion
 *
 * Depends on core.js globals:
 *   state, buildSwatchRow, CAMERA_COLOR, totalCameras, nvrPlan, NVR_TB_PER_UNIT, renderMain
 */

window.renderCameras = function renderCameras(r){
  const wrap = document.createElement("div");

  // List container + Add button
  const list = document.createElement("div");
  list.id = "camsList";

  const add = document.createElement("button");
  add.className = "btn-sm";
  add.textContent = "+ Add Camera";
  add.onclick = () => {
    (r.cameras || (r.cameras = [])).push({
      type: "Dome",
      color: "W",     // W = White, B = Black
      name: "",
      notes: ""
    });
    renderMain();
  };

  wrap.appendChild(list);
  wrap.appendChild(add);

  // Render each camera row
  (r.cameras || []).forEach((c, idx) => {
    const row = document.createElement("div");
    row.className = "row";

    // Type
    const type = document.createElement("select");
    ["Dome","Bullet","Turret","PTZ"].forEach(t => {
      const o = document.createElement("option");
      o.value = o.text = t;
      if (c.type === t) o.selected = true;
      type.appendChild(o);
    });
    type.onchange = (e) => { c.type = e.target.value; };

    // Color swatch (with code text below)
    const color = document.createElement("div");
    color.appendChild(
      buildSwatchRow(CAMERA_COLOR, c.color || "W", (sel) => { c.color = sel.code; })
    );

    // Name (to Field 12)
    const nm = document.createElement("input");
    nm.placeholder = "Camera name (to Field 12)";
    nm.value = c.name || "";
    nm.oninput = (e) => c.name = e.target.value;

    // Notes (to Field 12)
    const nt = document.createElement("input");
    nt.placeholder = "Notes (to Field 12)";
    nt.value = c.notes || "";
    nt.oninput = (e) => c.notes = e.target.value;

    // Delete
    const del = document.createElement("button");
    del.className = "btn-sm";
    del.textContent = "Del";
    del.onclick = () => { r.cameras.splice(idx,1); renderMain(); };

    // Columns
    const c1 = document.createElement("div"); c1.className = "col"; c1.innerHTML = "<label>Type</label>";  c1.appendChild(type);
    const c2 = document.createElement("div"); c2.className = "col"; c2.innerHTML = "<label>Color</label>"; c2.appendChild(color);
    const c3 = document.createElement("div"); c3.className = "col"; c3.innerHTML = "<label>Name</label>";  c3.appendChild(nm);
    const c4 = document.createElement("div"); c4.className = "col"; c4.innerHTML = "<label>Notes</label>"; c4.appendChild(nt);
    const c5 = document.createElement("div"); c5.className = "fit"; c5.appendChild(del);

    row.appendChild(c1);
    row.appendChild(c2);
    row.appendChild(c3);
    row.appendChild(c4);
    row.appendChild(c5);
    list.appendChild(row);
  });

  // Realtime storage panel
  const camsTotal = totalCameras();
  const plan = nvrPlan(); // e.g., [{channels:32, model:"..."}, …]
  const totalTB = plan.length * (window.NVR_TB_PER_UNIT || 2);

  // Per-camera retained days: TB -> bytes -> bits, divide by (cams * perCamMbps * seconds)
  const perCamMbps = state.settings.cameraBitrateMbps * (state.settings.motionDuty || 0.05);
  const days = camsTotal > 0
    ? ((totalTB * 1e12 * 8) / (camsTotal * perCamMbps * 1e6 * 24 * 3600))
    : 0;

  const storage = document.createElement("div");
  storage.className = "systemSummary";
  storage.innerHTML = `
    <strong>Storage & NVRs</strong>
    <div class='muted'>
      Cameras: <b>${camsTotal}</b>,
      NVRs: <b>${plan.map(p=>p.channels).join(" + ") || "0"}</b>,
      Capacity: <b>${totalTB} TB</b><br/>
      Est. retention per camera (5% motion @ ${state.settings.cameraBitrateMbps} Mbps): <b>${days.toFixed(1)} days</b>
    </div>
  `;
  wrap.appendChild(storage);

  // Mount
  const mainContent = document.getElementById("mainContent");
  mainContent.appendChild(wrap);
};
