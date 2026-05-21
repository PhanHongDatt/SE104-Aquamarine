const { execFileSync, spawnSync } = require("node:child_process");
const { closeSync, existsSync, mkdirSync, openSync, rmSync } = require("node:fs");
const { join } = require("node:path");

const databaseUrl = process.env.DATABASE_URL;
const backupDir = process.env.BACKUP_DIR || "backups";
const dbContainer = process.env.DB_CONTAINER || "fe_db_1";

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

function isCommandAvailable(command) {
  const result = spawnSync(command, ["--version"], { stdio: "ignore" });
  return !result.error;
}

function runLocalBackup() {
  execFileSync("pg_dump", [databaseUrl, "--file", outputFile, "--no-owner", "--no-privileges"], {
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
