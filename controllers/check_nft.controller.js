var router = require('express').Router()
const user_wallet = require('../utils/user_wallet.json')
const nfts = require('../utils/nfts.json')
const axios = require('axios').default;

// api/products
router.post('/chcek_nft', async (req, res) => {
    try {
        const props = req.body
        console.log('hello')
        for (const nft of nfts) {
            const isNftExists = await axios.post('http://localhost:3005/controller/is_nft_exist', {
                id: nft.id,
            })
            console.log(isNftExists.data)
            if (!isNftExists.data) {
                console.log("lepas_create")
                const createdNft = await axios.post('http://localhost:3005/controller/create_nft', {
                    nft: nft,
                })
            }
            else {
                //     const updatedNft = await axios.post('/update_nft', {
                //         nft: nft,
                //     })
            }
        }

        var returnData = {}
        if (JSON.stringify(returnData) != JSON.stringify({})) {
            res.status(200).json(true)
        } else {
            res.status(200).json(false)
        }
    } catch (error) {
        res.status(400).json(error)
    }
})

module.exports = router;


