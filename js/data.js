/**
 * IMPERIUM / AIRPORT OPERATIONS SIMULATION DATA MODEL
 * Comprehensive initial fleet, gates, staff categories, and ground equipment
 */

export const INITIAL_GATES = [
    { id: 'A01', terminal: 'A', name: 'Gate A01', compatibleTypes: ['Heavy', 'Widebody', 'Executive', 'Narrowbody'], status: 'free', currentAircraft: null, availableAt: 480, x: 220, y: 160 },
    { id: 'A02', terminal: 'A', name: 'Gate A02', compatibleTypes: ['Narrowbody', 'Executive', 'Regional'], status: 'free', currentAircraft: null, availableAt: 480, x: 360, y: 160 },
    { id: 'A03', terminal: 'A', name: 'Gate A03', compatibleTypes: ['Narrowbody', 'Executive', 'Regional'], status: 'free', currentAircraft: null, availableAt: 480, x: 500, y: 160 },
    { id: 'B01', terminal: 'B', name: 'Gate B01', compatibleTypes: ['Heavy', 'Widebody', 'Narrowbody', 'Executive'], status: 'free', currentAircraft: null, availableAt: 480, x: 640, y: 160 },
    { id: 'B02', terminal: 'B', name: 'Gate B02', compatibleTypes: ['Narrowbody', 'Executive', 'Regional'], status: 'free', currentAircraft: null, availableAt: 480, x: 780, y: 160 },
    { id: 'B03', terminal: 'B', name: 'Gate B03', compatibleTypes: ['Heavy', 'Widebody', 'Narrowbody', 'Executive', 'Regional'], status: 'free', currentAircraft: null, availableAt: 480, x: 920, y: 160 }
];

export const INITIAL_STAFF = [
    // Ground clearance staff
    { id: 'ST-GC-01', type: 'Ground clearance staff', name: 'Ground Clearance Team Alpha', available: true, currentAssignment: null, shift: '06:00 - 14:00' },
    { id: 'ST-GC-02', type: 'Ground clearance staff', name: 'Ground Clearance Team Bravo', available: true, currentAssignment: null, shift: '08:00 - 16:00' },
    
    // Boarding staff
    { id: 'ST-BS-01', type: 'Boarding staff', name: 'Gate & Boarding Unit 1', available: true, currentAssignment: null, shift: '06:00 - 14:00' },
    { id: 'ST-BS-02', type: 'Boarding staff', name: 'Gate & Boarding Unit 2', available: true, currentAssignment: null, shift: '08:00 - 16:00' },
    
    // Baggage handlers
    { id: 'ST-BH-01', type: 'Baggage handlers', name: 'Baggage Handling Crew 1', available: true, currentAssignment: null, shift: '06:00 - 14:00' },
    { id: 'ST-BH-02', type: 'Baggage handlers', name: 'Baggage Handling Crew 2', available: true, currentAssignment: null, shift: '07:00 - 15:00' },
    { id: 'ST-BH-03', type: 'Baggage handlers', name: 'Baggage Handling Crew 3', available: true, currentAssignment: null, shift: '08:00 - 16:00' },
    
    // Cleaning crew
    { id: 'ST-CC-01', type: 'Cleaning crew', name: 'Cabin Sanitization Crew 1', available: true, currentAssignment: null, shift: '06:00 - 14:00' },
    { id: 'ST-CC-02', type: 'Cleaning crew', name: 'Cabin Sanitization Crew 2', available: true, currentAssignment: null, shift: '07:30 - 15:30' },
    
    // Refuelling staff
    { id: 'ST-RS-01', type: 'Refuelling staff', name: 'Hydrant & Fuel Tech Alpha', available: true, currentAssignment: null, shift: '06:00 - 14:00' },
    { id: 'ST-RS-02', type: 'Refuelling staff', name: 'Hydrant & Fuel Tech Bravo', available: true, currentAssignment: null, shift: '08:00 - 16:00' },
    
    // Technical maintenance engineers
    { id: 'ST-ME-01', type: 'Technical maintenance engineers', name: 'Avionics & Line Maint Eng 1', available: true, currentAssignment: null, shift: '06:00 - 18:00' },
    { id: 'ST-ME-02', type: 'Technical maintenance engineers', name: 'Systems & Powerplant Eng 2', available: true, currentAssignment: null, shift: '08:00 - 20:00' },
    
    // Security staff
    { id: 'ST-SS-01', type: 'Security staff', name: 'Airside Security Patrol 1', available: true, currentAssignment: null, shift: '06:00 - 14:00' },
    { id: 'ST-SS-02', type: 'Security staff', name: 'Baggage & K9 Security Unit', available: true, currentAssignment: null, shift: '07:00 - 15:00' },
    
    // Gate agents
    { id: 'ST-GA-01', type: 'Gate agents', name: 'Gate Lead Officer 1', available: true, currentAssignment: null, shift: '06:00 - 14:00' },
    { id: 'ST-GA-02', type: 'Gate agents', name: 'Gate Lead Officer 2', available: true, currentAssignment: null, shift: '08:00 - 16:00' },
    
    // Ground servicing crew
    { id: 'ST-GS-01', type: 'Ground servicing crew', name: 'Water & Waste Servicing Crew', available: true, currentAssignment: null, shift: '06:00 - 14:00' },
    { id: 'ST-GS-02', type: 'Ground servicing crew', name: 'Catering & Logistics Crew', available: true, currentAssignment: null, shift: '08:00 - 16:00' },
    
    // Emergency response team
    { id: 'ST-ER-01', type: 'Emergency response team', name: 'Airfield ARFF / Medical Squad 1', available: true, currentAssignment: null, shift: '24h Standby' },
    { id: 'ST-ER-02', type: 'Emergency response team', name: 'Critical Incident Response 2', available: true, currentAssignment: null, shift: '24h Standby' }
];

