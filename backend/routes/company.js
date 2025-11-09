const express = require('express');
const { createCompany } = require('../controllers/company');


const router = express.Router();

router.post('/' ,createCompany);

module.exports = router;
