const { execFileSync, spawnSync } = require("node:child_process");
const { closeSync, existsSync, openSync } = require("node:fs");

const databaseUrl = process.env.DATABASE_URL;
const backupFile = process.env.BACKUP_FILE;
const confirm = process.env.RESTORE_CONFIRM;
const dbContainer = process.env.DB_CONTAINER || "fe_db_1";

if (!databaseUrl) {
  console.error("DATABASE_URL is required for database restore.");
  process.exit(1);
}

if (!backupFile || !existsSync(backupFile)) {
  console.error("BACKUP_FILE must point to an existing .sql backup file.");
  process.exit(1);
}

if (confirm !== "YES") {
  console.error('Set RESTORE_CONFIRM="YES" to confirm destructive restore.');
  process.exit(1);
}

function parseDatabaseUrl(url) {
  const parsed = new URL(url);
  return {
    database: parsed.pathname.replace(/^\//, ""),
    user: decodeURIComponent(parsed.username),
  };
}

function isCommandAvailable(command) {
  const result = spawnSync(command, ["--version"], { stdio: "ignore" });
  return !result.error;
}

function runLocalRestore() {
  execFileSync("psql", [databaseUrl, "--file", backupFile], {
    stdio: "inherit",
  });
}

function runDockerRestore() {
  const { database, user } = parseDatabaseUrl(databaseUrl);
  const inputFd = openSync(backupFile, "r");

  try {
    const result = spawnSync("docker", ["exec", "-i", dbContainer, "psql", "-U", user, "-d", database], {
      stdio: [inputFd, "inherit", "inherit"],
    });

    if (result.error) {
      throw result.error;
    }

    if (result.status !== 0) {
      throw new Error(`docker psql exited with code ${result.status}`);
    }
  } finally {
    closeSync(inputFd);
  }
}

try {
  if (isCommandAvailable("psql")) {
    runLocalRestore();
  } else {
    console.warn(`psql was not found locally. Falling back to Docker container "${dbContainer}".`);
    runDockerRestore();
  }
} catch (error) {
  console.error("Database restore failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

console.log(`Database restored from: ${backupFile}`);
