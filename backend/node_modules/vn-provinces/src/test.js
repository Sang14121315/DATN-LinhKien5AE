const { getProvinces } = require("./index");

(async () => {
  const rs = await getProvinces();
  console.log("🎯 generate test", rs);
})();
