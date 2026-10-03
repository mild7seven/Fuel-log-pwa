function derived(x,p){
  const d=p && Number.isFinite(+x.odometer) && +x.odometer>=+p.odometer ? +x.odometer-+p.odometer : null;
  return {distance:d,kmPerLiter:d!==null&&+x.volume>0?d/+x.volume:null,costPerKm:d!==null&&d>0&&+x.totalAmount>0?+x.totalAmount/d:null};
}
function valid(x,p){
  const e=[];
  if(!x.vehicleId)e.push('Kendaraan wajib dipilih');
  if(!String(x.stationName||'').trim())e.push('SPBU wajib diisi');
  if(!x.transactionDate)e.push('Tanggal transaksi wajib diisi');
  if(!(x.volume>0))e.push('Volume tidak valid');
  if(!(x.pricePerLiter>0))e.push('Harga/L tidak valid');
  if(!(x.totalAmount>0))e.push('Total tidak valid');
  if(!(x.odometer>=0))e.push('Odometer tidak valid');
  if(p&&x.odometer<p.odometer)e.push('Odometer lebih kecil dari transaksi sebelumnya');
  if(x.volume>0&&x.pricePerLiter>0&&x.totalAmount>0){const expected=x.volume*x.pricePerLiter;if(Math.abs(expected-x.totalAmount)>Math.max(100,x.totalAmount*.03))e.push('Volume × harga/L berbeda signifikan dari total');}
  return e;
}
function recomputeAll(logs){
  const out=[...logs];
  const groups=new Map();
  out.forEach(x=>{if(!groups.has(x.vehicleId))groups.set(x.vehicleId,[]);groups.get(x.vehicleId).push(x)});
  for(const items of groups.values()){
    items.sort((a,b)=>(+a.odometer)-(+b.odometer));
    items.forEach((x,i)=>Object.assign(x,derived(x,i?items[i-1]:null)));
  }
  return out;
}
