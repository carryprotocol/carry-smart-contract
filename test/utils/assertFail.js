export default async function(promise, message) {
  let failed = false;
  let tx;
  try {
    tx = await promise;
  } catch (e) {
    failed = true;
    tx = null;
  }
  const txid = tx && tx.tx;
  if (!failed) {
    console.error('assertFail() fails; txid: ' + txid);
  }
  assert.isTrue(failed, message + '\ntxid: ' + txid);
}
