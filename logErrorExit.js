module.exports = (e) => {
  console.log(process.cwd(), e)
  throw new Error(e)
}
