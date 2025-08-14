/* core.js — shared state, utils, nav/summary/export */

window.CSV_HEADERS=["Quantity","Model","Location","Manufacturer","System","Custom Field 12"];
window.SYSTEM_TABS=["Control4","Lighting","Cameras","Security","Structured Wiring"];
window.SYSTEM_TO_EXPORT={Control4:"Control Systems",Lighting:"Lighting",Cameras:"Surveillance",Security:"Security Systems","Structured Wiring":"Networking"};

window.state={
  client:{name:"",phone:"",email:"",address:""},
  projectName:"",
  floors:[],
  selectedFloorId:null, selectedRoomId:null,
  selectedTab:"Control4",
  settings:{cameraBitrateMbps:4,sparePercent:20,motionDuty:0.05},
  racks:[],
  securityBrand:"ADC"
};

window.NVR_TB_PER_UNIT=2;

window.uid=()=>Math.random().toString(36).slice(2,9);
window.el=s=>document.querySelector(s);
window.escapeHTML = v => v == null ? "" : String(v).replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
window.csvCell=v=>{if(v==null)return"";const s=String(v).replace(/"/g,'""');return /[",\n]/.test(s)?`"${s}"`:s};
window.downloadFile=(content,filename,mime)=>{const b=new Blob([content],{type:mime});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(u);};

/* Swatches (globals so tabs can use) */
window.SWATCH_C4_KEYPAD=[{name:"Snow White",code:"SW",cls:"sw-c4-sw"},{name:"White",code:"WH",cls:"sw-c4-wh"},{name:"Light Almond",code:"LA",cls:"sw-c4-la"},{name:"Biscuit",code:"BI",cls:"sw-c4-bi"},{name:"Light Gray",code:"LG",cls:"sw-c4-lg"},{name:"Taupe",code:"TP",cls:"sw-c4-tp"},{name:"Stone Gray",code:"SG",cls:"sw-c4-sg"},{name:"Aluminum",code:"AU",cls:"sw-c4-au"},{name:"Coffee",code:"CF",cls:"sw-c4-cf"},{name:"Black",code:"BL",cls:"sw-c4-bl"},{name:"Midnight Black",code:"MB",cls:"sw-c4-mb"}];
window.SWATCH_C4_TOUCH=[{name:"White",code:"WH",cls:"sw-c4t-wh"},{name:"Black",code:"BL",cls:"sw-c4t-bl"}];
window.SWATCH_LUTRON=[{name:"White",code:"WH",cls:"sw-lut-wh"},{name:"Snow",code:"SW",cls:"sw-lut-sw"},{name:"Mist",code:"MI",cls:"sw-lut-mi"},{name:"Biscuit",code:"BI",cls:"sw-lut-bi"},{name:"Light Almond",code:"LA",cls:"sw-lut-la"},{name:"Ivory",code:"IV",cls:"sw-lut-iv"},{name:"Black",code:"BL",cls:"sw-lut-bl"},{name:"Midnight",code:"MN",cls:"sw-lut-mn"}];
window.SWATCH_NETWORK=[{name:"White",code:"WH",cls:"sw-net-wh"},{name:"Blue",code:"BU",cls:"sw-net-bu"},{name:"Green",code:"GN",cls:"sw-net-gn"},{name:"Red",code:"RD",cls:"sw-net-rd"},{name:"Black",code:"BL",cls:"sw-net-bl"}];
window.CAMERA_COLOR=[{name:"White",code:"W",cls:"sw-cam-w"},{name:"Black",code:"B",cls:"sw-cam-b"}];

window.buildSwatchRow=(list,current,onPick)=>{
  const wrap=document.createElement("div"); wrap.className="swatchRow";
  list.forEach(it=>{
    const b=document.createElement("button");
    b.className=`swatch ${it.cls}`+(current===it.code?" is-selected":"");
    b.title=it.name;
    b.onclick=(e)=>{e.preventDefault(); wrap.querySelectorAll(".swatch").forEach(x=>x.classList.remove("is-selected")); b.classList.add("is-selected"); onPick(it); codeEl.textContent=it.code; };
    wrap.appendChild(b);
  });
  const codeEl=document.createElement("div"); codeEl.className="swatchCode"; codeEl.textContent=current||"";
  const container=document.createElement("div"); container.appendChild(wrap); container.appendChild(codeEl);
  return container;
};

