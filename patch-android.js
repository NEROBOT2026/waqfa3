const fs = require('fs'), path = require('path');
function w(p, d, enc) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, d, enc); }
const R = 'android/app/src/main/';

// 1) permissions
let x = fs.readFileSync(R + 'AndroidManifest.xml', 'utf8');
['INTERNET','POST_NOTIFICATIONS','SCHEDULE_EXACT_ALARM','USE_EXACT_ALARM','RECEIVE_BOOT_COMPLETED','ACCESS_COARSE_LOCATION','ACCESS_FINE_LOCATION','VIBRATE','WAKE_LOCK'].forEach(n => {
  const full = 'android.permission.' + n;
  if (!x.includes(full)) x = x.replace('<application', '<uses-permission android:name="' + full + '" />\n    <application');
});
fs.writeFileSync(R + 'AndroidManifest.xml', x);

// 2) Quran text (downloaded by the workflow) -> www/quran.js
if (fs.existsSync('quran-raw.json')) {
  try {
    const sur = JSON.parse(fs.readFileSync('quran-raw.json', 'utf8')).data.surahs;
    const norm = t => t.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '');
    const out = sur.map(s => [s.name, s.ayahs.map((a, i) => {
      let t = a.text;
      if (i === 0 && s.number !== 1 && s.number !== 9) { const k = t.split(' '); if (norm(k[0]) === 'بسم') t = k.slice(4).join(' '); }
      return t;
    })]);
    const n = out.reduce((a, s) => a + s[1].length, 0);
    console.log('surahs', out.length, 'ayahs', n);
    if (out.length === 114 && n === 6236) { w('www/quran.js', 'window.QURAN=' + JSON.stringify(out) + ';'); console.log('quran.js written'); }
    else console.log('WARNING: unexpected Quran size, skipped');
  } catch (e) { console.log('WARNING: could not process quran-raw.json', e.message); }
} else console.log('WARNING: quran-raw.json missing, app will download the Quran at first use');

// 3) notification icons
w(R + 'res/drawable/ic_mosque.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAIAAADdvvtQAAADHUlEQVR4nO3aPU7cQACA0RDlNlRU1KlouUCKnIyCU6SioUmVK6VAQsmyLD/f2h7b71VICBh7vhmvzFw83l5+gc/6uvQAWDcBkQiIREAkAiIREImASAREIiASAZEIiERAJAIiERCJgEgERCIgEgGRCIhEQCQCIhEQiYBIBEQiIBIBkQiIREAkAiIREImASAREIiASAZEIiERAJAIiERCJgEgERCIgEgGRCIhEQCQCIhEQiYBIBEQiIBIBkQiIREAkAiIREImATrm+f7i+f1h6FEMT0Kue09HQCQIiERCJgF71+8f3gy94SUAkAiIREImASEYPaOfvYMa//NEDYnArCGj8VTiRVVz40AGt4g5ObfCbMHRAjO/b0gN4l+v7h6lfB59Y6Ee/teB4hrKOgCb1ual6+in/5Rj3ETbDEuzHfeY5MDTybjRuQAfOfhPP+AtHHtvU9vgIm2J6dvtEW80OdC6TLu4V7RznMmhAR2eiT88qPq9MdO0TGTSgKcw2B8NO9hT2EtDMk7qfhnYR0CLTuZOGth/QghO5h4a2HxCT2nhAi+8Biw9gahsPiKltOaBBVv8gw5jIlgNiBpsNaKh1P9RgzmuzATEPAZEIiGSbAQ34mWPAIZ3FNgNiNgIiERCJgEg2dah+8A+qz8Pb0tl7OxCJgEgE9Ia7m6ulhzA0AZ3yVI+GThDQcXc3V/92o6HXCOiIo7lo6CgBkQjo0Imdxib0koBIBPSfN/cYm9ABAZEIiERAJAIiERCJgEgERCIgkovH28tF/vCYx0/f857w568/M4zko5Y6JrupM9HdmHGMzCOMZLFHGNtgByIREImASAREIiASAZEIiERAJAIiERCJgEgERCIgEgGRCIhEQCQCIhEQiYBIBEQiIBIBkQiIREAkAiIREImASAREIiASAZEIiERAJAIiERCJgEgERCIgEgGRCIhEQCQCIhEQiYBIBEQiIBIBkQiIREAkAiIREImASAREIiASAZEIiERAJAIiERCJgEgERCIgEgGRCIhEQCQCIhEQiYBIBEQiIBIBkQiIREAkAiIREImASP4Cf2p6WcY8ji4AAAAASUVORK5CYII=', 'base64'));
w(R + 'res/drawable/ic_stat_mosque.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAABBUlEQVR4nO3awYrCMBiF0VZ8/1ee2SiIMIsxpveGnLMU0TZf/lahxwEAAAAAAAAAAAAA8POQPo4Rt/QBfOp14VePsCwTwDABwqYGWP3ycBzzz8EEhE0L8Nw5K0/BFedwn/XBM/y1EO+vn+d5XnNE45YI8N8d+Hz/CiGqA4yO/gohptwD3hfuk4X85nX3G98/6z5Q+Stoxsm2/hioDLCTugAzd2rjFNQF2E1VgCt2aNsUVAXYUU2AK3dm0xTUBNhVRYDEjmyZgooAOxMgLB4geSlouAzFA+xOgDABwgQIEyBMgDABwgQIEyBs+HGNhn+TSaOPvJiAMAEAAAAAAAAAAAAAAGB9v4YQk8ZjC2ECAAAAAElFTkSuQmCC', 'base64'));

// 4) optional adhan sound (upload adhan.mp3 to the repo root)
if (fs.existsSync('adhan.mp3')) {
  w(R + 'res/raw/adhan.mp3', fs.readFileSync('adhan.mp3'));
  w('www/adhan.mp3', fs.readFileSync('adhan.mp3'));
  console.log('adhan.mp3 added');
} else console.log('no adhan.mp3 (default notification sound)');

// 5) fixed signing key so updates install over the old version
w('android/app/waqfa.p12', Buffer.from('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', 'base64'));
let g = fs.readFileSync('android/app/build.gradle', 'utf8');
if (!g.includes('waqfa.p12')) {
  g = g.replace(/android\s*\{/, m => m + "\n    signingConfigs {\n        debug {\n            storeFile file('waqfa.p12')\n            storePassword 'waqfa123'\n            keyAlias 'waqfa'\n            keyPassword 'waqfa123'\n            storeType 'pkcs12'\n        }\n    }");
  fs.writeFileSync('android/app/build.gradle', g);
}
console.log('patch done');
