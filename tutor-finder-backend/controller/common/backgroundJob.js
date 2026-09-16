const runInBackground = (fn) => {
  Promise.resolve()
    .then(fn)
    .catch(err => console.error("Background job failed:", err.message));
};

module.exports={runInBackground}