/* Floors/Rooms (unchanged logic) */
const floorsList=el("#floorsList");
window.addFloor=function(name){const fid=uid();const f={id:fid,name:name||`Floor ${state.floors.length+1}`,rooms:[]};state.floors.push(f);addRoom(fid,"Room 1");selectRoom(fid,f.rooms[0].id);renderLeft();renderTabs();renderMain();renderSummary();};
window.addRoom=function(fid,name){const f=state.floors.find(x=>x.id===fid);if(!f)return;const rid=uid();const room={id:rid,name:name||"New Room",notes:"",photos:[],isEquipmentRoom:false,control4:{videoStreams:0,videoNotes:"",audio:{enabled:false,wired:false,speakers:0,distribution:"Stereo",notes:""},keypads:[],touchscreens:[],remotes:[]},lighting:{banks:[]},cameras:[],security:{zones:[],panel:{present:false,type:"primary"}},networking:{banks:[]}};f.rooms.push(room);};
window.copyFloor=function(fid){if(!confirm("Copy floor and its rooms?"))return;const f=state.floors.find(x=>x.id===fid);const nf=JSON.parse(JSON.stringify(f));nf.id=uid();nf.name=f.name+" (copy)";nf.rooms.forEach(r=>r.id=uid());state.floors.push(nf);renderLeft();};
window.deleteFloor=function(fid){if(!confirm("Delete floor?"))return;state.floors=state.floors.filter(f=>f.id!==fid);const first=state.floors[0];state.selectedFloorId=first?first.id:null;state.selectedRoomId=first&&first.rooms[0]?first.rooms[0].id:null;renderLeft();renderMain();renderSummary();};
window.copyRoom=function(fid,rid){if(!confirm("Copy room?"))return;const f=state.floors.find(x=>x.id===fid);const r=f.rooms.find(x=>x.id===rid);const nr=JSON.parse(JSON.stringify(r));nr.id=uid();nr.name=r.name+" (copy)";f.rooms.push(nr);renderLeft();};
window.deleteRoom=function(fid,rid){if(!confirm("Delete room?"))return;const f=state.floors.find(x=>x.id===fid);f.rooms=f.rooms.filter(r=>r.id!==rid);if(state.selectedRoomId===rid){state.selectedRoomId=f.rooms[0]?f.rooms[0].id:null;}renderLeft();renderMain();renderSummary();};
window.selectRoom=function(fid,rid){state.selectedFloorId=fid;state.selectedRoomId=rid;renderLeft();renderMain();};

window.renderLeft=function(){
  floorsList.innerHTML="";
  state.floors.forEach(f=>{
    const card=document.createElement("div"); card.className="floorCard";
    const header=document.createElement("div"); header.className="floorHeader";
    const name=document.createElement("input"); name.value=f.name; name.oninput=(e)=>{f.name=e.target.value; renderSummary();};
    const btns=document.createElement("div"); btns.className="inline";
    const copy=document.createElement("button"); copy.className="btn-sm"; copy.textContent="Copy"; copy.onclick=()=>copyFloor(f.id);
    const del=document.createElement("button"); del.className="btn-sm"; del.textContent="Del"; del.onclick=()=>deleteFloor(f.id);
    header.appendChild(name); btns.appendChild(copy); btns.appendChild(del); header.appendChild(btns); card.appendChild(header);

    const rooms=document.createElement("div"); rooms.className="rooms";
    f.rooms.forEach(r=>{
      const row=document.createElement("div"); row.className="roomBtn"+(state.selectedRoomId===r.id?" active":"");
      const left=document.createElement("div"); left.className="inline";
      const rn=document.createElement("input"); rn.value=r.name; rn.oninput=(e)=>{r.name=e.target.value; renderSummary();};
      left.appendChild(rn);
      const tools=document.createElement("div"); tools.className="inline";
      const c=document.createElement("button"); c.className="btn-sm"; c.textContent="Copy"; c.onclick=(ev)=>{ev.stopPropagation(); copyRoom(f.id,r.id);};
      const d=document.createElement("button"); d.className="btn-sm"; d.textContent="Del"; d.onclick=(ev)=>{ev.stopPropagation(); deleteRoom(f.id,r.id);};
      tools.appendChild(c); tools.appendChild(d);
      row.onclick=()=>selectRoom(f.id,r.id);
      row.appendChild(left); row.appendChild(tools);
      rooms.appendChild(row);
    });
    const add=document.createElement("button"); add.className="btn-sm btn-wide"; add.textContent="+ Add Room"; add.onclick=()=>{addRoom(f.id); renderLeft();};
    card.appendChild(rooms); card.appendChild(add);
    floorsList.appendChild(card);
  });
};

