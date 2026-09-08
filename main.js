/* SOUTH PARK: THE CHEESY POOF CAPER - unofficial fan game.
   All geometry/art/audio generated procedurally in code. No external assets. */
(function(){
'use strict';
if (typeof THREE === 'undefined') {
  document.getElementById('hint').textContent = 'Could not load the 3D engine (CDN blocked). Try a refresh.';
  return;
}

// ---------- renderer / scene ----------
var app = document.getElementById('app');
var renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true });
} catch (e) {
  document.getElementById('hint').textContent = 'WebGL is not available in this browser.';
  return;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fb6cf);
scene.fog = new THREE.Fog(0x9fb6cf, 28, 85);

var camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 300);

var hemi = new THREE.HemisphereLight(0xdfeaff, 0x6b6f80, 1.05);
scene.add(hemi);
var sun = new THREE.DirectionalLight(0xfff2d8, 1.15);
sun.position.set(18, 30, 12);
scene.add(sun);

function lam(color) { return new THREE.MeshLambertMaterial({ color: color }); }

// ---------- ground / road / pond ----------
var ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), lam(0xf4f7fb));
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

var road = new THREE.Mesh(new THREE.PlaneGeometry(7, 70), lam(0x3c414b));
road.rotation.x = -Math.PI / 2; road.position.y = 0.02;
scene.add(road);
for (var dash = -32; dash <= 32; dash += 4) {
  var d = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 1.6), lam(0xd8c94a));
  d.rotation.x = -Math.PI / 2; d.position.set(0, 0.03, dash);
  scene.add(d);
}
var pond = new THREE.Mesh(new THREE.CircleGeometry(6, 28), lam(0x3f7fbf));
pond.rotation.x = -Math.PI / 2; pond.position.set(17, 0.03, 13);
scene.add(pond);
var pondRim = new THREE.Mesh(new THREE.TorusGeometry(6.1, 0.25, 8, 28), lam(0xe8edf4));
pondRim.rotation.x = -Math.PI / 2; pondRim.position.set(17, 0.06, 13);
scene.add(pondRim);

// ---------- obstacles ----------
var boxes = [];   // {x,z,hx,hz} AABBs
var circles = [{ x: 17, z: 13, r: 6.6 }]; // pond

function addBox(x, z, hx, hz) { boxes.push({ x: x, z: z, hx: hx, hz: hz }); }

// ---------- text signs via canvas ----------
function textPlane(text, w, h, bg, fg, fontPx) {
  var c = document.createElement('canvas'); c.width = 512; c.height = Math.round(512 * h / w);
  var g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = fg; g.lineWidth = 10; g.strokeRect(5, 5, c.width - 10, c.height - 10);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold ' + (fontPx || 64) + 'px Trebuchet MS, sans-serif';
  g.fillText(text, c.width / 2, c.height / 2);
  var tex = new THREE.CanvasTexture(c);
  var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
  return m;
}

// ---------- houses ----------
var houseColors = [0x8a5a33, 0x4a7a4f, 0x5a6ea8, 0xa8576b, 0x7a5a9a, 0x3f8a8a];
function makeHouse(color) {
  var g = new THREE.Group();
  var body = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 4.4), lam(color));
  body.position.y = 1.5; g.add(body);
  var roof = new THREE.Mesh(new THREE.ConeGeometry(3.9, 2.0, 4), lam(0xdfe6ee));
  roof.position.y = 4.0; roof.rotation.y = Math.PI / 4; g.add(roof);
  var door = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.8), lam(0x2e2a26));
  door.position.set(0, 0.9, 2.21); g.add(door);
  var winM = lam(0xbfe3ff);
  var w1 = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), winM);
  w1.position.set(-1.4, 1.8, 2.21); g.add(w1);
  var w2 = w1.clone(); w2.position.x = 1.4; g.add(w2);
  var chim = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.4, 0.6), lam(0x775544));
  chim.position.set(1.2, 4.2, 0); g.add(chim);
  return g;
}
var houseSpots = [
  [-10.5, -13, 0], [10.5, -13, 1], [-10.5, -4, 2], [10.5, -4, 3],
  [-10.5, 5, 4], [10.5, 5, 5], [-10.5, 14, 1], [10.5, 14, 3]
];
houseSpots.forEach(function (s) {
  var h = makeHouse(houseColors[s[2] % houseColors.length]);
  h.position.set(s[0], 0, s[1]);
  scene.add(h);
  addBox(s[0], s[1], 2.6, 2.3);
});

// ---------- school ----------
var school = new THREE.Group();
var sBody = new THREE.Mesh(new THREE.BoxGeometry(14, 5, 6), lam(0xd8b13c));
sBody.position.y = 2.5; school.add(sBody);
var sRoof = new THREE.Mesh(new THREE.BoxGeometry(14.6, 0.7, 6.6), lam(0x8a4a3a));
sRoof.position.y = 5.3; school.add(sRoof);
var sSign = textPlane('SOUTH PARK ELEMENTARY', 10, 1.4, '#f2e4b0', '#7a2c1e', 44);
sSign.position.set(0, 4.1, 3.05); school.add(sSign);
var sDoor = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.6), lam(0x4a3222));
sDoor.position.set(0, 1.3, 3.05); school.add(sDoor);
for (var wi = -5; wi <= 5; wi += 2.5) {
  if (Math.abs(wi) < 1.4) continue;
  var sw = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), lam(0xbfe3ff));
  sw.position.set(wi, 2.6, 3.05); school.add(sw);
}
school.position.set(0, 0, -25);
scene.add(school);
addBox(0, -25, 7.2, 3.2);

