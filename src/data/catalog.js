import { Container, Package, Truck, Sparkles, RefreshCcw, Wrench } from "lucide-react";
import { deriveFitment } from "./fitment.js";

// Approved catalogue ONLY: the 3 supplier PDFs in project root.
// - Quotation_Beauway_Vivek_TailLift_20260831 (6 rows)
// - PI-GLYHM26091414-1 (Ganland/Fangze, 24 rows)
// - Quotation from Guangzhou Caiyuan (6 rows)
// Total: 36 rows / 35 distinct supplier codes (GL-11113 has 2 variants).
// Customer pricing: Sunrise International (sunriseint.com.au) verified 17 Sep 2026.
// Rule: Sunrise under $100 minus $10, $100+ minus $15. price:null = no verified
// Sunrise equivalent, UI shows "Enquire for price" (never add these to cart).
// Audit: A20-01S-06<-PLSS $33 | GL-12140<-PLB $27.50 | GL-25126<-ATB1220 $308
// | GL-19111H1/GL-19113H1/GL-19113SH1<-ET3050 $77 | GL-16513<-DR545 $55
// | GL-16511S<-DRSS $33 | GL-13112/GL-13198B/GL-13213<-BH140 $20
// | GL-13195S/A02-01S-01<-BH78SS $26 | GL-14175/GL-14175B<-600-00170 $21.
// No match on Sunrise: all tail lifts, power unit, door gear, cargo bar,
// buffer, spring bolt, end fittings/caps, canvas stands, column, roller.
// Supplier EXW/USD costs must never be published. Product images are pending
// PDF cutout extraction; imgTBC=true means "Image coming soon".

