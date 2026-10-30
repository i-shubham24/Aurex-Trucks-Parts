/* Landing-page copy for categories and sub-categories (/shop/:category/:type).
   Facts come from the catalogue (product names, sizes and fitment notes), the counter FAQ and, for signage,
   the NHVR's VSB 12. Don't add certification or compliance claims here without a document to back them.
   Plain JS: imported by the app, src/seo/meta.js and scripts/prerender.js. */

/* URL slug for a sub-category name, e.g. "Safety Signage & Marker Plates" -> "safety-signage-marker-plates".
   Keep in step with subSlug() in truck-parts-api/src/controllers/sitemapController.js. */
export const subSlug = (name) =>
  String(name || "").toLowerCase().replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/* Homepage H1 and overview section; "{address}" is replaced with the trade counter address. */
export const HOME_CONTENT = {
  h1: "Truck & trailer parts, tail lifts and body hardware · Campbellfield, Melbourne",
  heading: "Truck and trailer parts from Campbellfield, shipped Australia-wide",
  paragraphs: [
    "Aurex supplies fleets, body builders and workshops with hydraulic tail lifts, trailer and truck body hardware and heavy vehicle signage. The range covers door gear and cam locks, hinges, paddle locks, door seals, cargo tracks and restraint fittings, curtainsider and tipper hardware, side guards, aluminium body profiles, composite body panels, and Class 1 reflective rear marking plates.",
    "Stocked lines ship from our trade counter at {address}. Order by 2pm for same-day dispatch. VIC metro is overnight, Sydney, Brisbane and Adelaide take 1 to 2 business days, and Perth and regional areas take 2 to 5. ABN workshops and fleets can open a trade account, and tail lifts are quoted to suit your chassis.",
  ],
  // [label, path, part number whose photo the homepage tile shows]; links without a photo render as buttons.
  links: [
    ["Door gear & cam locks", "/shop/trailer-parts/door-gear", "ATP-TP-01"],
    ["Hinges", "/shop/trailer-parts/hinges", "ATP-TP-04"],
    ["Door hardware", "/shop/trailer-parts/door-hardware", "ATP-TP-65"],
    ["Door seals", "/shop/trailer-parts/door-seals", "ATP-TP-34"],
    ["Cargo tracks", "/shop/trailer-parts/tracks", "ATP-TP-54"],
    ["Tipper hardware", "/shop/trailer-parts/tipper-hardware", "ATP-TP-106"],
    ["Side guards", "/shop/trailer-parts/side-guards", "ATP-TP-83"],
    ["Corner caps", "/shop/trailer-parts/corner-caps", "ATP-TP-96"],
    ["Tool boxes & accessories", "/shop/accessories", "ATP-ACC-02"],
    ["FRP honeycomb panels", "/shop/accessories/frp-honeycomb-panels", "ATP-ACC-06"],
    ["Tail lifts", "/shop/tail-lifts", "ATP-TL-02"],
    ["Rear marking plates", "/shop/trailer-parts/safety-signage-marker-plates", "ATP-TP-109"],
    ["Guides", "/guides"],
  ],
};

export const CATEGORY_NAMES = {
  "tail-lifts": "Tail Lifts",
  "trailer-parts": "Trailer Parts",
  accessories: "Accessories",
};