export const INITIAL_EQUIPMENT = [
    { id: 'EQ-FT-01', type: 'Fuel trucks', name: 'Aviation Fuel Bowser 01', available: true, currentAssignment: null, operational: true },
    { id: 'EQ-FT-02', type: 'Fuel trucks', name: 'Aviation Fuel Bowser 02', available: true, currentAssignment: null, operational: true },
    { id: 'EQ-FT-03', type: 'Fuel trucks', name: 'Hydrant Dispenser Truck 03', available: true, currentAssignment: null, operational: true },
    
    { id: 'EQ-BV-01', type: 'Baggage vehicles', name: 'Electric Tug & Belt Loader 01', available: true, currentAssignment: null, operational: true },
    { id: 'EQ-BV-02', type: 'Baggage vehicles', name: 'Baggage Tractor Train 02', available: true, currentAssignment: null, operational: true },
    { id: 'EQ-BV-03', type: 'Baggage vehicles', name: 'Container Pallet Loader 03', available: true, currentAssignment: null, operational: true },
    
    { id: 'EQ-PB-01', type: 'Pushback tractors', name: 'Heavy Towbarless Tractor 01', available: true, currentAssignment: null, operational: true },
    { id: 'EQ-PB-02', type: 'Pushback tractors', name: 'Conventional Pushback Tug 02', available: true, currentAssignment: null, operational: true },
    
    { id: 'EQ-CV-01', type: 'Cleaning vehicles', name: 'Cabin Service Cleaning Van 01', available: true, currentAssignment: null, operational: true },
    { id: 'EQ-CV-02', type: 'Cleaning vehicles', name: 'High-Lift Cabin Van 02', available: true, currentAssignment: null, operational: true },
    
    { id: 'EQ-GPU-01', type: 'Ground power units', name: 'Solid State 400Hz GPU 01', available: true, currentAssignment: null, operational: true },
    { id: 'EQ-GPU-02', type: 'Ground power units', name: 'Mobile Diesel GPU 02', available: true, currentAssignment: null, operational: true },
    
    { id: 'EQ-CT-01', type: 'Catering trucks', name: 'High-Loader Catering Truck 01', available: true, currentAssignment: null, operational: true },
    { id: 'EQ-CT-02', type: 'Catering trucks', name: 'Executive Galley Servicer 02', available: true, currentAssignment: null, operational: true },
    
    { id: 'EQ-ME-01', type: 'Maintenance equipment', name: 'Mobile Engine Crane & Scissor Lift 01', available: true, currentAssignment: null, operational: true },
    { id: 'EQ-ME-02', type: 'Maintenance equipment', name: 'Avionics Diagnostic Unit 02', available: true, currentAssignment: null, operational: true },
    
    { id: 'EQ-BB-01', type: 'Boarding bridges/buses', name: 'Telescopic Jetway A01-A03', available: true, currentAssignment: null, operational: true },
    { id: 'EQ-BB-02', type: 'Boarding bridges/buses', name: 'Airside VIP Passenger Bus 01', available: true, currentAssignment: null, operational: true }
];

