const commands = [
  "pwd",
  "ls -la",
  "mkdir testDir",
  "cd testDir",
  "touch testFile.txt",
  "ls -la",
  "chmod 755 testFile.txt",
  "ls -la",
  "chown user:group testFile.txt",
  "echo 'This is a test file.' > anotherFile.txt",
  "cat anotherFile.txt",
  "cp anotherFile.txt copiedFile.txt",
  "mv copiedFile.txt renamedFile.txt",
  "ln -s renamedFile.txt symlink.txt",
  "ls -la", // Check to see if all files were created correctly.
  "find . -name '*.txt'",
  "tar -cvf testArchive.tar .", // Archive current directory contents.
  "ls -la", // Ensure archive was created.
  "gzip testArchive.tar", // Compress the archive.
  "ls -la", // Ensure gzip created the archive successfully.
  "gunzip testArchive.tar.gz", // Decompress the archive.
  "ls -la", // Verify the archive has been restored.
  "tar -xvf testArchive.tar", // Extract the archive.
  "ls -la", // Ensure extraction was successful.
  "rm -r *", // Clean up the directory.
  "cd ..",
  "rm -r testDir",
];

export default commands;
