var router = require('express').Router()
const user_wallet = require('../utils/user_wallet.json')
const nfts = require('../utils/nfts.json')
const axios = require('axios').default;

// api/products
router.post('/chcek_nft', async (req, res) => {
    try {
        const props = req.body
        var returnData = false

        for (const nft of nfts) {
            const isNftExists = await axios.post('http://localhost:3005/is_nft_exist', {
                did: nft.did,
            })
            console.log(isNftExists.data)
            if (!isNftExists.data) {
                console.log("lepas_create")
                const createdNft = await axios.post('http://localhost:3005/create_nft', {
                    nft: nft,
                })
            }
            else {
                const updatedNft = await axios.post('http://localhost:3005/update_nft', {
                    nft: nft,
                })
            }
            returnData = true
        }

        return res.status(200).json(returnData)
    } catch (error) {
        return res.status(400).json(error)
    }
})

module.exports = router;


