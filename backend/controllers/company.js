const Company = require("../models/Company")
exports.createCompany = async (req, res) => {
  try {
    const { name, address, website, description, tel } = req.body;
    if (!name)
      return res.status(400).json({ message: 'Company name is required' });

    const company = await Company.create({
      name,
      address,
      website,
      description,
      tel,
    });

    res.status(201).json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};