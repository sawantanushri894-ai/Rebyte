const { localStore } = require('../config/supabase');

async function getAll(req, res) {
  try {
    const { category, search, available_only } = req.query;
    let items = [...localStore.inventory];

    if (category && category !== 'ALL') {
      items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i => 
        i.name.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q)) ||
        (i.tags && i.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (available_only === 'true') {
      items = items.filter(i => i.stock > 0);
    }

    return res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch inventory' });
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;
    const item = localStore.inventory.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Component not found' });
    }
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch component' });
  }
}

async function getCategories(req, res) {
  const categories = Array.from(new Set(localStore.inventory.map(i => i.category)));
  return res.json({ success: true, data: categories });
}

module.exports = {
  getAll,
  getById,
  getCategories
};
