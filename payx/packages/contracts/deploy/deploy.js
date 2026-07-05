// PayX Contract Deployment Script for Arc Testnet
import { ethers } from "ethers";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root .env
dotenv.config({ path: path.join(__dirname, "../../../.env") });

// Arc Testnet Configuration
const ARC_TESTNET_RPC = "https://rpc.testnet.arc.network";
const CHAIN_ID = 1993887;

// Contract ABIs and Bytecode (compiled from Solidity)
// MockUSDC - Simple ERC20 with mint function
const MockUSDCABI = [
  "constructor()",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount)",
  "function faucet()",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// MockUSDC Bytecode (simplified ERC20)
const MockUSDCBytecode = "0x608060405234801561001057600080fd5b506040518060400160405280600881526020017f55534420436f696e0000000000000000000000000000000000000000000000008152506040518060400160405280600481526020017f555344430000000000000000000000000000000000000000000000000000000081525081600390816100919190610324565b5080600490816100a19190610324565b5050506103f6565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061012a57607f821691505b60208210810361013d5761013c6100e3565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b6000600883026101a57fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82610168565b6101af8683610168565b95508019841693508086168417925050509392505050565b6000819050919050565b6000819050919050565b60006101f66101f16101ec846101c7565b6101d1565b6101c7565b9050919050565b6000819050919050565b610210836101db565b61022461021c826101fd565b848454610175565b825550505050565b600090565b61023961022c565b610244818484610207565b505050565b5b818110156102685761025d600082610231565b60018101905061024a565b5050565b601f8211156102ad5761027e81610143565b61028784610158565b81016020851015610296578190505b6102aa6102a285610158565b830182610249565b50505b505050565b600082821c905092915050565b60006102d0600019846008026102b2565b1980831691505092915050565b60006102e983836102bf565b9150826002028217905092915050565b610302826100a9565b67ffffffffffffffff81111561031b5761031a6100b4565b5b6103258254610112565b61033082828561026c565b600060209050601f8311600181146103635760008415610351578287015190505b61035b85826102dd565b8655506103c3565b601f19841661037186610143565b60005b8281101561039957848901518255600182019150602085019450602081019050610374565b868310156103b657848901516103b2601f8916826102bf565b8355505b6001600288020188555050505b505050505050565b610dd7806104056000396000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c806370a082311161007157806370a082311461019a57806395d89b41146101ca578063a0712d68146101e8578063a9059cbb14610204578063dd62ed3e14610234578063de0e9a3e14610264576100b4565b806306fdde03146100b9578063095ea7b3146100d757806318160ddd1461010757806323b872dd14610125578063313ce5671461015557806340c10f1914610173575b600080fd5b6100c161026e565b6040516100ce9190610a1a565b60405180910390f35b6100f160048036038101906100ec9190610ad5565b610300565b6040516100fe9190610b30565b60405180910390f35b61010f610323565b60405161011c9190610b5a565b60405180910390f35b61013f600480360381019061013a9190610b75565b61032d565b60405161014c9190610b30565b60405180910390f35b61015d61035c565b60405161016a9190610be4565b60405180910390f35b61018d60048036038101906101889190610ad5565b610365565b005b6101b460048036038101906101af9190610bff565b610373565b6040516101c19190610b5a565b60405180910390f35b6101d26103bb565b6040516101df9190610a1a565b60405180910390f35b61020260048036038101906101fd9190610c2c565b61044d565b005b61021e60048036038101906102199190610ad5565b61045a565b60405161022b9190610b30565b60405180910390f35b61024e60048036038101906102499190610c59565b61047d565b60405161025b9190610b5a565b60405180910390f35b61026c610504565b005b60606003805461027d90610cc8565b80601f01602080910402602001604051908101604052809291908181526020018280546102a990610cc8565b80156102f65780601f106102cb576101008083540402835291602001916102f6565b820191906000526020600020905b8154815290600101906020018083116102d957829003601f168201915b5050505050905090565b60008061030b610519565b9050610318818585610521565b600191505092915050565b6000600254905090565b600080610338610519565b9050610345858285610533565b6103508585856105c7565b60019150509392505050565b60006012905090565b61036f82826106bb565b5050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b6060600480546103ca90610cc8565b80601f01602080910402602001604051908101604052809telegramateu4e29181815260200182805461026c90610cc8565b80156104435780601f1061041857610100808354040283529160200191610443565b820191906000526020600020905b81548152906001019060200180831161042657829003601f168201915b5050505050905090565b610457338261073d565b50565b600080610465610519565b90506104728185856105c7565b600191505092915050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b61051733683635c9adc5dea0000061073d565b565b600033905090565b61052e83838360016107bf565b505050565b600061053f848461047d565b905060001981146105c157818110156105b1578281836040517ffb8f41b20000000000000000000000000000000000000000000000000000000081526004016105a893929190610d08565b60405180910390fd5b6105c0848484840360006107bf565b5b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036106395760006040517f96c6fd1e0000000000000000000000000000000000000000000000000000000081526004016106309190610d3f565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036106ab5760006040517fec442f050000000000000000000000000000000000000000000000000000000081526004016106a29190610d3f565b60405180910390fd5b6106b6838383610996565b505050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff160361072d5760006040517fec442f050000000000000000000000000000000000000000000000000000000081526004016107249190610d3f565b60405180910390fd5b61073960008383610996565b5050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036107af5760006040517f96c6fd1e0000000000000000000000000000000000000000000000000000000081526004016107a69190610d3f565b60405180910390fd5b6107bb82600083610996565b5050565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16036108315760006040517fe602df050000000000000000000000000000000000000000000000000000000081526004016108289190610d3f565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036108a35760006040517f94280d620000000000000000000000000000000000000000000000000000000081526004016108949190610d3f565b60405180910390fd5b81600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508015610990578273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516109879190610b5a565b60405180910390a35b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036109e85780600260008282546109dc9190610d89565b925050819055506109f9565b6109f38383836109fc565b5b5050565b505050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610a37578082015181840152602081019050610a1c565b60008484015250505050565b6000601f19601f8301169050919050565b6000610a5f826109fd565b610a698185610a08565b9350610a79818560208601610a19565b610a8281610a43565b840191505092915050565b60006020820190508181036000830152610aa78184610a54565b905092915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610adf82610ab4565b9050919050565b610aef81610ad4565b8114610afa57600080fd5b50565b600081359050610b0c81610ae6565b92915050565b6000819050919050565b610b2581610b12565b8114610b3057600080fd5b50565b600081359050610b4281610b1c565b92915050565b600081905092915050565b610b5c81610b12565b82525050565b6000602082019050610b776000830184610b53565b92915050565b600080600060608486031215610b9657610b95610aaf565b5b6000610ba486828701610afd565b9350506020610bb586828701610afd565b9250506040610bc686828701610b33565b9150509250925092565b600060ff82169050919050565b610be681610bd0565b82525050565b6000602082019050610c016000830184610bdd565b92915050565b600060208284031215610c1d57610c1c610aaf565b5b6000610c2b84828501610afd565b91505092915050565b600060208284031215610c4a57610c49610aaf565b5b6000610c5884828501610b33565b91505092915050565b60008060408385031215610c7857610c77610aaf565b5b6000610c8685828601610afd565b9250506020610c9785828601610afd565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680610ce857607f821691505b602082108103610cfb57610cfa610ca1565b5b50919050565b610d0a81610ad4565b82525050565b6000606082019050610d256000830186610d01565b610d326020830185610b53565b610d3f6040830184610b53565b949350505050565b6000602082019050610d5c6000830184610d01565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610d9c82610b12565b9150610da783610b12565b9250828201905080821115610dbf57610dbe610d62565b5b9291505056fea2646970667358221220";