export const CATEGORY_CONTENT = {
  "tail-lifts": {
    heading: "Choosing a tail lift",
    notes: [
      "Our hydraulic cantilever tail lifts come in three capacities: 1.5 tonne aluminium, 2 tonne aluminium and 3 tonne steel. All run on 24V and have 2450mm-wide platforms, with depths of 2200, 2400 or 2600mm depending on the model. A 12V 2.2kW hydraulic power unit is also listed for tail lift systems.",
      "As a rule of thumb from the counter: 1.5T aluminium suits vans and light rigids, 2T aluminium suits most rigid trucks and tray bodies, and 3T steel suits heavy rigids and heavy pallet work.",
      "Tail lifts are quoted rather than sold off the shelf, because each one is matched to the chassis, platform size, voltage and mounting brackets. Send your chassis model, rear overhang, bed height, body type and the heaviest load you lift, and we confirm the fit before quoting.",
    ],
    faqs: [
      { q: "What does a tail lift's capacity rating mean?", a: "The rated capacity applies with the load's centre of gravity at a stated distance from the body, called the load centre. A load sitting further out on the platform puts more strain on the lift, so check the load centre in the specification and keep heavy loads close to the body." },
      { q: "Why are tail lifts quote-only?", a: "Each lift has to be matched to your chassis, platform dimensions, voltage and mounting brackets. Submit a tail lift enquiry or call the counter and we confirm the fit before quoting." },
      { q: "Do you sell tail lift power units separately?", a: "Yes. A 12V 2.2kW hydraulic power unit with accessories is listed in this category. Check your lift's voltage and hydraulic requirements with the counter before ordering." },
    ],
    guides: ["choosing-a-tail-lift"],
  },
  "trailer-parts": {
    heading: "Trailer and truck body parts",
    notes: [
      "Hardware for building and repairing truck and trailer bodies: door gear and cam locks, hinges, door retainers, paddle locks, door seals, cargo tracks and restraint fittings, curtainsider gear, tipper hardware, side guards, aluminium body profiles and corner caps, plus rear marking plates and heavy vehicle signs.",
      "Most lines are stocked at our Campbellfield trade counter. Matching a replacement is easiest with measurements of the old part and a photo, so send both if you're unsure.",
    ],
    faqs: [
      { q: "Do you offer trade pricing?", a: "Yes. ABN workshops save 5 percent with priority quotes, and fleets with 5 or more vehicles save 10 percent with 30-day terms. Volume breaks apply over 5 units." },
      { q: "Can I collect from Campbellfield?", a: "Yes. Click and Collect from our Campbellfield trade counter is free, with a 4-hour turnaround." },
    ],
    guides: ["truck-trailer-door-hardware", "rear-marking-plates-vsb12"],
  },
  accessories: {
    heading: "Body panels and fleet accessories",
    notes: [
      "Composite panels for truck and van bodies (FRP honeycomb, FRP plywood and XPS insulated panels) alongside rubber buffers, chrome wheel nut covers and a steel tool box.",
      "Panels are quoted to order. Send the body dimensions and use (dry freight, heavy-duty doors or refrigerated) and the counter will recommend the panel and sizes.",
    ],
    faqs: [
      { q: "Which panel suits a refrigerated body?", a: "The XPS insulated composite panels, which have a closed-cell extruded polystyrene foam core between FRP skins, are listed for refrigerated van bodies, chiller boxes and temperature-controlled transport." },
      { q: "Honeycomb or plywood-core panels?", a: "FRP honeycomb panels are chosen to save weight. FRP plywood panels have a solid plywood core, listed for heavy-duty doors where hinges, latches and keepers need maximum screw holding." },
    ],
    guides: ["frp-honeycomb-vs-plywood-vs-xps-panels"],
  },
};