/* Tabs shell (renderTabs + dispatch) */
const systemTabs=el("#systemTabs"), mainContent=el("#mainContent");
window.renderTabs=function(){ systemTabs.innerHTML=""; SYSTEM_TABS.forEach(t=>{const e=document.createElement("div"); e.className="tab"+(state.selectedTab===t?" active":""); e.textContent=t; e.onclick=()=>{state.selectedTab=t; renderTabs(); renderMain();}; systemTabs.appendChild(e);});};
window.getSelected=function(){const f=state.floors.find(x=>x.id===state.selectedFloorId); if(!f) return {}; const r=f.rooms.find(x=>x.id===state.selectedRoomId); return {f,r};};
window.markEquipmentRoom=function(room){state.floors.forEach(ff=>ff.rooms.forEach(rr=>rr.isEquipmentRoom=false)); room.isEquipmentRoom=true;};
window.renderMain=function(){
  const {f,r}=getSelected(); mainContent.innerHTML="";
  if(!r){ mainContent.innerHTML='<div class="muted">Select a floor & room.</div>'; return; }
  const header=document.createElement("div"); header.className="systemSummary"; header.innerHTML=`<strong>${escapeHTML(f.name)} — ${escapeHTML(r.name)}</strong>`; mainContent.appendChild(header);
  const tab=state.selectedTab;
  if(tab==="Control4") window.renderControl4(r);
  else if(tab==="Lighting") window.renderLighting(r);
  else if(tab==="Cameras") window.renderCameras(r);
  else if(tab==="Security") window.renderSecurity(r);
  else if(tab==="Structured Wiring") window.renderStructured(r);
};

/* Calculations shared */
window.autoPoECount=function(){ let c=0; state.floors.forEach(f=>f.rooms.forEach(r=>{ c+=(r.cameras||[]).length; c+=(r.control4.touchscreens||[]).length; })); return c; };
window.totalCameras=function(){ return state.floors.reduce((a,f)=>a+f.rooms.reduce((aa,r)=>aa+(r.cameras||[]).length,0),0); };
window.countLutronDevices=function(){ let devices=0; state.floors.forEach(f=>f.rooms.forEach(r=> (r.lighting.banks||[]).forEach(b=> (b.gangs||[]).forEach(()=> devices+=1 )))); const controllers=Math.min(2,Math.max(1,Math.ceil(devices/100)||0)); return {devices,controllers}; };
window.nvrPlan=function(){
  const n=totalCameras(); const plan=[]; if(n<=0) return plan; let remaining=n;
  if(remaining>=32){ plan.push({channels:32,model:"LUMA-NVR-32"}); remaining-=32; }
  if(remaining>0 && remaining<=8){ plan.push({channels:8,model:"LUMA-NVR-8"}); remaining-=8; }
  else if(remaining>0 && remaining<=16){ plan.push({channels:16,model:"LUMA-NVR-16"}); remaining-=16; }
  else if(remaining>16 && remaining<=24){ plan.push({channels:16,model:"LUMA-NVR-16"}); remaining-=16; plan.push({channels:8,model:"LUMA-NVR-8"}); remaining-=8; }
  else if(remaining>24 && remaining<=32){ plan.push({channels:32,model:"LUMA-NVR-32"}); remaining-=32; }
  if(n>32 && n<=40){ const i=plan.findIndex(p=>p.channels===8); if(i>=0) plan.splice(i,1,{channels:16,model:"LUMA-NVR-16"}); }
  return plan;
};