// flag pole
var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 7), lam(0xcccccc));
pole.position.set(8.5, 3.5, -21); scene.add(pole);
var flag = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.0), lam(0xc0392b));
flag.position.set(9.5, 6.3, -21); scene.add(flag);

// ---------- bus stop ----------
var bench = new THREE.Group();
var seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 0.6), lam(0x7a5a33));
seat.position.y = 0.55; bench.add(seat);
var leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.55, 0.5), lam(0x5a4025));
leg1.position.set(-1, 0.27, 0); bench.add(leg1);
var leg2 = leg1.clone(); leg2.position.x = 1; bench.add(leg2);
bench.position.set(5.2, 0, 17.5); scene.add(bench);
var bsPole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3), lam(0x888888));
bsPole.position.set(6.6, 1.5, 17.5); scene.add(bsPole);
var bsSign = textPlane('BUS STOP', 1.6, 0.9, '#2c5aa0', '#ffffff', 90);
bsSign.position.set(6.6, 3.2, 17.5); scene.add(bsSign);

var pondSign = textPlane("STARK'S POND", 2.2, 1.0, '#e8dcc0', '#4a3a22', 60);
pondSign.position.set(11.4, 1.1, 9.6); pondSign.rotation.y = Math.PI * 0.22; scene.add(pondSign);
var psPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1), lam(0x6a5232));
psPole.position.set(11.4, 0.55, 9.6); scene.add(psPole);

// ---------- trees ----------
function makeTree(s) {
  var g = new THREE.Group();
  var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.0), lam(0x4a3423));
  trunk.position.y = 0.5; g.add(trunk);
  var c1 = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.0, 8), lam(0x2e5d3a));
  c1.position.y = 1.8; g.add(c1);
  var c2 = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.7, 8), lam(0x3a7248));
  c2.position.y = 2.9; g.add(c2);
  var c3 = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.3, 8), lam(0xe8f0f6));
  c3.position.y = 3.9; g.add(c3);
  g.scale.setScalar(s);
  return g;
}
var treeSpots = [[-18, -20, 1.4], [-20, 8, 1.2], [-16, 22, 1.5], [14, -18, 1.3], [22, -8, 1.6], [24, 4, 1.1], [-22, -6, 1.0], [13, 24, 1.3], [-14, -16, 0.9], [26, 18, 1.4]];
treeSpots.forEach(function (t) {
  var tr = makeTree(t[2]); tr.position.set(t[0], 0, t[1]); scene.add(tr);
});

// ---------- snow mounds ----------
for (var mi = 0; mi < 14; mi++) {
  var m = new THREE.Mesh(new THREE.SphereGeometry(1 + Math.random() * 1.6, 10, 8), lam(0xffffff));
  m.scale.y = 0.35;
  var ang = Math.random() * Math.PI * 2, rr = 18 + Math.random() * 16;
  m.position.set(Math.cos(ang) * rr, 0, Math.sin(ang) * rr);
  scene.add(m);
}

// ---------- mountains ring ----------
for (var mni = 0; mni < 10; mni++) {
  var ma = (mni / 10) * Math.PI * 2 + 0.3;
  var mr = 58 + (mni % 3) * 9;
  var mh = 16 + (mni % 4) * 5;
  var mtn = new THREE.Mesh(new THREE.ConeGeometry(12 + (mni % 3) * 4, mh, 5), lam(0x7d8ba0));
  mtn.position.set(Math.cos(ma) * mr, mh / 2 - 0.5, Math.sin(ma) * mr);
  scene.add(mtn);
  var cap = new THREE.Mesh(new THREE.ConeGeometry((12 + (mni % 3) * 4) * 0.42, mh * 0.42, 5), lam(0xf4f8fc));
  cap.position.set(Math.cos(ma) * mr, mh * 0.79 - 0.5, Math.sin(ma) * mr);
  scene.add(cap);
}

// ---------- street lamps ----------
for (var li = -24; li <= 24; li += 12) {
  var lp = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 4.4), lam(0x333944));
  lp.position.set(4.2, 2.2, li); scene.add(lp);
  var lampM = new THREE.MeshBasicMaterial({ color: 0xffe9a0 });
  var lb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), lampM);
  lb.position.set(4.2, 4.5, li); scene.add(lb);
}

// ---------- falling snow ----------
var SNOW_N = 1400;
var snowGeo = new THREE.BufferGeometry();
var snowPos = new Float32Array(SNOW_N * 3);
var snowVel = new Float32Array(SNOW_N);
for (var si = 0; si < SNOW_N; si++) {
  snowPos[si * 3] = (Math.random() - 0.5) * 90;
  snowPos[si * 3 + 1] = Math.random() * 30;
  snowPos[si * 3 + 2] = (Math.random() - 0.5) * 90;
  snowVel[si] = 1.2 + Math.random() * 1.8;
}
snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
var snow = new THREE.Points(snowGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.16, transparent: true, opacity: 0.9 }));
scene.add(snow);

// ---------- characters: crude cutout kids in 3D ----------
function blobShadow(r) {
  var s = new THREE.Mesh(new THREE.CircleGeometry(r, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 }));
  s.rotation.x = -Math.PI / 2; s.position.y = 0.02;
  return s;
}

