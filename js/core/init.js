/* init.js — bootstrap & seeding */

(function(){
  // Seed sample data for quick testing
  window.seedSample = function(){
    state.floors = [];
    addFloor("Main Floor");
    const f = state.floors[0];

    f.rooms[0].name = "Living Room";
    f.rooms[0].control4.videoStreams = 1; f.rooms[0].control4.videoNotes = "Mount behind TV";
    f.rooms[0].control4.audio.enabled = true; f.rooms[0].control4.audio.wired = true;
    f.rooms[0].control4.audio.speakers = 2;  f.rooms[0].control4.audio.notes = "2ch stereo zone";
    f.rooms[0].control4.keypads.push({ type: "Configurable", name: "LR Scene", colorCode: "WH", notes: "3 scenes" });

    f.rooms[0].lighting.banks.push({
      id: uid(), name: "Bank 1",
      gangs: [{ type:"Dimmer", notes:"", colorCode:"WH" }, { type:"Switch", notes:"", colorCode:"WH" }]
    });

    f.rooms[0].networking.banks.push({ id: uid(), name: "Bank 1", jacks: 4, colorCode: "BL" });
    f.rooms[0].cameras.push({ type: "Dome", color: "W", name: "Driveway", notes: "Face street" });

    addRoom(f.id, "Kitchen");

    const f2id = uid();
    state.floors.push({ id: f2id, name: "Upstairs", rooms: [] });
    addRoom(f2id, "Bedroom");

    state.floors[0].rooms[0].isEquipmentRoom = true;

    renderLeft(); renderTabs(); renderMain(); renderSummary();
  };

  function bindDomRefs(){
    window.$floorsList  = document.querySelector('#floorsList');
    window.$systemTabs  = document.querySelector('#systemTabs');
    window.$mainContent = document.querySelector('#mainContent');
    window.$summaryArea = document.querySelector('#summaryArea');
  }

  window.init = function init(){
    bindDomRefs();

    // Seed a starting floor/room if empty
    if (state.floors.length === 0) {
      addFloor('Floor 1');
    }

    // Initial UI
    renderTabs();
    renderLeft();
    renderMain();
    renderSummary();

    // Header buttons
    const exportBtn   = document.getElementById('exportBtn');
    const dlJsonBtn   = document.getElementById('downloadJson');
    const clearBtn    = document.getElementById('clearProject');
    const addFloorBtn = document.getElementById('addFloorBtn');
    const seedBtn     = document.getElementById('seedBtn');

    if (exportBtn) exportBtn.onclick = exportCSV;
    if (dlJsonBtn) dlJsonBtn.onclick = () => {
      const out = JSON.stringify(state, null, 2);
      downloadFile(out, exportFilename().replace(".csv",".json"), "application/json");
    };
    if (clearBtn) clearBtn.onclick = () => {
      if (!confirm("Clear project?")) return;
      state = {
        client:{name:"",phone:"",email:"",address:""},
        projectName:"",
        floors:[],
        selectedFloorId:null, selectedRoomId:null,
        selectedTab:"Control4",
        settings: state.settings,
        racks:[],
        securityBrand: state.securityBrand
      };
      renderTabs(); renderLeft(); renderMain(); renderSummary();
    };
    if (addFloorBtn) addFloorBtn.onclick = () => addFloor();
    if (seedBtn)     seedBtn.onclick     = seedSample;

    // Client / project inputs
    const cName = document.getElementById('clientName');
    const cPhone= document.getElementById('clientPhone');
    const cEmail= document.getElementById('clientEmail');
    const cAddr = document.getElementById('clientAddress');
    const pName = document.getElementById('projectName');

    [cName,cPhone,cEmail,cAddr,pName].forEach(inp => {
      if (!inp) return;
      inp.addEventListener('input', () => {
        state.client.name    = cName.value;
        state.client.phone   = cPhone.value;
        state.client.email   = cEmail.value;
        state.client.address = cAddr.value;
        state.projectName    = pName.value;
      });
    });
  };
})();
