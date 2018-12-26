const ethUtils = require('ethereumjs-util');

export function encodePacked(...params) {
  let data = '0x';
  for (let i = 0; i < params.length; i++) {
    const value = params[i];
    switch (typeof value) {
      case 'number':
        const hex = ethUtils.intToHex(value).slice(2);
        for (let j = 0; j < 64 - hex.length; j++) {
          data = data + '0';
        }
        data = data + hex;
        break;
      case 'string':
        if (ethUtils.isHexString(value)) {
          data = data + value.slice(2);
        } else {
          data = data + ethUtils.fromUtf8(value).slice(2);
        }
        break;
      case 'boolean':
        data = data + (value ? '01' : '00');
        break;
    }
  }

  return data;
}

export default function(data, privateKey) {
  const hash = ethUtils.sha3(data);
  const sign = ethUtils.ecsign(hash, ethUtils.toBuffer(privateKey));
  return (
    ethUtils.bufferToHex(sign.r) +
    ethUtils.bufferToHex(sign.s).slice(2) +
    ethUtils.intToHex(sign.v).slice(2)
  );
}
