const express = require('express');
const { createCompany, getCompanies } = require('../controllers/company');
const { authorize,protect } = require('../middlewares/auth');


const router = express.Router();

router.post('/' ,protect,authorize("admin"),createCompany);
router.get('/' ,protect,getCompanies);


module.exports = router;
