const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabaseClient = null;
let isDualModeFallback = true;

if (SUPABASE_URL && SUPABASE_KEY && !SUPABASE_URL.includes('your-project')) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
    isDualModeFallback = false;
    console.log('[ReByte Supabase] Connected to live Supabase PostgreSQL instance');
  } catch (err) {
    console.warn('[ReByte Supabase] Failed to connect to Supabase. Activating Local Dual-Mode Fallback.');
    isDualModeFallback = true;
  }
} else {
  console.log('[ReByte Supabase] Running in robust Local Dual-Mode Fallback store (No Supabase credentials detected)');
}

// In-Memory Fallback Store pre-seeded for Mumbai University / VIVA Institute of Technology ECE Dept
const localStore = {
  users: [
    {
      id: 'usr-admin-01',
      email: 'admin@viva.edu.in',
      password: 'admin123',
      name: 'Prof. K. Venkatesh (Lab In-Charge)',
      role: 'admin',
      college_id: 'VIVA-FAC-ECE-01',
      department: 'Electronics & Computer Engineering',
      year: 'Faculty',
      phone: '+91 98201 12345',
      status: 'verified',
      created_at: new Date('2026-01-10T10:00:00Z').toISOString()
    },
    {
      id: 'usr-student-01',
      email: 'anushka.ece@viva.edu.in',
      password: 'student123',
      name: 'Anushka Sharma',
      role: 'student',
      college_id: 'VIVA-ECE-2024-042',
      department: 'Electronics & Computer Engineering',
      year: 'SE - Sem IV',
      phone: '+91 98765 43210',
      status: 'verified',
      created_at: new Date('2026-02-01T09:30:00Z').toISOString()
    },
    {
      id: 'usr-student-02',
      email: 'rahul.ece@viva.edu.in',
      password: 'student123',
      name: 'Rahul Patil',
      role: 'student',
      college_id: 'VIVA-ECE-2024-089',
      department: 'Electronics & Computer Engineering',
      year: 'SE - Sem IV',
      phone: '+91 91234 56789',
      status: 'pending_verification',
      otp_code: '582910',
      created_at: new Date('2026-09-12T14:15:00Z').toISOString()
    }
  ],
  inventory: [
    {
      id: 'inv-esp32',
      name: 'ESP32-WROOM-32 Wi-Fi & BLE Dev Board',
      category: 'Microcontrollers',
      description: 'Dual-core Xtensa 32-bit LX6 MCU, 240MHz, integrated Wi-Fi and Bluetooth BLE 4.2. Ideal for IoT capstone projects.',
      stock: 14,
      total_stock: 16,
      daily_rate: 15,
      purchase_price: 450,
      security_deposit: 250,
      condition: 'A+ Tested',
      shelf_location: 'Rack B-03 (Lab 302)',
      is_available: true,
      image_badge: 'IoT Ready',
      tags: ['IoT', 'Wi-Fi', 'ESP32', 'Bluetooth']
    },
    {
      id: 'inv-arduino-uno',
      name: 'Arduino Uno R3 (ATmega328P DIP)',
      category: 'Microcontrollers',
      description: 'Official compatible microcontroller board with 14 digital I/O pins, 6 PWM, 6 analog inputs, 16 MHz ceramic resonator.',
      stock: 22,
      total_stock: 25,
      daily_rate: 10,
      purchase_price: 380,
      security_deposit: 200,
      condition: 'Good',
      shelf_location: 'Rack A-01 (Lab 301)',
      is_available: true,
      image_badge: 'ECE Standard',
      tags: ['Arduino', 'Beginner', 'GPIO']
    },
    {
      id: 'inv-raspberry-pi4',
      name: 'Raspberry Pi 4 Model B (4GB LPDDR4)',
      category: 'Microcontrollers',
      description: 'Quad-core 1.5GHz 64-bit ARM Cortex-A72 CPU, dual 4K micro-HDMI, Gigabit Ethernet, 2x USB 3.0. Suited for Edge AI & Computer Vision.',
      stock: 5,
      total_stock: 6,
      daily_rate: 45,
      purchase_price: 4200,
      security_deposit: 1500,
      condition: 'Like New',
      shelf_location: 'Locked Cabinet C-01',
      is_available: true,
      image_badge: 'High Spec',
      tags: ['Raspberry Pi', 'Linux', 'Edge AI', 'Computer Vision']
    },
    {
      id: 'inv-stm32-bluepill',
      name: 'STM32F103C8T6 ARM Cortex-M3 BluePill',
      category: 'Microcontrollers',
      description: '32-bit ARM Cortex-M3 core, 72 MHz, 64KB Flash, 20KB SRAM. Required for BMD / Advanced Microprocessor syllabus.',
      stock: 18,
      total_stock: 20,
      daily_rate: 12,
      purchase_price: 290,
      security_deposit: 150,
      condition: 'Tested',
      shelf_location: 'Rack A-04 (Lab 302)',
      is_available: true,
      image_badge: 'ARM Core',
      tags: ['ARM', 'STM32', 'Embedded Systems']
    },
    {
      id: 'inv-sensor-hcsr04',
      name: 'HC-SR04 Ultrasonic Distance Sensor',
      category: 'Sensors',
      description: 'Non-contact distance measurement from 2cm to 400cm with 3mm ranging accuracy. Essential for obstacle avoidance robots.',
      stock: 35,
      total_stock: 40,
      daily_rate: 5,
      purchase_price: 95,
      security_deposit: 50,
      condition: 'Good',
      shelf_location: 'Drawer S-02',
      is_available: true,
      image_badge: 'Acoustic',
      tags: ['Ultrasonic', 'Distance', 'Robotics']
    },
    {
      id: 'inv-sensor-mpu6050',
      name: 'MPU-6050 6-Axis Accelerometer & Gyroscope',
      category: 'Sensors',
      description: 'Triple-axis MEMS accelerometer and triple-axis gyroscope with integrated Digital Motion Processor (DMP) on I2C bus.',
      stock: 20,
      total_stock: 22,
      daily_rate: 8,
      purchase_price: 160,
      security_deposit: 100,
      condition: 'Verified',
      shelf_location: 'Drawer S-05',
      is_available: true,
      image_badge: '6-DOF',
      tags: ['IMU', 'Gyroscope', 'I2C']
    },
    {
      id: 'inv-actuator-sg90',
      name: 'SG90 9g Micro Servo Motor (180°)',
      category: 'Actuators',
      description: 'High torque miniature servo motor with nylon gears. 1.6 kg-cm torque at 4.8V. Includes mounting horns and screws.',
      stock: 40,
      total_stock: 45,
      daily_rate: 5,
      purchase_price: 110,
      security_deposit: 60,
      condition: 'New',
      shelf_location: 'Drawer M-01',
      is_available: true,
      image_badge: 'PWM Servo',
      tags: ['Servo', 'Actuator', 'Robotics']
    },
    {
      id: 'inv-actuator-l298n',
      name: 'L298N Dual H-Bridge Motor Driver Module',
      category: 'Actuators',
      description: 'Dual full-bridge driver designed to accept standard TTL logic levels and drive inductive loads like relays, solenoids, DC and stepping motors.',
      stock: 16,
      total_stock: 18,
      daily_rate: 7,
      purchase_price: 180,
      security_deposit: 100,
      condition: 'Good',
      shelf_location: 'Drawer M-03',
      is_available: true,
      image_badge: 'High Current',
      tags: ['Motor Driver', 'H-Bridge', 'DC Motors']
    },
    {
      id: 'inv-display-1602i2c',
      name: '16x2 Character LCD with I2C Module (Yellow-Green)',
      category: 'Displays',
      description: 'Alphanumeric dot matrix LCD with PCF8574 I2C adapter pre-soldered. Reduces pin usage from 16 to 2 wires (SDA/SCL).',
      stock: 25,
      total_stock: 28,
      daily_rate: 6,
      purchase_price: 190,
      security_deposit: 100,
      condition: 'Tested',
      shelf_location: 'Drawer D-01',
      is_available: true,
      image_badge: 'I2C Serial',
      tags: ['LCD', 'Display', 'I2C']
    },
    {
      id: 'inv-tool-multimeter',
      name: 'Digital Multimeter DT830D with Probes',
      category: 'Tools & Passives',
      description: 'Measures DC/AC voltage, DC current, resistance, diode test and hFE transistor check with continuity buzzer.',
      stock: 12,
      total_stock: 14,
      daily_rate: 15,
      purchase_price: 320,
      security_deposit: 200,
      condition: 'Calibrated',
      shelf_location: 'Equipment Rack T-01',
      is_available: true,
      image_badge: 'Lab Tool',
      tags: ['Multimeter', 'Measurement', 'Testing']
    },
    {
      id: 'inv-ewaste-mega2560',
      name: 'Refurbished Arduino Mega 2560 (E-Waste Restored)',
      category: 'E-Waste Refurbished',
      description: 'Recovered from semester-end student scrap bins. Blown 5V LDO diode replaced and bootloader re-flashed by VIVA ECE Tech Club.',
      stock: 8,
      total_stock: 10,
      daily_rate: 12,
      purchase_price: 520,
      security_deposit: 250,
      condition: 'Restored / Fully Functional',
      shelf_location: 'Green Rack E-01',
      is_available: true,
      image_badge: 'Eco Restored',
      tags: ['E-Waste', 'Recycled', 'Mega2560', 'Restored']
    }
  ],
  rentals: [
    {
      id: 'rnt-101',
      user_id: 'usr-student-01',
      user_name: 'Anushka Sharma',
      user_email: 'anushka.ece@viva.edu.in',
      item_id: 'inv-esp32',
      item_name: 'ESP32-WROOM-32 Wi-Fi & BLE Dev Board',
      rental_type: 'RENT',
      duration_days: 7,
      daily_rate: 15,
      rental_fee: 105,
      security_deposit: 250,
      total_amount: 355,
      payment_method: 'UPI_QR',
      payment_reference: 'UPI-VIVA-982187',
      pickup_token: 'RNT-20260910-401',
      status: 'COLLECTED', // Infographic Step 6 explicit state
      created_at: new Date('2026-09-10T11:00:00Z').toISOString(),
      collected_at: new Date('2026-09-10T11:30:00Z').toISOString(),
      due_date: new Date('2026-09-17T11:30:00Z').toISOString(),
      counter_officer: 'Prof. K. Venkatesh',
      condition_on_checkout: 'A+ Tested',
      condition_on_return: null,
      fine_amount: 0,
      refunded_deposit: 0,
      returned_at: null
    },
    {
      id: 'rnt-102',
      user_id: 'usr-student-01',
      user_name: 'Anushka Sharma',
      user_email: 'anushka.ece@viva.edu.in',
      item_id: 'inv-raspberry-pi4',
      item_name: 'Raspberry Pi 4 Model B (4GB LPDDR4)',
      rental_type: 'RENT',
      duration_days: 5,
      daily_rate: 45,
      rental_fee: 225,
      security_deposit: 1500,
      total_amount: 1725,
      payment_method: 'OFFLINE_STORE_CASH',
      pickup_token: 'RNT-20260913-882',
      status: 'APPROVED', // Pending offline collection
      created_at: new Date('2026-09-13T10:00:00Z').toISOString(),
      collected_at: null,
      due_date: null,
      counter_officer: null,
      condition_on_checkout: 'Like New',
      condition_on_return: null,
      fine_amount: 0,
      refunded_deposit: 0,
      returned_at: null
    }
  ],
  payments: [
    {
      id: 'pay-001',
      rental_id: 'rnt-101',
      user_id: 'usr-student-01',
      user_email: 'anushka.ece@viva.edu.in',
      amount: 355,
      payment_method: 'UPI_QR',
      status: 'PAID',
      transaction_ref: 'UPI-VIVA-982187',
      offline_token: 'RNT-20260910-401',
      created_at: new Date('2026-09-10T11:00:00Z').toISOString()
    },
    {
      id: 'pay-002',
      rental_id: 'rnt-102',
      user_id: 'usr-student-01',
      user_email: 'anushka.ece@viva.edu.in',
      amount: 1725,
      payment_method: 'OFFLINE_STORE_CASH',
      status: 'PENDING_OFFLINE_PAYMENT',
      transaction_ref: 'CASH-COUNTER-VIVA',
      offline_token: 'RNT-20260913-882',
      created_at: new Date('2026-09-13T10:00:00Z').toISOString()
    }
  ],
  donations: [
    {
      id: 'don-01',
      student_id: 'usr-student-01',
      student_name: 'Anushka Sharma',
      student_email: 'anushka.ece@viva.edu.in',
      component_name: 'Salvaged Arduino Nano + HC-05 Bluetooth',
      category: 'Microcontrollers',
      estimated_weight_kg: 0.25,
      condition_description: 'Working condition, headers slightly bent. Mini USB port firm.',
      status: 'PENDING_EVALUATION',
      evaluation_notes: 'Awaiting lab technician multimeter check',
      created_at: new Date('2026-09-11T16:00:00Z').toISOString()
    },
    {
      id: 'don-02',
      student_id: 'usr-student-02',
      student_name: 'Rahul Patil',
      student_email: 'rahul.ece@viva.edu.in',
      component_name: 'Faulty Arduino Mega 2560 (Blown Diode)',
      category: 'E-Waste Refurbished',
      estimated_weight_kg: 0.4,
      condition_description: 'Power LED was dead. Salvaged from semester mini project.',
      status: 'RESTOCKED',
      evaluation_notes: 'Diode replaced by tech club, restocked to green inventory shelf',
      restocked_inventory_id: 'inv-ewaste-mega2560',
      created_at: new Date('2026-09-05T12:00:00Z').toISOString()
    }
  ],
  projects: [
    {
      id: 'proj-01',
      title: 'Autonomous Agri-Rover with ESP32 & LoRa Mesh',
      student_id: 'usr-student-01',
      student_name: 'Anushka Sharma',
      student_email: 'anushka.ece@viva.edu.in',
      domain_tags: ['IoT', 'Robotics', 'LoRa', 'Agriculture'],
      abstract: 'A soil moisture mapping rover equipped with ultrasonic obstacle avoidance and telemetry transmitting over a 1km LoRa range to central node.',
      hardware_requested: ['ESP32-WROOM-32', 'HC-SR04', 'L298N Motor Driver', 'LoRa SX1278'],
      status: 'APPROVED',
      mentor_assigned: 'Prof. K. Venkatesh',
      submitted_at: new Date('2026-09-08T10:00:00Z').toISOString()
    },
    {
      id: 'proj-02',
      title: 'Gesture-Controlled Robotic Wheelchair using MPU-6050',
      student_id: 'usr-student-02',
      student_name: 'Rahul Patil',
      student_email: 'rahul.ece@viva.edu.in',
      domain_tags: ['Embedded Systems', 'Assistive Tech', 'Robotics'],
      abstract: 'Hands-free navigation system mapping head tilt angles using MPU-6050 IMU to differential motor drive commands via Arduino Mega.',
      hardware_requested: ['Arduino Uno R3', 'MPU-6050', 'L298N', 'SG90 Servo'],
      status: 'PENDING_REVIEW',
      mentor_assigned: null,
      submitted_at: new Date('2026-09-12T15:30:00Z').toISOString()
    }
  ],
  login_audits: [
    {
      id: 'aud-001',
      user_id: 'usr-admin-01',
      email: 'admin@viva.edu.in',
      role: 'admin',
      ip_address: '192.168.1.102 (Campus LAN)',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0',
      status: 'SUCCESS',
      failure_reason: null,
      timestamp: new Date('2026-09-13T09:00:00Z').toISOString()
    },
    {
      id: 'aud-002',
      user_id: 'usr-student-01',
      email: 'anushka.ece@viva.edu.in',
      role: 'student',
      ip_address: '10.20.44.15 (VIVA WiFi)',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0',
      status: 'SUCCESS',
      failure_reason: null,
      timestamp: new Date('2026-09-13T09:30:00Z').toISOString()
    },
    {
      id: 'aud-003',
      user_id: null,
      email: 'intruder@unknown.com',
      role: 'unknown',
      ip_address: '185.220.101.5',
      user_agent: 'Python-urllib/3.10',
      status: 'FAILED',
      failure_reason: 'User not found / Invalid college domain credentials',
      timestamp: new Date('2026-09-13T10:15:00Z').toISOString()
    }
  ]
};

module.exports = {
  supabaseClient,
  isDualModeFallback,
  localStore
};
