const fs = require('fs');
const path = require('path');

(() => {
  const imagesPath = path.join(__dirname, '../images');
  let files = fs.readdirSync(imagesPath);

  // Json file should be removed and dependent file also (filename minus .json)
  const jsonFiles = files.filter((f) => f.includes('.json'));
  let errorHappened = false;

  jsonFiles.forEach((fName) => {
    try {
      const correspondingFileName = fName.replace('.json', '');
      fs.unlinkSync(`${imagesPath}/${fName}`);
      fs.unlinkSync(`${imagesPath}/${correspondingFileName}`);
      console.log(
        `removed file: ${fName} and corresponding resized file: ${correspondingFileName}`
      );
    } catch (e) {
      errorHappened = true;
      console.log(e);
    }
  });

  console.log(
    errorHappened
      ? 'Some files could not be removed'
      : `Succesfully removed all the resized files (${jsonFiles.length})`
  );
})();
