/* js/tabs/wiring.js
 * Structured Wiring (Networking) tab renderer
 * - Default bank label: "Bank N"
 * - Del Bank on the right to avoid accidental taps
 * - Per bank: Name, Jacks (#), Color swatch with code
 * - No PoE field on this tab
 *
 * Depends on core.js globals:
 *   state, uid, buildSwatchRow, SWATCH_NETWORK, renderMain, renderSummary
 */

window.renderStructured = function renderStructured(r){
  const wrap = document.createElement("div");

  // Banks container + Add Bank
  const list = document.createElement("div");
  list.id = "networkBanksList";

  const add = document.createElement("button");
  add.className = "btn-sm";
  add.textContent = "+ Add Bank";
  add.onclick = () => {
    (r.networking.banks || (r.networking.banks = [])).push({
      id: uid(),
      name: `Bank ${r.networking.banks.length + 1}`,
      jacks: 0,
      colorCode: null
    });
    renderMain();
  };

  wrap.appendChild(list);
  wrap.appendChild(add);

  // Render each bank
  (r.networking.banks || []).forEach((bank, idx) => {
    const card = document.createElement("div");
    card.className = "systemSummary";

    // Header: Bank name (left) + Del Bank (right)
    const head = document.createElement("div");
    head.className = "row";

    const name = document.createElement("input");
    name.value = bank.name || "";
    name.oninput = (e) => bank.name = e.target.value;

    const del = document.createElement("button");
    del.className = "btn-sm";
    del.textContent = "Del Bank";
    del.onclick = () => {
      r.networking.banks.splice(idx, 1);
      renderMain();
      renderSummary();
    };

    head.appendChild(name);
    const right = document.createElement("div");
    right.className = "fit";
    right.appendChild(del);
    head.appendChild(right);
    card.appendChild(head);

    // Body row: Jacks (#) + Color swatch with code
    const row = document.createElement("div");
    row.className = "row";

    const j = document.createElement("input");
    j.type = "number";
    j.min = 0;
    j.value = bank.jacks || 0;
    j.oninput = (e) => {
      bank.jacks = Number(e.target.value || 0);
      renderSummary(); // keep the top-right summary in sync
    };

    const colWrap = document.createElement("div");
    colWrap.className = "col";
    colWrap.innerHTML = "<label>Color (optional)</label>";
    colWrap.appendChild(
      buildSwatchRow(SWATCH_NETWORK, bank.colorCode, (sel) => { bank.colorCode = sel.code; })
    );

    const cJ = document.createElement("div"); cJ.className = "col";
    cJ.innerHTML = "<label>Jacks</label>";
    cJ.appendChild(j);

    row.appendChild(cJ);
    row.appendChild(colWrap);
    card.appendChild(row);

    list.appendChild(card);
  });

  // Mount into the main content area
  const mainContent = document.getElementById("mainContent");
  mainContent.appendChild(wrap);
};