/* Summary */
const summaryArea=el("#summaryArea");
window.renderSummary=function(){
  const totals={cams:0,keypads:0,touch:0,jacks:0,loads:0,poe:0};
  state.floors.forEach(f=>f.rooms.forEach(r=>{
    totals.cams+=(r.cameras||[]).length;
    totals.keypads+=(r.control4.keypads||[]).length;
    totals.touch+=(r.control4.touchscreens||[]).length;
    (r.lighting.banks||[]).forEach(b=> (b.gangs||[]).forEach(()=> totals.loads+=1 ));
    (r.networking.banks||[]).forEach(b=> totals.jacks+=Number(b.jacks||0));
  }));
  totals.poe = autoPoECount();

  const camsTotal=totalCameras();
  const plan=nvrPlan();
  const totalTB=plan.length*NVR_TB_PER_UNIT;
  const perCamMbps=state.settings.cameraBitrateMbps*(state.settings.motionDuty||0.05);
  const days = camsTotal>0 ? ((totalTB*1e12*8)/(camsTotal*perCamMbps*1e6*24*3600)) : 0;

  summaryArea.innerHTML =
   `<div class='chip'>Cameras: ${totals.cams}</div>`
  +`<div class='chip'>Touchscreens: ${totals.touch}</div>`
  +`<div class='chip'>Keypads: ${totals.keypads}</div>`
  +`<div class='chip'>Jacks: ${totals.jacks}</div>`
  +`<div class='chip'>Lighting Loads: ${totals.loads}</div>`
  +`<div class='chip'>PoE: ${totals.poe}</div>`
  +`<div class='chip'>Cap: ${totalTB} TB; Retention≈ ${days.toFixed(1)}d</div>`;
};

/* Export helpers */
window.row=(q,model,location,manufacturer,system,cf12)=>({"Quantity":q,"Model":model,"Location":location,"Manufacturer":manufacturer,"System":system,"Custom Field 12":cf12||""});
window.exportFilename=function(){
  const dt=new Date(),y=dt.getFullYear(),m=String(dt.getMonth()+1).padStart(2,"0"),d=String(dt.getDate()).padStart(2,"0");
  const cn=(state.client.name||"Client").trim(); let pn=(state.projectName||"").trim(); if(!pn) pn=cn+" Project";
  return `${cn} - ${pn} - ${y}-${m}-${d}.csv`.replace(/\s+/g," ");
};

/* Racks (unchanged from your latest) */
window.computeRacks=function(){
  const plan=[];
  const equip = state.floors.flatMap(f=>f.rooms.map(r=>({f,r}))).find(x=>x.r.isEquipmentRoom) ||
                (state.floors[0]?{f:state.floors[0],r:state.floors[0].rooms[0]}:null);
  if(!equip||!equip.r) return [];

  const jacks=state.floors.reduce((a,f)=>a+f.rooms.reduce((aa,r)=>aa+(r.networking.banks||[]).reduce((s,b)=>s+Number(b.jacks||0),0),0),0);
  const portsNeeded=Math.ceil(jacks*(1+state.settings.sparePercent/100));
  const switches=portsNeeded>24?[{model:"ARAKNIS-420-48P",ru:1}]:portsNeeded>8?[{model:"ARAKNIS-420-24P",ru:1}]:portsNeeded>0?[{model:"ARAKNIS-420-8P",ru:1}]:[];

  let smalls=0; state.floors.forEach(f=>f.rooms.forEach(r=>{ if(r.control4 && (r.control4.videoStreams>0 || (r.control4.audio&&r.control4.audio.enabled))) smalls++; }));
  const shelves=smalls>0?[{model:"STRONG-1U-SHELF",ru:1}]:[];

  const fixed=[{model:"WattBox WB-700CH",ru:2}];
  const vents=[{model:"VENT-1U",ru:1},{model:"VENT-1U",ru:1}];
  const reserve=[{model:"UPS-RESERVED",ru:2}];

  const parts=[...fixed,...switches,...nvrPlan().map(n=>({model:n.model,ru:2})),...shelves,...vents,...reserve];

  let current={ru:0,items:[]};
  function finalize(){ if(current.items.length) plan.push(current); current={ru:0,items:[]}; }
  function add(it){ if(current.ru+it.ru>24) finalize(); current.items.push(it); current.ru+=it.ru; }
  parts.forEach(add); finalize();

  plan.forEach(rk=>{ const need=rk.ru; rk.size=need<=6?6:need<=12?12:need<=18?18:24; rk.model=`SR-WMS-${rk.size}U`; });
  return plan;
};

