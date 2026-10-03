import { defineConfig } from "tsdown";
import { packageBuilds } from "../../scripts/tsdown-builds.mjs";

export default defineConfig(packageBuilds(process.cwd(), ["react", "react-dom"]));
