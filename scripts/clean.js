const fs = require('fs');
const path = require('path');

(() => {
  const imagesPath = path.join(__dirname, '../images');
  let files = fs.readdirSync(imagesPath);

  // Json file should be removed and dependent file also (filename minus .json)
  const jsonFiles = files.filter((f) => f.includes('.json'));
  jsonFiles.forEach((fName) => {
    try {
      const correspondingFileName = fName.replace('.json', '');
      fs.unlinkSync(`${imagesPath}/${fName}`);
      fs.unlinkSync(`${imagesPath}/${correspondingFileName}`);
      console.log(
        `removed file: ${fName} and corresponding resized file: ${correspondingFileName}`
      );
      console.log('Removed all the resized files');
    } catch (e) {
      console.log(e);
    }
  });
})();
