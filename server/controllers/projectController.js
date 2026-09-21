const { localStore } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

async function createProject(req, res) {
  try {
    const { title, domain_tags, abstract, hardware_requested } = req.body;

    if (!title || !abstract) {
      return res.status(400).json({ success: false, message: 'Project title and abstract are required' });
    }

    const newProject = {
      id: `proj-${uuidv4().slice(0, 6)}`,
      title,
      student_id: req.user.id,
      student_name: req.user.name,
      student_email: req.user.email,
      domain_tags: Array.isArray(domain_tags) ? domain_tags : ['IoT', 'Robotics'],
      abstract,
      hardware_requested: Array.isArray(hardware_requested) ? hardware_requested : [hardware_requested || 'ESP32'],
      status: 'PENDING_REVIEW',
      mentor_assigned: null,
      submitted_at: new Date().toISOString()
    };

    localStore.projects.unshift(newProject);

    return res.status(201).json({
      success: true,
      message: 'Capstone / Mini-Project proposal submitted for faculty review. Lab faculty will assign a mentor shortly.',
      data: newProject
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error submitting project proposal' });
  }
}

async function getUserProjects(req, res) {
  try {
    const projects = localStore.projects.filter(p => p.student_id === req.user.id);
    return res.json({ success: true, data: projects });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving user projects' });
  }
}

module.exports = {
  createProject,
  getUserProjects
};
