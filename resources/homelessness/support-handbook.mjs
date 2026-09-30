import {sourceCatalog,services} from './support-catalog.mjs';
export const handbookRegions={darwin:'Greater Darwin / Palmerston (check catchment)',katherine:'Katherine / Big Rivers (check catchment)',alice:'Alice Springs',tennant:'Tennant Creek / Barkly',arnhem:'East Arnhem / Nhulunbuy (check community)',topend:'Other Top End / remote community',central:'Other Central Australia / remote community',npy:'NPY lands / border communities',unsure:'Not sure / anywhere in the NT'};
export const handbookNeeds=sourceCatalog.needs.map(n=>({id:n.need_id,title:n.title,summary:n.recognise}));
export const catalogueMetadata={version:sourceCatalog.version,handbookVersion:sourceCatalog.handbook_handoff.version,verifiedDate:sourceCatalog.checked_date,records:sourceCatalog.services.length,canonicalRecords:77,supplementalRecords:3,needs:handbookNeeds.length,sourceSha256:sourceCatalog.handbook_handoff.sha256,scope:'77 completed handbook records plus 3 retained reviewed web routes. Published information only; no live beds, appointments or acceptance confirmed.'};
export const handbookDirectory=sourceCatalog.services.map(raw=>({
 ...services[raw.service_id],
 regions:Object.entries(handbookRegions).map(([region,label])=>({region,label,service_available:raw.regions.includes(region)||raw.regions.includes('nt-wide'),channels:[...new Set((raw.contact_options||[]).filter(o=>!o.regions?.length||o.regions.includes(region)).map(o=>o.type))],access_notes:raw.boundary_note||raw.service_scope,local_delivery_confirmed:false})).filter(r=>r.service_available),
 originalScope:raw.regions_original,availabilityStatus:raw.availability_status
}));
export const handbookLinks=Object.fromEntries(handbookDirectory.map(record=>[record.id,[record.id]]));
export const handbookRouteAdditions={};
