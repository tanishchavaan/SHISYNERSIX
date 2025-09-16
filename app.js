// app.js — Demo front-end logic (no backend)
document.addEventListener('DOMContentLoaded'), () => {

  // --- Mock initial data ---
  let reports = [
    {id:1, lat:17.6868, lon:83.2185, type:'High Waves', text:'Large waves at the breakwater', severity:3, time: Date.now()-3600000},
    {id:2, lat:16.4559, lon:80.9462, type:'Flooding', text:'Water entering low-lying street', severity:4, time: Date.now()-1800000},
    {id:3, lat:11.0168, lon:76.9558, type:'Erosion', text:'Beach line receding', severity:2, time: Date.now()-800000}
  ];

  // --- Initialize map (Leaflet) ---
  const map = L.map('map').setView([16.5,80.2],6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19, attribution:'© OSM'}).addTo(map);

  const reportLayer = L.layerGroup().addTo(map);
  const hotspotLayer = L.layerGroup().addTo(map);
  const safeZoneLayer = L.layerGroup().addTo(map);

  // draw sample safe zone
  const safeCircle = L.circle([15.5,80.5], {radius:40000, color:'#2dd4bf', fillColor:'#bbf7d0', opacity:0.6}).addTo(safeZoneLayer);

  // helper to create markers
  function renderReports(){
    reportLayer.clearLayers();
    reports.forEach(r=>{
      const m = L.marker([r.lat, r.lon]).bindPopup(
        `<b>${r.type}</b><br>${r.text}<br><small>${new Date(r.time).toLocaleString()}</small>`
      );
      reportLayer.addLayer(m);
    });
    generateHotspots();
  }

  // simple hotspot generation: cluster count nearest
  function generateHotspots(){
    hotspotLayer.clearLayers();
    const grid = {}; // simple bucketing by rounded coords
    reports.forEach(r=>{
      const gx = Math.round(r.lat*4)/4, gy=Math.round(r.lon*4)/4;
      const k = `${gx}_${gy}`;
      grid[k] = (grid[k]||0) + 1;
    });
    Object.keys(grid).forEach(k=>{
      const [gx,gy] = k.split('_').map(parseFloat);
      const count = grid[k];
      if(count >= 2){
        const size = 12 + (count*6);
        const circle = L.circle([gx,gy], {
          radius: 25000,
          color:'rgba(255,80,60,0.25)',
          fillColor:'rgba(255,80,60,0.18)'
        }).bindPopup(`Hotspot: ${count} reports`);
        hotspotLayer.addLayer(circle);
      }
    });
  }

  renderReports();

  // --- Chart (trend of reports by type) ---
  const ctx = document.getElementById('trendChart').getContext('2d');
  const typeCounts = countByType(reports);
  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(typeCounts),
      datasets: [{data: Object.values(typeCounts), backgroundColor:['#2563eb','#fb923c','#ef4444','#a78bfa','#10b981']}]
    },
    options: {plugins:{legend:{position:'bottom'}}}
  });

  function countByType(list){
    const obj={};
    list.forEach(r=>obj[r.type] = (obj[r.type]||0)+1);
    return obj;
  }

  // --- Social feed (simulated) ---
  const socialFeed = document.getElementById('socialFeed');
  const sampleSocial = [
    {t:'@fisher_john: Huge swells near the pier — be careful', time:'5m'},
    {t:'@local_news: Flooding reported on coastal road', time:'12m'},
    {t:'@tourist_: Beach erosion visible after storm', time:'1h'}
  ];
  sampleSocial.forEach(p => {
    const el = document.createElement('div');
    el.className='feed-item';
    el.innerHTML = `<b>${p.t}</b><div style="font-size:12px;color:#555">${p.time}</div>`;
    socialFeed.appendChild(el);
  });

  // --- Crisis room chat l
