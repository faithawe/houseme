import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("public/images");

const files = [
  ["hero/living-room.jpg", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2400&q=80"],
  ["about/apartment-interior.jpg", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"],
  ["about/modern-living.jpg", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"],
  ["about/kitchen.jpg", "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80"],
  ["about/cityscape.jpg", "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80"],
  ["listings/lekki-1.jpg", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80"],
  ["listings/lekki-2.jpg", "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80"],
  ["listings/lekki-3.jpg", "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1600&q=80"],
  ["listings/yaba-1.jpg", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80"],
  ["listings/yaba-2.jpg", "https://images.unsplash.com/photo-1560185893-a55cbc8c57bb?auto=format&fit=crop&w=1600&q=80"],
  ["listings/yaba-3.jpg", "https://images.unsplash.com/photo-1586023492124-a2d3baf319fb?auto=format&fit=crop&w=1600&q=80"],
  ["listings/abuja-1.jpg", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80"],
  ["listings/abuja-2.jpg", "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80"],
  ["listings/abuja-3.jpg", "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80"],
  ["listings/jos-1.jpg", "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80"],
  ["listings/jos-2.jpg", "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=80"],
  ["listings/jos-3.jpg", "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80"],
  ["listings/ibadan-1.jpg", "https://images.unsplash.com/photo-1631679706909-1844bbd8720d?auto=format&fit=crop&w=1600&q=80"],
  ["listings/ibadan-2.jpg", "https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=1600&q=80"],
  ["listings/ibadan-3.jpg", "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1600&q=80"],
  ["listings/ph-1.jpg", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80"],
  ["listings/ph-2.jpg", "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80"],
  ["listings/ph-3.jpg", "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80"],
  ["listings/kano-1.jpg", "https://images.unsplash.com/photo-1560185893-a55cbc8c57bb?auto=format&fit=crop&w=1600&q=80"],
  ["listings/kano-2.jpg", "https://images.unsplash.com/photo-1505691938895-1758d7a238f1?auto=format&fit=crop&w=1600&q=80"],
  ["listings/kano-3.jpg", "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=80"],
  ["listings/enugu-1.jpg", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"],
  ["listings/enugu-2.jpg", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80"],
  ["listings/enugu-3.jpg", "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80"],
  ["listings/kaduna-1.jpg", "https://images.unsplash.com/photo-1568605114967-8130f3cd7467?auto=format&fit=crop&w=1600&q=80"],
  ["listings/kaduna-2.jpg", "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=80"],
  ["listings/kaduna-3.jpg", "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80"],
  ["avatars/avatar-1.jpg", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80"],
  ["avatars/avatar-2.jpg", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80"],
  ["avatars/avatar-3.jpg", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80"],
  ["avatars/avatar-4.jpg", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80"],
  ["avatars/avatar-5.jpg", "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80"],
];

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

let ok = 0;
let fail = 0;

for (const [rel, url] of files) {
  const dest = path.join(root, rel);
  await mkdir(path.dirname(dest), { recursive: true });
  if (await exists(dest)) {
    console.log(`SKIP ${rel}`);
    ok += 1;
    continue;
  }
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "HouseMeImageFetch/1.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1000) throw new Error(`too small (${buf.length})`);
    await writeFile(dest, buf);
    console.log(`OK ${rel} (${buf.length})`);
    ok += 1;
  } catch (err) {
    console.error(`FAIL ${rel}: ${err.message}`);
    fail += 1;
  }
}

console.log(`DONE ok=${ok} fail=${fail}`);
if (fail > 0) process.exitCode = 1;
