// Realistic mock data tailored specifically to Amrita Vishwa Vidyapeetham campus

export const INITIAL_PASSES = [
  {
    id: "PASS-2026-9042",
    studentName: "Adithya Ramachandran",
    rollNumber: "CB.EN.U4CSE23108",
    department: "Computer Science & Engineering",
    hostel: "D-Block Men's Hostel (Room 312)",
    warden: "Dr. K. S. Narayanan (Warden - D Block)",
    parentName: "Smt. V. Lakshmi & Sri. Ramachandran",
    parentPhone: "+91 98412 84920",
    vehicleNumber: "TN-38-BZ-4102",
    vehicleType: "Four Wheeler (Sedan)",
    purpose: "Hostel Pickup & Medical Checkup Weekend",
    requestedSlot: "Today, 4:00 PM – 7:30 PM",
    status: "APPROVED",
    approvedAt: "Today at 3:15 PM",
    qrHash: "CS-AUTH-9042-TOKEN-9281X",
    gateStatus: "READY_FOR_ENTRY", // READY_FOR_ENTRY, INSIDE_CAMPUS, EXITED
    entryTime: null,
    exitTime: null
  },
  {
    id: "PASS-2026-9043",
    studentName: "Ananya S. Kumar",
    rollNumber: "CB.EN.U4AIE23045",
    department: "Artificial Intelligence & Robotics",
    hostel: "Mythreyi Ladies Hostel (Room 108)",
    warden: "Dr. Deepa Mohan (Chief Warden)",
    parentName: "Sri. Suresh Kumar",
    parentPhone: "+91 94471 20194",
    vehicleNumber: "KL-09-AX-9912",
    vehicleType: "Four Wheeler (SUV)",
    purpose: "Family Visit & Project Material Delivery",
    requestedSlot: "Today, 2:30 PM – 6:00 PM",
    status: "APPROVED",
    approvedAt: "Today at 2:10 PM",
    qrHash: "CS-AUTH-9043-TOKEN-8832Y",
    gateStatus: "INSIDE_CAMPUS",
    entryTime: "2:42 PM (Main Gate Lane 2)",
    exitTime: null
  },
  {
    id: "PASS-2026-9044",
    studentName: "Karthik Raja M.",
    rollNumber: "CB.EN.U4ECE24012",
    department: "Electronics & Communication Engg",
    hostel: "Vashishta Hostel (Room 420)",
    warden: "Dr. M. Soundararajan",
    parentName: "Sri. Murugesan K.",
    parentPhone: "+91 98840 55122",
    vehicleNumber: "TN-37-CK-5520",
    vehicleType: "Two Wheeler (Motorcycle)",
    purpose: "Semester Break Advance Clearance",
    requestedSlot: "Today, 11:00 AM – 2:00 PM",
    status: "APPROVED",
    approvedAt: "Today at 10:45 AM",
    qrHash: "CS-AUTH-9044-TOKEN-7711Z",
    gateStatus: "EXITED",
    entryTime: "11:15 AM (Main Gate Lane 1)",
    exitTime: "1:48 PM (Main Gate Lane 2)"
  }
];

export const FABLAB_MACHINES = [
  {
    id: "m-1",
    name: "Bambu Lab X1-Carbon #01",
    type: "FDM 3D Printer",
    material: "PLA, PETG, ABS, Carbon Fiber",
    status: "Available",
    bedSize: "256 x 256 x 256 mm",
    speed: "500 mm/s High Speed"
  },
  {
    id: "m-2",
    name: "Ultimaker S5 Dual Extruder",
    type: "FDM Precision 3D Printer",
    material: "Tough PLA, Nylon, PVA Dissolvable",
    status: "Active (2h remaining)",
    bedSize: "330 x 240 x 300 mm",
    speed: "Industrial Grade"
  },
  {
    id: "m-3",
    name: "Formlabs Form 3+ SLA",
    type: "Resin Stereolithography",
    material: "Clear Resin, Rigid 10k, Tough 2000",
    status: "Available",
    bedSize: "145 x 145 x 185 mm",
    speed: "25-300 micron layers"
  },
  {
    id: "m-4",
    name: "Bantam Desktop PCB Mill",
    type: "Precision CNC PCB Prototyper",
    material: "FR-1 Copper Clad single/double layer",
    status: "Maintenance Check",
    bedSize: "140 x 114 x 40 mm",
    speed: "0.005mm repeatability"
  }
];

export const INITIAL_WORK_ORDERS = [
  {
    id: "FAB-WO-402",
    studentName: "Adithya Ramachandran",
    rollNumber: "CB.EN.U4CSE23108",
    projectTitle: "Autonomous Quadcopter Motor Mount (GENESIS '26)",
    technology: "3D Printing (FDM)",
    material: "PETG (High Tensile)",
    infill: "40% Gyroid",
    layerHeight: "0.20 mm",
    estimatedTime: "2 hrs 35 mins",
    estimatedCost: "₹185 (42g filament)",
    status: "IN_QUEUE",
    submittedAt: "10 mins ago",
    machine: "Bambu Lab X1-Carbon #01",
    priority: "HIGH (Hackathon)"
  },
  {
    id: "FAB-WO-401",
    studentName: "Kavitha R.",
    rollNumber: "CB.EN.U4ECE23019",
    projectTitle: "IoT Smart Energy Meter PCB",
    technology: "CNC PCB Milling",
    material: "FR-1 Double Sided Board",
    infill: "N/A (2 Layer traces)",
    layerHeight: "0.15 mm isolation",
    estimatedTime: "45 mins",
    estimatedCost: "₹120 (Board blank)",
    status: "IN_PRODUCTION",
    submittedAt: "1 hr ago",
    machine: "Bantam Desktop PCB Mill",
    priority: "STANDARD"
  },
  {
    id: "FAB-WO-400",
    studentName: "Gokul Nath V.",
    rollNumber: "CB.EN.U4MEC22081",
    projectTitle: "Robotic Gripper Finger Linkage",
    technology: "3D Printing (FDM)",
    material: "PLA Tough (Black)",
    infill: "50% Grid",
    layerHeight: "0.16 mm",
    estimatedTime: "3 hrs 10 mins",
    estimatedCost: "₹240 (68g filament)",
    status: "READY_FOR_PICKUP",
    submittedAt: "4 hrs ago",
    machine: "Ultimaker S5",
    priority: "STANDARD"
  }
];

