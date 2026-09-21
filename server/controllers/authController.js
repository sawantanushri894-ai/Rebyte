const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { localStore } = require('../config/supabase');
const { JWT_SECRET } = require('../middleware/auth');

function logAudit(req, email, user, status, failureReason = null) {
  const auditEntry = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    user_id: user ? user.id : null,
    email: email || (user ? user.email : 'unknown'),
    role: user ? user.role : 'unauthenticated',
    ip_address: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1 (Localhost)',
    user_agent: req.headers['user-agent'] || 'ReByte Client',
    status: status, // SUCCESS or FAILED
    failure_reason: failureReason,
    timestamp: new Date().toISOString()
  };
  localStore.login_audits.unshift(auditEntry);
  // Keep audit log to 200 items max in memory
  if (localStore.login_audits.length > 200) {
    localStore.login_audits.pop();
  }
}

async function register(req, res) {
  try {
    const { email, password, name, college_id, department, year, phone } = req.body;

    if (!email || !password || !name || !college_id) {
      return res.status(400).json({
        success: false,
        message: 'Name, College Email, College ID, and Password are required.'
      });
    }

    // Validate college domain
    const emailLower = email.toLowerCase().trim();
    const isCollegeDomain = emailLower.endsWith('.edu.in') || 
                           emailLower.endsWith('.ac.in') || 
                           emailLower.includes('viva') || 
                           emailLower.includes('mu');

    if (!isCollegeDomain) {
      return res.status(400).json({
        success: false,
        message: 'Registration requires an authorized Mumbai University / VIVA college domain email (@viva.edu.in, @mu.ac.in).'
      });
    }

    const existingUser = localStore.users.find(u => u.email.toLowerCase() === emailLower);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this college email already exists.'
      });
    }

    // Step 1: Generate Mock OTP simulation & set status to pending_verification
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = {
      id: `usr-${uuidv4().slice(0, 8)}`,
      email: emailLower,
      password: password, // In production, bcrypt hash
      name: name.trim(),
      role: 'student',
      college_id: college_id.trim().toUpperCase(),
      department: department || 'Electronics & Computer Engineering',
      year: year || 'SE - Sem IV',
      phone: phone || '+91 98000 00000',
      status: 'pending_verification', // Infographic Step 1 requirement
      otp_code: mockOtp,
      id_card_url: `https://rebyte-assets.viva.edu.in/id-cards/${college_id.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`,
      created_at: new Date().toISOString()
    };

    localStore.users.push(newUser);

    return res.status(201).json({
      success: true,
      message: 'Step 1 complete: Student registration received. Simulated 6-digit OTP dispatched to college email. Account flagged as pending_verification.',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        college_id: newUser.college_id,
        status: newUser.status,
        otp_simulation: mockOtp
      }
    });
  } catch (err) {
    console.error('[Register Error]', err);
    return res.status(500).json({ success: false, message: 'Internal server error during registration' });
  }
}

async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const user = localStore.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.otp_code && user.otp_code !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code entered' });
    }

    user.otp_verified = true;
    return res.json({
      success: true,
      message: 'OTP validated successfully. Registration submitted for Admin Verification (Step 2).',
      data: {
        id: user.id,
        email: user.email,
        status: user.status
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal error validating OTP' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      logAudit(req, email, null, 'FAILED', 'Missing email or password in request');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const emailLower = email.toLowerCase().trim();
    const user = localStore.users.find(u => u.email.toLowerCase() === emailLower);

    if (!user) {
      logAudit(req, emailLower, null, 'FAILED', 'User account does not exist');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No registered account for this email.'
      });
    }

    if (user.password !== password) {
      logAudit(req, emailLower, user, 'FAILED', 'Incorrect password credentials');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password mismatch.'
      });
    }

    // Successful login -> write to audit history
    logAudit(req, emailLower, user, 'SUCCESS', null);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, otp_code: __, ...safeUser } = user;

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('[Login Error]', err);
    return res.status(500).json({ success: false, message: 'Internal server error during login' });
  }
}

async function getMe(req, res) {
  const { password: _, otp_code: __, ...safeUser } = req.user;
  return res.json({
    success: true,
    user: safeUser
  });
}

module.exports = {
  register,
  verifyOtp,
  login,
  getMe,
  logAudit
};
