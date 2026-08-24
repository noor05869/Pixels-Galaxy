import { ImageResponse } from "next/og";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() { return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 90, color: "white", background: "linear-gradient(135deg,#124ea3,#28c7e8)" }}><div style={{ fontSize: 34, letterSpacing: 8, fontWeight: 800 }}>PIXELS GALAXY</div><div style={{ display: "flex", flexDirection: "column", fontSize: 92, lineHeight: .9, fontWeight: 900, marginTop: 40 }}><span>PLAY BEYOND</span><span>THE SCREEN.</span></div><div style={{ marginTop: 40, color: "#14f1a1", fontSize: 28 }}>Wonder is waiting.</div></div>, size); }
