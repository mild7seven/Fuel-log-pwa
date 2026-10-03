const FUEL_PATTERNS=[
  ['Pertamax Green 95',['PERTAMAX\\s*GREEN\\s*95','PERTAMAX\\s*GREEN']],
  ['Pertamax Turbo',['PERTAMAX\\s*TURBO']],
  ['Pertamax',['PERTAMAX\\s*92','PERTAMAX']],
  ['Pertalite',['Pertalite']],
  ['Revvo 95',['REVVO\\s*95']],
  ['Revvo 92',['REVVO\\s*92']],
  ['BP Ultimate',['BP\\s*ULTIMATE']],
  ['BP 92',['BP\\s*92']]
];
function money(s){const raw=String(s??'').replace(/[^\d.,]/g,'');if(!raw)return null;const n=raw.replace(/\./g,'').replace(/,/g,'');return Number(n)||null}
function normalizeDate(y,m,d){return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
function parseReceipt(t){
  const raw=String(t||''),u=raw.toUpperCase(),a=raw.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const r={stationName:'',transactionDate:'',transactionTime:'',fuelTypeName:'',volume:null,pricePerLiter:null,totalAmount:null,vehiclePlate:'',confidence:0,fields:{}};
  const station=a.find(x=>/SPBU|PERTAMINA|SHELL|VIVO|\bBP\b/i.test(x))||'';r.stationName=station.replace(/^(NAMA\\s*)?SPBU\\s*[:#-]?\\s*/i,'').slice(0,100);
  let d=u.match(/\b(20\d{2})[-\/.](\d{1,2})[-\/.](\d{1,2})\b/)||u.match(/\b(\d{1,2})[-\/.](\d{1,2})[-\/.](20\d{2})\b/);
  if(d)r.transactionDate=d[1].length===4?normalizeDate(d[1],d[2],d[3]):normalizeDate(d[3],d[2],d[1]);
  const tm=u.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)(?::[0-5]\d)?\b/);if(tm)r.transactionTime=`${tm[1].padStart(2,'0')}:${tm[2]}`;
  for(const [name,pats] of FUEL_PATTERNS){if(pats.some(p=>new RegExp(p,'i').test(u))){r.fuelTypeName=name;break}}
  const literPatterns=[new RegExp("(\\d+(?:[.,]\\d+)?)\\s*(?:L|LTR|LITER)\\b","i"),new RegExp("(?:VOLUME|VOL|QTY|QUANTITY)\\s*[:=-]?\\s*(\\d+(?:[.,]\\d+)?)","i")];
  for(const re of literPatterns){const m=u.match(re);if(m){r.volume=Number(m[1].replace(',','.'));break}}
  const pricePatterns=[new RegExp("(?:RP\\.?\\s*)?(\\d{1,3}(?:[.,]\\d{3})+|\\d{4,6})\\s*(?:\\/\\s*(?:L|LTR|LITER)|PER\\s*L(?:ITER)?)\\b","i"),new RegExp("(?:HARGA|PRICE)\\s*(?:\\/|PER)?\\s*(?:L|LITER)?\\s*[:=-]?\\s*RP?\\.?\\s*([\\d.,]+)","i")];
  for(const re of pricePatterns){const m=raw.match(re);if(m){r.pricePerLiter=money(m[1]);break}}
  const totalLine=a.find(x=>/TOTAL|JUMLAH|AMOUNT|GRAND\\s*TOTAL|SUBTOTAL/i.test(x));
  if(totalLine){const nums=totalLine.match(/\d[\d.,]*/g);if(nums?.length)r.totalAmount=money(nums[nums.length-1])}
  if(!r.totalAmount){const m=u.match(/(?:TOTAL|JUMLAH|AMOUNT|GRAND\\s*TOTAL)\\s*[:=-]?\\s*(?:RP\.?\\s*)?([\d.,]+)/);if(m)r.totalAmount=money(m[1])}
  const plateMatches=[...u.matchAll(/\b([A-Z]{1,2})\s*([0-9]{1,4})\s*([A-Z]{1,3})\b/g)].map(m=>`${m[1]} ${m[2]} ${m[3]}`);
  r.vehiclePlate=plateMatches.find(x=>!/^BP\s*\d/.test(x))||'';
  r.fields={stationName:!!r.stationName,transactionDate:!!r.transactionDate,transactionTime:!!r.transactionTime,fuelTypeName:!!r.fuelTypeName,volume:r.volume>0,pricePerLiter:r.pricePerLiter>0,totalAmount:r.totalAmount>0,vehiclePlate:!!r.vehiclePlate};
  const vals=Object.values(r.fields);r.confidence=Math.round(vals.filter(Boolean).length/vals.length*100);
  return r;
}
function validateReceiptData(r){const e=[];if(!r.stationName)e.push('SPBU belum terdeteksi');if(!r.transactionDate)e.push('Tanggal belum terdeteksi');if(!r.fuelTypeName)e.push('Jenis BBM belum terdeteksi');if(!(r.volume>0))e.push('Volume belum terdeteksi');if(!(r.pricePerLiter>0))e.push('Harga/L belum terdeteksi');if(!(r.totalAmount>0))e.push('Total belum terdeteksi');if(r.volume>0&&r.pricePerLiter>0&&r.totalAmount>0&&Math.abs(r.volume*r.pricePerLiter-r.totalAmount)>Math.max(100,r.totalAmount*.03))e.push('Volume × harga/L berbeda signifikan dari total');return e}
