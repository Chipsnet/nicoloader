var electron = require('electron');
var ipcRenderer = electron.ipcRenderer;

function checkText() {
	if (document.getElementById("nico_url").value === "") {
		ipcRenderer.send('error', 'URLを入力してください');
	} else {
		ipcRenderer.send('ready', document.getElementById("nico_url").value)
		ipcRenderer.send('sendpath', document.getElementById("filepath").value)
		window.location.href = "process.html";
	};
}

function openinfo() {
	alert('Nicoloader v1.0.1\nDeveloped by Minato86\n\nコマンド系作者\nNaki @Naki_ASMR\n\nSpecial Thanks\n抹茶鯖の方々　みのっち氏');
}

function openweb() {
	const shell = electron.shell;
	shell.openExternal('https://lab.m86.work/2019/08/blog-post.html');
}

function logadd(arg) {
	obj = document.getElementById("log");
	obj.value += arg + "\n";
	obj.scrollTop = obj.scrollHeight;
}

ipcRenderer.on('reply', (event, arg) => {
	logadd(arg);
	ipcRenderer.send('start', 'started')
})

ipcRenderer.on('info', (event, arg) => {
	logadd(arg.msg);
})

ipcRenderer.on('success', (event, arg) => {
	alert(arg.msg);
	window.location.href = "index.html"
})