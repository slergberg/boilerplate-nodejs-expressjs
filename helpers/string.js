const leftPad = (str, padString, length) => {
  let paddedStr = str

  while (paddedStr.length < length) {
    paddedStr = `${padString}${paddedStr}`
  }

  return paddedStr
}

const rightPad = (str, padString, length) => {
  let paddedStr = str

  while (paddedStr.length < length) {
    paddedStr = `${paddedStr}${padString}`
  }

  return paddedStr
}

module.exports = {
  leftPad,
  rightPad,
}
