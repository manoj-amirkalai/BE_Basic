// fileManager.js
// Complete Node.js File System Manager covering all major fs features

const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

class FileManager {
  // =============================
  // FILE CREATE / WRITE
  // =============================
  static async createFile(filePath, content = "") {
    await fsp.writeFile(filePath, content, {
      encoding: "utf-8",
      flag: "w",
    });
    return `File created: ${filePath}`;
  }
  static createFile(filePath, content = "") {
    return new Promise((resolve, reject) => {
      fs.writeFile(
        filePath,
        content,
        { encoding: "utf-8", flag: "w" },
        (err) => {
          if (err) return reject(err);
          resolve(`File created: ${filePath}`);
        },
      );
    });
  }

  // =============================
  // FILE READ
  // =============================
  static async readFile(filePath) {
    const data = await fsp.readFile(filePath, "utf-8");
    return data;
  }

  // =============================
  // FILE APPEND
  // =============================
  static async appendFile(filePath, content) {
    await fsp.appendFile(filePath, content, "utf-8");
    return `Content appended: ${filePath}`;
  }

  // =============================
  // FILE DELETE
  // =============================
  static async deleteFile(filePath) {
    await fsp.unlink(filePath);
    return `File deleted: ${filePath}`;
  }

  // =============================
  // FILE RENAME
  // =============================
  static async renameFile(oldPath, newPath) {
    await fsp.rename(oldPath, newPath);
    return `File renamed to: ${newPath}`;
  }

  // =============================
  // FILE COPY
  // =============================
  static async copyFile(source, destination) {
    await fsp.copyFile(source, destination);
    return `File copied to: ${destination}`;
  }

  // =============================
  // CHECK FILE EXISTS
  // =============================
  static async fileExists(filePath) {
    try {
      await fsp.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // =============================
  // GET FILE INFO
  // =============================
  static async getFileInfo(filePath) {
    const stats = await fsp.stat(filePath);

    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
    };
  }

  // =============================
  // DIRECTORY CREATE
  // =============================
  static async createDirectory(dirPath) {
    await fsp.mkdir(dirPath, { recursive: true });
    return `Directory created: ${dirPath}`;
  }

  // =============================
  // READ DIRECTORY
  // =============================
  static async readDirectory(dirPath) {
    const files = await fsp.readdir(dirPath);
    return files;
  }

  // =============================
  // DELETE DIRECTORY
  // =============================
  static async deleteDirectory(dirPath) {
    await fsp.rm(dirPath, {
      recursive: true,
      force: true,
    });

    return `Directory deleted: ${dirPath}`;
  }

  // =============================
  // STREAM READ (Large Files)
  // =============================
  static streamRead(filePath) {
    return new Promise((resolve, reject) => {
      let data = "";

      const stream = fs.createReadStream(filePath, "utf-8");

      stream.on("data", (chunk) => {
        data += chunk;
      });

      stream.on("end", () => {
        resolve(data);
      });

      stream.on("error", reject);
    });
  }

  // =============================
  // STREAM WRITE
  // =============================
  static streamWrite(filePath, content) {
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(filePath);

      stream.write(content);

      stream.end();

      stream.on("finish", () => resolve("Stream write complete"));

      stream.on("error", reject);
    });
  }

  // =============================
  // WATCH FILE
  // =============================
  static watchFile(filePath, callback) {
    fs.watch(filePath, (eventType, filename) => {
      callback({ eventType, filename });
    });
  }

  // =============================
  // MOVE FILE
  // =============================
  static async moveFile(source, destination) {
    await this.copyFile(source, destination);

    await this.deleteFile(source);

    return "File moved";
  }

  // =============================
  // GET ABSOLUTE PATH
  // =============================
  static getAbsolutePath(relativePath) {
    return path.resolve(relativePath);
  }
}

// =============================
// EXAMPLE USAGE
// =============================

async function example() {
  const file = "test.txt";
  const copy = "copy.txt";
  const dir = "myFolder";

  console.log(await FileManager.createFile(file, "Hello World dfsd"));

  console.log(await FileManager.appendFile(file, "\nAppended text"));

  console.log("File Content:", await FileManager.readFile(file));

  console.log("Exists:", await FileManager.fileExists(file));

  console.log("File Info:", await FileManager.getFileInfo(file));

  console.log(await FileManager.copyFile(file, copy));

  console.log(await FileManager.renameFile(copy, "renamed.txt"));

  console.log(await FileManager.createDirectory(dir));

  console.log("Directory Files:", await FileManager.readDirectory("."));

  console.log(
    await FileManager.streamWrite("stream.txt", "Stream content example"),
  );

  console.log("Stream Read:", await FileManager.streamRead("stream.txt"));

  FileManager.watchFile(file, (event) => {
    console.log("File changed:", event);
  });

  // Uncomment to test delete
  // await FileManager.deleteFile(file);
  // await FileManager.deleteDirectory(dir);
}

// Run example
example();

// Export for external usage
module.exports = FileManager;
