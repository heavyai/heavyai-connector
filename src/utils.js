module.exports = {
  // Bind arguments starting with argument number "n".
  // NOTE: n is 1-indexed
  bindArgsFromN: (fn, n, ...boundArgs) =>
    function func(...args) {
      return fn(...args.slice(0, n - 1), ...boundArgs)
    }
}