/* Export CSV (calls render functions' data via state) */
window.exportCSV=function(){
  const rows=[];
  state.floors.forEach(f=>f.rooms.forEach(r=>{
    const loc=`${f.name}: ${r.name}`;
    // CONTROL4 export (same as your latest)
    if(r.control4.videoStreams>0){
      const f12 = `streams:${r.control4.videoStreams}; notes:${r.control4.videoNotes||""}`;
      rows.push(row(1,"C4-CORE1",loc,"Control4",SYSTEM_TO_EXPORT.Control4,f12));
    }
    if(r.control4.audio.enabled && r.control4.audio.wired && r.control4.audio.speakers>0){
      const f12 = `spk:${r.control4.audio.speakers}; dist:${r.control4.audio.distribution}; notes:${r.control4.audio.notes||""}`;
      rows.push(row(1,"TRIAD-AMP-1U",loc,"TRIAD","Control Systems",f12));
    }
    (r.control4.keypads||[]).forEach(k=>{
      const base=(k.type==="Dimmer")?"C4-L-KDS":"C4-L-KC", col=k.colorCode||"WH";
      const f12=`name:${k.name||""}; notes:${k.notes||""}; color:${col}`;
      rows.push(row(1,base,loc,"Control4","Control Systems",f12));
      rows.push(row(1,`C4-L-CKKC-${col}`,loc,"Control4","Control Systems",f12));
      rows.push(row(1,`C4-L-FP1-${col}`,loc,"Control4","Control Systems",f12));
    });
    (r.control4.touchscreens||[]).forEach(ts=>{
      const col=ts.colorCode||"WH";
      const sku=(ts.size==='8"')?`C4-T4IW8-${col}`:`C4-T4IW10-${col}`;
      rows.push(row(1,sku,loc,"Control4","Control Systems",`size:${ts.size}; color:${col}`));
    });
    (r.control4.remotes||[]).forEach(rm=>{
      const model=(rm.color==="AS")?"C4-HALO-TS-AS":"C4-HALO-TS-BL";
      rows.push(row(1,model,loc,"Control4","Control Systems",`color:${rm.color}`));
    });

    // Lighting
    (r.lighting.banks||[]).forEach(b=>(b.gangs||[]).forEach((g,idx)=>{
      let model=(g.type==="Dimmer")?"RRST-PRO-N-XX":(g.type==="Switch"?"RRST-8ANS-XX":"RRST-W4B-XX");
      const col=g.colorCode||"WH"; model=model.replace("XX",col);
      rows.push(row(1,model,loc,"Lutron","Lighting",`bank:${b.name||"Bank"}; pos:${idx+1}; notes:${g.notes||""}; color:${col}`));
    }));

    // Cameras
    (r.cameras||[]).forEach(c=>{
      let model=""; if(c.type==="Bullet") model=`LUM-820-IP-BMH${c.color||"W"}`; else if(c.type==="Turret") model="LUM-820-IP-TMHC"; else if(c.type==="PTZ") model="LUM-420-IP-PTZ-4X"; else model=`LUM-820-IP-DF${c.color||"W"}`;
      rows.push(row(1,model,loc,"Luma","Surveillance",`name:${c.name||""}; notes:${c.notes||""}; color:${c.color||"W"}`));
    });

    // Security sensors + brand
    (r.security.zones||[]).forEach(z=>{
      const brand=state.securityBrand;
      if(brand==="ADC"){
        const map={ "D/W":"Qolsys-DW-Mini", "Motion":"IQ-Motion-S", "Glass":"IQ-Glass-S", "Carbon":"IQ-Carbon", "Smoke":"DSC-PG9936" };
        const mf= z.type==="Smoke" ? "DSC" : "Qolsys";
        rows.push(row(z.qty||1, map[z.type]||z.type, loc, mf, "Security Systems",""));
      } else {
        const map={ "D/W":"QC-PROSIXMINI", "Motion":"QC-PROSIXPIRV", "Glass":"QC-PROSIXGB", "Carbon":"QC-PROSIXCOV", "Smoke":"QC-PROSIXCMBOV" };
        rows.push(row(z.qty||1, map[z.type]||z.type, loc, "Resideo", "Security Systems",""));
      }
    });
    if(r.security.panel && r.security.panel.present){
      if(state.securityBrand==="ADC"){
        const mdl=(r.security.panel.type==="primary")?"IQ4-MAIN":"IQ4-REMOTE";
        rows.push(row(1,mdl,loc,"Qolsys","Security Systems",`panel:${r.security.panel.type}`));
      } else {
        rows.push(row(1,"QC-PROWLTOUCHC",loc,"Resideo","Security Systems",`panel:${r.security.panel.type}`));
      }
    }

    // Structured wiring
    (r.networking.banks||[]).forEach(b=>{
      rows.push(row(1,"Cat6-150",loc,"Generic","Networking",`bank:${b.name}; jacks:${b.jacks}; color:${b.colorCode||"n/a"}`));
    });
  }));

  // Equipment room aggregates (same)
  const equip = state.floors.flatMap(f=>f.rooms.map(r=>({f,r}))).find(x=>x.r.isEquipmentRoom) ||
                (state.floors[0]?{f:state.floors[0],r:state.floors[0].rooms[0]}:null);
  if(equip){
    const loc=`${equip.f.name}: ${equip.r.name}`;
    nvrPlan().forEach(n=> rows.push(row(1,n.model,loc,"Luma","Surveillance",`${n.channels} channels`)));
    const jacksTotal=state.floors.reduce((a,f)=>a+f.rooms.reduce((aa,r)=>aa+(r.networking.banks||[]).reduce((s,b)=>s+Number(b.jacks||0),0),0),0);
    const portsNeeded=Math.ceil(jacksTotal*(1+state.settings.sparePercent/100));
    if(portsNeeded>0){ let sw="ARAKNIS-420-8P"; if(portsNeeded>24) sw="ARAKNIS-420-48P"; else if(portsNeeded>8) sw="ARAKNIS-420-24P"; rows.push(row(1,sw,loc,"Araknis","Networking",`${portsNeeded} ports incl ${state.settings.sparePercent}% spares`)); }
    rows.push(row(1,"WB-700CH",loc,"WattBox","Networking","Power conditioner (2RU)"));
    computeRacks().forEach((rk,i)=> rows.push(row(1,rk.model,loc,"Strong","Networking",`Rack ${i+1}: ${rk.ru} RU used; contents:${rk.items.map(it=>it.model).join(" | ")}`)));
  }

  const out=[CSV_HEADERS]; rows.forEach(it=> out.push(CSV_HEADERS.map(h=>csvCell(it[h]))));
  const csv=out.map(r=>r.join(",")).join("\n");
  const fname=exportFilename(); downloadFile(csv,fname,"text/csv"); alert("CSV generated: "+fname);
};

