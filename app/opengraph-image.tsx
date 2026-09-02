import { ImageResponse } from "next/og";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() { return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 90, color: "#f4f2e9", background: "linear-gradient(135deg,#0d1118,#19313a)" }}><div style={{ fontSize: 34, letterSpacing: 8, fontWeight: 800, color: "#48ded8" }}>PIXELS GALAXY</div><div style={{ display: "flex", flexDirection: "column", fontSize: 92, lineHeight: .9, fontWeight: 900, marginTop: 40 }}><span>KU STRING</span><span>PAKISTAN</span></div><div style={{ marginTop: 40, color: "#d9ff57", fontSize: 28 }}>Blue • Green • Pink — PKR 1,999</div></div>, size); }
