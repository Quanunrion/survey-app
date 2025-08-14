/* js/tabs/control4.js
 * Control4 tab renderer
 * - Equipment room single-select
 * - Video streams (+ programming notes to Field 12)
 * - Audio config (+ programming notes to Field 12)
 * - Keypads: type, name, programming notes, color swatch (shows code under picker)
 * - Touchscreens: 8"/10" with color swatches, live list, delete
 * - Remotes: HALO-TS with Black/Silver swatches, live list, delete
 *
 * Depends on core.js globals:
 *   state, buildSwatchRow, SWATCH_C4_KEYPAD, SWATCH_C4_TOUCH,
 *   markEquipmentRoom, renderMain, renderSummary
 */

window.renderControl4 = function renderControl4(r){
  const box = document.createElement("div");

  /* Top config rows: equipment, video, audio */
  const form = document.createElement("div");
  form.innerHTML =
    "<div class='row'>"
      +"<div class='col'>"
        +"<label>Equipment Room?</label>"
        +"<select id='eqRoom'><option value='no'>No</option><option value='yes'>Yes</option></select>"
      +"</div>"
      +"<div class='col'>"
        +"<label>Video streams (count)</label>"
        +"<input id='videoCount' type='number' min='0' value='"+Number(r.control4.videoStreams||0)+"'>"
      +"</div>"
      +"<div class='col'>"
        +"<label>Video programming notes</label>"
        +"<input id='videoNotes' placeholder='Controller programming notes (to Field 12)'>"
      +"</div>"
    +"</div>"
    +"<div class='row'>"
      +"<div class='col'>"
        +"<label>Audio</label>"
        +"<select id='audioEnabled'>"
          +"<option value='no'>None</option>"
          +"<option value='wired'>Wired</option>"
          +"<option value='wireless'>Wireless</option>"
        +"</select>"
      +"</div>"
      +"<div class='col'>"
        +"<label>Speakers</label>"
        +"<input id='speakerCount' type='number' min='0' value='"+Number(r.control4.audio.speakers||0)+"'>"
      +"</div>"
      +"<div class='col'>"
        +"<label>Audio distribution</label>"
        +"<select id='audioDist'>"
          +"<option>Mono</option><option>Stereo</option><option>2.1</option>"
          +"<option>5.1</option><option>7.1</option><option>7.2</option><option>7.2.4</option>"
        +"</select>"
      +"</div>"
      +"<div class='col'>"
        +"<label>Audio programming notes</label>"
        +"<input id='audioNotes' placeholder='Amp programming notes (to Field 12)'>"
      +"</div>"
    +"</div>";
  box.appendChild(form);

  /* Keypads section — Name + Programming Notes + Color Swatch (with code) */
  const ksec = document.createElement("div");
  ksec.className = "systemSummary";
  ksec.innerHTML = "<strong>Keypads</strong><div id='keypadsList'></div>";

  const addK = document.createElement("button");
  addK.className = "btn-sm";
  addK.textContent = "+ Add Keypad";
  addK.onclick = () => {
    r.control4.keypads.push({ type: "Configurable", name: "", notes: "", colorCode: "WH" });
    renderMain();
  };
  ksec.appendChild(addK);
  box.appendChild(ksec);

  /* Touchscreens — live list w/ color swatches + delete */
  const tse = document.createElement("div");
  tse.className = "systemSummary";
  tse.innerHTML = "<strong>Touchscreens</strong>";

  const tsBar = document.createElement("div");
  tsBar.className = "row";
  const add8 = document.createElement("button");
  add8.className = "btn-sm";
  add8.textContent = '+ 8"';
  add8.onclick = () => { r.control4.touchscreens.push({ size: '8"', colorCode: "WH" }); renderMain(); };

  const add10 = document.createElement("button");
  add10.className = "btn-sm";
  add10.textContent = '+ 10"';
  add10.onclick = () => { r.control4.touchscreens.push({ size: '10"', colorCode: "WH" }); renderMain(); };

  tsBar.appendChild(add8);
  tsBar.appendChild(add10);
  tse.appendChild(tsBar);

  (r.control4.touchscreens||[]).forEach((ts, i) => {
    const row = document.createElement("div"); row.className = "row";

    const info = document.createElement("div"); info.className = "col";
    info.innerHTML = "<label>Touchscreen</label><div class='chip'>"+ts.size+"</div>";

    const colors = document.createElement("div"); colors.className = "col";
    colors.appendChild(buildSwatchRow(SWATCH_C4_TOUCH, ts.colorCode || "WH", (sel) => { ts.colorCode = sel.code; }));

    const del = document.createElement("div"); del.className = "fit";
    const b = document.createElement("button"); b.className = "btn-sm"; b.textContent = "Del";
    b.onclick = () => { r.control4.touchscreens.splice(i,1); renderMain(); };
    del.appendChild(b);

    row.appendChild(info);
    row.appendChild(colors);
    row.appendChild(del);
    tse.appendChild(row);
  });
  box.appendChild(tse);

  /* Remotes — HALO-TS Black/Silver swatches + delete */
  const rse = document.createElement("div"); rse.className = "systemSummary"; rse.innerHTML = "<strong>Remotes</strong>";
  const addR = document.createElement("button"); addR.className = "btn-sm"; addR.textContent = "+ Add Remote";
  addR.onclick = () => { r.control4.remotes.push({ color: "BL" }); renderMain(); };
  rse.appendChild(addR);

  (r.control4.remotes||[]).forEach((rm, i) => {
    const row = document.createElement("div"); row.className = "row";

    const info = document.createElement("div"); info.className = "col";
    info.innerHTML = '<label>Model</label><div class="chip">C4-HALO-TS</div>';

    const color = document.createElement("div"); color.className = "col";
    // Using existing classes: sw-c4t-bl for black, reuse aluminum class for silver swatch
    color.appendChild(buildSwatchRow(
      [{name:"Black",code:"BL",cls:"sw-c4t-bl"},{name:"Silver",code:"AS",cls:"sw-c4-au"}],
      rm.color || "BL",
      (sel)=>{ rm.color = sel.code; }
    ));

    const del = document.createElement("div"); del.className = "fit";
    const b = document.createElement("button"); b.className = "btn-sm"; b.textContent = "Del";
    b.onclick = () => { r.control4.remotes.splice(i,1); renderMain(); };
    del.appendChild(b);

    row.appendChild(info);
    row.appendChild(color);
    row.appendChild(del);
    rse.appendChild(row);
  });
  box.appendChild(rse);

  /* Mount assembled section into main column before binding inputs */
  const mainContent = document.getElementById("mainContent");
  mainContent.appendChild(box);

  /* Bind inputs after insertion */
  const eq = document.getElementById("eqRoom");
  if (eq) {
    eq.value = r.isEquipmentRoom ? "yes" : "no";
    eq.onchange = (e) => {
      if (e.target.value === "yes") { markEquipmentRoom(r); }
      else { r.isEquipmentRoom = false; }
      renderSummary();
    };
  }

  const v = document.getElementById("videoCount");
  if (v) v.oninput = (e)=> r.control4.videoStreams = Number(e.target.value||0);

  const vn = document.getElementById("videoNotes");
  if (vn) { vn.value = r.control4.videoNotes || ""; vn.oninput = (e)=> r.control4.videoNotes = e.target.value; }

  const a = document.getElementById("audioEnabled");
  if (a) {
    a.value = r.control4.audio.enabled ? (r.control4.audio.wired ? "wired" : "wireless") : "no";
    a.onchange = (e)=>{
      const val = e.target.value;
      r.control4.audio.enabled = (val !== "no");
      r.control4.audio.wired   = (val === "wired");
    };
  }

  const s = document.getElementById("speakerCount");
  if (s) s.oninput = (e)=> r.control4.audio.speakers = Number(e.target.value||0);

  const d = document.getElementById("audioDist");
  if (d) { d.value = r.control4.audio.distribution || "Stereo"; d.onchange = (e)=> r.control4.audio.distribution = e.target.value; }

  const an = document.getElementById("audioNotes");
  if (an) { an.value = r.control4.audio.notes || ""; an.oninput = (e)=> r.control4.audio.notes = e.target.value; }

  /* Keypads list (inline renderer) */
  function renderKeypads(){
    const container = document.getElementById("keypadsList");
    if (!container) return;
    container.innerHTML = "";

    (r.control4.keypads||[]).forEach((k, idx)=>{
      const row = document.createElement("div"); row.className = "row";

      // Type
      const type = document.createElement("select");
      ["Configurable","Dimmer"].forEach(t=>{
        const o=document.createElement("option"); o.value=o.text=t; if(k.type===t) o.selected=true; type.appendChild(o);
      });
      type.onchange = (e)=> k.type = e.target.value;

      // Name (to Field 12)
      const name = document.createElement("input");
      name.placeholder = "Keypad name (to Field 12)";
      name.value = k.name || "";
      name.oninput = (e)=> k.name = e.target.value;

      // Programming notes (to Field 12)
      const notes = document.createElement("input");
      notes.placeholder = "Programming notes (to Field 12)";
      notes.value = k.notes || "";
      notes.oninput = (e)=> k.notes = e.target.value;

      // Color swatch (with code text below)
      const color = document.createElement("div");
      color.appendChild(buildSwatchRow(SWATCH_C4_KEYPAD, k.colorCode || "WH", (sel)=>{ k.colorCode = sel.code; }));

      // Delete button
      const del = document.createElement("button");
      del.className = "btn-sm";
      del.textContent = "Del";
      del.onclick = () => { r.control4.keypads.splice(idx,1); renderKeypads(); };

      // Columns
      const c1 = document.createElement("div"); c1.className="col"; c1.innerHTML="<label>Type</label>"; c1.appendChild(type);
      const c2 = document.createElement("div"); c2.className="col"; c2.innerHTML="<label>Name</label>"; c2.appendChild(name);
      const c3 = document.createElement("div"); c3.className="col"; c3.innerHTML="<label>Programming Notes</label>"; c3.appendChild(notes);
      const c4 = document.createElement("div"); c4.className="col"; c4.innerHTML="<label>Color</label>"; c4.appendChild(color);
      const c5 = document.createElement("div"); c5.className="fit"; c5.appendChild(del);

      row.appendChild(c1); row.appendChild(c2); row.appendChild(c3); row.appendChild(c4); row.appendChild(c5);
      container.appendChild(row);
    });
  }
  renderKeypads();
};
