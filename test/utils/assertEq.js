export default function(expected, actual, message) {
  expected = new web3.BigNumber(expected);
  assert.isTrue(
    expected.eq(actual),
    message +
      '\n      expected: ' +
      expected.toString() +
      '\n      actual:   ' +
      actual.toString() +
      '\n      delta:    ' +
      expected.minus(actual).toString() +
      '\n      '
  );
}
