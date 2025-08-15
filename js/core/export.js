/* export.js — CSV rows and download */

(function(){
  window.row = (q, model, location, manufacturer, system, cf12) => ({
    "Quantity": q,
    "Model": model,
    "Location": location,
    "Manufacturer": manufacturer,
    "System": system,
    "Custom Field 12": cf12 || ""
  });

  window.exportFilename = function(){
    const dt = new Date(), y = dt.getFullYear(), m = String(dt.getMonth() + 1).padStart(2, "0"), d = String(dt.getDate()).padStart(2, "0");
    const cn = (state.client.name || "Client").trim();
    let pn = (state.projectName || "").trim();
    if (!pn) pn = cn + " Project"; // auto from client if blank
    return `${cn} - ${pn} - ${y}-${m}-${d}.csv`.replace(/\s+/g, " ");
  };

  window.exportCSV = function(){
    const rows = [];
    const logCounts = {control4:0, lighting:0, cameras:0, security:0, wiring:0, equip:0};

    try {
      (state.floors || []).forEach(f => (f.rooms || []).forEach(r => {
        const loc = `${f.name}: ${r.name}`;

        /* ===== CONTROL4 ===== */
        try {
          const c4 = r.control4 || {};
          if (Number(c4.videoStreams) > 0) {
            const f12 = `streams:${c4.videoStreams}; notes:${c4.videoNotes || ""}`;
            rows.push(row(1, "C4-CORE1", loc, "Control4", SYSTEM_TO_EXPORT.Control4, f12)); logCounts.control4++;
          }
          const aud = c4.audio || {};
          if (aud.enabled && aud.wired && Number(aud.speakers) > 0) {
            const f12 = `spk:${aud.speakers}; dist:${aud.distribution || ""}; notes:${aud.notes || ""}`;
            rows.push(row(1, "TRIAD-AMP-1U", loc, "TRIAD", "Control Systems", f12)); logCounts.control4++;
          }
          (Array.isArray(c4.keypads) ? c4.keypads : []).forEach(k => {
            const base = (k.type === "Dimmer") ? "C4-L-KDS" : "C4-L-KC";
            const col  = k.colorCode || "WH";
            const f12  = `name:${k.name || ""}; notes:${k.notes || ""}; color:${col}`;
            rows.push(row(1, base, loc, "Control4", "Control Systems", f12));                 logCounts.control4++;
            rows.push(row(1, `C4-L-CKKC-${col}`, loc, "Control4", "Control Systems", f12));   logCounts.control4++;
            rows.push(row(1, `C4-L-FP1-${col}`,  loc, "Control4", "Control Systems", f12));   logCounts.control4++;
          });
          (Array.isArray(c4.touchscreens) ? c4.touchscreens : []).forEach(ts => {
            const col = ts.colorCode || "WH";
            const sku = (ts.size === '8"') ? `C4-T4IW8-${col}` : `C4-T4IW10-${col}`;
            rows.push(row(1, sku, loc, "Control4", "Control Systems", `size:${ts.size}; color:${col}`)); logCounts.control4++;
          });
          (Array.isArray(c4.remotes) ? c4.remotes : []).forEach(rm => {
            const model = (rm.color === "AS") ? "C4-HALO-TS-AS" : "C4-HALO-TS-BL";
            rows.push(row(1, model, loc, "Control4", "Control Systems", `color:${rm.color || "BL"}`)); logCounts.control4++;
          });
        } catch (e) { console.error("Export CONTROL4 failed in", loc, e); }

        /* ===== LIGHTING ===== */
        try {
          const L = r.lighting || {};
          (Array.isArray(L.banks) ? L.banks : []).forEach(b =>
            (Array.isArray(b.gangs) ? b.gangs : []).forEach((g, idx) => {
              const type = g.type || "Switch";
              let model = (type === "Dimmer") ? "RRST-PRO-N-XX"
                        : (type === "Switch") ? "RRST-8ANS-XX"
                        : "RRST-W4B-XX";
              const col  = g.colorCode || "WH";
              model = model.replace("XX", col);
              const note = `bank:${b.name || "Bank"}; pos:${idx + 1}; notes:${g.notes || ""}; color:${col}`;
              rows.push(row(1, model, loc, "Lutron", "Lighting", note)); logCounts.lighting++;
            })
          );
        } catch (e) { console.error("Export LIGHTING failed in", loc, e); }

        /* ===== CAMERAS ===== */
        try {
          (Array.isArray(r.cameras) ? r.cameras : []).forEach(c => {
            let model = "";
            const color = c.color || "W";
            switch (c.type) {
              case "Bullet": model = `LUM-820-IP-BMH${color}`; break;
              case "Turret": model = "LUM-820-IP-TMHC"; break; // fixed
              case "PTZ":    model = "LUM-420-IP-PTZ-4X"; break;
              default:       model = `LUM-820-IP-DF${color}`; // Dome
            }
            rows.push(row(1, model, loc, "Luma", "Surveillance",
              `name:${c.name || ""}; notes:${c.notes || ""}; color:${color}`));
            logCounts.cameras++;
          });
        } catch (e) { console.error("Export CAMERAS failed in", loc, e); }

        /* ===== SECURITY ===== */
        try {
          const sec = r.security || {};
          (Array.isArray(sec.zones) ? sec.zones : []).forEach(z => {
            const qty = Number(z.qty || 1);
            if (state.securityBrand === "ADC") {
              const map = { "D/W":"Qolsys-DW-Mini", "Motion":"IQ-Motion-S", "Glass":"IQ-Glass-S", "Carbon":"IQ-Carbon", "Smoke":"DSC-PG9936" };
              const mf  = (z.type === "Smoke") ? "DSC" : "Qolsys";
              rows.push(row(qty, map[z.type] || z.type, loc, mf, "Security Systems", "")); logCounts.security++;
            } else {
              const map = { "D/W":"QC-PROSIXMINI", "Motion":"QC-PROSIXPIRV", "Glass":"QC-PROSIXGB", "Carbon":"QC-PROSIXCOV", "Smoke":"QC-PROSIXCMBOV" };
              rows.push(row(qty, map[z.type] || z.type, loc, "Resideo", "Security Systems", "")); logCounts.security++;
            }
          });
          if (sec.panel && sec.panel.present) {
            if (state.securityBrand === "ADC") {
              const mdl = (sec.panel.type === "primary") ? "IQ4-MAIN" : "IQ4-REMOTE";
              rows.push(row(1, mdl, loc, "Qolsys", "Security Systems", `panel:${sec.panel.type}`)); logCounts.security++;
            } else {
              rows.push(row(1, "QC-PROWLTOUCHC", loc, "Resideo", "Security Systems", `panel:${sec.panel.type || "primary"}`)); logCounts.security++;
            }
          }
        } catch (e) { console.error("Export SECURITY failed in", loc, e); }

        /* ===== STRUCTURED WIRING ===== */
        try {
          const net = r.networking || {};
          (Array.isArray(net.banks) ? net.banks : []).forEach(b => {
            const j = Number(b.jacks || 0);
            rows.push(row(1, "Cat6-150", loc, "Generic", "Networking",
              `bank:${b.name || "Bank"}; jacks:${j}; color:${b.colorCode || "n/a"}`));
            logCounts.wiring++;
          });
        } catch (e) { console.error("Export WIRING failed in", loc, e); }

      }));
    } catch (e) {
      console.error("Export per-room loop failed:", e);
    }

    /* ===== EQUIPMENT ROOM (aggregates) ===== */
    try {
      const equip = state.floors.flatMap(f => (f.rooms || []).map(r => ({ f, r })))
                    .find(x => x.r && x.r.isEquipmentRoom) ||
                    (state.floors[0] ? { f: state.floors[0], r: state.floors[0].rooms[0] } : null);
      if (equip && equip.r) {
        const loc = `${equip.f.name}: ${equip.r.name}`;

        // NVRs
        nvrPlan().forEach(n => {
          rows.push(row(1, n.model, loc, "Luma", "Surveillance", `${n.channels} channels`));
          logCounts.equip++;
        });

        // Switches: multiple models/quantities
        const portsNeeded = computePortsNeeded();
        if (portsNeeded > 0) {
          const swPlan = planSwitches(portsNeeded);
          const grouped = swPlan.reduce((m, s) => { m[s.model] = (m[s.model] || 0) + 1; return m; }, {});
          Object.entries(grouped).forEach(([model, qty]) => {
            rows.push(row(qty, model, loc, "Araknis", "Networking",
              `${portsNeeded} ports incl ${state.settings.sparePercent}% spares`));
            logCounts.equip++;
          });
        }

        // Racks (auto) + per-rack patch panels + WattBox
        const racks = computeRacks();
        racks.forEach((rk, i) => {
          rows.push(row(
            1,
            rk.model,
            loc,
            "Strong",
            "Networking",
            `Rack ${i+1}: ${rk.ru} RU used; contents:${rk.items.map(it=>it.model).join(" | ")}`
          ));
          logCounts.equip++;

          const panelQty = rk.items.filter(it => it.model === "WP-CAT6-HDPP-24").length;
          if (panelQty > 0) {
            rows.push(row(
              panelQty,
              "WP-CAT6-HDPP-24",
              loc,
              "Wirepath",
              "Networking",
              `Rack ${i+1}: Patch panels (${panelQty}×24 ports)`
            ));
            logCounts.equip++;
          }

          rows.push(row(
            1,
            "WB-700CH",
            loc,
            "WattBox",
            "Networking",
            `Rack ${i+1}: Power conditioner (2RU)`
          ));
          logCounts.equip++;
        });
      }
    } catch (e) { console.error("Export EQUIPMENT failed:", e); }

    // Build & download CSV
    const out = [CSV_HEADERS];
    rows.forEach(it => out.push(CSV_HEADERS.map(h => csvCell(it[h]))));
    const csv = out.map(r => r.join(",")).join("\n");
    downloadFile(csv, exportFilename(), "text/csv");

    console.log("Export summary:", logCounts);
    alert("CSV generated.");
  };
})();
