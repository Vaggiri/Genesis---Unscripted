import express from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// 1. Job-to-machine matching API
app.post('/api/match-machine', upload.single('file'), (req, res) => {
  const file = req.file;
  const description = req.body.description;

  console.log('Received file:', file);
  console.log('Received description:', description);

  // Mock analysis logic for hackathon demo
  const mockResponse = {
    machine: 'Ultimaker S5 Pro Bundle',
    estimatedHours: 4.5,
    materialNeeded: 'PLA - 150g',
    earliestSlot: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    confidence: 0.92
  };

  setTimeout(() => {
    res.json(mockResponse);
  }, 1500); // Simulate processing time
});

// 4. Circuit analysis & booking API
app.post('/api/analyze-circuit', upload.single('file'), (req, res) => {
  const file = req.file;
  
  console.log('Analyzing circuit file:', file);

  // Mock circuit analysis logic
  const mockResponse = {
    componentsFound: ['Resistor 10k', 'Capacitor 100uF', 'NE555 Timer', 'LED'],
    bestLab: {
      id: 'lab-electronics-101',
      name: 'Advanced Electronics Lab A',
      pcSpecs: 'Intel Core i7, 16GB RAM, Windows 11',
      hardwareVersion: 'Oscilloscope Tektronix TBS1052B, Function Generator',
      softVersion: 'Multisim 14.2, MATLAB R2023a',
      componentsAvailable: true
    },
    availability: [
      { slot: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), status: 'available' },
      { slot: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), status: 'available' }
    ]
  };

  setTimeout(() => {
    res.json(mockResponse);
  }, 2000); // Simulate processing time
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