/* Keyed by "<category>/<sub slug>". `name` must match the product `sub` value exactly. */
export const SUB_CONTENT = {
  "trailer-parts/safety-signage-marker-plates": {
    name: "Safety Signage & Marker Plates",
    title: "Rear Marking Plates & Heavy Vehicle Signs",
    description: "Class 1 reflective rear marking plates (Cat 33, 34A/B, 41A/B, 615A/B) and DO NOT OVERTAKE TURNING VEHICLE signs, in aluminium or self-adhesive.",
    intro: "Class 1 reflective rear marking plates, zebra strip plates and DO NOT OVERTAKE TURNING VEHICLE signs for trucks and trailers, in rigid aluminium or self-adhesive versions. Also LONG VEHICLE, ROAD TRAIN, OVERSIZE and dangerous goods signs.",
    notes: [
      "Under the NHVR's Vehicle Standards Bulletin 12 (VSB 12), rear marking plates must be fitted to motor vehicles over 12 tonnes GVM and trailers over 10 tonnes GTM. Plates are named by category, which describes their size: Category 33 is a 300 × 300mm symbol plate, 34A/34B are 300 × 400mm plates that add the DO NOT OVERTAKE TURNING VEHICLE legend, 41A/41B are 400 × 100mm strips, and 615A/615B are 600 × 150mm strips for vehicles with a fifth wheel at the rear, such as prime movers.",
      "Aluminium plates suit flat, rigid surfaces. VSB 12 recommends self-adhesive plates for curved surfaces rather than bending a plate. Don't mix reflective material classes on one vehicle.",
    ],
    faqs: [
      { q: "Which vehicles need rear marking plates?", a: "VSB 12 requires them on motor vehicles over 12 tonnes GVM, trailers over 10 tonnes GTM, and buses over 12 tonnes GVM (except urban route buses fitted for standing passengers). Lighter vehicles may fit them voluntarily." },
      { q: "When is a DO NOT OVERTAKE TURNING VEHICLE sign required?", a: "VSB 12 says vehicles or combinations 7.5m or longer that have to straddle lanes or turn from an adjacent lane at intersections must display the message, and vehicles shorter than 7.5m must not. The obligation itself comes from the road rules in each state." },
      { q: "Can I use self-adhesive plates instead of aluminium?", a: "Yes. VSB 12 covers pressure-sensitive (self-adhesive) plates and recommends them for curved surfaces. Whichever you choose, use the same reflective material class on all plates on the vehicle." },
    ],
    guides: ["rear-marking-plates-vsb12"],
  },
  "trailer-parts/door-hardware": {
    name: "Door Hardware",
    title: "Truck & Trailer Door Hardware",
    description: "Door retainers, hold-back catches, paddle locks, strap hinges, grab handles and seal corner tabs for pantechs, vans, curtainsiders and toolboxes.",
    intro: "Door retainers and hold-back catches, paddle locks and flush paddle handles, strap hinges, grab handles and door seal corner tabs for pantechs, refrigerated vans, curtainsiders, toolboxes and service bodies.",
    notes: [
      "A door retainer holds an open door against the body so it can't swing while you load. They come in several arm lengths and finishes, from zinc-plated steel for general freight bodies to stainless steel for refrigerated vans and wash-down bodies.",
      "Paddle locks and flush paddle handles suit toolboxes, canopies and side doors. For rear doors locked by vertical bars, see Door Gear.",
    ],
    faqs: [
      { q: "Stainless steel or zinc-plated?", a: "Stainless steel (304) suits refrigerated, food and wash-down bodies, where corrosion is the main risk. Zinc-plated steel suits general freight bodies and costs less." },
      { q: "How do I match a replacement part?", a: "Measure the old part (overall length, hole centres and arm length for retainers) and send the measurements with a photo to the counter. We'll match it before dispatch." },
    ],
    guides: ["truck-trailer-door-hardware"],
  },
  "trailer-parts/tipper-hardware": {
    name: "Tipper Hardware",
    title: "Tipper Body Hardware & Tailgate Hinges",
    description: "3-way tailgate hinge kits (30, 40, 50mm), tipper hinges with gudgeons, tailgate lock bolts, grain locks, alloy grain doors and tipper ladders.",
    intro: "3-way tailgate hinge kits in 30, 40 and 50mm, tipper hinges with gudgeons, tailgate lock bolts, an aluminium grain lock and alloy grain door, plus slide-out and fixed ladders for tipper bodies.",
    notes: [
      "3-way tailgate hinge kits let a tailgate open more than one way, including swinging to the side. The kit size sets the duty: 30mm suits 2-way and 3-way tipping tailgates, 40mm heavy commercial tailgates, and 50mm severe-duty rock and bulk bodies.",
      "The 400mm alloy grain door and the 25mm grain lock fit tailgate cut-outs on grain tippers and trailers, for controlled unloading.",
    ],
    faqs: [
      { q: "Which hinge kit size do I need?", a: "Match the size to your tailgate's duty and the existing hinge pins: 30mm for standard tipping tailgates, 40mm for heavy commercial tailgates, 50mm for severe-duty rock and bulk bodies. Send measurements if you're replacing an existing kit." },
      { q: "Do you have ladders for tipper bodies?", a: "Yes. A 7-step aluminium tipper ladder, and 2-step and 3-step zinc-plated slide-out ladders that mount under the chassis." },
    ],
    guides: [],
  },
  "trailer-parts/side-guards": {
    name: "Side Guards",
    title: "Truck & Trailer Side Guards",
    description: "Aluminium side guard systems (3500mm and 6500mm pairs), 6.5m profile tube, adjustable brackets, rail caps, corner covers and 90° connectors.",
    intro: "Aluminium side guard systems in 3500mm and 6500mm pairs, plus 6.5m profile tube, adjustable 735mm rail brackets, rail end caps, corner covers and 90° connectors for repairs and custom lengths.",
    notes: [
      "Side guards, also called lateral protection, fill the open space between the wheels to reduce the risk of pedestrians, cyclists and motorcyclists going under the vehicle.",
      "The 3500mm pair suits rigid trucks and short trailers, and the 6500mm pair suits semi-trailers and B-doubles. The rail caps suit 100 × 30mm tube.",
    ],
    faqs: [
      { q: "Are side guards a legal requirement?", a: "It depends on the vehicle type, when it was built and where it operates. Check with your body builder or the NHVR before relying on a fitment for compliance." },
      { q: "Can I buy parts to repair a damaged guard?", a: "Yes. Profile tube, brackets, end caps, corner covers and connectors are all sold separately." },
    ],
    guides: [],
  },
  "trailer-parts/cargo-control": {
    name: "Cargo Control",
    title: "Cargo Control & Load Restraint Fittings",
    description: "Shoring bars, E/Q-track and F-track end fittings with webbing straps, track end caps, recessed 2T lashing rings and curtain track rollers.",
    intro: "Load restraint fittings for vans, pantechs, curtainsiders and decks: an adjustable steel shoring bar, E & Q-track and F-track end fittings with webbing straps, track end caps, a recessed 2,000kg lashing ring and curtainsider track rollers.",
    notes: [
      "End fittings clip into wall or floor track to anchor straps and bars. Match the fitting to the track profile you have (E, F, Q or O track), as they aren't interchangeable.",
      "Plan restraint for the load as a whole, using the National Transport Commission's Load Restraint Guide, and check every fitting's rating against the forces involved.",
    ],
    faqs: [
      { q: "Which end fitting suits my track?", a: "Use E & Q-track fittings with E or Q track and F-track fittings with F track. If you're unsure which profile you have, send a photo of the track to the counter." },
      { q: "What's the shoring bar for?", a: "It braces across the body of a pantech or van to stop loads moving. The quick-release lever handle adjusts it to the body width." },
    ],
    guides: ["truck-trailer-door-hardware"],
  },
  "trailer-parts/door-seals": {
    name: "Door Seals",
    title: "Truck & Trailer Door Seals",
    description: "PVC door seals in 20, 25, 30, 55 and 85mm profiles, PVC J-profile and 30 × 55mm rubber seal, with corner tabs, for pantech, van and refrigerated doors.",
    intro: "PVC door seals in 20, 25, 30, 55 and 85mm profiles (4 to 5m lengths), a 25 × 30mm PVC J-profile, a 30 × 55mm rubber seal and matching corner tabs for pantech, van, trailer and refrigerated doors.",
    notes: [
      "Choose the profile by the gap it has to close. With the door shut, measure the gap between door and frame, then the depth of the face the seal mounts to. The wider 55 and 85mm profiles suit wide-gap trailer and pantech rear doors.",
      "Grey PVC and black rubber corner tabs finish the seal neatly at the door corners.",
    ],
    faqs: [
      { q: "How do I measure for a replacement seal?", a: "Measure the full perimeter you need to seal and the profile of the old seal (width and depth). If you can, send a photo of the cut end of the old seal with a ruler alongside." },
      { q: "PVC or rubber?", a: "Match what's fitted now unless it's failing. If you're unsure, send a photo of the profile and the door type, and the counter will recommend one." },
    ],
    guides: ["truck-trailer-door-hardware"],
  },
  "trailer-parts/tracks": {
    name: "Tracks",
    title: "Cargo Tracks: E, F, O and Q Track",
    description: "Zinc-plated E-track (132mm, 3.0m), O-track (85mm, 3.0m), steel F-track and steel or 304 stainless Q-track (4.5m) for load restraint.",
    intro: "Zinc-plated E-track (132mm, 3.0m), O-track (85mm, 3.0m), steel F-track (3050mm) and Q-track in steel or 304 stainless (4.5m) for load restraint in vans, pantechs, trailers and curtainsiders.",
    notes: [
      "Track is fixed to walls, floors or curtain rails and accepts end fittings and straps at many points along its length, so the load can be restrained wherever it sits.",
      "Stainless Q-track suits wet and marine conditions. Finish exposed track ends with the safety end caps listed under Cargo Control.",
    ],
    faqs: [
      { q: "E-track, F-track, O-track or Q-track?", a: "They're different profiles with different slot patterns, and fittings aren't interchangeable between them. If you're adding to an existing body, match the track already fitted. For a new body, ask the counter which system suits your load." },
    ],
    guides: [],
  },
  "trailer-parts/door-gear": {
    name: "Door Gear",
    title: "Door Gear & Cam Lock Kits",
    description: "Cam lock kits for 22, 27 and 34mm pipe, 27mm door locking gear kits with lever handles, cam gear sub-assemblies and stainless 27mm door gear.",
    intro: "Cam lock kits for 22, 27 and 34mm locking pipe, a 27mm door locking gear kit with lever handle (200L / 200R), a 27mm cam gear sub-assembly and 27mm stainless door gear for truck and trailer rear doors.",
    notes: [
      "Door gear is the vertical locking bar on a rear door, with cams at each end that engage keepers on the door frame, worked by a lever handle. The size is set by the bar's outside diameter, which is 22, 27 or 34mm in our range.",
      "Parts are handed. L and R in the part name mean left- and right-hand versions, so check which side of the opening your door sits on.",
    ],
    faqs: [
      { q: "How do I know which size I need?", a: "Measure the outside diameter of the existing locking bar: 22mm suits light commercial vans and bodies, 27mm suits truck and trailer doors, and 34mm suits heavy-duty trailer and semi doors." },
      { q: "What is the sub-assembly without a handle for?", a: "It's the cam gear without an operating handle, for workshops fitting their own handle or reusing a good one." },
    ],
    guides: ["truck-trailer-door-hardware"],
  },
  "trailer-parts/hinges": {
    name: "Hinges",
    title: "Truck & Trailer Door Hinges",
    description: "Rear door strap hinges in steel (weld or bolt lug, 280mm) and 304 stainless (260mm), plus steel and polished stainless side door hinges.",
    intro: "Rear door strap hinges in steel, with weld-on or bolt-on lug (280mm), and in 304 stainless with bolt lug (260mm), plus steel (85 × 206mm) and polished 304 stainless side door hinges.",
    notes: [
      "Weld-lug hinges are welded to the body frame. Bolt-lug hinges bolt on, which suits bodies where welding isn't practical.",
      "Stainless hinges suit refrigerated vans and bodies that are washed down often. Match the length and hole pattern to the hinge you're replacing.",
    ],
    faqs: [
      { q: "Weld lug or bolt lug?", a: "Use whatever your body is built for. Weld lugs need a steel frame to weld to. Bolt lugs suit bodies where welding is impractical, or where you want to replace the hinge without hot work." },
    ],
    guides: ["truck-trailer-door-hardware"],
  },
  "trailer-parts/profiles": {
    name: "Profiles",
    title: "Aluminium Truck Body Profiles",
    description: "Aluminium body extrusions: top rail (5.0m), intermediate body profile (4.3m), bottom rail side coaming (4.3m) and roof bow support top-hat (5.0m).",
    intro: "Aluminium body extrusions for truck and trailer builders: top rail body profile (5.0m), intermediate body profile (4.3m), bottom rail side coaming (4.3m) and a roof bow support top-hat profile (5.0m).",
    notes: [
      "Profiles frame and join body panels. The top rail runs along the roof line, the bottom rail and side coaming finish the floor edge, the intermediate profile joins wall panels, and the top-hat section supports roof bows.",
      "Profiles are sold in the lengths shown, for cutting to suit. Check the profile's panel channel against your panel thickness before ordering.",
    ],
    faqs: [
      { q: "Will these suit my panels?", a: "Send the panel type and thickness and the counter will confirm which profile fits." },
    ],
    guides: ["frp-honeycomb-vs-plywood-vs-xps-panels"],
  },
  "trailer-parts/corner-caps": {
    name: "Corner Caps",
    title: "Truck Body Aluminium Corner Caps",
    description: "Aluminium corner caps for square-cornered truck and trailer bodies: 3-way corner cap, and ALLT and PTB caps with matching outer covers.",
    intro: "Aluminium corner caps for square-cornered truck and trailer bodies: a 3-way corner cap, and ALLT and PTB corner caps with matching outer covers.",
    notes: [
      "Corner caps close and protect the joint where the roof, walls and front or rear frame meet. Match the cap style (3-way, ALLT or PTB) to the profile system on your body. The PTB cap suits the front top corner of van and pantech bodies.",
    ],
    faqs: [
      { q: "Which corner cap do I need?", a: "Match the cap to the one you're replacing, or send a photo of the corner and the profiles meeting there. The counter will identify the style." },
    ],
    guides: [],
  },
  "trailer-parts/latches": {
    name: "Latches",
    title: "Trailer Gate & Tailgate Latches",
    description: "Spring-loaded locking latches, a heavy-duty 12mm-pin spring latch and an over-centre latch fastener for trailer gates, ramps, tailgates and drop sides.",
    intro: "A spring-loaded locking latch, a heavy-duty spring latch with 12mm pin (160mm long) and a heavy-duty over-centre latch fastener for trailer gates, ramps, tailgates, ute trays, drop sides and tipper gates.",
    notes: [
      "Spring latches lock a pin into a gate, ramp or door. Over-centre fasteners pull a gate or drop side up tight and hold it there under tension.",
    ],
    faqs: [
      { q: "Spring latch or over-centre fastener?", a: "Use a spring latch to lock something in place, and an over-centre fastener to clamp a gate or drop side closed against rattle." },
    ],
    guides: [],
  },
  "trailer-parts/locks": {
    name: "Locks",
    title: "Paddle Lock Kits",
    description: "Paddle lock kits for toolboxes, canopies and side doors, a flush stainless lock with blind mount, and a recessed stainless kit for 16mm-rod trailer doors.",
    intro: "Paddle lock kits for toolboxes, canopies and side doors: a 105 × 25mm left-hand kit and a flush-mount stainless lock with blind mount. Also a recessed stainless paddle lock kit (152 × 320mm) for rear trailer doors with 16mm rods.",
    notes: [
      "Check the handing before ordering: left- and right-hand kits mirror each other. For more paddle locks and handles, see Door Hardware.",
    ],
    faqs: [
      { q: "Left or right hand?", a: "It depends on which side the lock's latch must throw. Match the part you're replacing, or tell the counter which way the door opens." },
    ],
    guides: ["truck-trailer-door-hardware"],
  },
  "trailer-parts/curtain-gear": {
    name: "Curtain Gear",
    title: "Curtainsider & Tautliner Gear",
    description: "Left- and right-hand HT curtain tensioners and a sliding post base locking assembly for curtainsider and tautliner bodies.",
    intro: "Left- and right-hand HT curtain tensioners and a sliding post base locking assembly for curtainsider and tautliner bodies.",
    notes: [
      "Curtain tensioners tighten the side curtain at the ends of the body. Sliding post base locks hold the removable side posts in position. Tensioners are handed, so order the left or right version to suit the end of the body.",
    ],
    faqs: [
      { q: "Do you carry other curtainsider parts?", a: "Yes. See Canvas Stands for roof supports, Tracks for Q-track, and Cargo Control for curtainsider track rollers and strap fittings." },
    ],
    guides: [],
  },
  "trailer-parts/canvas-stands": {
    name: "Canvas Stands",
    title: "Canvas Stands & Tautliner Roof Supports",
    description: "Heavy-duty canvas support stands in 1250mm, 1995mm and 2045mm widths for tautliner bodies.",
    intro: "Heavy-duty canvas support stands in 1250mm, 1995mm and 2045mm widths for tautliner bodies.",
    notes: [
      "Canvas stands support the roof canvas across the body. Choose the width to suit the inside of your body and match the existing stands.",
    ],
    faqs: [
      { q: "Which width do I need?", a: "Measure an existing stand, or the inside width of the body where the stand sits, then pick the nearest of 1250, 1995 or 2045mm." },
    ],
    guides: [],
  },
  "accessories/frp-honeycomb-panels": {
    name: "FRP Honeycomb Panels",
    title: "FRP Honeycomb Panels for Truck Bodies",
    description: "20mm FRP honeycomb panels with a polypropylene honeycomb core: 4300 × 2300 side panels, 2400 × 2300 front panel and 1200mm door panels.",
    intro: "20mm FRP honeycomb sandwich panels for truck and van bodies, with a polypropylene honeycomb core and gelcoat FRP skins. Sizes are 4300 × 2300mm side panels (including a raw-edge version), a 2400 × 2300mm front panel, and 1200mm-wide door panels in 2400, 2800 and 3200mm lengths.",
    notes: [
      "Honeycomb panels are chosen for low weight. The polypropylene core is far lighter than solid plywood or steel walls, which protects payload.",
      "Where hinges, latches and keepers need maximum screw holding, consider FRP plywood door panels. For refrigerated bodies, see the XPS insulated panels in Accessories.",
      "Panels are quoted to order, so send your body dimensions.",
    ],
    faqs: [
      { q: "Honeycomb or plywood-core panels?", a: "Use honeycomb for side and front walls where weight matters most. Use FRP plywood for doors that carry heavy hardware or take forklift knocks." },
      { q: "How do I order panels?", a: "Panels are price on application. Send an enquiry with the body dimensions and quantities, and the counter will quote." },
    ],
    guides: ["frp-honeycomb-vs-plywood-vs-xps-panels"],
  },
  "accessories/frp-plywood-panels": {
    name: "FRP Plywood Panels",
    title: "FRP Plywood Door Panels",
    description: "20mm FRP plywood door panels (structural plywood core, FRP gelcoat skins), 1200mm wide in 2400, 2800 and 3200mm lengths.",
    intro: "20mm FRP plywood door panels, with a structural plywood core between FRP gelcoat skins, 1200mm wide in 2400, 2800 and 3200mm lengths, for heavy-duty van, truck and trailer doors.",
    notes: [
      "The solid plywood core gives hinges, latches and keepers more to hold than a honeycomb core, which suits doors working hard on distribution and linehaul fleets.",
      "Panels are quoted to order, so send the door sizes and quantities.",
    ],
    faqs: [
      { q: "Why plywood-core for doors?", a: "Doors carry the most hardware and take the knocks. A solid core holds screws and bolts better than a honeycomb core." },
    ],
    guides: ["frp-honeycomb-vs-plywood-vs-xps-panels"],
  },
};

export const subContentFor = (category, sub) => SUB_CONTENT[`${category}/${sub}`] || null;
