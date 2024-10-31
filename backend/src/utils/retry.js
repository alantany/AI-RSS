const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function retry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
}

module.exports = retry; 