// Innovation Labs, Software, Hardware inventory and mock data store for Amrita InnovateX

export const INNOVATION_LABS = [
  {
    id: 'lab-ai-hpc',
    name: 'AI & High Performance Computing Lab',
    block: 'Academic Block 3 (AB-3)',
    floor: 'Floor 3, Room 304',
    category: 'software',
    inCharge: 'Dr. K. Swaminathan (AMR-FAC-209)',
    capacity: 45,
    specs: {
      workstations: '30x Dell Precision (Intel i9, 64GB RAM, RTX 4090 24GB)',
      serverNode: 'NVIDIA DGX A100 8-GPU Cluster Node',
      softwareInstalled: [
        'PyTorch 2.3', 'TensorFlow 2.16', 'CUDA 12.4', 'Ubuntu 22.04 LTS', 
        'Docker & Kubernetes', 'MATLAB 2024a', 'JupyterHub', 'ROS 2 Humble'
      ],
      suitableProjects: [
        'Deep Learning', 'Computer Vision', 'LLM Fine-tuning', 'Autonomous Robotics', 
        'Reinforcement Learning', 'Medical Image Processing', 'Big Data'
      ]
    },
    currentUtilization: '78%',
    availableSlotsToday: ['09:00 - 11:00 AM', '02:00 - 04:30 PM', '05:00 - 08:00 PM (Late Innovator Slot)'],
    benchComponents: []
  },
  {
    id: 'lab-vlsi-embedded',
    name: 'VLSI, Embedded Systems & Circuit Design Lab',
    block: 'Academic Block 1 (AB-1)',
    floor: 'Floor 2, Room 212',
    category: 'hardware_circuit',
    inCharge: 'Dr. Priya M. (AMR-FAC-184)',
    capacity: 40,
    specs: {
      workstations: '25x HP Z-Stations (Intel i7, 32GB RAM)',
      equipment: [
        'Tektronix 100MHz 4-Channel DSO', 'Rigol Arbitrary Waveform Generators', 
        'Keysight Spectrum Analyzer (3GHz)', 'SMD Soldering & Rework Stations'
      ],
      softwareInstalled: [
        'Cadence Virtuoso', 'Xilinx Vivado 2023.2', 'Altium Designer 24', 
        'KiCad 8.0', 'Keil uVision 5', 'STM32CubeIDE', 'LTspice XVII'
      ],
      suitableProjects: [
        'FPGA Design', 'SoC Prototyping', 'Circuit Synthesis', 'Signal Processing', 
        'Bio-medical Sensors', 'IoT Nodes', 'Embedded Hardware'
      ]
    },
    currentUtilization: '64%',
    availableSlotsToday: ['11:30 AM - 01:30 PM', '03:00 - 05:00 PM', '05:30 - 07:30 PM'],
    benchComponents: [
      { name: 'LM741 Operational Amplifier', category: 'IC', stock: 120, status: 'In Stock' },
      { name: 'NE555 Precision Timer', category: 'IC', stock: 85, status: 'In Stock' },
      { name: 'STM32F401 Black Pill MCU', category: 'Development Board', stock: 24, status: 'Available' },
      { name: 'ESP32-WROOM-32 Wi-Fi & BT', category: 'IoT Module', stock: 35, status: 'Available' },
      { name: 'Xilinx Spartan-7 FPGA Board', category: 'FPGA', stock: 15, status: 'Reserved for Lab' },
      { name: '10k Ohm 1/4W Resistors', category: 'Passive', stock: 500, status: 'Abundant' },
      { name: '100uF 25V Electrolytic Capacitor', category: 'Passive', stock: 200, status: 'Abundant' },
      { name: 'MPU6050 6-Axis IMU Sensor', category: 'Sensor', stock: 18, status: 'Available' }
    ]
  },
  {
    id: 'lab-fablab-proto',
    name: 'FabLab & Rapid Prototyping Workshop',
    block: 'Central Tech Innovation Bay (TBI)',
    floor: 'Ground Floor, Bay 1',
    category: 'rapid_prototyping',
    inCharge: 'Er. Rajesh V. (AMR-FAC-112)',
    capacity: 25,
    specs: {
      equipment: [
        '4x Prusa MK4 3D Printers (PLA/PETG)', '1x Formlabs Form 3+ SLA Resin Printer',
        'Epilog Laser 60W CO2 Laser Cutter', 'Bantam Tools Desktop PCB CNC Mill',
        'Roland MDX-50 3D Precision Milling'
      ],
      softwareInstalled: [
        'Autodesk Fusion 360', 'SolidWorks 2024', 'PrusaSlicer', 
        'Formlabs PreForm', 'LightBurn Laser CAM'
      ],
      suitableProjects: [
        'Drone Chassis & Gimbal', 'Robotic Grippers', 'Product Enclosures', 
        'Custom PCB Milling', 'Architectural Mockups', 'Mechanical Linkages'
      ]
    },
    currentUtilization: '85%',
    availableSlotsToday: ['01:00 - 02:30 PM (Idle Gap Match)', '04:00 - 06:30 PM'],
    benchComponents: [
      { name: 'PLA 1.75mm Filament (Black/White/Red)', category: 'Raw Material', stock: '18 Spools', status: 'In Stock' },
      { name: 'PETG High-Tensile Filament', category: 'Raw Material', stock: '6 Spools', status: 'Available' },
      { name: 'FR4 Double-Sided Copper Clad Boards', category: 'PCB Stock', stock: '45 Pcs', status: 'In Stock' },
      { name: 'Cast Acrylic Sheets (3mm & 5mm)', category: 'Raw Material', stock: '20 Sheets', status: 'Available' }
    ]
  },
  {
    id: 'lab-iot-robotics',
    name: 'IoT & Autonomous Robotics Sandbox',
    block: 'Academic Block 3 (AB-3)',
    floor: 'Floor 1, Room 118',
    category: 'robotics_iot',
    inCharge: 'Dr. Murali Mohan (AMR-FAC-241)',
    capacity: 35,
    specs: {
      equipment: [
        'Robotics Indoor Drone Testing Cage', 'TurtleBot 4 ROS2 Autonomous Rovers',
        'LoRaWAN Gateway & RF Anechoic Mini-Chamber', 'Thermal Imaging Camera FLIR'
      ],
      softwareInstalled: [
        'ROS 2 Humble / Iron', 'Gazebo Garden Sim', 'MATLAB Robotics Toolbox',
        'Arduino IDE 2.3', 'Wireshark RF Analyzer'
      ],
      suitableProjects: [
        'Swarm Robotics', 'Drone Navigation', 'Smart Agriculture IoT', 
        'Wireless Sensor Networks', 'Industrial Automation'
      ]
    },
    currentUtilization: '52%',
    availableSlotsToday: ['10:00 - 12:00 PM', '02:00 - 04:00 PM', '04:30 - 07:00 PM'],
    benchComponents: [
      { name: 'LoRa SX1278 433MHz Transceiver', category: 'RF Module', stock: 30, status: 'In Stock' },
      { name: 'L298N Motor Driver Module', category: 'Power', stock: 40, status: 'In Stock' },
      { name: 'Raspberry Pi 4 Model B (4GB)', category: 'SBC', stock: 12, status: 'Available on Request' },
      { name: 'LiPo 3S 2200mAh 35C Battery', category: 'Power', stock: 16, status: 'Charged & Ready' }
    ]
  }
];

