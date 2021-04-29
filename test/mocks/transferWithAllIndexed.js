const logs = [{
  address: "0xecf7ef42b57ee37a959bf507183c5dd6bf182081",
  topics: [
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    "0x000000000000000000000000c24d112c58a87c17a0484b2a7d8fd69e1b625ccf",
    "0x0000000000000000000000004bbb41f61fffc1bbe65a2aa192c65281e16ea758",
    "0x000000000000000000000000000000000000000000000000000000000000006e",
  ],
  data: "0x",
  blockNumber: "0xba6a96",
  transactionHash: "0xe4c14eeb82e9274c41b3cc70aa8563faa8fe070c82ba2bbff25a8aeeaeaf96eb",
  transactionIndex: "0x80",
  blockHash: "0x9142c80814a627cee5e7f8cae044ae020e1c756fd83c3cee92fdfeec958f2f5d",
  logIndex: "0xc2",
  removed: false,
  timeStamp: "0x6072960e",
  gasPrice: "0x1087ee0600",
  gasUsed: "0x2c567",
}];

const expectedDecodedLogs = [
  {
    name: "Transfer",
    events: [
      {
        name: "from",
        type: "address",
        value: "0xc24d112c58a87c17a0484b2a7d8fd69e1b625ccf",
      },
      {
        name: "to",
        type: "address",
        value: "0x4bbb41f61fffc1bbe65a2aa192c65281e16ea758",
      },
      { name: "tokenId", type: "uint256", value: "110" },
    ],
    address: "0xecf7ef42b57ee37a959bf507183c5dd6bf182081",
    blockNumber: "12216982",
    transactionHash: "0xe4c14eeb82e9274c41b3cc70aa8563faa8fe070c82ba2bbff25a8aeeaeaf96eb",
    blockHash: "0x9142c80814a627cee5e7f8cae044ae020e1c756fd83c3cee92fdfeec958f2f5d",
    timeStamp: "1618122254",
    gasPrice: "71000000000",
    gasUsed: "181607",
    logIndex: "194",
    transactionIndex: "128",
  }
];

module.exports = { logs, expectedDecodedLogs };
