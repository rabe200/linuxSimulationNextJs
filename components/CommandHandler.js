import fs from "./FileSystem.json";

// Initialize a set of common processes with PIDs
let processes = {
  1001: { command: "bash", user: "user", status: "running" },
  1002: { command: "ssh", user: "user", status: "running" },
  1003: { command: "vim", user: "user", status: "running" },
  1004: { command: "node", user: "user", status: "running" },
  1005: { command: "npm", user: "user", status: "running" },
  1006: { command: "htop", user: "user", status: "running" },
};

let currentPath = ["root", "home", "user"];
let isRoot = false; // Track if the user is running as root
let sessionState = {}; // Track sessions for ssh, ftp, etc.
const systemStartTime = new Date(new Date().getTime() - 7200 * 1000); // System started 2 hours ago

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function resolvePath(cwd, path = "") {
  let newPath = path.startsWith("/")
    ? path.split("/").filter(Boolean)
    : [...cwd, ...path.split("/").filter(Boolean)];

  const resolvedPath = [];
  for (const part of newPath) {
    if (part === "..") {
      resolvedPath.pop();
    } else if (part !== ".") {
      resolvedPath.push(part);
    }
  }
  return resolvedPath;
}

function navigatePath(fileSystem, path) {
  return path.reduce((dir, part) => {
    if (dir && typeof dir === "object") {
      const lowercasedPart = part.toLowerCase();
      const foundKey = Object.keys(dir).find(
        (key) => key.toLowerCase() === lowercasedPart
      );
      return dir[foundKey];
    }
    return undefined;
  }, fileSystem);
}

function matchFilesWithWildcard(dir, pattern) {
  const regexPattern = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
  return Object.keys(dir).filter((filename) => regexPattern.test(filename));
}

function simulateNetworkLatency() {
  return new Promise((resolve) => setTimeout(resolve, Math.random() * 2000));
}

