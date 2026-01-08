import { runTask } from "../runModel.js";
runTask("Use search_docs with query 'codemode', then call summarize with 2 sentences on the first hit.")
  .then(res => { console.log("SMOKE:", res); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
