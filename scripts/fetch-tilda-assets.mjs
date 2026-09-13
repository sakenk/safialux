// Скачивает логотип, фото и логотипы брендов с текущего сайта SanLux на Tilda в public/.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const CDN = "https://static.tildacdn.ink";
const ASSETS = {
  "brand/sanlux-logo.png": "tild3337-3533-4633-b366-363439643839/sanlux_logo.png",
  "photos/vanny.jpg": "tild6562-6335-4133-a531-623934646566/_2.jpg",
  "photos/rakoviny.jpeg": "tild3337-3832-4033-b739-343734363163/photo.jpeg",
  "photos/unitazy.jpg": "tild6634-3037-4366-b931-396166613862/_Grohe.jpg",
  "photos/interior.jpg": "tild3965-6233-4130-b561-396462323962/kymks6w5a0wfu3gr3i4b.jpg",
  "photos/showroom-1.jpg": "tild3561-3132-4730-b863-366234623731/phone.jpg",
  "photos/showroom-2.jpg": "tild6136-6333-4131-b261-366163326634/phone.jpg",
  "photos/showroom-3.jpg": "tild3064-3064-4632-b236-343966343631/phone-block6.jpg",
  "brands/grohe.png": "tild6161-3232-4435-b430-663737613836/grohe.png",
  "brands/gappo.jpeg": "tild3030-3730-4364-a631-613566303634/gappo.jpeg",
  "brands/saniteco.png": "tild6232-6438-4439-b830-343535613133/saniteco.png",
  "brands/triton.png": "tild3137-3533-4465-a433-326634633863/triton.png",
  "brands/cersanit.png": "tild3865-3938-4133-a663-393839323838/cersanit.png",
  "brands/ampm.png": "tild6631-3762-4661-b738-653561386465/ampm.png",
  "brands/lusso.png": "tild6239-6534-4130-b935-306138636231/lusso.png",
  "brands/santek.png": "tild6232-6338-4638-b461-346138326232/santek1.png",
  "brands/1marka.png": "tild6236-6537-4038-b862-313830396665/1marka.png",
  "brands/santehprom.png": "tild3936-3934-4639-a537-376638393736/santehprom.png",
  "brands/frap.jpeg": "tild6336-6661-4539-a537-613664613234/frap.jpeg",
  "brands/sanita-luxe.jpg": "tild6661-6438-4531-b731-623162353466/sanita_luxe.jpg",
};

for (const [dest, src] of Object.entries(ASSETS)) {
  const res = await fetch(`${CDN}/${src}`);
  if (!res.ok) {
    console.error(`✗ ${dest}: HTTP ${res.status}`);
    continue;
  }
  const file = path.join("public", dest);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
  console.log(`✓ ${dest}`);
}
