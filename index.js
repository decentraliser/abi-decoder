const { sha3, BN, hexToNumber } = require("web3-utils");
const abiCoder = require("web3-eth-abi");

class LogsDecoder {
  static create() {
    return new LogsDecoder();
  }

  constructor() {
    this.savedABIs = [];
    this.methodIDs = {};
    this.typeToString = this.typeToString.bind(this);
  }

  getABIs() {
    return this.savedABIs;
  }

  getMethodIDs() {
    return this.methodIDs;
  }

  addABI(abiArray) {
    if (Array.isArray(abiArray)) {
      // Iterate new abi to generate method id"s
      abiArray.map(function(abi) {
        if (abi.name) {
          const signature = sha3(
            abi.name +
            "(" +
            abi.inputs
              .map(this.typeToString)
              .join(",") +
            ")"
          );
          if (abi.type === "event") {
            if(!this.methodIDs[signature.slice(2)]){
              this.methodIDs[signature.slice(2)] = [];
            }
            this.methodIDs[signature.slice(2)].push(abi);
          } else {
            this.methodIDs[signature.slice(2, 10)] = abi;
          }
        }
      }, this);

      this.savedABIs = this.savedABIs.concat(abiArray);
    } else {
      throw new Error("Expected ABI array, got " + typeof abiArray);
    }
  }

  removeABI(abiArray) {
    if (Array.isArray(abiArray)) {
      // Iterate new abi to generate method id"s
      abiArray.map(function(abi) {
        if (abi.name) {
          const signature = sha3(
            abi.name +
              "(" +
              abi.inputs
                .map(function(input) {
                  return input.type;
                })
                .join(",") +
              ")"
          );
          if (abi.type === "event") {
            if (this.methodIDs[signature.slice(2)]) {
              delete this.methodIDs[signature.slice(2)];
            }
          } else {
            if (this.methodIDs[signature.slice(2, 10)]) {
              delete this.methodIDs[signature.slice(2, 10)];
            }
          }
        }
      }, this);
    } else {
      throw new Error("Expected ABI array, got " + typeof abiArray);
    }
  }

  decodeMethod(data) {
    const methodID = data.slice(2, 10);
    const abiItem = this.methodIDs[methodID];
    if (abiItem) {
      let decoded = abiCoder.decodeParameters(abiItem.inputs, data.slice(10));

      let retData = {
        name: abiItem.name,
        params: [],
      };

      for (let i = 0; i < decoded.__length__; i++) {
        let param = decoded[i];
        let parsedParam = param;
        const isUint = abiItem.inputs[i].type.indexOf("uint") === 0;
        const isInt = abiItem.inputs[i].type.indexOf("int") === 0;
        const isAddress = abiItem.inputs[i].type.indexOf("address") === 0;

        if (isUint || isInt) {
          const isArray = Array.isArray(param);

          if (isArray) {
            parsedParam = param.map(val => new BN(val).toString());
          } else {
            parsedParam = new BN(param).toString();
          }
        }

        // Addresses returned by web3 are randomly cased so we need to standardize and lowercase all
        if (isAddress) {
          const isArray = Array.isArray(param);

          if (isArray) {
            parsedParam = param.map(_ => _.toLowerCase());
          } else {
            parsedParam = param.toLowerCase();
          }
        }

        retData.params.push({
          name: abiItem.inputs[i].name,
          value: parsedParam,
          type: abiItem.inputs[i].type,
        });
      }

      return retData;
    }
  }

  decodeLogs(logs) {
    return logs.filter(log => log.topics.length > 0).map((logItem) => {
      const methodID = logItem.topics[0].slice(2);
      const methods = this.methodIDs[methodID];

      if (methods) {
        return methods.map(method=>this.tryDecodeLogs(method, logItem)).filter(data=>data!==null)[0];
      }
    });
  }

  tryDecodeLogs(method, logItem) {
    try {
      const logData = logItem.data;
      let decodedParams = [];
      let dataIndex = 0;
      let topicsIndex = 1;

      let dataTypes = [];
      method.inputs.map((input) => {
        if (!input.indexed) {
          if(input.type === "tuple") {
            dataTypes.push("tuple" + this.typeToString(input) );
          } else {
            dataTypes.push(input);
          }
        }
      });

      const decodedData = abiCoder.decodeParameters(
        dataTypes,
        logData.slice(2)
      );

      // Loop topic and data to get the params
      method.inputs.map(function(param) {
        let decodedP = {
          name: param.name,
          type: param.type,
        };

        if (param.indexed) {
          decodedP.value = logItem.topics[topicsIndex];
          topicsIndex++;
        } else {
          decodedP.value = decodedData[dataIndex];
          dataIndex++;
        }

        if (param.type === "address") {
          decodedP.value = decodedP.value.toLowerCase();
          // 42 because len(0x) + 40
          if (decodedP.value.length > 42) {
            let toRemove = decodedP.value.length - 42;
            let temp = decodedP.value.split("");
            temp.splice(2, toRemove);
            decodedP.value = temp.join("");
          }
        }

        if (
          param.type === "uint256" ||
          param.type === "uint8" ||
          param.type === "int"
        ) {
          // ensure to remove leading 0x for hex numbers
          if (typeof decodedP.value === "string" && decodedP.value.startsWith("0x")) {
            decodedP.value = new BN(decodedP.value.slice(2), 16).toString(10);
          } else {
            decodedP.value = new BN(decodedP.value).toString(10);
          }

        }

        decodedParams.push(decodedP);
      });

      const returnValues = {
        name: method.name,
        events: decodedParams,
        address: logItem.address,
        transactionHash: logItem.transactionHash,
        blockNumber: String(hexToNumber(logItem.blockNumber)),
        blockHash: logItem.blockHash,
      };

      if (logItem.timeStamp) returnValues["timeStamp"] = String(hexToNumber(logItem.timeStamp));
      if (logItem.gasPrice) returnValues["gasPrice"] = String(hexToNumber(logItem.gasPrice));
      if (logItem.gasUsed) returnValues["gasUsed"] = String(hexToNumber(logItem.gasUsed));
      if (logItem.logIndex) returnValues["logIndex"] = String(hexToNumber(logItem.logIndex));
      if (logItem.transactionIndex) returnValues["transactionIndex"] = String(hexToNumber(logItem.transactionIndex));

      return returnValues;
    } catch (error) {
      return null;
    }
  }

  typeToString(input) {
    if (input.type === "tuple") {
      return "(" + input.components.map(component => this.typeToString(component)).join(",") + ")";
    }
    return input.type;
  }
}

module.exports = LogsDecoder;