function makeKid(opts) {
  // opts: skin, jacket, pants, hat:{style,color,trim}, fat, hair
  var g = new THREE.Group();
  var fat = opts.fat ? 1.45 : 1.0;

  var body = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 14), lam(opts.jacket));
  body.scale.set(fat, 0.92, 0.78);
  body.position.y = 0.42; g.add(body);

  var pants = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), lam(opts.pants));
  pants.scale.set(fat * 0.85, 0.5, 0.68);
  pants.position.y = 0.17; g.add(pants);

  var head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 16), lam(opts.skin));
  head.position.y = 0.88; g.add(head);

  // eyes: big flat white ovals + pupils
  var eyeGeo = new THREE.SphereGeometry(0.115, 12, 10);
  var eyeM = new THREE.MeshBasicMaterial({ color: 0xffffff });
  var e1 = new THREE.Mesh(eyeGeo, eyeM); e1.scale.set(1, 1.25, 0.55); e1.position.set(-0.115, 0.94, 0.27); g.add(e1);
  var e2 = e1.clone(); e2.position.x = 0.115; g.add(e2);
  var pupGeo = new THREE.SphereGeometry(0.032, 8, 6);
  var pupM = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
  var p1 = new THREE.Mesh(pupGeo, pupM); p1.position.set(-0.105, 0.95, 0.345); g.add(p1);
  var p2 = p1.clone(); p2.position.x = 0.125; g.add(p2);

  // mouth
  var mouth = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: 0x54251c }));
  mouth.scale.set(1.6, 0.5, 0.4); mouth.position.set(0, 0.74, 0.315); g.add(mouth);

  // feet
  var footGeo = new THREE.BoxGeometry(0.17, 0.09, 0.26);
  var footM = lam(0x22252c);
  var f1 = new THREE.Mesh(footGeo, footM); f1.position.set(-0.15 * fat, 0.045, 0.04); g.add(f1);
  var f2 = new THREE.Mesh(footGeo, footM); f2.position.set(0.15 * fat, 0.045, 0.04); g.add(f2);

  // arms + mittens
  var armGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.3, 8);
  var a1 = new THREE.Mesh(armGeo, lam(opts.jacket));
  a1.position.set(-0.37 * fat, 0.45, 0.05); a1.rotation.z = 0.7; g.add(a1);
  var a2 = new THREE.Mesh(armGeo, lam(opts.jacket));
  a2.position.set(0.37 * fat, 0.45, 0.05); a2.rotation.z = -0.7; g.add(a2);
  var mitGeo = new THREE.SphereGeometry(0.08, 8, 8);
  var mitM = lam(opts.mittens || opts.jacket);
  var m1 = new THREE.Mesh(mitGeo, mitM); m1.position.set(-0.47 * fat, 0.32, 0.06); g.add(m1);
  var m2 = new THREE.Mesh(mitGeo, mitM); m2.position.set(0.47 * fat, 0.32, 0.06); g.add(m2);

  // hat styles
  var hc = opts.hat ? opts.hat.color : null;
  if (opts.hat && opts.hat.style === 'cap') {           // Stan: blue cap, red band + pom
    var dome = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), lam(hc));
    dome.position.y = 0.98; g.add(dome);
    var band = new THREE.Mesh(new THREE.CylinderGeometry(0.355, 0.355, 0.1, 16), lam(opts.hat.trim));
    band.position.y = 0.99; g.add(band);
    var pom = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), lam(opts.hat.trim));
    pom.position.y = 1.36; g.add(pom);
  } else if (opts.hat && opts.hat.style === 'ushanka') { // Kyle: green ushanka w/ ear flaps
    var ush = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.38, 0.22, 14), lam(hc));
    ush.position.y = 1.1; g.add(ush);
    var fl1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.26, 0.24), lam(hc));
    fl1.position.set(-0.35, 0.92, 0); g.add(fl1);
    var fl2 = fl1.clone(); fl2.position.x = 0.35; g.add(fl2);
  } else if (opts.hat && opts.hat.style === 'cartcap') { // Cartman: teal cap, yellow trim + pom
    var cd = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), lam(hc));
    cd.position.y = 0.99; g.add(cd);
    var cb = new THREE.Mesh(new THREE.CylinderGeometry(0.365, 0.365, 0.09, 16), lam(opts.hat.trim));
    cb.position.y = 1.0; g.add(cb);
    var cp = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), lam(opts.hat.trim));
    cp.position.y = 1.38; g.add(cp);
  } else if (opts.hat && opts.hat.style === 'hood') {    // Kenny: orange parka hood ring
    var hood = new THREE.Mesh(new THREE.SphereGeometry(0.37, 16, 12), lam(hc));
    hood.position.y = 0.9; g.add(hood);
    // face opening: re-draw skin circle + eyes on front
    var face = new THREE.Mesh(new THREE.CircleGeometry(0.21, 16), lam(opts.skin));
    face.position.set(0, 0.9, 0.345); g.add(face);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.235, 0.075, 10, 18), lam(opts.hat.trim));
    ring.position.set(0, 0.9, 0.33); g.add(ring);
    var ke1 = new THREE.Mesh(eyeGeo, eyeM); ke1.scale.set(0.8, 1.1, 0.5); ke1.position.set(-0.08, 0.94, 0.36); g.add(ke1);
    var ke2 = ke1.clone(); ke2.position.x = 0.08; g.add(ke2);
    var kp1 = new THREE.Mesh(pupGeo, pupM); kp1.position.set(-0.075, 0.95, 0.405); g.add(kp1);
    var kp2 = kp1.clone(); kp2.position.x = 0.085; g.add(kp2);
    // hide the default face features behind hood
    e1.visible = e2.visible = p1.visible = p2.visible = mouth.visible = false;
  } else if (opts.hat && opts.hat.style === 'beret') {   // Wendy
    var hair = new THREE.Mesh(new THREE.SphereGeometry(0.355, 16, 12), lam(0x2b2b33));
    hair.scale.set(1, 1.05, 1); hair.position.y = 0.9; g.add(hair);
    var faceW = new THREE.Mesh(new THREE.SphereGeometry(0.335, 20, 16), lam(opts.skin));
    faceW.position.set(0, 0.875, 0.03); g.add(faceW);
    // eyes must sit on the new face - re-add
    var we1 = new THREE.Mesh(eyeGeo, eyeM); we1.scale.set(1, 1.25, 0.55); we1.position.set(-0.115, 0.94, 0.31); g.add(we1);
    var we2 = we1.clone(); we2.position.x = 0.115; g.add(we2);
    var wp1 = new THREE.Mesh(pupGeo, pupM); wp1.position.set(-0.105, 0.95, 0.385); g.add(wp1);
    var wp2 = wp1.clone(); wp2.position.x = 0.125; g.add(wp2);
    e1.visible = e2.visible = p1.visible = p2.visible = mouth.visible = false;
    var ber = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam(hc));
    ber.scale.set(1.15, 0.55, 1.15); ber.position.y = 1.2; g.add(ber);
  } else if (opts.hat && opts.hat.style === 'tuft') {    // Butters
    for (var ti = 0; ti < 5; ti++) {
      var tuft = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 6), lam(hc));
      tuft.position.set((ti - 2) * 0.09, 1.21, 0.05);
      tuft.rotation.z = (ti - 2) * 0.25;
      g.add(tuft);
    }
  }

  g.add(blobShadow(0.42 * fat));
  g.userData.wobble = Math.random() * Math.PI * 2;
  g.userData.feet = [f1, f2];
  g.userData.arms = [a1, a2];
  return g;
}

