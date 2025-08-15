/* state.js — app labels and global state */

(function(){
  // CSV columns & system tabs
  window.CSV_HEADERS = ["Quantity","Model","Location","Manufacturer","System","Custom Field 12"];
  window.SYSTEM_TABS = ["Control4","Lighting","Cameras","Security","Structured Wiring"];
  window.SYSTEM_TO_EXPORT = {
    Control4: "Control Systems",
    Lighting: "Lighting",
    Cameras: "Surveillance",
    Security: "Security Systems",
    "Structured Wiring": "Networking"
  };

  // App state
  window.state = {
    client: { name: "", phone: "", email: "", address: "" },
    projectName: "",
    floors: [],
    selectedFloorId: null,
    selectedRoomId: null,
    selectedTab: "Control4",
    settings: { cameraBitrateMbps: 4, sparePercent: 20, motionDuty: 0.05 },
    racks: [],
    securityBrand: "ADC" // "ADC" or "Resideo"
  };

  // NVR capacity (TB) per unit
  window.NVR_TB_PER_UNIT = 2;
})();
