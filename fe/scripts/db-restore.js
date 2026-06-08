const { execFileSync, spawnSync } = require("node:child_process");
const { closeSync, existsSync, openSync, readFileSync } = require("node:fs");

function loadLocalEnv() {
  if (!existsSync(".env")) return;

  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
}

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL;
const backupFile = process.env.BACKUP_FILE;
const confirm = process.env.RESTORE_CONFIRM;
const dbContainer = process.env.DB_CONTAINER || "quan_ly_vang_bac_db";

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

function getPostgresToolUrl(url) {
  const parsed = new URL(url);
  parsed.searchParams.delete("schema");
  return parsed.toString();
}

function isCommandAvailable(command) {
  const result = spawnSync(command, ["--version"], { stdio: "ignore" });
  return !result.error;
}

function runLocalRestore() {
  execFileSync("psql", [getPostgresToolUrl(databaseUrl), "--file", backupFile], {
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