// waddle animation for a kid group
function animateKid(g, dt, moving, t) {
  g.userData.wobble += dt * (moving ? 11 : 2.2);
  var w = g.userData.wobble;
  if (moving) {
    g.rotation.z = Math.sin(w) * 0.13;
    g.position.y = Math.abs(Math.sin(w)) * 0.05;
    var feet = g.userData.feet;
    feet[0].position.y = 0.045 + Math.max(0, Math.sin(w)) * 0.09;
    feet[1].position.y = 0.045 + Math.max(0, -Math.sin(w)) * 0.09;
    var arms = g.userData.arms;
    arms[0].rotation.x = Math.sin(w) * 0.5;
    arms[1].rotation.x = -Math.sin(w) * 0.5;
  } else {
    g.rotation.z = Math.sin(w) * 0.02;
    g.position.y = Math.sin(w) * 0.012;
    g.userData.feet[0].position.y = 0.045;
    g.userData.feet[1].position.y = 0.045;
    g.userData.arms[0].rotation.x *= 0.9;
    g.userData.arms[1].rotation.x *= 0.9;
  }
}

// ---------- cast ----------
var SKIN = 0xf2c98f;
var player = makeKid({ skin: SKIN, jacket: 0x9a4b2f, pants: 0x3a4a6b, mittens: 0x333333, hat: { style: 'cap', color: 0x5a5f6b, trim: 0x8a2f2f } });
player.position.set(0, 0, 20);
scene.add(player);

var npcs = [];
function addNPC(name, g, lines, x, z) {
  g.position.set(x, 0, z);
  scene.add(g);
  npcs.push({ name: name, g: g, lines: lines, lineIdx: 0, tx: x, tz: z, wait: Math.random() * 3, speed: 1.5 + Math.random() * 0.6, moving: false });
  return npcs[npcs.length - 1];
}
addNPC('Stan', makeKid({ skin: SKIN, jacket: 0x7a4a3a, pants: 0x33507a, mittens: 0xc0392b, hat: { style: 'cap', color: 0x33507a, trim: 0xc0392b } }),
  ["Dude, this is pretty messed up right here.", "Have you seen my Sparky? No? Cool cool.", "Cartman's been crying about Cheesy Poofs all morning."], -4, 12);
addNPC('Kyle', makeKid({ skin: SKIN, jacket: 0xd8722c, pants: 0x3f6b3a, mittens: 0x3f6b3a, hat: { style: 'ushanka', color: 0x3f9a4f } }),
  ["You know, I learned something today... never hide snacks from Cartman.", "Snow day is the best day, dude.", "Ike! ...wait, you're not Ike."], 4, 8);
addNPC('Kenny', makeKid({ skin: SKIN, jacket: 0xd86a1e, pants: 0xd86a1e, mittens: 0x8a4a1e, hat: { style: 'hood', color: 0xd86a1e, trim: 0x8a4a1e } }),
  ["(Mmph mmph mmph!)", "(Mmmph! Mmph mmph!)", "(...mmph.)"], 6.5, 16.5);
addNPC('Wendy', makeKid({ skin: SKIN, jacket: 0x7a4a8a, pants: 0x333944, mittens: 0xffd23f, hat: { style: 'beret', color: 0xc06aa0 } }),
  ["It's a nice day for South Park. That's rare.", "If you see Stan, tell him... nothing. Never mind."], -6, -2);
