/* utils.js — small helpers shared everywhere */

(function(){
  // CSV header & tab labels are defined in state.js
  // Utilities kept minimal and framework-agnostic

  window.uid = () => Math.random().toString(36).slice(2, 9);

  window.el  = (s) => document.querySelector(s);

  window.escapeHTML = (v) => v == null ? "" :
    String(v).replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));

  window.csvCell = (v) => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };

  window.downloadFile = (content, filename, mime) => {
    const b = new Blob([content], { type: mime });
    const u = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = u; a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(u);
  };

  /* Shared swatch palettes (order: light → dark) */
  window.SWATCH_C4_KEYPAD = [
    {name:"Snow White", code:"SW", cls:"sw-c4-sw"},
    {name:"White",      code:"WH", cls:"sw-c4-wh"},
    {name:"Light Almond",code:"LA",cls:"sw-c4-la"},
    {name:"Biscuit",    code:"BI", cls:"sw-c4-bi"},
    {name:"Light Gray", code:"LG", cls:"sw-c4-lg"},
    {name:"Taupe",      code:"TP", cls:"sw-c4-tp"},
    {name:"Stone Gray", code:"SG", cls:"sw-c4-sg"},
    {name:"Aluminum",   code:"AU", cls:"sw-c4-au"},
    {name:"Coffee",     code:"CF", cls:"sw-c4-cf"},
    {name:"Black",      code:"BL", cls:"sw-c4-bl"},
    {name:"Midnight Black", code:"MB", cls:"sw-c4-mb"}
  ];
  window.SWATCH_C4_TOUCH = [
    {name:"White", code:"WH", cls:"sw-c4t-wh"},
    {name:"Black", code:"BL", cls:"sw-c4t-bl"}
  ];
  window.SWATCH_LUTRON = [
    {name:"White", code:"WH", cls:"sw-lut-wh"},
    {name:"Snow",  code:"SW", cls:"sw-lut-sw"},
    {name:"Mist",  code:"MI", cls:"sw-lut-mi"},
    {name:"Biscuit", code:"BI", cls:"sw-lut-bi"},
    {name:"Light Almond", code:"LA", cls:"sw-lut-la"},
    {name:"Ivory", code:"IV", cls:"sw-lut-iv"},
    {name:"Black", code:"BL", cls:"sw-lut-bl"},
    {name:"Midnight", code:"MN", cls:"sw-lut-mn"}
  ];
  window.SWATCH_NETWORK = [
    {name:"White", code:"WH", cls:"sw-net-wh"},
    {name:"Blue",  code:"BU", cls:"sw-net-bu"},
    {name:"Green", code:"GN", cls:"sw-net-gn"},
    {name:"Red",   code:"RD", cls:"sw-net-rd"},
    {name:"Black", code:"BL", cls:"sw-net-bl"}
  ];
  window.CAMERA_COLOR = [
    {name:"White", code:"W", cls:"sw-cam-w"},
    {name:"Black", code:"B", cls:"sw-cam-b"}
  ];

  // Swatch row helper: shows chips + code under, updates live
  window.buildSwatchRow = (list, current, onPick) => {
    const wrap = document.createElement("div");
    wrap.className = "swatchRow";
    list.forEach(it => {
      const b = document.createElement("button");
      b.className = `swatch ${it.cls}` + (current === it.code ? " is-selected" : "");
      b.title = it.name;
      b.onclick = (e) => {
        e.preventDefault();
        wrap.querySelectorAll(".swatch").forEach(x => x.classList.remove("is-selected"));
        b.classList.add("is-selected");
        onPick(it);
        codeEl.textContent = it.code; // live update code under picker
      };
      wrap.appendChild(b);
    });
    const codeEl = document.createElement("div");
    codeEl.className = "swatchCode";
    codeEl.textContent = current || "";
    const container = document.createElement("div");
    container.appendChild(wrap);
    container.appendChild(codeEl);
    return container;
  };
})();