export const INITIAL_BOOKING_REQUESTS = [
  {
    id: 'req-101',
    studentName: 'Adithya K.',
    studentRoll: 'CB.EN.U4CSE23012',
    labId: 'lab-ai-hpc',
    labName: 'AI & High Performance Computing Lab',
    projectTitle: 'Autonomous Drone Obstacle Avoidance via YOLOv8 & PyTorch',
    projectType: 'Software / AI',
    requirements: 'Needs RTX 4090 GPU node, CUDA 12.4, Ubuntu 22.04 environment',
    slotTime: 'Today 02:00 - 04:30 PM',
    status: 'pending', // 'pending' | 'approved' | 'rejected'
    submittedAt: 'Today, 02:45 AM',
    facultyAssigned: 'Dr. K. Swaminathan (AMR-FAC-209)'
  },
  {
    id: 'req-102',
    studentName: 'Meera R.',
    studentRoll: 'CB.EN.U4ECE23048',
    labId: 'lab-vlsi-embedded',
    labName: 'VLSI, Embedded Systems & Circuit Design Lab',
    projectTitle: 'Bio-Sensor Analog Front-End with LM741 & STM32',
    projectType: 'Hardware / Circuit',
    requirements: 'Bench DSO 100MHz, LM741 IC, STM32CubeIDE, Altium Designer',
    slotTime: 'Today 03:00 - 05:00 PM',
    status: 'approved',
    submittedAt: 'Yesterday, 04:15 PM',
    facultyAssigned: 'Dr. Priya M. (AMR-FAC-184)'
  },
  {
    id: 'req-103',
    studentName: 'Gowtham M.',
    studentRoll: 'CB.EN.U4MEE23019',
    labId: 'lab-fablab-proto',
    labName: 'FabLab & Rapid Prototyping Workshop',
    projectTitle: 'Lightweight Hexacopter Arm Bracket (PLA / PETG)',
    projectType: 'Rapid Prototyping',
    requirements: 'Prusa MK4 3D Printer, 85g PETG filament, 2.5h print run',
    slotTime: 'Today 01:00 - 02:30 PM (Idle Gap Matched)',
    status: 'pending',
    submittedAt: 'Today, 01:20 AM',
    facultyAssigned: 'Er. Rajesh V. (AMR-FAC-112)'
  }
];

// Helper to get stored bookings or defaults
export const getStoredBookings = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem('amrita_innovatex_bookings');
      if (data) return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Booking load error:', e);
  }
  return INITIAL_BOOKING_REQUESTS;
};

export const saveStoredBookings = (bookings) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('amrita_innovatex_bookings', JSON.stringify(bookings));
    }
  } catch (e) {
    console.warn('Booking save error:', e);
  }
};