addNPC('Butters', makeKid({ skin: SKIN, jacket: 0x4aa8a0, pants: 0x3a4a6b, mittens: 0x4aa8a0, hat: { style: 'tuft', color: 0xe8d25a } }),
  ["Oh hamburgers!", "Lu lu lu, I got some apples!", "Cartman says I can't have any Cheesy Poofs. That's rough, buddy."], -3, 18);
addNPC('Mr. Garrison', makeKid({ skin: SKIN, jacket: 0x3f6b5a, pants: 0x333944, mittens: 0x3f6b5a }),
  ["Okay children, let's take our seats.", "And remember: there are no stupid questions, only stupid people."], 3, -20.5);
// make Garrison taller-ish
npcs[5].g.scale.set(1.1, 1.25, 1.1);

var cartman = { name: 'Cartman', g: makeKid({ skin: SKIN, jacket: 0xc0392b, pants: 0x6b4a2f, mittens: 0xffd23f, fat: true, hat: { style: 'cartcap', color: 0x2c8a9a, trim: 0xffd23f } }), state: 'wander', tx: 0, tz: -18, wait: 2, cooldown: 0 };
cartman.g.position.set(0, 0, -18);
scene.add(cartman.g);

// ---------- cheesy poofs ----------
var poofs = [];
var poofSpots = [
  [2.5, 10], [-5, 7], [5, -6], [-4.5, -11], [2, -17], [8, 2], [-8, 20],
  [13.5, 10], [20, 15.5], [14, 7], [-13, 10], [7, 22]
];
function makePoof() {
  var g = new THREE.Group();
  var bag = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 0.12), new THREE.MeshLambertMaterial({ color: 0xe8821e, emissive: 0x552a00 }));
  g.add(bag);
  var label = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.14), new THREE.MeshBasicMaterial({ color: 0xfff2c8 }));
  label.position.z = 0.065; g.add(label);
  var crunch = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), lam(0xd8a23c));
  crunch.position.set(0, 0.22, 0); g.add(crunch);
  return g;
}
poofSpots.forEach(function (p) {
  var poof = makePoof();
  poof.position.set(p[0], 0.75, p[1]);
  scene.add(poof);
  poofs.push({ g: poof, held: false, baseY: 0.75, wob: Math.random() * 6 });
});
var poofsHeld = 0;
var POOFS_TOTAL = poofs.length;

function freeSpot() {
  for (var i = 0; i < 40; i++) {
    var a = Math.random() * Math.PI * 2, r = 4 + Math.random() * 22;
    var x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (z < -19 && Math.abs(x) < 9) continue;             // inside school
    var ok = true;
    for (var b = 0; b < boxes.length; b++) {
      if (Math.abs(x - boxes[b].x) < boxes[b].hx + 0.6 && Math.abs(z - boxes[b].z) < boxes[b].hz + 0.6) { ok = false; break; }
    }
    var dpx = x - 17, dpz = z - 13;
    if (dpx * dpx + dpz * dpz < 7.4 * 7.4) ok = false;
    if (ok) return [x, z];
  }
  return [0, 0];
}

// ---------- audio: synthesized bluegrass-ish plucks (original melody) ----------
var AC = null, masterGain = null, musicTimer = null;
function initAudio() {
  if (AC) return;
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = AC.createGain(); masterGain.gain.value = 0.24; masterGain.connect(AC.destination);
    startMusic();
  } catch (e) { AC = null; }
}
function pluck(freq, when, dur, type, vol) {
  if (!AC) return;
  var o = AC.createOscillator(), g = AC.createGain();
  o.type = type || 'triangle'; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(vol || 0.5, when + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, when + (dur || 0.28));
  o.connect(g); g.connect(masterGain);
  o.start(when); o.stop(when + (dur || 0.28) + 0.05);
}
// original pentatonic riff, two bars, banjo-ish
var RIFF = [392, 440, 523.25, 587.33, 523.25, 440, 392, 329.63, 392, 440, 523.25, 659.25, 587.33, 523.25, 440, 392];
var BASS = [196, 196, 220, 146.83];
var riffIdx = 0;
function startMusic() {
  var step = 0.21, next = AC.currentTime + 0.1;
  musicTimer = setInterval(function () {
    if (!AC) return;
    while (next < AC.currentTime + 0.6) {
      var f = RIFF[riffIdx % RIFF.length];
      pluck(f, next, 0.26, 'triangle', 0.32);
      pluck(f * 2, next, 0.12, 'square', 0.05);
      if (riffIdx % 4 === 0) pluck(BASS[(riffIdx / 4) % BASS.length], next, 0.5, 'sine', 0.4);
      riffIdx++; next += step;
    }
  }, 200);
}
function sfxPickup() { if (!AC) return; var t = AC.currentTime; pluck(880, t, 0.12, 'square', 0.25); pluck(1318.5, t + 0.09, 0.18, 'square', 0.25); }
function sfxSteal() {
  if (!AC) return; var t = AC.currentTime;
  var o = AC.createOscillator(), g = AC.createGain();
  o.type = 'sawtooth'; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.5);
  g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
  o.connect(g); g.connect(masterGain); o.start(t); o.stop(t + 0.6);
}
function sfxTalk() { if (!AC) return; var t = AC.currentTime; pluck(520, t, 0.07, 'square', 0.18); pluck(620, t + 0.08, 0.07, 'square', 0.18); }
function sfxWin() { if (!AC) return; var t = AC.currentTime;[523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { pluck(f, t + i * 0.13, 0.4, 'triangle', 0.4); }); }
function sfxJump() { if (!AC) return; pluck(660, AC.currentTime, 0.09, 'sine', 0.15); }

