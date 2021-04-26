const logs = [
  {
    address: "0x7fdcd2a1e52f10c28cb7732f46393e297ecadda1",
    topics: ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"],
    data:
      "0x000000000000000000000000e8a3137e1d499797ea5a520a98b1b4af753f3ca80000000000000000000000000239769a1adf4def9f07da824b80b9c4fcb595930000000000000000000000000000000000000000000000000000000000000508",
    blockNumber: "0x5b7d9c",
    transactionHash: "0x0d541dce966c0f7ff8148f3d6ccda542d0c4ffbc61827d2f4097716189675073",
    transactionIndex: "0x6d",
    blockHash: "0x73ea90f3ddb9e20d93e77063419836fd7e34619aecac1ab6d1cf21763f2168a1",
    logIndex: "0x3d",
    removed: false,
  }
];

const expectedDecodedLogs = [
  {
    name: "Transfer",
    events: [
      {
        name: "from",
        type: "address",
        value: "0xe8a3137e1d499797ea5a520a98b1b4af753f3ca8"
      },
      {
        name: "to",
        type: "address",
        value: "0x0239769a1adf4def9f07da824b80b9c4fcb59593"
      },
      { name: "tokenId", type: "uint256", value: "1288" }
    ],
    address: "0x7fdcd2a1e52f10c28cb7732f46393e297ecadda1",
    transactionHash: "0x0d541dce966c0f7ff8148f3d6ccda542d0c4ffbc61827d2f4097716189675073",
    blockNumber: "5995932",
    blockHash: "0x73ea90f3ddb9e20d93e77063419836fd7e34619aecac1ab6d1cf21763f2168a1"
  }
];

module.exports = { logs, expectedDecodedLogs };
