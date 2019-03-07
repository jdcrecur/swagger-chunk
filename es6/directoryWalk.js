import fs from 'fs'
import path from 'path'

const directoryWalk = (currentDirPath, callback, baseChecked = false) => {
    console.log(currentDirPath)
    if( !baseChecked ){
        fs.accessSync(currentDirPath);
        baseChecked = true; // prevent this logic running again
    }
    fs.readdirSync(currentDirPath).forEach(function (name) {
        const filePath = path.join(currentDirPath, name)
        const stat = fs.statSync(filePath)
        if (stat.isFile()) {
          console.log('FILE')
          callback(filePath, stat)
        }
        else if (stat.isDirectory()) {
          directoryWalk(filePath, callback, baseChecked);
        }
    });
}

export default directoryWalk