// ---------- input ----------
var keys = {};
window.addEventListener('keydown', function (e) {
  keys[e.code] = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].indexOf(e.code) >= 0) e.preventDefault();
  if (e.code === 'KeyE') tryTalk();
});
window.addEventListener('keyup', function (e) { keys[e.code] = false; });

var camYaw = 0, dragging = false, lastX = 0;
renderer.domElement.addEventListener('mousedown', function (e) { dragging = true; lastX = e.clientX; });
window.addEventListener('mouseup', function () { dragging = false; });
window.addEventListener('mousemove', function (e) {
  if (dragging) { camYaw -= (e.clientX - lastX) * 0.006; lastX = e.clientX; }
});
renderer.domElement.addEventListener('contextmenu', function (e) { e.preventDefault(); });
// basic touch: left half = move stick (toward touch), right half = camera drag
var touchMove = null, touchCam = null;
renderer.domElement.addEventListener('touchstart', function (e) {
  for (var i = 0; i < e.changedTouches.length; i++) {
    var t = e.changedTouches[i];
    if (t.clientX < window.innerWidth / 2 && !touchMove) touchMove = { id: t.identifier, x0: t.clientX, y0: t.clientY, dx: 0, dy: 0 };
    else if (!touchCam) touchCam = { id: t.identifier, x: t.clientX };
  }
  e.preventDefault();
}, { passive: false });
renderer.domElement.addEventListener('touchmove', function (e) {
  for (var i = 0; i < e.changedTouches.length; i++) {
    var t = e.changedTouches[i];
    if (touchMove && t.identifier === touchMove.id) { touchMove.dx = t.clientX - touchMove.x0; touchMove.dy = t.clientY - touchMove.y0; }
    if (touchCam && t.identifier === touchCam.id) { camYaw -= (t.clientX - touchCam.x) * 0.008; touchCam.x = t.clientX; }
  }
  e.preventDefault();
}, { passive: false });
renderer.domElement.addEventListener('touchend', function (e) {
  for (var i = 0; i < e.changedTouches.length; i++) {
    var t = e.changedTouches[i];
    if (touchMove && t.identifier === touchMove.id) touchMove = null;
    if (touchCam && t.identifier === touchCam.id) touchCam = null;
  }
}, { passive: false });

// ---------- HUD / dialog ----------
var poofsEl = document.getElementById('poofs');
var timerEl = document.getElementById('timer');
var hintEl = document.getElementById('hint');
var dialogEl = document.getElementById('dialog');
var dialogUntil = 0;
function say(name, line, secs) {
  dialogEl.innerHTML = '<b>' + name + ':</b> ' + line;
  dialogEl.style.display = 'block';
  dialogUntil = performance.now() + (secs || 3.5) * 1000;
  sfxTalk();
}
function updateHUD() {
  poofsEl.textContent = 'CHEESY POOFS: ' + poofsHeld + ' / ' + POOFS_TOTAL;
  var s = Math.max(0, Math.ceil(timeLeft));
  timerEl.textContent = Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  timerEl.style.color = s <= 30 ? '#ff7a6b' : '#fff';
}
function nearestNPC(maxD) {
  var best = null, bd = maxD;
  npcs.forEach(function (n) {
    var d = Math.hypot(n.g.position.x - player.position.x, n.g.position.z - player.position.z);
    if (d < bd) { bd = d; best = n; }
  });
  return best;
}
function tryTalk() {
  if (!running) return;
  var n = nearestNPC(2.6);
  if (n) {
    say(n.name, n.lines[n.lineIdx % n.lines.length]);
    n.lineIdx++;
  }
}

// ---------- collision ----------
function collide(px, pz) {
  var x = px, z = pz;
  for (var i = 0; i < boxes.length; i++) {
    var b = boxes[i];
    var dx = x - b.x, dz = z - b.z;
    if (Math.abs(dx) < b.hx + 0.42 && Math.abs(dz) < b.hz + 0.42) {
      var pushX = (b.hx + 0.42 - Math.abs(dx)) * (dx >= 0 ? 1 : -1);
      var pushZ = (b.hz + 0.42 - Math.abs(dz)) * (dz >= 0 ? 1 : -1);
      if (Math.abs(pushX) < Math.abs(pushZ)) x += pushX; else z += pushZ;
    }
  }
  for (var c = 0; c < circles.length; c++) {
    var ci = circles[c];
    var cdx = x - ci.x, cdz = z - ci.z;
    var d = Math.hypot(cdx, cdz);
    if (d < ci.r && d > 0.001) { x = ci.x + cdx / d * ci.r; z = ci.z + cdz / d * ci.r; }
  }
  var rr = Math.hypot(x, z);
  if (rr > 40) { x *= 40 / rr; z *= 40 / rr; }
  return [x, z];
}

// ---------- game state ----------
var running = false, over = false;
var timeLeft = 240, elapsed = 0;
var playerVY = 0, playerGrounded = true;
var titleEl = document.getElementById('title');
var winEl = document.getElementById('win');
var loseEl = document.getElementById('lose');

