var router = require('express').Router()
const user_wallet = require('../utils/user_wallet.json')
const nfts = require('../utils/nfts.json')
const axios = require('axios').default;

// api/products
router.post('/chcek_nft', async (req, res) => {
    try {
        const props = req.body
        var returnData = false

        // search user-crypto-wallets
        const moralis_data = await axios.get('https://deep-index.moralis.io/api/v2/' +
            props?.wallet_address
            + '/nft?chain=bsc&format=decimal', {
            headers: {
                'Accept': 'application/json',
                'X-API-Key': 'yF2EqHpOWCYHgZgwF3nb7TTCOs0inQ7ACAdbZTyukQdxHDtIBwf8MdIoUMGh7CdL'
            }
        });
        // console.log(moralis_data?.data)
        const results = moralis_data?.data?.result
        for (const result of results) {
            const isNftExists = await axios.post('http://localhost:3005/is_nft_exist', {
                did: props?.did,
                nft: result,
            })
            // console.log(props?.did)
            // console.log(result)
            // console.log(isNftExists.data)
            if (!isNftExists.data) {
                console.log("lepas_create")
                const createdNft = await axios.post('http://localhost:3005/create_nft', {
                    did: props?.did,
                    nft: result,
                })
                // return res.status(200).json(createdNft)
            }
            else {
                console.log("lepas_update")
                const updatedNft = await axios.post('http://localhost:3005/update_nft', {
                    did: props?.did,
                    nft: result,
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


