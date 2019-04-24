const fs = require('fs');

fs.readFile('test_read.txt', (err, data) => {
  if (err) throw err;
  fs.writeFile('test_write.txt', data, (err) => {
    if (err) throw err;
  });
});
