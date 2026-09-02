import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [productImage, logo] = await Promise.all([
    readFile(path.join(process.cwd(), "public", "photos", "ku-string-bundle-hero.png")),
    readFile(path.join(process.cwd(), "public", "brand", "pixels-galaxy-icon.jpg")),
  ]);
  const productImageUrl = `data:image/png;base64,${productImage.toString("base64")}`;
  const logoUrl = `data:image/jpeg;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", overflow: "hidden", color: "#f4f2e9", background: "#07101b" }}>
      <img src={productImageUrl} alt="" width="1200" height="630" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(90deg,rgba(5,10,18,.98) 0%,rgba(5,10,18,.88) 40%,rgba(5,10,18,.18) 72%)" }} />
      <div style={{ position: "relative", width: 690, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "58px 0 58px 70px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img src={logoUrl} alt="" width="82" height="82" style={{ width: 82, height: 82, borderRadius: 18 }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#48ded8", fontSize: 30, fontWeight: 900, letterSpacing: 3 }}>PIXELS GALAXY</span>
            <span style={{ color: "#aab4bc", fontSize: 17, marginTop: 4 }}>PLAY BEYOND THE SCREEN</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 48, fontSize: 76, lineHeight: .92, fontWeight: 900, letterSpacing: -3 }}>
          <span>KU STRING</span>
          <span style={{ color: "#d9ff57" }}>IS HERE.</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 34, fontSize: 22, fontWeight: 700 }}>
          <span>BLUE</span><span style={{ color: "#48ded8" }}>•</span><span>GREEN</span><span style={{ color: "#48ded8" }}>•</span><span>PINK</span>
        </div>
        <div style={{ display: "flex", alignSelf: "flex-start", marginTop: 22, padding: "11px 17px", borderRadius: 8, color: "#07101b", background: "#d9ff57", fontSize: 17, fontWeight: 900 }}>
          CASH ON DELIVERY ACROSS PAKISTAN
        </div>
      </div>
    </div>,
    size,
  );
}