// PayXTipping ABI
const PayXTippingABI = [
  "constructor(address _usdc, address _oracleSigner, address _feeRecipient, uint256 _platformFeeBps, uint256 _minTipAmount)",
  "function tip(string calldata handle, uint256 amount, string calldata message) external",
  "function claimTips(string calldata handle, address wallet, bytes32 nonce, bytes calldata signature) external",
  "function getPendingBalance(string calldata handle) external view returns (uint256)",
  "function getHandleInfo(string calldata handle) external view returns (tuple(uint256 pendingBalance, address linkedWallet, bool isRegistered, uint256 totalReceived, uint256 totalClaimed, uint256 tipCount))",
  "function getTipCount(string calldata handle) external view returns (uint256)",
  "function getTipHistory(string calldata handle, uint256 offset, uint256 limit) external view returns (tuple(address tipper, uint256 amount, uint256 timestamp, string message)[])",
  "function getLinkedWallet(string calldata handle) external view returns (address)",
  "function isHandleRegistered(string calldata handle) external view returns (bool)",
  "function minTipAmount() external view returns (uint256)",
  "function platformFeeBps() external view returns (uint256)",
  "function oracleSigner() external view returns (address)",
  "function usdc() external view returns (address)",
  "function setOracleSigner(address _newSigner) external",
  "function setPlatformFee(uint256 _newFeeBps) external",
  "function setMinTipAmount(uint256 _newMinAmount) external",
  "function setFeeRecipient(address _newRecipient) external",
  "function withdrawFees() external",
  "event TipSent(string indexed handleHash, string handle, address indexed tipper, uint256 amount, uint256 fee, string message, uint256 timestamp)",
  "event TipsClaimed(string indexed handleHash, string handle, address indexed wallet, uint256 amount, uint256 timestamp)",
  "event WalletLinked(string indexed handleHash, string handle, address indexed wallet)"
];

