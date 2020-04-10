const electron = require('electron');
const dialog = electron.dialog;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;
const fs = require('fs');
const ffmpeg = require('ffmpeg-static-electron');
const { spawn } = require('child_process')

nico_url = "";

let mainWindow = null;

try {
    fs.statSync('./download');
} catch(err) {
    if(err.code === 'ENOENT') {
        fs.mkdir('./download', function (err) {
        });
    }
}

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.setMenu(null);
    mainWindow.loadFile('./index.html');
});

ipc.on('error', (event, arg) => {
    dialog.showErrorBox('URLを解析できませんでした', arg)
})

ipc.on('sendpath', (event, arg) => {
    path = arg;
})

ipc.on('ready', (event, arg) => {
    nico_url = arg;
    setTimeout(() => {
        event.sender.send('reply', `${arg}の解析を行います...`);
    }, 2000);
})

ipc.on('start', (event, arg) => {
    var ffmpeg_do = spawn(ffmpeg.path, ['-protocol_whitelist', 'file,http,https,tcp,tls,crypto', '-user_agent', "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36", "-i", `${nico_url}`, '-movflags', 'faststart', '-c', 'copy', '-bsf:a', 'aac_adtstoasc', `./download/${path}.mp4`]);
    ffmpeg_do.stderr.on('data', data => {
        //console.error(data.toString())
        mainWindow.webContents.send('info', {msg:`${data.toString()}`});
    })
    ffmpeg_do.stdout.on('data', data => {
        //console.log(data.toString())
        mainWindow.webContents.send('info', {msg:`${data.toString()}`});
    })
    
    ffmpeg_do.on('close', code => {
    if (code !== 0) {
        dialog.showErrorBox('出力に失敗しました', `process exited with code ${code}\nURLが間違っていないか確認してください。`)
        mainWindow.webContents.send('not_nicoURL', {msg:`notnicourl`});
        nico_url = "";
    } else {
        mainWindow.webContents.send('success', {msg:'出力が完了しました。'});
        nico_url = "";
    }})
})