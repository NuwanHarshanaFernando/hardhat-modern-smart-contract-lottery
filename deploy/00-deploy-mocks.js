const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

 /* VRF Mock Values */
   // const MOCK_BASE_FEE = ethers.utils.parseEther("0.25"); // 0.25 is the premium. It costs 0.25 LINK per request.
   const MOCK_BASE_FEE = ethers.parseEther("0.25"); // 0.25 is the premium. It costs 0.25 LINK per request.
   const MOCK_GAS_PRICE_LINK = 1e9; // link per gas. Calculated value based on the gas price of the chain
    // Eth price is sky rocketing $1,000,000,000 
    // Chainlink Nodes pay the gas fees to give us randomness & do external execution
    // So the price of requests change based on the price of gas
    // LINK / ETH price
    const MOCK_WEI_PER_UNIT_LINK = 4e15;

module.exports = async function({getNamedAccounts, deployments}){
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = [MOCK_BASE_FEE, MOCK_GAS_PRICE_LINK, MOCK_WEI_PER_UNIT_LINK]

    if(developmentChains.includes(network.name)){
        log("Local network detected! Deploying mocks...")
        // deploy a mock vrfcoordinator...
        await deploy("VRFCoordinatorV2_5Mock", {
            from: deployer,
            log: true,
            args: args
        })
        log("Mocks Deployed!")
        log("-----------------------------------------------")
    }

   
}

module.exports.tags = ["all", "mocks"]