const { localStore } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

async function createDonation(req, res) {
  try {
    const { component_name, category, estimated_weight_kg, condition_description } = req.body;

    if (!component_name) {
      return res.status(400).json({ success: false, message: 'Component name is required' });
    }

    const donation = {
      id: `don-${uuidv4().slice(0, 6)}`,
      student_id: req.user.id,
      student_name: req.user.name,
      student_email: req.user.email,
      component_name,
      category: category || 'E-Waste Refurbished',
      estimated_weight_kg: parseFloat(estimated_weight_kg || 0.2),
      condition_description: condition_description || 'Student e-waste contribution',
      status: 'PENDING_EVALUATION',
      evaluation_notes: 'Awaiting lab technician multimeter check and physical inspection',
      created_at: new Date().toISOString()
    };

    localStore.donations.unshift(donation);

    return res.status(201).json({
      success: true,
      message: 'E-Waste donation logged successfully. Thank you for contributing to campus circular electronics! Lab technicians will evaluate and credit your profile.',
      data: donation
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error submitting donation' });
  }
}

async function getUserDonations(req, res) {
  try {
    const donations = localStore.donations.filter(d => d.student_id === req.user.id);
    return res.json({ success: true, data: donations });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving donations' });
  }
}

module.exports = {
  createDonation,
  getUserDonations
};
