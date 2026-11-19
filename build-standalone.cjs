const fs=require('node:fs'),path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,name),'utf8');
let html=read('index.html').replace('<link rel="stylesheet" href="style.css">',()=>'<style>'+read('style.css')+'</style>');
for(const name of ['data.js','app.js','online.js'])html=html.replace('<script src="'+name+'"></script>',()=>'<script>'+read(name)+'</script>');
const out=path.resolve(__dirname,'../outputs');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'Biddio.html'),html);
console.log('Standalone solo version built.');
