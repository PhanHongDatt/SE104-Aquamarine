const { execFileSync, spawnSync } = require("node:child_process");
const { closeSync, existsSync, mkdirSync, openSync, readFileSync, rmSync } = require("node:fs");
const { join } = require("node:path");

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
const backupDir = process.env.BACKUP_DIR || "backups";
const dbContainer = process.env.DB_CONTAINER || "quan_ly_vang_bac_db";

if (!databaseUrl) {
  console.error("DATABASE_URL is required for database backup.");
  process.exit(1);
}

if (!existsSync(backupDir)) {
  mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputFile = join(backupDir, `aquamarine-${timestamp}.sql`);

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

function runLocalBackup() {
  execFileSync("pg_dump", [getPostgresToolUrl(databaseUrl), "--file", outputFile, "--no-owner", "--no-privileges"], {
    stdio: "inherit",
  });
}

function runDockerBackup() {
  const { database, user } = parseDatabaseUrl(databaseUrl);
  const outputFd = openSync(outputFile, "w");

  try {
    const result = spawnSync(
      "docker",
      ["exec", dbContainer, "pg_dump", "-U", user, "-d", database, "--no-owner", "--no-privileges"],
      { stdio: ["ignore", outputFd, "inherit"] },
    );

    if (result.error) {
      throw result.error;
    }

    if (result.status !== 0) {
      throw new Error(`docker pg_dump exited with code ${result.status}`);
    }
  } finally {
    closeSync(outputFd);
  }
}

try {
  if (isCommandAvailable("pg_dump")) {
    runLocalBackup();
  } else {
    console.warn(`pg_dump was not found locally. Falling back to Docker container "${dbContainer}".`);
    runDockerBackup();
  }
} catch (error) {
  if (existsSync(outputFile)) {
    rmSync(outputFile, { force: true });
  }

  console.error("Database backup failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

console.log(`Database backup created: ${outputFile}`);