export const INITIAL_AIRCRAFT = [
    {
        id: 'AC-101',
        flightNumber: 'AI101',
        airline: 'Air India',
        aircraftType: 'Boeing 787-9',
        category: 'Widebody',
        arrivalTime: 485, // 08:05
        scheduledDepartureTime: 570, // 09:30
        estimatedDepartureTime: 570,
        gate: 'A01',
        destination: 'DEL (Delhi)',
        origin: 'LHR (London)',
        passengers: 248,
        baggage: 312,
        priority: 'High',
        status: 'At Gate',
        currentTask: 'De-boarding passengers',
        turnaroundProgress: 15,
        delayDuration: 0,
        fuelRequirement: 42000,
        technicalStatus: 'Normal',
        emergencyStatus: 'None',
        tailNumber: 'VT-ANX'
    },
    {
        id: 'AC-700',
        flightNumber: 'AL700',
        airline: 'Imperium Private',
        aircraftType: 'Gulfstream G700',
        category: 'Executive',
        arrivalTime: 490, // 08:10
        scheduledDepartureTime: 555, // 09:15
        estimatedDepartureTime: 555,
        gate: 'A02',
        destination: 'TEB (New York Teterboro)',
        origin: 'ZRH (Zurich)',
        passengers: 12,
        baggage: 18,
        priority: 'High',
        status: 'At Gate',
        currentTask: 'Cabin cleaning',
        turnaroundProgress: 35,
        delayDuration: 0,
        fuelRequirement: 18500,
        technicalStatus: 'Normal',
        emergencyStatus: 'None',
        tailNumber: 'N700AL'
    },
    {
        id: 'AC-202',
        flightNumber: 'AI202',
        airline: 'Air India',
        aircraftType: 'Airbus A321neo',
        category: 'Narrowbody',
        arrivalTime: 500, // 08:20
        scheduledDepartureTime: 580, // 09:40
        estimatedDepartureTime: 580,
        gate: 'A03',
        destination: 'BOM (Mumbai)',
        origin: 'DXB (Dubai)',
        passengers: 182,
        baggage: 210,
        priority: 'Normal',
        status: 'Taxi to assigned gate',
        currentTask: 'Taxi to assigned gate',
        turnaroundProgress: 5,
        delayDuration: 0,
        fuelRequirement: 14000,
        technicalStatus: 'Normal',
        emergencyStatus: 'None',
        tailNumber: 'VT-CIQ'
    },
    {
        id: 'AC-303',
        flightNumber: 'AI303',
        airline: 'Air India',
        aircraftType: 'Boeing 777-300ER',
        category: 'Heavy',
        arrivalTime: 510, // 08:30
        scheduledDepartureTime: 615, // 10:15
        estimatedDepartureTime: 615,
        gate: 'B01',
        destination: 'JFK (New York)',
        origin: 'FRA (Frankfurt)',
        passengers: 326,
        baggage: 410,
        priority: 'Normal',
        status: 'Approaching airport',
        currentTask: 'Aircraft approaching airport',
        turnaroundProgress: 0,
        delayDuration: 0,
        fuelRequirement: 68000,
        technicalStatus: 'Normal',
        emergencyStatus: 'None',
        tailNumber: 'VT-ALJ'
    },
    {
        id: 'AC-405',
        flightNumber: 'AI405',
        airline: 'Air India',
        aircraftType: 'Airbus A320neo',
        category: 'Narrowbody',
        arrivalTime: 515, // 08:35
        scheduledDepartureTime: 595, // 09:55
        estimatedDepartureTime: 595,
        gate: 'B02',
        destination: 'MAA (Chennai)',
        origin: 'BLR (Bangalore)',
        passengers: 164,
        baggage: 195,
        priority: 'Normal',
        status: 'Flight scheduled',
        currentTask: 'Flight scheduled',
        turnaroundProgress: 0,
        delayDuration: 0,
        fuelRequirement: 12500,
        technicalStatus: 'Normal',
        emergencyStatus: 'None',
        tailNumber: 'VT-EXF'
    },
    {
        id: 'AC-901',
        flightNumber: 'AI901',
        airline: 'Air India',
        aircraftType: 'Boeing 787-8',
        category: 'Widebody',
        arrivalTime: 525, // 08:45
        scheduledDepartureTime: 610, // 10:10
        estimatedDepartureTime: 610,
        gate: 'B03',
        destination: 'SIN (Singapore)',
        origin: 'SYD (Sydney)',
        passengers: 230,
        baggage: 290,
        priority: 'Normal',
        status: 'Flight scheduled',
        currentTask: 'Flight scheduled',
        turnaroundProgress: 0,
        delayDuration: 0,
        fuelRequirement: 39000,
        technicalStatus: 'Normal',
        emergencyStatus: 'None',
        tailNumber: 'VT-ANI'
    },
    {
        id: 'AC-505',
        flightNumber: 'EK505',
        airline: 'Emirates',
        aircraftType: 'Boeing 777-300ER',
        category: 'Heavy',
        arrivalTime: 530, // 08:50
        scheduledDepartureTime: 630, // 10:30
        estimatedDepartureTime: 630,
        gate: 'A01',
        destination: 'DXB (Dubai)',
        origin: 'DEL (Delhi)',
        passengers: 340,
        baggage: 420,
        priority: 'Normal',
        status: 'Flight scheduled',
        currentTask: 'Flight scheduled',
        turnaroundProgress: 0,
        delayDuration: 0,
        fuelRequirement: 65000,
        technicalStatus: 'Normal',
        emergencyStatus: 'None',
        tailNumber: 'A6-EPG'
    },
    {
        id: 'AC-710',
        flightNumber: 'AL710',
        airline: 'Imperium Private',
        aircraftType: 'Bombardier Global 7500',
        category: 'Executive',
        arrivalTime: 535, // 08:55
        scheduledDepartureTime: 600, // 10:00
        estimatedDepartureTime: 600,
        gate: 'A02',
        destination: 'GVA (Geneva)',
        origin: 'HND (Tokyo)',
        passengers: 8,
        baggage: 14,
        priority: 'High',
        status: 'Flight scheduled',
        currentTask: 'Flight scheduled',
        turnaroundProgress: 0,
        delayDuration: 0,
        fuelRequirement: 22000,
        technicalStatus: 'Normal',
        emergencyStatus: 'None',
        tailNumber: 'N710AL'
    },
    {
        id: 'AC-612',
        flightNumber: 'LH612',
        airline: 'Lufthansa',
        aircraftType: 'Airbus A350-900',
        category: 'Widebody',
        arrivalTime: 545, // 09:05
        scheduledDepartureTime: 645, // 10:45
        estimatedDepartureTime: 645,
        gate: 'B01',
        destination: 'MUC (Munich)',
        origin: 'DEL (Delhi)',
        passengers: 280,
        baggage: 350,
        priority: 'Normal',
        status: 'Flight scheduled',
        currentTask: 'Flight scheduled',
        turnaroundProgress: 0,
        delayDuration: 0,
        fuelRequirement: 52000,
        technicalStatus: 'Normal',
        emergencyStatus: 'None',
        tailNumber: 'D-AIXC'
    },
    {
        id: 'AC-415',
        flightNumber: 'SQ415',
        airline: 'Singapore Airlines',
        aircraftType: 'Boeing 787-10',
        category: 'Widebody',
        arrivalTime: 550, // 09:10
        scheduledDepartureTime: 650, // 10:50
        estimatedDepartureTime: 650,
        gate: 'A03',
        destination: 'SIN (Singapore)',
        origin: 'FRA (Frankfurt)',
        passengers: 305,
        baggage: 375,
        priority: 'Normal',
        status: 'Flight scheduled',
        currentTask: 'Flight scheduled',
        turnaroundProgress: 0,
        delayDuration: 0,
        fuelRequirement: 46000,
        technicalStatus: 'Normal',
        emergencyStatus: 'None',
        tailNumber: '9V-SCB'
    },
    {
        id: 'AC-118',
        flightNumber: 'BA118',
        airline: 'British Airways',
        aircraftType: 'Boeing 777-200ER',
        category: 'Widebody',
        arrivalTime: 560, // 09:20
        scheduledDepartureTime: 665, // 11:05
        estimatedDepartureTime: 665,
        gate: 'B02',
        destination: 'LHR (London Heathrow)',
        origin: 'BLR (Bangalore)',
        passengers: 260,
        baggage: 330,
        priority: 'Normal',
        status: 'Flight scheduled',
        currentTask: 'Flight scheduled',
        turnaroundProgress: 0,
        delayDuration: 0,
        fuelRequirement: 55000,
        technicalStatus: 'Normal',
        emergencyStatus: 'None',
        tailNumber: 'G-VIIA'
    },
    {
        id: 'AC-822',
        flightNumber: 'AF822',
        airline: 'Air France',
        aircraftType: 'Airbus A330-300',
        category: 'Widebody',
        arrivalTime: 570, // 09:30
        scheduledDepartureTime: 675, // 11:15
        estimatedDepartureTime: 675,
        gate: 'B03',
        destination: 'CDG (Paris)',
        origin: 'BOM (Mumbai)',
        passengers: 274,
        baggage: 340,
        priority: 'Normal',
        status: 'Flight scheduled',
        currentTask: 'Flight scheduled',
        turnaroundProgress: 0,
        delayDuration: 0,
        fuelRequirement: 48000,
        technicalStatus: 'Normal',
        emergencyStatus: 'None',
        tailNumber: 'F-GZCB'
    },
    {
        id: 'AC-730',
        flightNumber: 'AL730',
        airline: 'Imperium Private',
        aircraftType: 'Dassault Falcon 8X',
        category: 'Executive',
        arrivalTime: 580, // 09:40
        scheduledDepartureTime: 640, // 10:40
        estimatedDepartureTime: 640,
        gate: 'A02',
        destination: 'NICE (Nice Cote d\'Azur)',
        origin: 'DXB (Dubai)',
        passengers: 9,
        baggage: 12,
        priority: 'High',
        status: 'Flight scheduled',
        currentTask: 'Flight scheduled',
        turnaroundProgress: 0,
        delayDuration: 0,
        fuelRequirement: 16000,
        technicalStatus: 'Normal',
        emergencyStatus: 'None',
        tailNumber: 'N730AL'
    },
    {
        id: 'AC-244',
        flightNumber: 'AI244',
        airline: 'Air India',
        aircraftType: 'Airbus A320neo',
        category: 'Narrowbody',
        arrivalTime: 590, // 09:50
        scheduledDepartureTime: 670, // 11:10
        estimatedDepartureTime: 670,
        gate: 'A03',
        destination: 'CCU (Kolkata)',
        origin: 'HYD (Hyderabad)',
        passengers: 155,
        baggage: 180,
        priority: 'Normal',
        status: 'Flight scheduled',
        currentTask: 'Flight scheduled',
        turnaroundProgress: 0,
        delayDuration: 0,
        fuelRequirement: 12000,
        technicalStatus: 'Normal',
        emergencyStatus: 'None',
        tailNumber: 'VT-EXU'
    },
    {
        id: 'AC-955',
        flightNumber: 'QR955',
        airline: 'Qatar Airways',
        aircraftType: 'Airbus A350-1000',
        category: 'Widebody',
        arrivalTime: 600, // 10:00
        scheduledDepartureTime: 700, // 11:40
        estimatedDepartureTime: 700,
        gate: 'A01',
        destination: 'DOH (Doha)',
        origin: 'DEL (Delhi)',
        passengers: 310,
        baggage: 380,
        priority: 'Normal',
        status: 'Flight scheduled',
        currentTask: 'Flight scheduled',
        turnaroundProgress: 0,
        delayDuration: 0,
        fuelRequirement: 58000,
        technicalStatus: 'Normal',
        emergencyStatus: 'None',
        tailNumber: 'A7-ANI'
    },
    {
        id: 'AC-129',
        flightNumber: 'AI129',
        airline: 'Air India',
        aircraftType: 'Boeing 787-8',
        category: 'Widebody',
        arrivalTime: 610, // 10:10
        scheduledDepartureTime: 705, // 11:45
        estimatedDepartureTime: 705,
        gate: 'B01',
        destination: 'ORD (Chicago O\'Hare)',
        origin: 'DEL (Delhi)',
        passengers: 238,
        baggage: 300,
        priority: 'Normal',
        status: 'Flight scheduled',
        currentTask: 'Flight scheduled',
        turnaroundProgress: 0,
        delayDuration: 0,
        fuelRequirement: 44000,
        technicalStatus: 'Normal',
        emergencyStatus: 'None',
        tailNumber: 'VT-ANQ'
    },
    {
        id: 'AC-740',
        flightNumber: 'AL740',
        airline: 'Imperium Private',
        aircraftType: 'Gulfstream G650ER',
        category: 'Executive',
        arrivalTime: 620, // 10:20
        scheduledDepartureTime: 685, // 11:25
        estimatedDepartureTime: 685,
        gate: 'A02',
        destination: 'HND (Tokyo Haneda)',
        origin: 'ZRH (Zurich)',
        passengers: 10,
        baggage: 15,
        priority: 'High',
        status: 'Flight scheduled',
        currentTask: 'Flight scheduled',
        turnaroundProgress: 0,
        delayDuration: 0,
        fuelRequirement: 21000,
        technicalStatus: 'Normal',
        emergencyStatus: 'None',
        tailNumber: 'N740AL'
    },
    {
        id: 'AC-350',
        flightNumber: 'CX350',
        airline: 'Cathay Pacific',
        aircraftType: 'Airbus A350-900',
        category: 'Widebody',
        arrivalTime: 630, // 10:30
        scheduledDepartureTime: 730, // 12:10
        estimatedDepartureTime: 730,
        gate: 'B02',
        destination: 'HKG (Hong Kong)',
        origin: 'BOM (Mumbai)',
        passengers: 275,
        baggage: 345,
        priority: 'Normal',
        status: 'Flight scheduled',
        currentTask: 'Flight scheduled',
        turnaroundProgress: 0,
        delayDuration: 0,
        fuelRequirement: 50000,
        technicalStatus: 'Normal',
        emergencyStatus: 'None',
        tailNumber: 'B-LRA'
    }
];
