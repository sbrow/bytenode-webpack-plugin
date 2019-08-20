/* eslint-disable @typescript-eslint/no-magic-numbers */

module.exports = {
    extends: ["@commitlint/config-conventional"],
    rules: {
      "header-max-length": [2, "always", 100],
      "scope-case": [0, "always"],
      "subject-case": [2, "always", "sentence-case"],
      "subject-full-stop": [2, "never"]
    }
  };
  
  