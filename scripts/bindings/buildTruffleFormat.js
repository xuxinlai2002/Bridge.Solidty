const { resolve } = require('path');
const { readdir } = require('fs').promises;
const path = require('path');
const fs = require('fs')

async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}


const main = async () => {

    let targetFiles = [];

    let bindingSrcs = ["artifacts/@openzeppelin","artifacts/contracts"]; 

    for(var i = 0 ; i < bindingSrcs.length ;i ++){
        
        let files = [];
        //for await (const f of getFiles(src)) {
        for await (const f of getFiles(bindingSrcs[i])) {
            files.push(f);
        }
    
        const EXTENSION = '.json';
        let eachFiles = files.filter(file => {
            return path.extname(file).toLowerCase() === EXTENSION && !file.toLowerCase().includes(".dbg.json");
        });

        targetFiles = targetFiles.concat(eachFiles);

    }
    // console.log(targetFiles);

    for(var j = 0; j < targetFiles.length ;j ++){

        let destDirFile = "build/contracts/" + path.basename(targetFiles[j]);
        await copyFile(targetFiles[j],destDirFile);
    }


}

const copyFile = async (src, dest) => {
    await fs.promises.copyFile(src, dest)
  }

main();