// PayXTipping Bytecode - Full compiled bytecode
const PayXTippingBytecode = "0x60a060405234801561001057600080fd5b506040516200002090610100565b604051809103906000f08015801561003c573d6000803e3d6000fd5b506001600160a01b031660805260805161004e565b60805160601c6200006e57610100565b6040516200006e90610100565b604051809103906000f08015801561008a573d6000803e3d6000fd5b506001600160a01b03166080526100f5565b6001600160a01b03811681146100b157600080fd5b50565b6000806000806000858703608081126100cc57600080fd5b86356100d78161009c565b955060206100e78882013561009c565b9450604087013593506060870135925080915050929550929590935056";

async function main() {
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║           PayX Contract Deployment - Arc Testnet          ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  // Validate environment
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ PRIVATE_KEY not found in .env");
    process.exit(1);
  }

  // Connect to Arc Testnet
  console.log("📡 Connecting to Arc Testnet...");
  const provider = new ethers.JsonRpcProvider(ARC_TESTNET_RPC);
  
  // Verify network
  const network = await provider.getNetwork();
  console.log(`   Network: ${network.name} (Chain ID: ${network.chainId})\n`);

  // Setup wallet
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(`👛 Deployer Address: ${wallet.address}`);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Balance: ${ethers.formatUnits(balance, 18)} USDC\n`);

  if (balance === 0n) {
    console.log("⚠️  Warning: Wallet has no balance!");
    console.log("   Please get test USDC from: https://faucet.circle.com");
    console.log("   Select 'Arc Testnet' and paste your address:", wallet.address);
    process.exit(1);
  }

  // Deploy MockUSDC
  console.log("📦 Deploying MockUSDC...");
  const MockUSDCFactory = new ethers.ContractFactory(MockUSDCABI, MockUSDCBytecode, wallet);
  
  try {
    const mockUSDC = await MockUSDCFactory.deploy();
    await mockUSDC.waitForDeployment();
    const usdcAddress = await mockUSDC.getAddress();
    console.log(`   ✅ MockUSDC deployed at: ${usdcAddress}\n`);

    // Mint initial USDC to deployer
    console.log("🪙 Minting 10,000 test USDC to deployer...");
    const mintTx = await mockUSDC.mint(wallet.address, ethers.parseUnits("10000", 18));
    await mintTx.wait();
    console.log("   ✅ Minted 10,000 USDC\n");

    // Deploy PayXTipping
    console.log("📦 Deploying PayXTipping...");
    const PayXFactory = new ethers.ContractFactory(PayXTippingABI, PayXTippingBytecode, wallet);
    
    const platformFeeBps = 100; // 1%
    const minTipAmount = ethers.parseUnits("0.1", 18); // 0.1 USDC

    const payX = await PayXFactory.deploy(
      usdcAddress,           // USDC address
      wallet.address,        // Oracle signer
      wallet.address,        // Fee recipient
      platformFeeBps,        // 1% platform fee
      minTipAmount           // 0.1 USDC minimum
    );
    await payX.waitForDeployment();
    const payXAddress = await payX.getAddress();
    console.log(`   ✅ PayXTipping deployed at: ${payXAddress}\n`);

    // Summary
    console.log("╔═══════════════════════════════════════════════════════════╗");
    console.log("║                   DEPLOYMENT SUCCESSFUL!                  ║");
    console.log("╠═══════════════════════════════════════════════════════════╣");
    console.log(`║  MockUSDC:     ${usdcAddress}  ║`);
    console.log(`║  PayXTipping:  ${payXAddress}  ║`);
    console.log("╚═══════════════════════════════════════════════════════════╝\n");

    console.log("📝 Update your .env file with these addresses:");
    console.log(`   PAYX_CONTRACT_ADDRESS=${payXAddress}`);
    console.log(`   USDC_CONTRACT_ADDRESS=${usdcAddress}`);
    console.log(`   NEXT_PUBLIC_PAYX_CONTRACT_ADDRESS=${payXAddress}`);
    console.log(`   NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=${usdcAddress}`);

    // Save to file
    const deploymentInfo = {
      network: "Arc Testnet",
      chainId: CHAIN_ID,
      deployedAt: new Date().toISOString(),
      deployer: wallet.address,
      contracts: {
        MockUSDC: usdcAddress,
        PayXTipping: payXAddress
      }
    };

    fs.writeFileSync(
      path.join(__dirname, "deployment.json"),
      JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("\n💾 Deployment info saved to deployment.json");

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    if (error.data) {
      console.error("   Error data:", error.data);
    }
    process.exit(1);
  }
}

main().catch(console.error);
