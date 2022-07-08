var router = require('express').Router()
const user_wallet = require('../utils/user_wallet.json')
const nfts = require('../utils/nfts.json')
const axios = require('axios').default;

// api/products
router.post('/chcek_nft', async (req, res) => {
    try {
        const props = req.body
        var returnData = false
        // oasis-crypto-wallets
        // search user-crypto-wallets
        const moralis_data = await axios.get('https://deep-index.moralis.io/api/v2/' +
            props?.wallet_address
            + '/nft?chain=bsc&format=decimal', {
            headers: {
                'Accept': 'application/json',
                'X-API-Key': 'yF2EqHpOWCYHgZgwF3nb7TTCOs0inQ7ACAdbZTyukQdxHDtIBwf8MdIoUMGh7CdL'
            }
        });

        const results = moralis_data?.data?.result
        var oasis_inventory_metadatas = []
        for (const result of results) {
            const isNftExists = await axios.post('http://localhost:3005/is_nft_exist', {
                did: props?.did,
                nft: result,
            })
            if (!isNftExists.data) {
                const createdNft = await axios.post('http://localhost:3005/create_nft', {
                    did: props?.did,
                    nft: result,
                })
            }
            else {

                const updatedNft = await axios.post('http://localhost:3005/get_transaction_id', {
                    did: props?.did,
                    nft: result,
                })

                var oasis_inventory_metadata = {
                    asset_id: updatedNft?.data,
                    amount: result?.amount
                }
                oasis_inventory_metadatas.push(oasis_inventory_metadata)

            }
            returnData = true
        }


        const oasis_inventory_find = await axios.post('http://localhost:3005/oasis_inventory/find', {
            did: props?.did,
        })

        var return_inventory
        if (!oasis_inventory_find?.data) {
            // create
            const oasis_inventory_create = await axios.post('http://localhost:3005/oasis_inventory/create', {
                did: props?.did,
                metadata: oasis_inventory_metadatas,
            })
            return_inventory = oasis_inventory_create?.data
        } else {
            // update
            console.log("tak_rela_update")
            var new_datas_to_update = []
            console.log(oasis_inventory_find?.data?.metadata)
            oasis_inventory_find?.data?.metadata?.metadata?.forEach(currentValue => {
                manipulate_data = currentValue
                oasis_inventory_metadatas?.forEach((currentValuei, index, arr) => {
                    if (currentValue?.asset_id === currentValuei?.asset_id) {
                        manipulate_data = currentValuei
                        oasis_inventory_metadatas?.splice(index, 1)
                    }
                })
                new_datas_to_update.push(manipulate_data)
            });
            new_datas_to_update.concat(oasis_inventory_metadatas)

            const oasis_inventory_append = await axios.post('http://localhost:3005/oasis_inventory/append', {
                did: props?.did,
                metadata: new_datas_to_update,
            })

            if (oasis_inventory_append?.data) {
                return_inventory = oasis_inventory_append?.data
            } else {
                return_inventory = oasis_inventory_find?.data
            }


        }
        return res.status(200).json({
            id: return_inventory?.id,
            asset: return_inventory?.asset,
            metadata: return_inventory?.metadata,
        })
    } catch (error) {
        return res.status(400).json(error)
    }
})

module.exports = router;