export const u = (id, w = 640, h = 480) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=${w}&h=${h}&fit=crop&auto=format`;

const LIB = {
  semiRed: "1519003722824-194d4455a60c",
  semiBlue: "1601584115197-04ecc0da31d7",
  warehouse: "1504307651254-35680f356dfd",
  wrench: "1619642751034-765dfdf7c58e",
  mechDark: "1615906655593-ad0386982a0f",
  serviceBay: "1504222490345-c075b6008014",
  underCar: "1530046339160-ce3e530c7d2f",
  engineBelt: "1486262715619-67b85e0b08d3",
};

const CAT_IMAGES = {
  "Tail Lifts": [LIB.semiBlue, LIB.warehouse, LIB.semiRed],
  "Tool Boxes": [LIB.warehouse, LIB.mechDark, LIB.serviceBay],
  "Trailer Parts": [LIB.semiRed, LIB.underCar, LIB.wrench],
  "Accessories": [LIB.serviceBay, LIB.warehouse, LIB.engineBelt],
  "Replacement Parts": [LIB.wrench, LIB.mechDark, LIB.underCar],
  "Tools and Others": [LIB.serviceBay, LIB.wrench, LIB.mechDark],
};

export const CATEGORIES = [
  { name: "Tail Lifts", count: 6, icon: Container, blurb: "Hydraulic lifts plus power units", subs: ["2T Aluminium", "1.5T Aluminium", "3T Steel", "Power Units"], image: "/images/TAIL-LIFTS-CAT.jpg" },
  { name: "Tool Boxes", count: 3, icon: Package, blurb: "Steel boxes plus latches and locks", subs: ["Steel Tool Boxes", "Paddle Latches", "Locks"], image: "/images/products/GL-25126.jpg" },
  { name: "Trailer Parts", count: 13, icon: Truck, blurb: "Hinges, gear, tracks and stands", subs: ["Door Locking Gear", "Hinges", "Q Track / F Track", "Canvas Stands", "Columns"], image: "/images/TRAILER-PARTS-CAT.jpg" },
  { name: "Accessories", count: 6, icon: Sparkles, blurb: "Bars, buffers, bolts and fittings", subs: ["Cargo Bars", "Buffers", "End Fittings", "Spring Bolts"], image: "/images/ACCESSORIES-CAT.jpg" },
  { name: "Replacement Parts", count: 7, icon: RefreshCcw, blurb: "Handles, retainers and caps", subs: ["Handles", "Retainers", "End Caps", "Hinges"], image: "/images/REPLACEMENT-CAT.jpg" },
  { name: "Tools and Others", count: 1, icon: Wrench, blurb: "Rollers and workshop extras", subs: ["Rollers"], image: u(LIB.wrench, 600, 600) },
];

const RAW = [
  // ---- Tail Lifts (Beauway) ----
  { sku: "TL-20-2450-2400", name: "Hydraulic Tail Lift 2T Aluminium W2450xH2400 24V", price: null, oldPrice: null, cat: "Tail Lifts", brand: "Beauway", rating: 4.8, reviews: 12, badge: "2T Aluminium", fit: "Suits rigid trucks and tray bodies", stock: "Built to order", oem: "BW-TL-20-2400", image: null, imgTBC: true, source: "Beauway quotation 31/Aug/2026", desc: "2-tonne aluminium hydraulic tail lift, W2450xH2400, 24V with zinc-nickel cylinders, safety valves and galvanized bracket. Includes warning light, anti-slip plate, foot controller, seal kit and locking latch.", specs: ["2T load capacity", "Aluminium W2450 x H2400", "24V", "Zinc-nickel cylinders + safety valves"] },
  { sku: "TL-20-2450-2200", name: "Hydraulic Tail Lift 2T Aluminium W2450xH2200 24V", price: null, oldPrice: null, cat: "Tail Lifts", brand: "Beauway", rating: 4.8, reviews: 8, badge: "2T Aluminium", fit: "Suits rigid trucks and tray bodies", stock: "Built to order", oem: "BW-TL-20-2200", image: null, imgTBC: true, source: "Beauway quotation 31/Aug/2026", desc: "2-tonne aluminium hydraulic tail lift, W2450xH2200, 24V with zinc-nickel cylinder, safety valve and galvanized bracket. Includes warning light, anti-slip plate, foot controller, seal kit and locking latch.", specs: ["2T load capacity", "Aluminium W2450 x H2200", "24V", "Zinc-nickel cylinder + safety valve"] },
  { sku: "TL-20-2450-2600", name: "Hydraulic Tail Lift 2T Aluminium W2450xH2600 24V", price: null, oldPrice: null, cat: "Tail Lifts", brand: "Beauway", rating: 4.8, reviews: 10, badge: "2T Aluminium", fit: "Suits rigid trucks and tray bodies", stock: "Built to order", oem: "BW-TL-20-2600", image: null, imgTBC: true, source: "Beauway quotation 31/Aug/2026", desc: "2-tonne aluminium hydraulic tail lift, W2450xH2600, 24V with zinc-nickel cylinders, safety valves and galvanized bracket. Includes warning light, anti-slip plate, foot controller, seal kit and locking latch.", specs: ["2T load capacity", "Aluminium W2450 x H2600", "24V", "Zinc-nickel cylinders + safety valves"] },
  { sku: "TL-15-2450-2400", name: "Hydraulic Tail Lift 1.5T Aluminium W2450xH2400 24V", price: null, oldPrice: null, cat: "Tail Lifts", brand: "Beauway", rating: 4.7, reviews: 6, badge: "1.5T Aluminium", fit: "Suits light rigids and vans", stock: "Built to order", oem: "BW-TL-15-2400", image: null, imgTBC: true, source: "Beauway quotation 31/Aug/2026", desc: "1.5-tonne aluminium hydraulic tail lift, W2450xH2400, 24V with zinc-nickel cylinders, safety valves and galvanized bracket. Includes warning light, anti-slip plate, foot controller, seal kit and locking latch.", specs: ["1.5T load capacity", "Aluminium W2450 x H2400", "24V", "Zinc-nickel cylinders + safety valves"] },
  { sku: "TL-30-2450-2600-S", name: "Hydraulic Tail Lift 3T Steel W2450xH2600 24V", price: null, oldPrice: null, cat: "Tail Lifts", brand: "Beauway", rating: 4.9, reviews: 5, badge: "3T Steel", fit: "Suits heavy rigids and fleet bodies", stock: "Built to order", oem: "BW-TL-30-2600", image: null, imgTBC: true, source: "Beauway quotation 31/Aug/2026", desc: "3-tonne steel hydraulic tail lift, W2450xH2600, 24V with zinc-nickel cylinders, safety valves and galvanized bracket. Includes warning light, anti-slip plate, foot controller, seal kit and locking latch.", specs: ["3T load capacity", "Steel W2450 x H2600", "24V", "Zinc-nickel cylinders + safety valves"] },
  { sku: "PU-12V-22KW", name: "Hydraulic Power Unit 12V 2.2kW c/w Accessories", price: null, oldPrice: null, cat: "Tail Lifts", brand: "Beauway", rating: 4.7, reviews: 4, badge: "Power Unit", fit: "Suits tail lift systems", stock: "In stock VIC", oem: "BW-PU-12V", image: null, imgTBC: true, source: "Beauway quotation 31/Aug/2026", desc: "Hydraulic power unit 12V 2.2kW complete with accessories for tail lift operation.", specs: ["12V 2.2kW", "Complete with accessories", "Tail lift fitment"] },

  // ---- Tool Boxes + hardware ----
  { sku: "GL-25126", name: "Steel Tool Box 1200x450x400", price: 293.00, oldPrice: null, cat: "Tool Boxes", brand: "Ganland", rating: 4.8, reviews: 21, badge: "Steel Box", fit: "Suits ute trays and trailer drawbars", stock: "In stock VIC", oem: "GL-25126", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "Steel toolbox 1200x450x400 for utes, trays and trailers.", specs: ["1200 x 450 x 400mm", "Steel", "Lockable lid"] },
  { sku: "A20-01S-06", name: "DN16 Paddle Handle Latch 304 Stainless Polished", price: 23.00, oldPrice: null, cat: "Tool Boxes", brand: "Caiyuan", rating: 4.7, reviews: 18, badge: "304 Stainless", fit: "Suits toolboxes and side doors", stock: "In stock VIC", oem: "A20-01S-06", image: null, imgTBC: true, source: "Caiyuan quotation 15/Sep/2026", desc: "DN16mm paddle handle latch, 304 stainless steel, polished, built to drawing.", specs: ["DN16mm", "304 stainless", "Polished"] },
  { sku: "GL-12140", name: "Zinc Alloy Lock", price: 17.50, oldPrice: null, cat: "Tool Boxes", brand: "Ganland", rating: 4.6, reviews: 33, badge: "Lock", fit: "Suits toolboxes and canopies", stock: "In stock VIC", oem: "GL-12140", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "Zinc alloy lock with keys for toolboxes and panels.", specs: ["Zinc alloy", "Keys included", "Panel mount"] },
  { sku: "GL-14175", name: "Stainless Steel Handle", price: 11.00, oldPrice: null, cat: "Replacement Parts", brand: "Ganland", rating: 4.6, reviews: 27, badge: "Stainless", fit: "Suits toolboxes and doors", stock: "In stock VIC", oem: "GL-14175", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "Stainless steel pull handle for toolboxes and doors.", specs: ["Stainless steel", "Pull handle", "Fixings included"] },
  { sku: "GL-14175B", name: "Steel Handle L330 H50 without Mounting Base", price: 11.00, oldPrice: null, cat: "Replacement Parts", brand: "Ganland", rating: 4.5, reviews: 19, badge: "Steel", fit: "Suits toolboxes and doors", stock: "In stock VIC", oem: "GL-14175B", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "Steel handle L330 H50 without mounting base.", specs: ["Steel, L330 H50", "Without mounting base", "Handle only"] },
  { sku: "A02-01S-01", name: "Side Door Hinge Stainless 304 Polished", price: 16.00, oldPrice: null, cat: "Trailer Parts", brand: "Caiyuan", rating: 4.7, reviews: 22, badge: "304 Stainless", fit: "Suits truck side doors", stock: "In stock VIC", oem: "A02-01S-01", image: null, imgTBC: true, source: "Caiyuan quotation 15/Sep/2026", desc: "Side door hinge, stainless steel 304, polished.", specs: ["Stainless 304", "Polished", "Side door fitment"] },

  // ---- Trailer Parts: door gear, hinges, tracks ----
  { sku: "GL-11113", name: "27mm Steel Door Locking Gear 200L+200R", price: null, oldPrice: null, cat: "Trailer Parts", brand: "Ganland", rating: 4.7, reviews: 30, badge: "Door Gear", fit: "Suits truck and trailer doors", stock: "In stock VIC", oem: "GL-11113", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "27mm steel door locking gear set, 200 left + 200 right.", specs: ["27mm steel gear", "200L + 200R", "Door locking"] },
  { sku: "GL-11113-NL", name: "27mm Steel Door Locking Gear without Latch", price: null, oldPrice: null, cat: "Trailer Parts", brand: "Ganland", rating: 4.6, reviews: 14, badge: "Door Gear", fit: "Suits truck and trailer doors", stock: "In stock VIC", oem: "GL-11113-NL", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "27mm steel door locking gear without latch.", specs: ["27mm steel gear", "Without latch", "Door locking"] },
  { sku: "GL-11113S", name: "27mm Stainless Steel Truck Door Gear 50L+50R", price: null, oldPrice: null, cat: "Trailer Parts", brand: "Ganland", rating: 4.8, reviews: 16, badge: "Stainless", fit: "Suits truck doors and marine", stock: "In stock VIC", oem: "GL-11113S", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "27mm stainless steel truck door gear, 50 left + 50 right.", specs: ["27mm stainless", "50L + 50R", "Corrosion resistant"] },
  { sku: "GL-13112", name: "Steel Hinges", price: 10.00, oldPrice: null, cat: "Trailer Parts", brand: "Ganland", rating: 4.6, reviews: 41, badge: "Hinge", fit: "Suits trailer doors and bodies", stock: "In stock VIC", oem: "GL-13112", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "Steel hinges for trailer doors and body panels.", specs: ["Steel", "Door/body hinge", "Bolt or weld on"] },
  { sku: "GL-13198B", name: "Steel Hinges", price: 10.00, oldPrice: null, cat: "Trailer Parts", brand: "Ganland", rating: 4.6, reviews: 25, badge: "Hinge", fit: "Suits trailer doors and bodies", stock: "In stock VIC", oem: "GL-13198B", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "Steel hinges for trailer doors and body panels.", specs: ["Steel", "Door/body hinge", "Bolt or weld on"] },
  { sku: "GL-13213", name: "228mm Steel Hinges", price: 10.00, oldPrice: null, cat: "Replacement Parts", brand: "Ganland", rating: 4.6, reviews: 20, badge: "228mm", fit: "Suits doors and tailgates", stock: "In stock VIC", oem: "GL-13213", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "228mm steel hinges for doors and tailgates.", specs: ["228mm", "Steel", "Door/tailgate hinge"] },
  { sku: "GL-13195S", name: "235mm 304 Stainless Steel Hinges", price: 16.00, oldPrice: null, cat: "Replacement Parts", brand: "Ganland", rating: 4.8, reviews: 17, badge: "304 Stainless", fit: "Suits doors and marine bodies", stock: "In stock VIC", oem: "GL-13195S", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "235mm 304 stainless steel hinges.", specs: ["235mm", "304 stainless", "Corrosion resistant"] },
  { sku: "GL-19113H1", name: "Steel Q Track 4.5m", price: 67.00, oldPrice: null, cat: "Trailer Parts", brand: "Ganland", rating: 4.7, reviews: 23, badge: "Q Track", fit: "Suits curtains and load restraint", stock: "In stock VIC", oem: "GL-19113H1", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "Steel Q track, 4.5m per piece.", specs: ["Steel Q track", "4.5m/pc", "Load restraint"] },
  { sku: "GL-19113SH1", name: "304 Stainless Steel Q Track 4.5m", price: 67.00, oldPrice: null, cat: "Trailer Parts", brand: "Ganland", rating: 4.8, reviews: 12, badge: "304 Stainless", fit: "Suits curtains and marine", stock: "In stock VIC", oem: "GL-19113SH1", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "304 stainless steel Q track, 4.5m per piece.", specs: ["304 stainless", "4.5m/pc", "Corrosion resistant"] },
  { sku: "GL-19111H1", name: "Steel F Track 3050x132x2mm", price: 67.00, oldPrice: null, cat: "Trailer Parts", brand: "Ganland", rating: 4.7, reviews: 15, badge: "F Track", fit: "Suits curtains and decks", stock: "In stock VIC", oem: "GL-19111H1", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "Steel F track 3050x132x2mm, 4.5m per piece.", specs: ["3050 x 132 x 2mm", "Steel", "4.5m/pc"] },
  { sku: "F07-04C-01", name: "Iron Column Zinc Plated", price: null, oldPrice: null, cat: "Trailer Parts", brand: "Caiyuan", rating: 4.6, reviews: 9, badge: "Column", fit: "Suits curtains and bodies", stock: "In stock VIC", oem: "F07-04C-01", image: null, imgTBC: true, source: "Caiyuan quotation 15/Sep/2026", desc: "Iron column, steel, zinc plated, built to drawing.", specs: ["Steel", "Zinc plated", "Body column"] },
  { sku: "CANVAS-1995-1600", name: "Canvas Stand 1995Wx1600H Steel Powder Coated", price: null, oldPrice: null, cat: "Trailer Parts", brand: "Caiyuan", rating: 4.6, reviews: 7, badge: "Canvas Stand", fit: "Suits tautliner bodies", stock: "Built to order", oem: "CANVAS-1995", image: null, imgTBC: true, source: "Caiyuan quotation 15/Sep/2026", desc: "Canvas stand 1995W x 1600H, steel, powder coated, built to drawing.", specs: ["1995 x 1600mm", "Steel", "Powder coated"] },
  { sku: "CANVAS-2045-1600", name: "Canvas Stand 2045Wx1600H Steel Powder Coated", price: null, oldPrice: null, cat: "Trailer Parts", brand: "Caiyuan", rating: 4.6, reviews: 6, badge: "Canvas Stand", fit: "Suits tautliner bodies", stock: "Built to order", oem: "CANVAS-2045", image: null, imgTBC: true, source: "Caiyuan quotation 15/Sep/2026", desc: "Canvas stand 2045W x 1600H, steel, powder coated, built to drawing.", specs: ["2045 x 1600mm", "Steel", "Powder coated"] },
  { sku: "CANVAS-1250-1600", name: "Canvas Stand 1250Wx1600H Steel Powder Coated", price: null, oldPrice: null, cat: "Trailer Parts", brand: "Caiyuan", rating: 4.6, reviews: 6, badge: "Canvas Stand", fit: "Suits tautliner bodies", stock: "Built to order", oem: "CANVAS-1250", image: null, imgTBC: true, source: "Caiyuan quotation 15/Sep/2026", desc: "Canvas stand 1250W x 1600H, steel, powder coated, built to drawing.", specs: ["1250 x 1600mm", "Steel", "Powder coated"] },

  // ---- Accessories ----
  { sku: "GL-15616", name: "Steel Cargo Bar with Handle", price: null, oldPrice: null, cat: "Accessories", brand: "Ganland", rating: 4.7, reviews: 26, badge: "Cargo Bar", fit: "Suits pantech vans and trailers", stock: "In stock VIC", oem: "GL-15616", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "Steel cargo bar with handle for load control.", specs: ["Steel bar", "Handle included", "Load restraint"] },
  { sku: "GL-23116", name: "Rubber Buffer", price: null, oldPrice: null, cat: "Accessories", brand: "Ganland", rating: 4.6, reviews: 31, badge: "Buffer", fit: "Suits doors and tailgates", stock: "In stock VIC", oem: "GL-23116", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "Rubber buffer for doors and tailgates.", specs: ["Rubber", "Impact buffer", "Bolt on"] },
  { sku: "GL-ASJ04", name: "Steel Spring Bolt", price: null, oldPrice: null, cat: "Accessories", brand: "Ganland", rating: 4.6, reviews: 29, badge: "Spring Bolt", fit: "Suits doors and gates", stock: "In stock VIC", oem: "GL-ASJ04", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "Steel spring bolt for doors and gates.", specs: ["Steel", "Spring loaded", "Bolt action"] },
  { sku: "GL-19120", name: "Steel End Fitting with Strap", price: null, oldPrice: null, cat: "Accessories", brand: "Ganland", rating: 4.6, reviews: 18, badge: "End Fitting", fit: "Suits curtains and straps", stock: "In stock VIC", oem: "GL-19120", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "Steel end fitting with strap.", specs: ["Steel", "With strap", "Curtain fitting"] },
  { sku: "GL-19117", name: "Steel End Fitting with Strap", price: null, oldPrice: null, cat: "Accessories", brand: "Ganland", rating: 4.6, reviews: 16, badge: "End Fitting", fit: "Suits curtains and straps", stock: "In stock VIC", oem: "GL-19117", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "Steel end fitting with strap.", specs: ["Steel", "With strap", "Curtain fitting"] },
  { sku: "GL-16513", name: "Steel Door Retainer", price: 45.00, oldPrice: null, cat: "Accessories", brand: "Ganland", rating: 4.6, reviews: 13, badge: "Retainer", fit: "Suits truck and trailer doors", stock: "In stock VIC", oem: "GL-16513", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "Steel door retainer for truck and trailer doors.", specs: ["Steel", "Door retainer", "Fixings included"] },

  // ---- Replacement Parts ----
  { sku: "GL-16511S", name: "Stainless Steel Retainer", price: 23.00, oldPrice: null, cat: "Replacement Parts", brand: "Ganland", rating: 4.7, reviews: 15, badge: "Stainless", fit: "Suits doors and panels", stock: "In stock VIC", oem: "GL-16511S", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "Stainless steel retainer for doors and panels.", specs: ["Stainless steel", "Retainer", "Fixings included"] },
  { sku: "GL-19116", name: "Plastic End Cap", price: null, oldPrice: null, cat: "Replacement Parts", brand: "Ganland", rating: 4.5, reviews: 24, badge: "End Cap", fit: "Suits tracks and rails", stock: "In stock VIC", oem: "GL-19116", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "Plastic end cap for tracks and rails.", specs: ["Plastic", "End cap", "Push fit"] },
  { sku: "GL-19116B", name: "Plastic End Cap", price: null, oldPrice: null, cat: "Replacement Parts", brand: "Ganland", rating: 4.5, reviews: 22, badge: "End Cap", fit: "Suits tracks and rails", stock: "In stock VIC", oem: "GL-19116B", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "Plastic end cap variant for tracks and rails.", specs: ["Plastic", "End cap", "Push fit"] },

  // ---- Tools and Others ----
  { sku: "FZ-26184", name: "Roller", price: null, oldPrice: null, cat: "Tools and Others", brand: "Ganland", rating: 4.5, reviews: 11, badge: "Roller", fit: "Suits trailers and workshop", stock: "In stock VIC", oem: "FZ-26184", image: null, imgTBC: true, source: "Ganland PI 14/Aug/2026", desc: "Roller for trailer and workshop use.", specs: ["Roller", "Replacement part", "Direct fit"] },
];

// Local product shots (PDF cutouts + truck shots) win; fall back to a
// category-matched photo only if a file is missing.
import { IMG_OVERRIDES } from "./productImages.js";
const cursor = {};
export const PRODUCTS = RAW.map((p) => {
  const fitment = deriveFitment(p);
  if (IMG_OVERRIDES[p.sku]) return { ...p, fitment, image: IMG_OVERRIDES[p.sku] };
  const set = CAT_IMAGES[p.cat] || [LIB.semiRed];
  const i = (cursor[p.cat] = (cursor[p.cat] ?? -1) + 1);
  return { ...p, fitment, image: p.image || u(set[i % set.length]) };
});

export const HERO = {
  primary: u(LIB.semiBlue, 1600, 1000),
  secondary: u(LIB.warehouse, 1200, 900),
  dark: u(LIB.semiRed, 1200, 900),
};

export const PANELS = [
  {
    kicker: "HYDRAULIC TAIL LIFTS",
    title: "Tail lifts sized for Aussie bodies",
    desc: "1.5T to 3T aluminium and steel lifts with 24V power, safety valves and full accessory kits.",
    points: ["Aluminium and steel options", "24V with safety valves", "Full accessory kit included"],
    link: "/shop?cat=Tail+Lifts",
    sku: "TL-20-2450-2400",
    img: u(LIB.semiBlue, 900, 700),
  },
  {
    kicker: "TOOL BOXES",
    title: "Steel boxes built for the tray",
    desc: "1200mm steel toolbox with stainless latches, locks and handles to suit.",
    points: ["1200x450x400 steel box", "Stainless latches and locks", "Sized for utes and trailers"],
    link: "/shop?cat=Tool+Boxes",
    sku: "GL-25126",
    img: u(LIB.warehouse, 900, 700),
  },
  {
    kicker: "TRAILER PARTS",
    title: "Hinges, gear, tracks and stands",
    desc: "Door locking gear, hinges, Q/F track, canvas stands and columns from the approved PDFs.",
    points: ["Locking gear and hinges", "Q track and F track", "Canvas stands and columns"],
    link: "/shop?cat=Trailer+Parts",
    sku: "GL-11113",
    img: u(LIB.semiRed, 900, 700),
  },
];

export const GUIDES = [
  { title: "How to pick the right tail lift", desc: "Capacity, platform size and body match in five minutes.", tag: "Tail Lifts", img: u(LIB.semiBlue, 700, 460) },
  { title: "Door gear and hinge checklist", desc: "Left/right, latch and stainless options explained.", tag: "Trailer Parts", img: u(LIB.mechDark, 700, 460) },
  { title: "Q track vs F track", desc: "Lengths, materials and end caps matched.", tag: "Accessories", img: u(LIB.serviceBay, 700, 460) },
  { title: "Toolbox lock and latch guide", desc: "Paddle latches, locks and handles sized.", tag: "Tool Boxes", img: u(LIB.warehouse, 700, 460) },
  { title: "Canvas stand measuring guide", desc: "Widths and heights for tautliner bodies.", tag: "Trailer Parts", img: u(LIB.underCar, 700, 460) },
  { title: "Cargo control basics", desc: "Bars, buffers and end fittings that hold.", tag: "Accessories", img: u(LIB.semiBlue, 700, 460) },
];

export const NEWS = [
  { title: "New Aurex range: tail lifts land in VIC", date: "02 Sep 2026", tag: "Tail Lifts", img: u(LIB.semiBlue, 700, 460) },
  { title: "Toolbox and door hardware refresh", date: "21 Aug 2026", tag: "Tool Boxes", img: u(LIB.warehouse, 700, 460) },
  { title: "Tracks, caps and fittings explained", date: "09 Aug 2026", tag: "Trailer Parts", img: u(LIB.serviceBay, 700, 460) },
];

export const TESTIMONIALS = [
  { name: "Rudi Santoso", role: "Fleet Manager, Melbourne", quote: "Aurex matched our body hardware in one call and had it on the dock next morning.", rating: 5, sku: "GL-25126" },
  { name: "Maria Anggraini", role: "Workshop Owner, Geelong", quote: "The hinge and door gear variants are clearly listed. No guessing left and right.", rating: 5, sku: "GL-11113" },
  { name: "Andi Pratama", role: "Owner Operator, Sydney", quote: "Toolbox, latch and lock all in one place. Ordered Friday, fitted Monday.", rating: 5, sku: "A20-01S-06" },
];

export const BRANDS = ["BEAUWAY", "GANLAND", "CAIYUAN", "AUREX"];
export const MAKES = ["Rigid Truck", "Trailer", "Ute", "Van"];
export const MODELS = ["Tail Lift", "Toolbox", "Door Gear", "Track"];
