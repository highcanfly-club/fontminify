import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import assert from "assert";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let { version } = JSON.parse(
  fs.readFileSync(
    new URL(path.join(__dirname, "/../package.json"), import.meta.url)
  )
);

const bin = path.resolve(path.join(__dirname, "/../dist/cli.js"));
const srcTtf = path.join(__dirname, "../fonts/SentyBrush.ttf");

describe("CLI version test", () => {
  let scriptOutput = "";
  const args = [bin, "--version"];
  let exitCode;

  before((done) => {
    let process = spawn("node", args);
    process.on("exit", (code) => {
      exitCode = code;
      done();
    });
    process.stdout.on("data", function (data) {
      data = data.toString();
      scriptOutput += data;
    });
  });
  it("exit code should be zero", () => {
    assert.equal(exitCode, 0);
  });
  it("version should be " + version, () => {
    assert.equal(scriptOutput.replace(/\n/g, ""), version);
  });
});

describe("CLI simple transformation test", () => {
  const args = [bin, "-T", srcTtf, ' temp' ];
  let scriptOutput = "";
  let scriptErrOutput = "";
  let exitCode;

  before((done) => {
    let process = spawn("node", args);
    process.on("exit", (code) => {
      exitCode = code;
      done();
    });
    process.stdout.on("data", function (data) {
      //console.log("stdout: " + data);

      data = data.toString();
      scriptOutput += data;
    });
    process.stderr.on("data", function (data) {
      data = data.toString();
      scriptErrOutput += data;
    });
  });
  it("exit code should be zero", () => {
    assert.equal(exitCode, 0);
  });
  it("output length should be at least 195kb", () => {
    assert.equal(scriptOutput.length > 199680, true);
  });
});

describe("CLI fail test", () => {
  const args = [bin, "-T", 'nimportekawak.ttf', ' temp' ];
  let scriptOutput = "";
  let scriptErrOutput = "";
  let exitCode;

  before((done) => {
    let process = spawn("node", args);
    process.on("exit", (code) => {
      exitCode = code;
      done();
    });
    process.stdout.on("data", function (data) {
      //console.log("stdout: " + data);

      data = data.toString();
      scriptOutput += data;
    });
    process.stderr.on("data", function (data) {
      data = data.toString();
      scriptErrOutput += data;
    });
  });
  it("exit code should be 1", () => {
    assert.equal(exitCode, 1);
  });
  it("output length should be 0", () => {
    assert.equal(scriptOutput.length , 0);
  });
});