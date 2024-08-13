// components/commands.js

const commands = [
  "pwd",
  "ss",
  "netstat",
  "ip addr",
  "ifconfig",
  "vim file.txt",
  "ls",
  "cd /home",
  "mkdir testDir",
  "touch newfile.txt",
  "rm newfile.txt",
  "mv oldfile.txt newfile.txt",
  "cat newfile.txt",
  "echo 'Hello World' > file.txt",
  "cp file.txt copy.txt",
  "ps",
  "kill 1234",
  "top",
  "htop",
  "date",
  "whoami",
  "hostname",
  "uname -a",
  "uptime",
  "cal",
  "bc",
  "df -h",
  "du -sh *",
  "free -m",
  "id",
  "who",
  "w",
  "last",
  "grep 'search term' file.txt",
  "which ls",
  "locate file.txt",
  "diff file1.txt file2.txt",
  "sort file.txt",
  "uniq file.txt",
  "head file.txt",
  "tail file.txt",
  "wc file.txt",
  "tee file.txt",
  "awk '{print $1}' file.txt",
  "sed 's/old/new/g' file.txt",
  "cut -d':' -f1 /etc/passwd",
  "tr 'a-z' 'A-Z'",
  "stat file.txt",
  "file file.txt",
  "lsblk",
  "parted /dev/sda print",
  "fdisk -l",
  "mkfs.ext4 /dev/sda1",
  "fsck /dev/sda1",
  "umount /mnt",
  "mount /dev/sda1 /mnt",
  "modprobe -r module",
  "lsmod",
  "ln -s target linkname",
  "xargs rm < files.txt",
  "jobs",
  "bg",
  "fg",
  "pkill vim",
  "nohup command &",
  "shutdown -h now",
  "reboot",
  "halt",
  "sync",
  "gzip file.txt",
  "gunzip file.txt.gz",
  "zip archive.zip file.txt",
  "unzip archive.zip",
  "scp file.txt user@remote:/path",
  "wget http://example.com/file.txt",
  "curl http://example.com",
  "ping google.com",
  "traceroute google.com",
  "nslookup google.com",
  "ftp ftp.example.com",
  "sftp user@example.com",
  "telnet example.com",
  "ssh user@example.com",
  "exit",
  "dig example.com",
  "killall vim",
  "watch -n 1 date",
  "hostnamectl",
  "journalctl -xe",
  "systemctl status",
  "timedatectl",
  "hwclock",
  "sudo apt update",
  "sudo apt install package",

  // Additional administrative commands
  "mkdir new_directory", // Creating a new directory
  "touch new_directory/newfile.txt", // Creating a new file inside the directory
  "mv new_directory/newfile.txt renamed.txt", // Renaming the file
  "cp renamed.txt new_directory/", // Copying the file back to the directory
  "rm new_directory/renamed.txt", // Removing the file inside the directory
  "ls -la", // Listing all files including hidden ones
  "chmod 755 new_directory", // Changing permissions of the directory
  "chown user:group new_directory", // Changing ownership of the directory
  "tar -cvf archive.tar new_directory", // Archiving the directory
  "gzip archive.tar", // Compressing the archive
  "gunzip archive.tar.gz", // Decompressing the archive
  "rm -r new_directory", // Removing the directory and its contents
  "df -h", // Checking disk space usage
  "du -sh new_directory", // Checking directory size
  "find /home/user -name '*.txt'", // Finding all .txt files in the user's home
  "echo 'Appended text' >> file.txt", // Appending text to a file
  "stat newfile.txt", // Getting file statistics
  "head -n 10 file.txt", // Displaying the first 10 lines of a file
  "tail -n 10 file.txt", // Displaying the last 10 lines of a file
  "grep 'pattern' file.txt", // Searching for a pattern in a file
  "sort file.txt", // Sorting contents of a file
  "uniq file.txt", // Removing duplicate lines from a file
  "chmod 644 file.txt", // Changing file permissions
  "chown user:user file.txt", // Changing file ownership
  "ln -s file.txt symlink.txt", // Creating a symbolic link
  "touch newfile{1..3}.txt", // Creating multiple files at once
  "rm *.txt", // Deleting all .txt files in the current directory
];

export default commands;
