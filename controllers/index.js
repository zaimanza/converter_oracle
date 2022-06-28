var router = require('express').Router();

// split up route handling
router.use('/', require('./check_nft.controller'))

module.exports = router;