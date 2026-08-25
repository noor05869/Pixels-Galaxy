#!/usr/bin/env node

import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

function readMaskedPassword() {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    throw new Error("A secure interactive terminal is required");
  }

  return new Promise((resolve, reject) => {
    let password = "";

    const finish = (error) => {
      process.stdin.off("data", onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stderr.write("\n");
      if (error) reject(error);
      else resolve(password);
    };

    const onData = (chunk) => {
      for (const character of chunk) {
        if (character === "\u0003") {
          finish(new Error("Password hashing cancelled"));
          return;
        }
        if (character === "\r" || character === "\n") {
          finish();
          return;
        }
        if (character === "\u0008" || character === "\u007f") {
          password = Array.from(password).slice(0, -1).join("");
          continue;
        }
        if (character >= " ") password += character;
      }
    };

    process.stderr.write("Admin password: ");
    process.stdin.setEncoding("utf8");
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", onData);
  });
}

async function main() {
  if (process.argv.length !== 2) throw new Error("Command-line password arguments are not accepted");

  const password = await readMaskedPassword();
  if (password.length === 0) throw new Error("Password cannot be empty");

  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  process.stdout.write(`scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}\n`);
}

main().catch(() => {
  process.stderr.write("Unable to generate password hash.\n");
  process.exitCode = 1;
});
