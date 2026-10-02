const express = require('express');
const router = express.Router();
const masterController = require('../controllers/masterController');

router.route('/')
    .get(masterController.getMasters)
    .post(masterController.createMaster);

router.route('/:id')
    .delete(masterController.deleteMaster);

module.exports = router;