/* Header binds & init helpers */
el("#exportBtn").onclick=exportCSV;
el("#downloadJson").onclick=()=>{const out=JSON.stringify(state,null,2); downloadFile(out,exportFilename().replace(".csv",".json"),"application/json");};
el("#clearProject").onclick=()=>{if(confirm("Clear project?")){ state={client:{name:"",phone:"",email:"",address:""},projectName:"",floors:[],selectedFloorId:null,selectedRoomId:null,selectedTab:"Control4",settings:state.settings,racks:[],securityBrand:state.securityBrand}; renderLeft(); renderTabs(); renderMain(); renderSummary(); }};
el("#addFloorBtn").onclick=()=>addFloor();
el("#seedBtn").onclick=seedSample;

const cName=el("#clientName"), cPhone=el("#clientPhone"), cEmail=el("#clientEmail"), cAddr=el("#clientAddress"), pName=el("#projectName");
[cName,cPhone,cEmail,cAddr,pName].forEach(inp=> inp.addEventListener("input",()=>{ state.client.name=cName.value; state.client.phone=cPhone.value; state.client.email=cEmail.value; state.client.address=cAddr.value; state.projectName=pName.value; }));

/* Seed / Init */
window.seedSample=function(){
  state.floors=[]; addFloor("Main Floor");
  const f=state.floors[0];
  f.rooms[0].name="Living Room";
  f.rooms[0].control4.videoStreams=1; f.rooms[0].control4.videoNotes="Mount behind TV";
  f.rooms[0].control4.audio.enabled=true; f.rooms[0].control4.audio.wired=true; f.rooms[0].control4.audio.speakers=2; f.rooms[0].control4.audio.notes="2ch stereo zone";
  f.rooms[0].control4.keypads.push({type:"Configurable",name:"LR Scene",colorCode:"WH",notes:"3 scenes"});
  f.rooms[0].lighting.banks.push({id:uid(),name:"Bank 1",gangs:[{type:"Dimmer",notes:"",colorCode:"WH"},{type:"Switch",notes:"",colorCode:"WH"}]});
  f.rooms[0].networking.banks.push({id:uid(),name:"Bank 1",jacks:4,colorCode:"BL"});
  f.rooms[0].cameras.push({type:"Dome",color:"W",name:"Driveway",notes:"Face street"});
  addRoom(f.id,"Kitchen");
  const f2id=uid(); state.floors.push({id:f2id,name:"Upstairs",rooms:[]}); addRoom(f2id,"Bedroom");
  state.floors[0].rooms[0].isEquipmentRoom=true;
  renderLeft(); renderTabs(); renderMain(); renderSummary();
};

window.init=function(){ renderTabs(); if(state.floors.length===0) addFloor("Floor 1"); renderLeft(); renderMain(); renderSummary(); };
