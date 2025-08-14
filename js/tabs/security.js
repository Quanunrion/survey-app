/* js/tabs/security.js
 * Security tab renderer
 * - ADC / Resideo toggle (top, re-renders on change)
 * - Generic sensor names: D/W, Motion, Glass, Carbon, Smoke
 * - Zone rows: Type, Quantity, Delete
 * - Panel: "present" checkbox + type (Primary first, then Remote); ensures single Primary
 *
 * Depends on core.js globals:
 *   state, renderMain
 */

window.renderSecurity = function renderSecurity(r){
  const wrap = document.createElement("div");

  /* --- Platform toggle: ADC / Resideo --- */
  const brandRow = document.createElement("div");
  brandRow.className = "row";

  const brandWrap = document.createElement("div");
  brandWrap.className = "col";

  const label = document.createElement("label");
  label.textContent = "Platform";

  const brandSel = document.createElement("select");
  ["ADC","Resideo"].forEach(b => {
    const o = document.createElement("option");
    o.value = b; o.text = b;
    if (state.securityBrand === b) o.selected = true;
    brandSel.appendChild(o);
  });
  brandSel.onchange = (e) => { state.securityBrand = e.target.value; renderMain(); };

  brandWrap.appendChild(label);
  brandWrap.appendChild(brandSel);
  brandRow.appendChild(brandWrap);
  wrap.appendChild(brandRow);

  /* --- Zones list --- */
  const zones = document.createElement("div");
  zones.id = "zonesList";

  const addZ = document.createElement("button");
  addZ.className = "btn-sm";
  addZ.textContent = "+ Add Sensor";
  addZ.onclick = () => {
    (r.security.zones || (r.security.zones = [])).push({ type: "D/W", qty: 1 });
    renderMain();
  };

  wrap.appendChild(zones);
  wrap.appendChild(addZ);

  (r.security.zones || []).forEach((z, idx) => {
    const row = document.createElement("div");
    row.className = "row";

    // Type (generic)
    const sel = document.createElement("select");
    ["D/W","Motion","Glass","Carbon","Smoke"].forEach(t => {
      const o = document.createElement("option");
      o.value = o.text = t;
      if (z.type === t) o.selected = true;
      sel.appendChild(o);
    });
    sel.onchange = (e) => z.type = e.target.value;

    // Quantity (numeric)
    const qty = document.createElement("input");
    qty.type = "number"; qty.min = 1;
    qty.value = z.qty || 1;
    qty.oninput = (e) => z.qty = Number(e.target.value || 1);

    // Delete
    const del = document.createElement("button");
    del.className = "btn-sm";
    del.textContent = "Del";
    del.onclick = () => { r.security.zones.splice(idx, 1); renderMain(); };

    // Columns
    const c1 = document.createElement("div"); c1.className = "col"; c1.innerHTML = "<label>Type</label>"; c1.appendChild(sel);
    const c2 = document.createElement("div"); c2.className = "col"; c2.innerHTML = "<label>Quantity</label>"; c2.appendChild(qty);
    const c3 = document.createElement("div"); c3.className = "fit"; c3.appendChild(del);

    row.appendChild(c1);
    row.appendChild(c2);
    row.appendChild(c3);
    zones.appendChild(row);
  });

  /* --- Panels: Primary first, then Remote; single Primary across project --- */
  const panel = document.createElement("div");
  panel.className = "systemSummary";
  panel.innerHTML =
    "<label><input type='checkbox' id='panelPresent'> This room gets a panel</label> " +
    "<select id='panelType' class='inline'>" +
      "<option value='primary'>Primary</option>" +
      "<option value='remote'>Remote</option>" +
    "</select>";
  wrap.appendChild(panel);

  // Mount into main column before binding
  const mainContent = document.getElementById("mainContent");
  mainContent.appendChild(wrap);

  // Bind panel inputs
  const panelPresent = document.getElementById("panelPresent");
  const panelType    = document.getElementById("panelType");

  panelPresent.checked = !!r.security.panel.present;
  panelType.value      = r.security.panel.type || "primary";

  panelPresent.onchange = () => { r.security.panel.present = panelPresent.checked; };

  panelType.onchange = () => {
    if (panelType.value === "primary" && r.security.panel.present){
      // Enforce a single Primary panel across project
      const existing = state.floors
        .flatMap(f => f.rooms)
        .find(x => x.security && x.security.panel && x.security.panel.present && x.security.panel.type === "primary");

      if (existing && existing !== r && !confirm("A primary panel exists. Replace with this room?")) {
        panelType.value = "remote";
        return;
      }
      // Demote all others to remote, set current to primary
      state.floors.forEach(f => f.rooms.forEach(rr => {
        if (rr.security && rr.security.panel) rr.security.panel.type = "remote";
      }));
      r.security.panel.type = "primary";
    } else {
      r.security.panel.type = panelType.value;
    }
  };
};