export async function executeCommand(command, args, history = []) {
  let output = "";
  const uptimeSeconds = Math.floor(
    (new Date().getTime() - systemStartTime.getTime()) / 1000
  );

  switch (command) {
    case "iptables":
      if (args[0] === "-L") {
        output =
          "Chain INPUT (policy ACCEPT)\n" +
          "target     prot opt source               destination         \n" +
          "ACCEPT     all  --  anywhere             anywhere            \n" +
          "DROP       all  --  192.168.0.0/24       anywhere            \n" +
          "Chain FORWARD (policy ACCEPT)\n" +
          "target     prot opt source               destination         \n" +
          "Chain OUTPUT (policy ACCEPT)\n" +
          "target     prot opt source               destination         \n";
      } else {
        output = "iptables: invalid or missing arguments";
      }
      break;

    case "dmesg":
      if (args[0] === "|") {
        output =
          "Hardware Error: CPU 1: Machine Check Exception: 0000000000000000 Bank 4: b200000000070f0f\n" +
          "Hardware Error: CPU 2: Machine Check Exception: 0000000000000000 Bank 4: b200000000070f0f\n";
      } else {
        output = "dmesg: missing operand";
      }
      break;

    case "chkrootkit":
      output =
        "ROOTKIT DETECTED: Possible LKM Trojan installed\n" +
        "Searching for /proc/... ... nothing found\n" +
        "Searching for LKM... ... nothing found\n";
      break;

    case "sudo":
      if (args.length > 0) {
        isRoot = true;
        output = await executeCommand(args[0], args.slice(1));
        isRoot = false;
      } else {
        output = "sudo: missing operand";
      }
      break;

    case "apt":
      if (args[0] === "install") {
        if (args[1]) {
          await simulateNetworkLatency();
          output = `Reading package lists... Done\nBuilding dependency tree... Done\nThe following NEW packages will be installed:\n  ${args[1]}\n0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.\nNeed to get 500 kB of archives.\nAfter this operation, 2 MB of additional disk space will be used.\nGet:1 http://deb.debian.org/debian stable/main ${args[1]} 500 kB\nFetched 500 kB in 1s (500 kB/s)\nSelecting previously unselected package ${args[1]}.\n(Reading database ... 100%\nUnpacking ${args[1]} (1.0-1) ...\nSetting up ${args[1]} (1.0-1) ...\nProcessing triggers for man-db (2.9.4-2) ...`;
        } else {
          output = "apt: missing package name";
        }
      } else if (args[0] === "update") {
        await simulateNetworkLatency();
        output =
          "Get:1 http://deb.debian.org/debian stable InRelease [116 kB]\n" +
          "Get:2 http://deb.debian.org/debian stable/main Sources [5,300 kB]\n" +
          "Get:3 http://deb.debian.org/debian stable/main amd64 Packages [10,000 kB]\n" +
          "Fetched 15,416 kB in 3s (5,138 kB/s)\n" +
          "Reading package lists... Done";
      } else {
        output = `apt: command not found: ${args.join(" ")}`;
      }
      break;

    case "ufw":
      if (args[0] === "status") {
        output =
          "Status: active\n" +
          "To                         Action      From\n" +
          "--                         ------      ----\n" +
          "22                         ALLOW       Anywhere\n" +
          "80                         ALLOW       Anywhere\n" +
          "443                        ALLOW       Anywhere\n";
      } else {
        output = "ufw: missing operand";
      }
      break;

    case "pwd":
      output = `/${currentPath.join("/")}`;
      break;

    case "ss":
      output =
        "Netid  State      Recv-Q Send-Q       Local Address:Port          Peer Address:Port \n" +
        "tcp    ESTAB      0      0            192.168.1.100:ssh           192.168.1.101:5566\n" +
        "tcp    LISTEN     0      128          127.0.0.1:ipp               0.0.0.0:*        \n" +
        "tcp    LISTEN     0      128          [::1]:ipp                   [::]:*           \n" +
        "udp    UNCONN     0      0            0.0.0.0:bootpc              0.0.0.0:*        \n";
      break;

    case "netstat":
      output =
        "Active Internet connections (w/o servers)\n" +
        "Proto Recv-Q Send-Q Local Address           Foreign Address         State\n" +
        "tcp        0      0 192.168.1.100:22        192.168.1.101:5566       ESTABLISHED\n" +
        "tcp        0      0 127.0.0.1:631           0.0.0.0:*               LISTEN\n" +
        "tcp6       0      0 ::1:631                 :::*                    LISTEN\n" +
        "udp        0      0 0.0.0.0:68              0.0.0.0:*               \n" +
        "udp        0      0 192.168.1.100:123       0.0.0.0:*               \n" +
        "udp6       0      0 ::1:123                 :::*                    \n";
      break;

    case "ip":
      if (args[0] === "a" || args[0] === "addr") {
        output =
          "1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000\n" +
          "    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n" +
          "    inet 127.0.0.1/8 scope host lo\n" +
          "       valid_lft forever preferred_lft forever\n" +
          "\n" +
          "2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000\n" +
          "    link/ether 00:0c:29:68:22:78 brd ff:ff:ff:ff:ff:ff\n" +
          "    inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic eth0\n" +
          "       valid_lft 86009sec preferred_lft 86009sec";
      } else {
        output = "ip: missing or unknown argument";
      }
      break;

    case "ifconfig":
      output =
        "eth0      Link encap:Ethernet  HWaddr 00:0c:29:68:22:78  \n" +
        "          inet addr:192.168.1.100  Bcast:192.168.1.255  Mask:255.255.255.0\n" +
        "          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1\n" +
        "          RX packets:208222 errors:0 dropped:0 overruns:0 frame:0\n" +
        "          TX packets:148158 errors:0 dropped:0 overruns:0 carrier:0\n" +
        "          collisions:0 txqueuelen:1000 \n" +
        "          RX bytes:212999848 (212.9 MB)  TX bytes:13287640 (13.2 MB)\n" +
        "\n" +
        "lo        Link encap:Local Loopback  \n" +
        "          inet addr:127.0.0.1  Mask:255.0.0.0\n" +
        "          UP LOOPBACK RUNNING  MTU:65536  Metric:1\n" +
        "          RX packets:4 errors:0 dropped:0 overruns:0 frame:0\n" +
        "          TX packets:4 errors:0 dropped:0 overruns:0 carrier:0\n" +
        "          collisions:0 txqueuelen:1 \n" +
        "          RX bytes:240 (240.0 B)  TX bytes:240 (240.0 B)";
      break;

    case "vim":
      if (args[0]) {
        output = `Vim: Editing file '${args[0]}'...\n-- INSERT --\nPress :wq to save and quit.\n`;
        // Simulate user editing session and quitting
        await new Promise((resolve) => setTimeout(resolve, 2000));
        output += `:wq\nVim: '${args[0]}' saved.`;
      } else {
        output = "Vim: No file specified.";
      }
      break;

    case "ls":
      let showAll = false;
      let pathArg = currentPath;

      args.forEach((arg) => {
        if (arg === "-a") {
          showAll = true;
        } else {
          pathArg = resolvePath(currentPath, arg);
        }
      });

      const targetDir = navigatePath(fs, pathArg);

      if (targetDir && typeof targetDir === "object") {
        output = Object.keys(targetDir)
          .filter((name) => showAll || !name.startsWith("."))
          .map((name) => {
            return typeof targetDir[name] === "object" ? `${name}/` : name;
          })
          .join(" ");
      } else {
        output = `ls: cannot access '${pathArg}': No such file or directory`;
      }
      break;

    case "cd":
      if (args[0]) {
        const newPath = resolvePath(currentPath, args[0]);
        if (navigatePath(fs, newPath)) {
          currentPath = newPath;
          output = "";
        } else {
          output = `cd: no such file or directory: ${args[0]}`;
        }
      } else {
        output = "cd: missing argument";
      }
      break;

    case "mkdir":
      if (args[0]) {
        const dir = navigatePath(fs, currentPath);
        if (dir[args[0]]) {
          output = `mkdir: cannot create directory '${args[0]}': File exists`;
        } else {
          dir[args[0]] = {};
          output = "";
        }
      } else {
        output = "mkdir: missing argument";
      }
      break;

    case "touch":
      if (args.length > 0) {
        const dir = navigatePath(fs, currentPath);
        let outputMessages = [];

        args.forEach((filename) => {
          if (dir.hasOwnProperty(filename)) {
            outputMessages.push(`touch: '${filename}' exists`);
          } else {
            dir[filename] = "";
            outputMessages.push(`touch: created '${filename}'`);
          }
        });

        output = outputMessages.join("\n");
      } else {
        output = "touch: missing argument";
      }
      break;

    case "rm":
      if (args.length > 0) {
        const dir = navigatePath(fs, currentPath);
        let filesToRemove = [];

        if (args[0] === "-r") {
          filesToRemove = args.slice(1).includes("*")
            ? matchFilesWithWildcard(dir, args[1])
            : args.slice(1);

          filesToRemove.forEach((file) => {
            if (dir.hasOwnProperty(file)) {
              if (typeof dir[file] === "object") {
                delete dir[file];
              } else {
                delete dir[file];
              }
            } else {
              output = `rm: cannot remove '${file}': No such file or directory`;
            }
          });
        } else {
          filesToRemove = args[0].includes("*")
            ? matchFilesWithWildcard(dir, args[0])
            : [args[0]];

          filesToRemove.forEach((file) => {
            if (dir.hasOwnProperty(file)) {
              if (typeof dir[file] === "object") {
                output = `rm: cannot remove '${file}': Is a directory`;
              } else {
                delete dir[file];
              }
            } else {
              output = `rm: cannot remove '${file}': No such file or directory`;
            }
          });
        }

        output = "";
      } else {
        output = "rm: missing operand";
      }
      break;

    case "mv":
      if (args.length === 2) {
        const srcPath = resolvePath(currentPath, args[0]);
        const destPath = resolvePath(currentPath, args[1]);
        const srcDir = navigatePath(fs, srcPath.slice(0, -1));
        const destDir = navigatePath(fs, destPath.slice(0, -1));

        const srcItemName = srcPath.slice(-1)[0];
        const destItemName = destPath.slice(-1)[0];

        if (
          destDir[destItemName] &&
          typeof destDir[destItemName] === "object"
        ) {
          destDir[destItemName][srcItemName] = srcDir[srcItemName];
          delete srcDir[srcItemName];
          output = "";
        } else if (srcDir && srcDir.hasOwnProperty(srcItemName)) {
          destDir[destItemName] = srcDir[srcItemName];
          delete srcDir[srcItemName];
          output = "";
        } else {
          output = `mv: cannot move '${args[0]}': No such file or directory`;
        }
      } else {
        output = "mv: missing file operand";
      }
      break;

    case "cat":
      if (args[0]) {
        const dir = navigatePath(fs, currentPath);
        if (dir.hasOwnProperty(args[0])) {
          if (typeof dir[args[0]] === "string") {
            output = dir[args[0]];
          } else {
            output = `cat: ${args[0]}: Is a directory`;
          }
        } else {
          output = `cat: ${args[0]}: No such file or directory`;
        }
      } else {
        output = "cat: missing file operand";
      }
      break;

    case "echo":
      if (args.includes(">")) {
        const index = args.indexOf(">");
        const content = args.slice(0, index).join(" ");
        const filename = args[index + 1];
        const dir = navigatePath(fs, currentPath);

        if (filename) {
          dir[filename] = content;
          output = "";
        } else {
          output = "echo: missing file name";
        }
      } else {
        output = args.join(" ");
      }
      break;

    case "cp":
      if (args.length < 2) {
        output = "cp: missing file operand";
      } else {
        const srcDir = navigatePath(fs, currentPath);
        const destPath = resolvePath(currentPath, args[args.length - 1]);
        const destDir = navigatePath(fs, destPath);

        let filesToCopy = args.slice(0, -1);

        if (filesToCopy.length === 1 && filesToCopy[0].includes("*")) {
          filesToCopy = matchFilesWithWildcard(srcDir, filesToCopy[0]);
        }

        if (filesToCopy.length > 0) {
          filesToCopy.forEach((file) => {
            if (srcDir.hasOwnProperty(file)) {
              if (typeof destDir === "object") {
                destDir[file] = srcDir[file];
              } else {
                output = `cp: target '${
                  args[args.length - 1]
                }' is not a directory`;
                return;
              }
            } else {
              output = `cp: cannot copy '${file}': No such file or directory`;
            }
          });
          output = "";
        } else {
          output = `cp: cannot copy '${args[0]}': No such file or directory`;
        }
      }
      break;

    case "ps":
      output = "  PID TTY          TIME CMD\n";
      for (const pid in processes) {
        if (processes[pid].status === "running") {
          output += `${pid} pts/0    00:00:00 ${processes[pid].command}\n`;
        }
      }
      break;

    case "kill":
      const pidToKill = args[0];
      if (processes[pidToKill] && processes[pidToKill].status === "running") {
        processes[pidToKill].status = "terminated";
        output = "";
      } else {
        output = `kill: ${args[0]}: No such process`;
      }
      break;

    case "top":
      const loadAverage = [
        (Math.random() * 0.5).toFixed(2),
        (Math.random() * 0.5).toFixed(2),
        (Math.random() * 0.5).toFixed(2),
      ];
      output =
        `top - 00:00:00 up ${Math.floor(
          uptimeSeconds / 3600
        )} hours, ${Math.floor(
          (uptimeSeconds % 3600) / 60
        )} minutes,  1 user,  load average: ${loadAverage.join(", ")}\n` +
        "Tasks: 100 total,   1 running,  99 sleeping,   0 stopped,   0 zombie\n" +
        "%Cpu(s):  0.3 us,  0.2 sy,  0.0 ni, 99.5 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st\n" +
        "MiB Mem :  16000.0 total,   8000.0 free,   4096.0 used,   2904.0 buff/cache\n" +
        "MiB Swap:  8000.0 total,   6000.0 free,   1000.0 used,   1000.0 avail Mem";
      break;

    case "htop":
      output =
        "PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command\n";
      for (const pid in processes) {
        if (processes[pid].status === "running") {
          output += `${pid} user      20   0  1234M  12M   4M R  0.3  0.1   0:00.00 ${processes[pid].command}\n`;
        }
      }
      break;

    case "date":
      output = new Date().toString();
      break;

    case "whoami":
      output = isRoot ? "root" : "user";
      break;

    case "hostname":
      output = "localhost";
      break;

    case "uname":
      if (args[0] === "-a") {
        output =
          "Linux localhost 5.4.0-52-generic #57-Ubuntu SMP Fri Oct 2 06:27:32 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux";
      } else {
        output = "Linux"; // Existing simple output for `uname`
      }
      break;

    case "uptime":
      const now = new Date();
      const uptimeSeconds = Math.floor((now - systemStartTime) / 1000);
      const hours = Math.floor(uptimeSeconds / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);
      output = `up ${hours} hours, ${minutes} minutes, 1 user, load average: 0.00, 0.01, 0.05`;
      break;

    case "cal":
      output =
        "    August 2024\nSu Mo Tu We Th Fr Sa\n             1  2  3\n 4  5  6  7  8  9 10\n11 12 13 14 15 16 17\n18 19 20 21 22 23 24\n25 26 27 28 29 30 31";
      break;

    case "bc":
      output = "Interactive calculator not supported";
      break;

    case "df":
      if (args[0] === "-h") {
        output =
          "Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1       100G   50G   50G  50% /\n" +
          "tmpfs           3.9G   1M  3.9G   1% /run\n" +
          "udev            3.9G   0    3.9G   0% /dev\n" +
          "/dev/sdb1       40G   10G   30G  25% /home\n";
      } else if (args[0] === "-i") {
        output =
          "Filesystem      Inodes  IUsed   IFree IUse% Mounted on\n/dev/sda1       100K    50K    50K   50% /\n" +
          "tmpfs           1M     1K     999K   1% /run\n" +
          "udev            1M     0      1M     0% /dev\n" +
          "/dev/sdb1       80K    20K    60K   25% /home\n";
      }
      break;

    case "du":
      output = "100K  ./test\n1M  ./home/user\n5M  ./root";
      break;

    case "free":
      output =
        "              total        used        free      shared  buff/cache   available\n" +
        "Mem:        16384000    8192000     4096000      204800     2048000     12288000\n" +
        "Swap:        8192000     2048000     6144000\n";
      break;

    case "id":
      output = isRoot
        ? "uid=0(root) gid=0(root) groups=0(root)"
        : "uid=1000(user) gid=1000(user) groups=1000(user),27(sudo),1001(admin)";
      break;

    case "who":
      output = isRoot
        ? "root pts/0 2024-08-01 00:00 (:0)"
        : "user pts/0 2024-08-01 00:00 (:0)";
      break;

    case "w":
      output =
        "00:00:00 up 1:23, 1 user, load average: 0.00, 0.00, 0.00\n" +
        (isRoot
          ? "root     pts/0    :0               00:00    1:23   0.00s  0.00s -bash"
          : "user     pts/0    :0               00:00    1:23   0.00s  0.00s -bash");
      break;

    case "last":
      output = isRoot
        ? "root    pts/0        :0               Fri Aug  1 00:00   still logged in"
        : "user    pts/0        :0               Fri Aug  1 00:00   still logged in";
      break;

    case "grep":
      if (args.length > 1) {
        const searchString = args[0];
        const fileName = args[1];
        const dir = navigatePath(fs, currentPath);
        if (dir.hasOwnProperty(fileName) && typeof dir[fileName] === "string") {
          const lines = dir[fileName].split("\n");
          output = lines
            .filter((line) => line.includes(searchString))
            .join("\n");
        } else {
          output = `grep: ${fileName}: No such file or directory`;
        }
      } else {
        output = "grep: missing operand";
      }
      break;

    case "which":
      output = `/usr/bin/${args[0]}`;
      break;

    case "locate":
      if (args[0]) {
        const filesFound = [];
        function searchFileSystem(obj, path = []) {
          for (const key in obj) {
            if (key.includes(args[0])) {
              filesFound.push([...path, key].join("/"));
            }
            if (typeof obj[key] === "object") {
              searchFileSystem(obj[key], [...path, key]);
            }
          }
        }
        searchFileSystem(fs);
        output = filesFound.length
          ? filesFound.join("\n")
          : `locate: ${args[0]}: No such file or directory`;
      } else {
        output = "locate: missing operand";
      }
      break;

    case "diff":
      if (args.length === 2) {
        const dir = navigatePath(fs, currentPath);
        const file1 = dir[args[0]];
        const file2 = dir[args[1]];
        if (file1 && file2) {
          const lines1 = file1.split("\n");
          const lines2 = file2.split("\n");
          const differences = lines1.filter(
            (line, idx) => line !== lines2[idx]
          );
          output = differences.join("\n");
        } else {
          output = `diff: ${
            file1 ? args[1] : args[0]
          }: No such file or directory`;
        }
      } else {
        output = "diff: missing operand";
      }
      break;

    case "sort":
      output = args.join(" ").split(" ").sort().join(" ");
      break;

    case "uniq":
      output = [...new Set(args)].join(" ");
      break;

    case "head":
      if (args[0]) {
        const dir = navigatePath(fs, currentPath);
        if (dir[args[0]] && typeof dir[args[0]] === "string") {
          output = dir[args[0]].split("\n").slice(0, 10).join("\n");
        } else {
          output = `head: cannot open '${args[0]}': No such file or directory`;
        }
      } else {
        output = "head: missing operand";
      }
      break;

    case "tail":
      if (args[0]) {
        const dir = navigatePath(fs, currentPath);
        if (dir[args[0]] && typeof dir[args[0]] === "string") {
          const lines = dir[args[0]].split("\n");
          output = lines.slice(-10).join("\n");
        } else {
          output = `tail: cannot open '${args[0]}': No such file or directory`;
        }
      } else {
        output = "tail: missing operand";
      }
      break;

    case "wc":
      if (args[0]) {
        const dir = navigatePath(fs, currentPath);
        if (dir[args[0]] && typeof dir[args[0]] === "string") {
          const content = dir[args[0]];
          const lines = content.split("\n").length;
          const words = content.split(/\s+/).length;
          const chars = content.length;
          output = `${lines} ${words} ${chars} ${args[0]}`;
        } else {
          output = `wc: ${args[0]}: No such file or directory`;
        }
      } else {
        output = "wc: missing operand";
      }
      break;

    case "tee":
      if (args.length > 0) {
        const dir = navigatePath(fs, currentPath);
        const content = args.slice(0, -1).join(" ");
        const filename = args[args.length - 1];
        if (dir[filename] !== undefined) {
          dir[filename] += "\n" + content;
        } else {
          dir[filename] = content;
        }
        output = content;
      } else {
        output = "tee: missing operand";
      }
      break;

    case "awk":
      if (args.length > 1) {
        const pattern = args[0];
        const filename = args[1];
        const dir = navigatePath(fs, currentPath);
        if (dir[filename] && typeof dir[filename] === "string") {
          output = dir[filename]
            .split("\n")
            .filter((line) => line.includes(pattern))
            .join("\n");
        } else {
          output = `awk: ${filename}: No such file or directory`;
        }
      } else {
        output = "awk: missing operand";
      }
      break;

    case "sed":
      if (args.length > 1) {
        const searchPattern = new RegExp(args[0], "g");
        const replaceWith = args[1];
        const filename = args[2];
        const dir = navigatePath(fs, currentPath);
        if (dir[filename] && typeof dir[filename] === "string") {
          output = dir[filename].replace(searchPattern, replaceWith);
        } else {
          output = `sed: ${filename}: No such file or directory`;
        }
      } else {
        output = "sed: missing operand";
      }
      break;

    case "cut":
      if (args.length > 1) {
        const option = args[0];
        const filename = args[1];
        const dir = navigatePath(fs, currentPath);
        if (dir[filename] && typeof dir[filename] === "string") {
          const delimiter = option.includes("-d") ? option.split("=")[1] : "\t";
          const field = option.includes("-f") ? option.split("=")[1] : "1";
          output = dir[filename]
            .split("\n")
            .map((line) => line.split(delimiter)[field - 1])
            .join("\n");
        } else {
          output = `cut: ${filename}: No such file or directory`;
        }
      } else {
        output = "cut: missing operand";
      }
      break;

    case "tr":
      if (args.length === 2) {
        const dir = navigatePath(fs, currentPath);
        const target = args[0];
        const replacement = args[1];
        for (const file in dir) {
          if (typeof dir[file] === "string") {
            dir[file] = dir[file].replace(new RegExp(target, "g"), replacement);
          }
        }
        output = `Replaced all occurrences of '${target}' with '${replacement}' in files.`;
      } else {
        output = "tr: missing operand";
      }
      break;

    case "stat":
      const filePath = resolvePath(currentPath, args[0]);
      const file = navigatePath(fs, filePath);
      if (file) {
        output =
          `File: ${args[0]}\nSize: 1234\tBlocks: 8\tIO Block: 4096  regular file\n` +
          `Device: 801h/2049d\tInode: 12345\tLinks: 1\n` +
          `Access: (0644/-rw-r--r--)  Uid: (${
            isRoot ? "0/root" : "1000/user"
          })   Gid: (${isRoot ? "0/root" : "1000/user"})\n` +
          `Access: 2024-08-01 00:00:00.000000000\n` +
          `Modify: 2024-08-01 00:00:00.000000000\n` +
          `Change: 2024-08-01 00:00:00.000000000`;
      } else {
        output = `stat: cannot stat '${args[0]}': No such file or directory`;
      }
      break;

    case "file":
      const fileTypePath = resolvePath(currentPath, args[0]);
      const fileTypeFile = navigatePath(fs, fileTypePath);
      if (fileTypeFile) {
        output = `${args[0]}: ASCII text`;
      } else {
        output = `file: cannot open '${args[0]}': No such file or directory`;
      }
      break;

    case "lsblk":
      if (args[0] === "-f") {
        output =
          "NAME   FSTYPE LABEL UUID                                 MOUNTPOINT\n" +
          "sda                                                       \n" +
          "├─sda1 ext4         1234-5678-9ABC-DEF0                   /\n" +
          "└─sda2 ext4         9ABC-DEF0-1234-5678                   /home\n" +
          "sdb                                                       \n" +
          "└─sdb1 ext4         ABCD-EF01-2345-6789                   /media/data\n";
      } else {
        output =
          "NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT\n" +
          "sda      8:0    0  100G  0 disk \n" +
          "├─sda1   8:1    0  100G  0 part /\n" +
          "sdb      8:16   0   40G  0 disk \n" +
          "└─sdb1   8:17   0   40G  0 part /home\n" +
          "sr0     11:0    1 1024M  0 rom  /media/cdrom";
      }
      break;

    case "parted":
      if (args[0] === "-l") {
        output =
          "Model: ATA VBOX HARDDISK (scsi)\n" +
          "Disk /dev/sda: 107GB\n" +
          "Sector size (logical/physical): 512B/512B\n" +
          "Partition Table: gpt\n" +
          "Disk Flags: \n\n" +
          "Number  Start   End     Size    File system  Name  Flags\n" +
          " 1      1049kB  1074MB  1073MB  ext4               \n" +
          " 2      1074MB  107GB   106GB   ext4               \n";
      } else {
        output = `parted: unrecognized option ${args[0]}`;
      }
      break;

    case "fdisk":
      if (args[0] === "-l") {
        output =
          "Disk /dev/sda: 100 GiB, 107374182400 bytes, 209715200 sectors\n" +
          "Units: sectors of 1 * 512 = 512 bytes\n" +
          "Sector size (logical/physical): 512 bytes / 4096 bytes\n" +
          "I/O size (minimum/optimal): 4096 bytes / 4096 bytes\n" +
          "Disklabel type: gpt\n" +
          "Disk identifier: 12345678-9ABC-DEF0-1234-56789ABCDEF0\n\n" +
          "Device     Start       End   Sectors  Size Type\n" +
          "/dev/sda1   2048    2099199  2097152    1G Linux filesystem\n" +
          "/dev/sda2 2099200 209715199 207616000  99G Linux filesystem\n";
      } else {
        output = `fdisk: ${args[0]}: Unable to open ${args[0]}`;
      }
      break;

    case "mkfs":
      let filesystemType = "ext4"; // default to ext4 if not specified
      let device;
      let options = [];
      let size;

      // Parse arguments
      args.forEach((arg, index) => {
        if (arg.startsWith("-t")) {
          if (arg === "-t" && args[index + 1]) {
            filesystemType = args[index + 1];
          } else {
            filesystemType = arg.slice(2);
          }
        } else if (arg.startsWith("-")) {
          options.push(arg);
        } else if (!device) {
          device = arg;
        } else {
          size = arg; // Treat the last argument as size if provided
        }
      });

      if (!device) {
        output = "mkfs: missing operand";
      } else {
        let sizeInfo = size ? ` with size ${size}` : "";
        let optionInfo =
          options.length > 0 ? ` and options ${options.join(" ")}` : "";

        output =
          `mke2fs 1.45.6 (20-Mar-2020)\nCreating ${filesystemType} filesystem${sizeInfo} on ${device}${optionInfo}\n` +
          `Allocating group tables: done\nWriting inode tables: done\nCreating journal: done\n` +
          `Writing superblocks and filesystem accounting information: done\n\n${device} formatted as ${filesystemType}`;
      }
      break;

    case "fsck":
      if (args.length === 0) {
        output = "fsck: missing operand";
      } else {
        output =
          `fsck from util-linux 2.34\n` +
          `${args[0]}: clean, 12345/67890 files, 98765/123456 blocks`;
      }
      break;

    case "umount":
      if (args.length === 0) {
        output = "umount: missing operand";
      } else {
        output = `umount: unmounting ${args[0]}...`;
      }
      break;

    case "mount":
      if (args.length === 0) {
        output =
          "/dev/sda1 on / type ext4 (rw,relatime)\n" +
          "tmpfs on /run type tmpfs (rw,nosuid,nodev,mode=755)\n" +
          "/dev/sdb1 on /home type ext4 (rw,relatime)\n";
      } else {
        output = `mount: mounting ${args[0]} on ${args[1]} type ${args[2]}...`;
      }
      break;

    case "modprobe":
      if (args[0] === "-r") {
        output = `modprobe: Removing module '${args[1]}'`;
      } else {
        output = `modprobe: Loading module '${args[0]}'`;
      }
      break;

    case "lsmod":
      output =
        "Module                  Size  Used by\n" +
        "ext4                   741376  1\n" +
        "mbcache                 16384  2 ext4\n" +
        "jbd2                   106496  1 ext4\n" +
        "evdev                   24576  16\n" +
        "serio_raw               16384  0\n" +
        "psmouse               147456  0\n";
      break;

    case "ln":
      if (args.length === 2) {
        output = `ln: created hard link '${args[1]}' to '${args[0]}'`;
      } else {
        output = `ln: missing operand after '${args[0]}'`;
      }
      break;

    case "xargs":
      if (args.length > 0) {
        output = `xargs processed '${args.join(" ")}'`;
      } else {
        output = "xargs: missing operand";
      }
      break;

    case "jobs":
      output = "No jobs";
      break;

    case "bg":
      output = `bg: ${args[0]}: No such job`;
      break;

    case "fg":
      output = `fg: ${args[0]}: No such job`;
      break;

    case "pkill":
      if (args[0]) {
        const processToKill = Object.keys(processes).find(
          (pid) =>
            processes[pid].command === args[0] &&
            processes[pid].status === "running"
        );
        if (processToKill) {
          processes[processToKill].status = "terminated";
          output = "";
        } else {
          output = `pkill: ${args[0]}: No such process`;
        }
      } else {
        output = "pkill: missing operand";
      }
      break;

    case "nohup":
      output = `nohup: ignoring input and redirecting stderr to stdout`;
      break;

    case "shutdown":
      output = "System is going down for reboot NOW!\n";
      output += "[  OK  ] Reached target Shutdown.\n";
      output += "[  OK  ] Finished Reboot.\n";
      output +=
        "Broadcast message from root@localhost (Fri Aug  1 00:00:00 2024):\n\n";
      output += "The system is going down for reboot NOW!";
      break;

    case "reboot":
      output = "Rebooting...\n";
      output += "[  OK  ] Stopped target Reboot.\n";
      output += "[  OK  ] Finished Reboot.\n";
      output += "[  OK  ] Reached target Reboot.\n";
      output += "Rebooting system.\n";
      break;

    case "halt":
      output = "System halted\n";
      output += "[  OK  ] Reached target Halt.\n";
      output += "[  OK  ] Finished Halt.\n";
      break;

    case "sync":
      output = "Syncing disks...\n";
      output += "[  OK  ] Reached target Sync.\n";
      output += "[  OK  ] Finished Sync.\n";
      break;

    case "gzip":
      if (args[0]) {
        const dir = navigatePath(fs, currentPath);
        if (dir.hasOwnProperty(args[0])) {
          output = `gzip: ${args[0]} compressed to ${args[0]}.gz`;
        } else {
          output = `gzip: ${args[0]}: No such file or directory`;
        }
      } else {
        output = "gzip: missing operand";
      }
      break;

    case "gunzip":
      if (args[0]) {
        const dir = navigatePath(fs, currentPath);
        const fileName = args[0].replace(".gz", "");
        if (dir.hasOwnProperty(args[0])) {
          dir[fileName] = dir[args[0]];
          delete dir[args[0]];
          output = `gunzip: ${args[0]} decompressed to ${fileName}`;
        } else {
          output = `gunzip: ${args[0]}: No such file or directory`;
        }
      } else {
        output = "gunzip: missing operand";
      }
      break;

    case "zip":
      if (args.length > 1) {
        const dir = navigatePath(fs, currentPath);
        const zipName = args[0];
        const filesToZip = args.slice(1);
        const validFiles = filesToZip.filter((file) =>
          dir.hasOwnProperty(file)
        );
        if (validFiles.length > 0) {
          output = `zip: ${zipName}.zip created containing: ${validFiles.join(
            ", "
          )}`;
        } else {
          output = `zip: ${args[1]}: No such file or directory`;
        }
      } else {
        output = "zip: missing operand";
      }
      break;

    case "unzip":
      if (args[0]) {
        const dir = navigatePath(fs, currentPath);
        const zipName = args[0].replace(".zip", "");
        if (dir.hasOwnProperty(args[0])) {
          output = `unzip: ${args[0]} unzipped to ${zipName}`;
        } else {
          output = `unzip: ${args[0]}: No such file or directory`;
        }
      } else {
        output = "unzip: missing operand";
      }
      break;

    case "scp":
      if (args.length > 1) {
        await simulateNetworkLatency();
        output = `scp: ${args[0]} copied to ${args[1]}`;
      } else {
        output = "scp: missing operand";
      }
      break;

    case "wget":
      if (args[0]) {
        output = `--2024-08-01 00:00:00-- ${args[0]}\nResolving ${args[0]}... 93.184.216.34\nConnecting to ${args[0]}|93.184.216.34|:80... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: unspecified [text/html]\nSaving to: 'index.html'\n\nindex.html           [ <=>                  ] 0           --.-K/s    in 0s\n`;
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate download time
        output += `2024-08-01 00:00:03 (5.00 MB/s) - 'index.html' saved [12345]`;
      } else {
        output = "wget: missing URL";
      }
      break;

    case "curl":
      if (args[0]) {
        await simulateNetworkLatency();
        output = `curl: Fetching ${args[0]}...`;
      } else {
        output = "curl: missing URL";
      }
      break;

    case "ping":
      if (args[0]) {
        const pingTimes = [29.8, 30.7, 32.1];
        output = `PING ${args[0]} (93.184.216.34) 56(84) bytes of data.\n`;
        pingTimes.forEach((time, index) => {
          output += `64 bytes from 93.184.216.34: icmp_seq=${
            index + 1
          } ttl=56 time=${time} ms\n`;
        });
        output += `\n--- ${args[0]} ping statistics ---\n`;
        output += `3 packets transmitted, 3 received, 0% packet loss, time 2017ms\n`;
        output += `rtt min/avg/max/mdev = ${Math.min(...pingTimes)}/${(
          pingTimes.reduce((a, b) => a + b) / pingTimes.length
        ).toFixed(2)}/${Math.max(...pingTimes)}/0.959 ms`;
      } else {
        output = "ping: missing operand";
      }
      break;

    case "traceroute":
      if (args[0]) {
        await simulateNetworkLatency();
        output =
          `traceroute to ${args[0]} (93.184.216.34), 30 hops max\n` +
          ` 1  192.168.0.1 (192.168.0.1)  1.000 ms  1.000 ms  1.000 ms\n` +
          ` 2  93.184.216.34 (93.184.216.34)  10.000 ms  10.000 ms  10.000 ms\n` +
          ` 3  * * *\n` +
          ` 4  * * *\n` +
          ` 5  * * *`;
      } else {
        output = "traceroute: missing operand";
      }
      break;

    case "nslookup":
      if (args[0]) {
        output =
          `Server: 8.8.8.8\nAddress: 8.8.8.8#53\n\n` +
          `Non-authoritative answer:\n` +
          `Name: ${args[0]}\nAddress: 93.184.216.34`;
      } else {
        output = "nslookup: missing operand";
      }
      break;

    case "ftp":
      if (args[0]) {
        if (!sessionState.ftp) {
          sessionState.ftp = { connected: true, host: args[0] };
          output = `Connected to ${args[0]}.\n220 (vsFTPd 3.0.3)\n`;
        } else {
          output = `530 Please login with USER and PASS.`;
        }
      } else {
        output = "ftp: missing operand";
      }
      break;

    case "sftp":
      if (args[0]) {
        if (!sessionState.sftp) {
          sessionState.sftp = { connected: true, host: args[0] };
          output = `Connected to ${args[0]}.\nsftp> `;
        } else {
          output = `sftp> ls\nremote file\nsftp> exit`;
          delete sessionState.sftp;
        }
      } else {
        output = "sftp: missing operand";
      }
      break;

    case "telnet":
      if (args[0]) {
        if (!sessionState.telnet) {
          sessionState.telnet = { connected: true, host: args[0] };
          output = `Trying ${args[0]}...\nConnected to ${args[0]}.\nEscape character is '^]'.\n`;
        } else {
          output = `Connection closed by foreign host.`;
          delete sessionState.telnet;
        }
      } else {
        output = "telnet: missing operand";
      }
      break;

    case "ssh":
      if (args[0]) {
        const dateStr = formatDate(new Date());
        output = `user@${args[0]}:~$ ls\nDocuments  Downloads  Music  Pictures  Videos\nuser@${args[0]}:~$ exit\nLogged out from ${args[0]} at ${dateStr}`;
      } else {
        output = "ssh: missing operand";
      }
      break;

    case "exit":
      const exitDateStr = formatDate(new Date());
      output = `Session closed at ${exitDateStr}`;
      break;

    case "dig":
      if (args[0]) {
        output =
          `; <<>> DiG 9.11.3-1ubuntu1.13-Ubuntu <<>> ${args[0]}\n` +
          `;; global options: +cmd\n` +
          `;; Got answer:\n` +
          `;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 12345\n` +
          `;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 0\n\n` +
          `;; QUESTION SECTION:\n` +
          `;${args[0]}.               IN  A\n\n` +
          `;; ANSWER SECTION:\n` +
          `${args[0]}.        300 IN  A   93.184.216.34`;
      } else {
        output = "dig: missing operand";
      }
      break;

    case "killall":
      if (args[0]) {
        const killedProcesses = [];
        for (const pid in processes) {
          if (
            processes[pid].command === args[0] &&
            processes[pid].status === "running"
          ) {
            processes[pid].status = "terminated";
            killedProcesses.push(pid);
          }
        }
        if (killedProcesses.length > 0) {
          output = `Killed process ${args[0]} with PIDs: ${killedProcesses.join(
            ", "
          )}`;
        } else {
          output = `killall: ${args[0]}: No such process`;
        }
      } else {
        output = "killall: missing operand";
      }
      break;

    case "watch":
      output =
        "Every 2.0s: uptime                               user@localhost: Wed Aug  1 00:00:00 2024\n\n" +
        "00:00:00 up 1:23, 1 user, load average: 0.00, 0.00, 0.00";
      break;

    case "hostnamectl":
      output =
        "   Static hostname: localhost\n" +
        "         Icon name: computer-laptop\n" +
        "           Chassis: laptop\n" +
        "        Machine ID: 1234567890abcdef1234567890abcdef\n" +
        "           Boot ID: 1234567890abcdef1234567890abcdef\n" +
        "Operating System: Linux\n" +
        "            Kernel: Linux 5.4.0-52-generic";
      break;

    case "journalctl":
      const logEntries = [];
      for (let i = 0; i < 10; i++) {
        const logTime = new Date(systemStartTime.getTime() + i * 60000); // Log entries every minute
        logEntries.push(
          `${logTime.toISOString()} localhost systemd[1]: Log entry ${i + 1}`
        );
      }
      output = logEntries.join("\n");
      break;

    case "systemctl":
      output =
        "UNIT                        LOAD   ACTIVE SUB     DESCRIPTION\n" +
        "proc-sys-fs-binfmt_misc.automount loaded active waiting  Arbitrary Executable File Formats File System Automount Point\n" +
        "sys-devices-virtual-net-docker0.device loaded active plugged  /sys/devices/virtual/net/docker0";
      break;

    case "timedatectl":
      output =
        "Local time: Fri 2024-08-01 00:00:00 UTC\n" +
        "Universal time: Fri 2024-08-01 00:00:00 UTC\n" +
        " RTC time: Fri 2024-08-01 00:00:00\n" +
        " Time zone: Etc/UTC (UTC, +0000)\n" +
        "System clock synchronized: yes\n" +
        " NTP service: active\n" +
        " RTC in local TZ: no";
      break;

    case "hwclock":
      output = "2024-08-01 00:00:00.000000+00:00";
      break;

    default:
      output = `Command not found: ${command}`;
  }

  return output;
}