export const CAMPUS_BLOCKS = [
  {
    id: "AB-1",
    name: "Academic Block 1 (AB-1)",
    tag: "Mechanical, Civil & Aerospace",
    totalRooms: 34,
    freeRoomsNow: 9,
    floors: ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor"]
  },
  {
    id: "AB-2",
    name: "Academic Block 2 (AB-2)",
    tag: "Computer Science, AI & Administration",
    totalRooms: 48,
    freeRoomsNow: 16,
    floors: ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor"]
  },
  {
    id: "AB-3",
    name: "Academic Block 3 (AB-3)",
    tag: "Electronics, Electrical & Biotech",
    totalRooms: 40,
    freeRoomsNow: 11,
    floors: ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor"]
  }
];

export const INITIAL_ROOMS = [
  {
    id: "AB2-304",
    blockId: "AB-2",
    floor: "3rd Floor",
    roomNumber: "AB2-304",
    name: "Interactive AI Lab & Seminar Hall",
    capacity: 65,
    status: "VACANT", // VACANT, OCCUPIED
    freeUntil: "6:30 PM (Free for next 2h 45m)",
    currentSubject: "No active lecture scheduled",
    amenities: ["Air Conditioned", "High-Gain Wi-Fi", "Dual Projectors", "Power Outlets at Every Desk", "Smart Podium"],
    ac: true,
    projector: true,
    powerOutlets: true,
    smartBoard: true
  },
  {
    id: "AB2-308",
    blockId: "AB-2",
    floor: "3rd Floor",
    roomNumber: "AB2-308",
    name: "M.Tech Collaboration Pod",
    capacity: 28,
    status: "VACANT",
    freeUntil: "8:00 PM (Free for next 4h 15m)",
    currentSubject: "Design Thinking Studio Window",
    amenities: ["Air Conditioned", "High-Gain Wi-Fi", "Whiteboard Wall", "Power Outlets at Every Desk"],
    ac: true,
    projector: false,
    powerOutlets: true,
    smartBoard: true
  },
  {
    id: "AB2-202",
    blockId: "AB-2",
    floor: "2nd Floor",
    roomNumber: "AB2-202",
    name: "Computer Science Lecture Hall B",
    capacity: 80,
    status: "OCCUPIED",
    freeUntil: "Busy until 4:45 PM",
    currentSubject: "23CSE301: Compiler Design (Batch A)",
    amenities: ["Air Conditioned", "Ceiling Projector", "Wall Sockets"],
    ac: true,
    projector: true,
    powerOutlets: true,
    smartBoard: false
  },
  {
    id: "AB1-104",
    blockId: "AB-1",
    floor: "1st Floor",
    roomNumber: "AB1-104",
    name: "Robotics Design & Drafting Hall",
    capacity: 50,
    status: "VACANT",
    freeUntil: "5:30 PM (Free for next 1h 45m)",
    currentSubject: "Free period after CAD Lab",
    amenities: ["Heavy-Duty Power Strip", "Ceiling Fans", "Dual Whiteboards", "Projector"],
    ac: false,
    projector: true,
    powerOutlets: true,
    smartBoard: false
  },
  {
    id: "AB1-210",
    blockId: "AB-1",
    floor: "2nd Floor",
    roomNumber: "AB1-210",
    name: "Fluid Dynamics Seminar Room",
    capacity: 40,
    status: "OCCUPIED",
    freeUntil: "Busy until 5:00 PM",
    currentSubject: "23MEC312: Heat Transfer Lab Viva",
    amenities: ["Air Conditioned", "Projector", "Wall Sockets"],
    ac: true,
    projector: true,
    powerOutlets: true,
    smartBoard: false
  },
  {
    id: "AB3-102",
    blockId: "AB-3",
    floor: "1st Floor",
    roomNumber: "AB3-102",
    name: "VLSI Circuit Theory Studio",
    capacity: 45,
    status: "VACANT",
    freeUntil: "7:00 PM (Free for next 3h 15m)",
    currentSubject: "Self-Study Hours",
    amenities: ["Air Conditioned", "Oscilloscope Power Bench", "High-Gain Wi-Fi", "Projector"],
    ac: true,
    projector: true,
    powerOutlets: true,
    smartBoard: true
  },
  {
    id: "AB3-301",
    blockId: "AB-3",
    floor: "3rd Floor",
    roomNumber: "AB3-301",
    name: "Signals & Systems Discussion Pod",
    capacity: 22,
    status: "VACANT",
    freeUntil: "6:00 PM (Free for next 2h 15m)",
    currentSubject: "Open Collaboration Window",
    amenities: ["Whiteboard", "Power Outlets", "Ceiling Fan", "High-Gain Wi-Fi"],
    ac: false,
    projector: false,
    powerOutlets: true,
    smartBoard: false
  }
];
