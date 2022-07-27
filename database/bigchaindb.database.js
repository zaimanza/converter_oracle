const axios = require('axios').default
const BigChainDB = require('bigchaindb-driver')
const bip39 = require('bip39')
const { Assets } = require('./mongodb.database')
const API_PATH = 'https://httpsbigchain.appserver.projectoasis.io/api/v1/'
const conn = new BigChainDB.Connection(API_PATH)

const fetchLatestTransaction = async (assetId) => {
    try {
        // console.log(assetId)
        // console.log("qw1")
        var transaction_data = await conn.listTransactions(assetId)
        console.log(assetId)
        // console.log(transaction_data)
        // console.log("qw2")
        transaction_data = transaction_data[transaction_data.length - 1]
        // console.log("qw3")
        // console.log(transaction_data?.asset?.id ?? transaction_data?.id)
        var temp_asset = await conn.searchAssets(transaction_data?.asset?.id ?? transaction_data?.id)
        // console.log("qw4")
        transaction_data.asset = temp_asset[0].data
        // console.log(transaction_data)

        return transaction_data
    } catch (error) {
        return
    }
}
exports.fetchLatestTransaction = fetchLatestTransaction

exports.createSingleAsset = async ({ asset, metadata, publicKey, privateKey }) => {
    // try {
    const txCreatePaint = BigChainDB.Transaction.makeCreateTransaction(
        asset,
        metadata,
        [
            BigChainDB.Transaction.makeOutput(
                BigChainDB.Transaction.makeEd25519Condition(publicKey),
            ),
        ],
        publicKey,
    )
    const txSigned = BigChainDB.Transaction.signTransaction(txCreatePaint, privateKey)

    let assetCreated = await conn.postTransactionCommit(txSigned)

    return assetCreated ?? {}
    // } catch (error) {
    //     res.status(400).json(error);
    // }
}

exports.updateSingleAsset = async ({ txCreatedID, publicKey, privateKey, metadata }) => {
    try {
        let txCreated = await conn.getTransaction(txCreatedID)

        const updatedBuilding = BigChainDB.Transaction.makeTransferTransaction(
            [
                {
                    tx: txCreated,
                    output_index: 0,
                },
            ],
            [
                BigChainDB.Transaction.makeOutput(
                    BigChainDB.Transaction.makeEd25519Condition(publicKey),
                ),
            ],
            metadata,
        )

        const signedTransfer = BigChainDB.Transaction.signTransaction(
            updatedBuilding,
            privateKey,
        )

        let assetTransfered = await conn.postTransactionCommit(signedTransfer)


        if (!assetTransfered) return {}
        return assetTransfered
    } catch (error) {
    }
}

exports.fetchTransaction = async (assetId) => {
    try {
        var list = {}
        list = await axios.get(`${API_PATH}transactions/${assetId}`).catch(function (error) {
            if (error) {
                console.log("Error in axios")
            }
        })

        if (!list) {
            list = {}
        }

        if (Object.keys(list).length === 0) return

        return await list
    } catch (error) {
        res.status(400).json(error);
    }
}

const searchAssetsBdb = async (string_data) => {
    let list = await axios(
        `${API_PATH}assets?search=${string_data}`
    );

    return list.data
}
exports.searchAssetsBdb = searchAssetsBdb

const listOutputsBdb = async (publicKey) => {
    console.table(publicKey)
    return await conn.listOutputs(publicKey)
}
exports.listOutputsBdb = listOutputsBdb

const listTransactionsBdb = async (assetId) => {
    return await conn.listTransactions(assetId)
}
exports.listTransactionsBdb = listTransactionsBdb