function resetGame() {
  poofsHeld = 0; timeLeft = 240; elapsed = 0; over = false;
  player.position.set(0, 0, 20); playerVY = 0; camYaw = 0;
  poofs.forEach(function (p, i) {
    p.held = false; p.g.visible = true;
    p.g.position.set(poofSpots[i][0], p.baseY, poofSpots[i][1]);
  });
  cartman.state = 'wander'; cartman.cooldown = 0;
  cartman.g.position.set(0, 0, -18);
  npcs.forEach(function (n) { n.tx = n.g.position.x; n.tz = n.g.position.z; });
  updateHUD();
}
function startGame() {
  initAudio();
  if (AC && AC.state === 'suspended') AC.resume();
  resetGame();
  titleEl.style.display = 'none'; winEl.style.display = 'none'; loseEl.style.display = 'none';
  running = true;
}
titleEl.addEventListener('click', startGame);
winEl.addEventListener('click', startGame);
loseEl.addEventListener('click', startGame);

function winGame() {
  running = false; over = true; sfxWin();
  var used = Math.round(elapsed);
  document.getElementById('wintime').textContent = 'Finished in ' + Math.floor(used / 60) + ':' + ('0' + (used % 60)).slice(-2) + ' - fast work, New Kid.';
  winEl.style.display = 'flex';
}
function loseGame() {
  running = false; over = true; sfxSteal();
  loseEl.style.display = 'flex';
}

// ---------- main loop ----------
var clock = new THREE.Clock();
var camPos = new THREE.Vector3(0, 6, 30);

