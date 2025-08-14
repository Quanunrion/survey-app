/* js/tabs/lighting.js
 * Lighting tab renderer (Lutron RA3)
 * - Banks list (Del on right)
 * - Gangs: static position label, Type, Notes (to Field 12), Color swatch (with code)
 * - Add Bank, + Gang (touch-friendly via CSS)
 * - Footer shows device count and required RA3 controllers (≤2, 100 devices each)
 *
 * Depends on core.js globals:
 *   state, uid, buildSwatchRow, SWATCH_LUTRON, countLutronDevices, renderMain
 */

window.renderLighting = function renderLighting(r){
  const wrap = document.createElement("div");

  // Banks container + "Add Bank"
  const banks = document.createElement("div");
  banks.id = "lightingBanksList";
  const add = document.createElement("button");
  add.className = "btn-sm";
  add.textContent = "+ Add Bank";
  add.onclick = () => {
    r.lighting.banks.push({
      id: uid(),
      name: `Bank ${r.lighting.banks.length + 1}`,
      gangs: []
    });
    renderMain();
  };
  wrap.appendChild(banks);
  wrap.appendChild(add);

  // Render all banks
  (r.lighting.banks || []).forEach((bank, bIdx) => {
    const card = document.createElement("div");
    card.className = "systemSummary";

    // Header row: Bank name (left) + Del Bank (right)
    const head = document.createElement("div");
    head.className = "row";

    const name = document.createElement("input");
    name.value = bank.name || "";
    name.oninput = (e) => bank.name = e.target.value;

    const del = document.createElement("button");
    del.className = "btn-sm";
    del.textContent = "Del Bank";
    del.onclick = () => {
      r.lighting.banks.splice(bIdx, 1);
      renderMain();
    };

    head.appendChild(name);
    const right = document.createElement("div");
    right.className = "fit";
    right.appendChild(del);
    head.appendChild(right);
    card.appendChild(head);

    // Gangs
    (bank.gangs || []).forEach((g, gIdx) => {
      const row = document.createElement("div");
      row.className = "row";

      // Static position label (index + 1)
      const pos = document.createElement("div");
      pos.className = "col";
      pos.innerHTML = `<label>Position</label><div class="chip">${gIdx + 1}</div>`;

      // Type select
      const type = document.createElement("select");
      ["Switch", "Dimmer", "Keypad"].forEach(t => {
        const o = document.createElement("option");
        o.value = o.text = t;
        if (g.type === t) o.selected = true;
        type.appendChild(o);
      });
      type.onchange = (e) => g.type = e.target.value;

      // Notes -> Field 12
      const notes = document.createElement("input");
      notes.type = "text";
      notes.placeholder = "Notes (to Field 12)";
      notes.value = g.notes || "";
      notes.oninput = (e) => g.notes = e.target.value;

      // Color swatch + code
      const color = document.createElement("div");
      color.appendChild(
        buildSwatchRow(SWATCH_LUTRON, g.colorCode || "WH", (sel) => { g.colorCode = sel.code; })
      );

      // Delete gang
      const delG = document.createElement("button");
      delG.className = "btn-sm";
      delG.textContent = "Del";
      delG.onclick = () => {
        bank.gangs.splice(gIdx, 1);
        renderMain();
      };

      // Assemble columns
      const cType = document.createElement("div"); cType.className = "col"; cType.innerHTML = "<label>Type</label>"; cType.appendChild(type);
      const cNotes = document.createElement("div"); cNotes.className = "col"; cNotes.innerHTML = "<label>Notes (to Field 12)</label>"; cNotes.appendChild(notes);
      const cColor = document.createElement("div"); cColor.className = "col"; cColor.innerHTML = "<label>Color</label>"; cColor.appendChild(color);
      const cDel = document.createElement("div"); cDel.className = "fit"; cDel.appendChild(delG);

      row.appendChild(pos);
      row.appendChild(cType);
      row.appendChild(cNotes);
      row.appendChild(cColor);
      row.appendChild(cDel);
      card.appendChild(row);
    });

    // Add gang button (large touch target via CSS)
    const addGang = document.createElement("button");
    addGang.className = "btn-sm";
    addGang.textContent = "+ Gang";
    addGang.onclick = () => {
      bank.gangs.push({
        type: "Switch",
        notes: "",
        colorCode: "WH"
      });
      renderMain();
    };
    card.appendChild(addGang);

    banks.appendChild(card);
  });

  // RA3 device/controller note
  const counts = countLutronDevices(); // { devices, controllers }
  const note = document.createElement("div");
  note.className = "muted";
  note.style.marginTop = "8px";
  note.textContent = `Devices: ${counts.devices} → RA3 Controllers needed: ${counts.controllers}`;
  wrap.appendChild(note);

  // Mount
  const mainContent = document.getElementById("mainContent");
  mainContent.appendChild(wrap);
};
