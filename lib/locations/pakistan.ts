export const pakistanProvinces = [
  { code: "punjab", name: "Punjab", cities: ["Lahore", "Rawalpindi", "Faisalabad", "Multan", "Gujranwala", "Sialkot", "Bahawalpur", "Sargodha", "Sheikhupura", "Gujrat", "Jhelum", "Sahiwal", "Kasur", "Rahim Yar Khan", "Dera Ghazi Khan", "Other city"] },
  { code: "sindh", name: "Sindh", cities: ["Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah", "Mirpur Khas", "Thatta", "Jacobabad", "Khairpur", "Other city"] },
  { code: "khyber-pakhtunkhwa", name: "Khyber Pakhtunkhwa", cities: ["Peshawar", "Abbottabad", "Mardan", "Swat", "Mingora", "Nowshera", "Kohat", "Dera Ismail Khan", "Mansehra", "Haripur", "Other city"] },
  { code: "balochistan", name: "Balochistan", cities: ["Quetta", "Gwadar", "Turbat", "Khuzdar", "Chaman", "Sibi", "Zhob", "Hub", "Other city"] },
  { code: "islamabad", name: "Islamabad Capital Territory", cities: ["Islamabad", "Other city"] },
  { code: "gilgit-baltistan", name: "Gilgit-Baltistan", cities: ["Gilgit", "Skardu", "Hunza", "Chilas", "Khaplu", "Other city"] },
  { code: "azad-kashmir", name: "Azad Jammu and Kashmir", cities: ["Muzaffarabad", "Mirpur", "Kotli", "Rawalakot", "Bagh", "Bhimber", "Other city"] },
] as const;

export type ProvinceCode = (typeof pakistanProvinces)[number]["code"];
export type PakistanProvince = (typeof pakistanProvinces)[number];

export function isProvinceCode(value: string): value is ProvinceCode {
  return pakistanProvinces.some((province) => province.code === value);
}

export function citiesForProvince(code: ProvinceCode | ""): readonly string[] {
  return pakistanProvinces.find((province) => province.code === code)?.cities ?? [];
}

export function provinceNameForCode(code: ProvinceCode): string {
  return pakistanProvinces.find((province) => province.code === code)?.name ?? code;
}