function update(dt, t) {
  // snow
  var sp = snowGeo.attributes.position.array;
  for (var i = 0; i < SNOW_N; i++) {
    sp[i * 3 + 1] -= snowVel[i] * dt;
    sp[i * 3] += Math.sin(t * 0.7 + i) * dt * 0.35;
    if (sp[i * 3 + 1] < 0) {
      sp[i * 3 + 1] = 28;
      sp[i * 3] = camera.position.x + (Math.random() - 0.5) * 90;
      sp[i * 3 + 2] = camera.position.z + (Math.random() - 0.5) * 90;
    }
  }
  snowGeo.attributes.position.needsUpdate = true;

  // poofs idle spin/bob
  poofs.forEach(function (p) {
    if (p.held) return;
    p.g.rotation.y += dt * 1.6;
    p.g.position.y = p.baseY + Math.sin(t * 2 + p.wob) * 0.12;
  });

  if (!running) {
    // slow orbit around town on overlays
    var oa = t * 0.06;
    camera.position.set(Math.cos(oa) * 26, 9, Math.sin(oa) * 26);
    camera.lookAt(0, 2, 0);
    npcs.forEach(function (n) { animateKid(n.g, dt, false, t); });
    animateKid(cartman.g, dt, false, t);
    animateKid(player, dt, false, t);
    return;
  }

  timeLeft -= dt; elapsed += dt;
  if (timeLeft <= 0) { timeLeft = 0; updateHUD(); loseGame(); return; }

  // --- player movement (camera-relative) ---
  var mx = 0, mz = 0;
  if (keys.KeyW || keys.ArrowUp) mz -= 1;
  if (keys.KeyS || keys.ArrowDown) mz += 1;
  if (keys.KeyA || keys.ArrowLeft) mx -= 1;
  if (keys.KeyD || keys.ArrowRight) mx += 1;
  if (touchMove) {
    mx += Math.max(-1, Math.min(1, touchMove.dx / 60));
    mz += Math.max(-1, Math.min(1, touchMove.dy / 60));
  }
  var moving = (mx !== 0 || mz !== 0);
  var speed = 4.7;
  if (moving) {
    var len = Math.hypot(mx, mz); if (len > 1) { mx /= len; mz /= len; }
    var sin = Math.sin(camYaw), cos = Math.cos(camYaw);
    var wx = mx * cos - mz * sin;
    var wz = mx * sin + mz * cos;
    var np = collide(player.position.x + wx * speed * dt, player.position.z + wz * speed * dt);
    player.position.x = np[0]; player.position.z = np[2 - 1];
    var targetRot = Math.atan2(wx, wz);
    var dr = targetRot - player.rotation.y;
    while (dr > Math.PI) dr -= Math.PI * 2;
    while (dr < -Math.PI) dr += Math.PI * 2;
    player.rotation.y += dr * Math.min(1, dt * 12);
  }
  // jump
  if ((keys.Space) && playerGrounded) { playerVY = 5.2; playerGrounded = false; sfxJump(); }
  if (!playerGrounded) {
    playerVY -= 14 * dt;
    player.position.y += playerVY * dt;
    if (player.position.y <= 0) { player.position.y = 0; playerVY = 0; playerGrounded = true; }
  }
  animateKid(player, dt, moving, t);
  if (!playerGrounded) player.position.y = Math.max(player.position.y, 0);

  // --- pickups ---
  poofs.forEach(function (p) {
    if (p.held) return;
    var d = Math.hypot(p.g.position.x - player.position.x, p.g.position.z - player.position.z);
    if (d < 0.85) {
      p.held = true; p.g.visible = false; poofsHeld++;
      sfxPickup(); updateHUD();
      say('New Kid', 'Got one! That\'s ' + poofsHeld + ' of ' + POOFS_TOTAL + '.', 1.6);
      if (poofsHeld >= POOFS_TOTAL) { winGame(); return; }
      if (cartman.state === 'wander' && poofsHeld >= 1) {
        cartman.state = 'chase';
        say('Cartman', 'HEY! Those are MY Cheesy Poofs! Respect my authoritah!', 3);
      }
    }
  });

  // --- talk hint ---
  var near = nearestNPC(2.6);
  hintEl.textContent = near ? 'Press E to talk to ' + near.name : 'Find the glowing Cheesy Poofs - and watch out for Cartman';

  // --- NPC wander ---
  npcs.forEach(function (n) {
    if (n.wait > 0) { n.wait -= dt; n.moving = false; animateKid(n.g, dt, false, t); return; }
    var dx = n.tx - n.g.position.x, dz = n.tz - n.g.position.z;
    var d = Math.hypot(dx, dz);
    if (d < 0.4) {
      n.wait = 1.5 + Math.random() * 4; n.moving = false;
      var a = Math.random() * Math.PI * 2, r = 3 + Math.random() * 14;
      n.tx = Math.max(-24, Math.min(24, n.g.position.x + Math.cos(a) * r));
      n.tz = Math.max(-17, Math.min(26, n.g.position.z + Math.sin(a) * r));
      if (Math.abs(n.tx) < 5 && Math.abs(n.tz) < 30) { /* street ok */ }
      animateKid(n.g, dt, false, t);
      return;
    }
    var sp2 = n.speed * dt;
    var np2 = collide(n.g.position.x + dx / d * sp2, n.g.position.z + dz / d * sp2);
    n.g.position.x = np2[0]; n.g.position.z = np2[1];
    n.g.rotation.y = Math.atan2(dx, dz);
    n.moving = true;
    animateKid(n.g, dt, true, t);
  });

  // --- Cartman AI ---
  var cg = cartman.g;
  if (cartman.state === 'chase') {
    var cdx = player.position.x - cg.position.x, cdz = player.position.z - cg.position.z;
    var cd = Math.hypot(cdx, cdz);
    if (cd > 0.72) {
      var cs = 3.5 * dt;
      var cnp = collide(cg.position.x + cdx / cd * cs, cg.position.z + cdz / cd * cs);
      cg.position.x = cnp[0]; cg.position.z = cnp[1];
      cg.rotation.y = Math.atan2(cdx, cdz);
      animateKid(cg, dt, true, t);
    } else if (cartman.cooldown <= 0) {
      // caught you: steal a poof back
      if (poofsHeld > 0) {
        poofsHeld--;
        var hidden = poofs.filter(function (p) { return p.held; });
        if (hidden.length) {
          var rp = hidden[0]; rp.held = false; rp.g.visible = true;
          var fs = freeSpot();
          rp.g.position.set(fs[0], rp.baseY, fs[1]);
        }
        sfxSteal(); updateHUD();
        say('Cartman', 'HA! Mine now! Screw you guys, I\'m going home!', 3);
      }
      cartman.state = 'flee'; cartman.cooldown = 6;
      var fa = Math.random() * Math.PI * 2;
      cartman.tx = Math.cos(fa) * 24; cartman.tz = Math.sin(fa) * 20;
    }
  } else if (cartman.state === 'flee') {
    cartman.cooldown -= dt;
    var fdx = cartman.tx - cg.position.x, fdz = cartman.tz - cg.position.z;
    var fd = Math.hypot(fdx, fdz);
    if (fd > 0.5) {
      var fs2 = 4.2 * dt;
      var fnp = collide(cg.position.x + fdx / fd * fs2, cg.position.z + fdz / fd * fs2);
      cg.position.x = fnp[0]; cg.position.z = fnp[1];
      cg.rotation.y = Math.atan2(fdx, fdz);
      animateKid(cg, dt, true, t);
    } else {
      animateKid(cg, dt, false, t);
    }
    if (cartman.cooldown <= 0) cartman.state = poofsHeld > 0 ? 'chase' : 'wander';
  } else {
    // wander near school
    if (cartman.wait > 0) { cartman.wait -= dt; animateKid(cg, dt, false, t); }
    else {
      var wdx = cartman.tx - cg.position.x, wdz = cartman.tz - cg.position.z;
      var wd = Math.hypot(wdx, wdz);
      if (wd < 0.5) {
        cartman.wait = 2 + Math.random() * 3;
        cartman.tx = -6 + Math.random() * 12; cartman.tz = -20 + Math.random() * 10;
        animateKid(cg, dt, false, t);
      } else {
        var ws = 1.8 * dt;
        var wnp = collide(cg.position.x + wdx / wd * ws, cg.position.z + wdz / wd * ws);
        cg.position.x = wnp[0]; cg.position.z = wnp[1];
        cg.rotation.y = Math.atan2(wdx, wdz);
        animateKid(cg, dt, true, t);
      }
    }
    if (poofsHeld > 0) cartman.state = 'chase';
  }

  // --- camera follow ---
  var camDist = 5.2, camH = 2.6;
  var cx = player.position.x - Math.sin(camYaw) * -camDist;
  var cz = player.position.z - Math.cos(camYaw) * -camDist;
  camPos.x += (cx - camPos.x) * Math.min(1, dt * 6);
  camPos.z += (cz - camPos.z) * Math.min(1, dt * 6);
  camPos.y += (camH - camPos.y) * Math.min(1, dt * 6);
  camera.position.copy(camPos);
  camera.lookAt(player.position.x, player.position.y + 1.0, player.position.z);

  // hide dialog when expired
  if (dialogEl.style.display === 'block' && performance.now() > dialogUntil) dialogEl.style.display = 'none';
  if ((elapsed * 2 | 0) !== ((elapsed - dt) * 2 | 0)) updateHUD();
}

function loop() {
  requestAnimationFrame(loop);
  var dt = Math.min(0.05, clock.getDelta());
  update(dt, clock.elapsedTime);
  renderer.render(scene, camera);
}
updateHUD();
loop();

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
})();
