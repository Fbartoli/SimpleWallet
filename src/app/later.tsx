  // // const wrapToken = async () => {
  // //   console.log(wrapNumberToken)
  // //   const weiBigInt = parseEther(wrapNumberToken)
  // //   console.log(weiBigInt)
  // //   const approveData = encodeFunctionData({
  // //     abi: parseAbi(erc20Abi),
  // //     functionName: 'approve',
  // //     args: [superTokenAddress, BigInt(weiBigInt)],
  // //   });
  // //   const upgradeData = encodeFunctionData({
  // //     abi: parseAbi(superTokenAbi),
  // //     functionName: 'upgrade',
  // //     args: [BigInt(weiBigInt)],
  // //   });
  // //   try {
  // //     await client?.sendTransaction({
  // //       calls: [
  // //         {
  // //           to: erc20Address,
  // //           data: approveData,
  // //           value: 0n,
  // //         },
  // //         {
  // //           to: superTokenAddress,
  // //           data: upgradeData,
  // //           value: 0n,
  // //         },
  // //       ],
  // //     })
  // //   } catch (error) {
  // //     console.error('Error creating stream:', error);
  // //   }
  // // }

  // // const createStream = async () => {
  // //   const weiBigInt = parseEther(flowRate)
  // //   const flowRateWeiPerSecond = weiBigInt / BigInt(86400)
  // //   const createFlowData = encodeFunctionData({
  // //     abi: parseAbi(CFAv1ForwarderABI),
  // //     functionName: 'createFlow',
  // //     args: [superTokenAddress, smartWallet?.address, receiverAddress, flowRateWeiPerSecond, '0x'],
  // //   });
  // //   try {



  // //     console.log(await client?.account.getStubSignature())
  // //     console.log(user?.linkedAccounts)
  // //     console.log()
  // //     await client?.sendTransaction({
  // //       calls: [

  // //         {
  // //           to: CFAv1ForwarderAddress,
  // //           data: createFlowData,
  // //           value: 0n,
  // //         }
  // //       ],
  // //     })
  // //   } catch (error) {
  // //     console.error('Error creating stream:', error);
  // //   }
  // // };

  //   // Disable login when Privy is not ready or the user is already authenticated
  // const erc20Address = '0x6b008BAc0e5846cB5d9Ca02ca0e801fCbF88B6f9'; // Replace with actual ERC20 token address
  // const erc20Abi = ['function approve(address spender, uint256 amount) public returns (bool)'];

  // // Super Token contract - you need to replace this with the actual Super Token address
  // const superTokenAddress = '0x7635356D54d8aF3984a5734C2bE9e25e9aBC2ebC'; // Replace with actual Super Token address
  // const superTokenAbi = ['function upgrade(uint256 amount) external'];

  // const CFAv1ForwarderAddress = '0xcfA132E353cB4E398080B9700609bb008eceB125';
  // // Simplified ABIs with only the functions we need
  // const CFAv1ForwarderABI = [
  //   "function createFlow(address token, address sender, address receiver, int96 flowRate, bytes memory userData) external returns (bool)"
  // ];


  // useWatchContractEvent({
  //   address: erc20Address,
  //   abi: erc20Abi,
  //   eventName: 'Transfer',
  //   args: {
  //     to: user?.smartWallet?.address as `0x${string}`,
  //   },
  //   async onLogs(logs) {
  //     console.log('New logs!', logs)
  //     const approveData = encodeFunctionData({
  //       abi: erc20Abi,
  //       functionName: 'approve',
  //       args: [superTokenAddress, 99999999999999999999999999999n],
  //     });
  //     const upgradeData = encodeFunctionData({
  //       abi: parseAbi(superTokenAbi),
  //       functionName: 'upgrade',
  //       args: [logs[0].args.value as bigint],
  //     });
  //     const hash = await client?.sendTransaction({
  //       calls: [
  //         {
  //           to: erc20Address,
  //           data: approveData,
  //           value: 0n,
  //         },
  //         {
  //           to: superTokenAddress,
  //           data: upgradeData,
  //           value: 0n,
  //         }
  //       ]
  //     })
  //     console.log('Transaction sent:', hash);
  //   },
  //   enabled: Boolean(user?.smartWallet?.address),
  // })

  // const sendTransaction = async () => {
  //   const approveData = encodeFunctionData({
  //     abi: parseAbi(contractAbi),
  //     functionName: 'mint',
  //     args: ['0x2F874EfAaCe8E8d0E2630bccdD209a2D4f4F609e', BigInt(99999999999999999999999999999)],
  //   });
  //   const hash = await client?.sendTransaction({
  //     calls: [{
  //       to: erc20Address,
  //       data: approveData,
  //       value: 0n,
  //     }]
  //   });
  //   console.log('Transaction sent:', hash);
  // }