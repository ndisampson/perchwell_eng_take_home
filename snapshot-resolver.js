const path = require("path");

const SNAP_EXT = ".snap";

module.exports = {
  resolveSnapshotPath(testPath) {
    return `${testPath}${SNAP_EXT}`;
  },
  resolveTestPath(snapshotPath) {
    return snapshotPath.slice(0, -SNAP_EXT.length);
  },
  testPathForConsistencyCheck: path.join("components", "example.test.js")
};

