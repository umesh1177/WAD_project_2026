const express = require('express');
const router = express.Router();
const {
  getMasterCollection,
  getAllMasters,
  saveMasterCollection,
} = require('../controllers/masterController');

router.get('/all', getAllMasters);
router.get('/:type', getMasterCollection);
router.post('/:type', saveMasterCollection);
router.put('/:type', saveMasterCollection);

module.exports = router;
