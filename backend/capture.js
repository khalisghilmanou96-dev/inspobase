import { chromium } from 'playwright';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('.', import.meta.url);
const target = new URL('./catalog.json', root);
const input = new URL('./domains.txt', root);
const outDir = new URL('./screenshots/', root);
await mkdir(outDir,{recursive:true});
let lines=(await readFile(input,'utf8')).split(/\r?\n/).map(x=>x.trim()).filter(x=>x&&!x.startsWith('#'));
let existing=[];try{existing=JSON.parse(await readFile(target,'utf8'))}catch{}
const seen=new Set(existing.map(x=>x.url));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:960},deviceScaleFactor:1,ignoreHTTPSErrors:false});
const concurrency=3;let pos=0,success=0;
async function worker(){while(pos<lines.length){const line=lines[pos++];let url;try{url=new URL(line.includes('://')?line:'https://'+line);if(!['https:','http:'].includes(url.protocol))continue}catch{continue}if(seen.has(url.href))continue;const page=await context.newPage();try{const response=await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:18000});if(!response||response.status()>=400)continue;await page.waitForTimeout(1200);const final=page.url();if(/github\.com\/[^/]+\/[^/]+/.test(final)&&!url.hostname.includes('github.com'))continue;const title=(await page.title()).trim().slice(0,110)||url.hostname;const name=createHash('sha256').update(url.href).digest('hex').slice(0,20)+'.webp';await page.screenshot({path:new URL(name,outDir).pathname,type:'webp',quality:75,animations:'disabled'});existing.push({id:name,url:url.href,src:'/screenshots/'+name,name,domain:url.hostname,cat:'Design',date:Date.now(),score:0,source:'Captured website'});seen.add(url.href);success++;if(success%10===0)console.log('captured',success)}catch(e){console.log('skip',url.href,e.message.slice(0,90))}finally{await page.close()}}}
await Promise.all(Array.from({length:concurrency},worker));await browser.close();const tmp=new URL('./catalog.tmp.json',root);await writeFile(tmp,JSON.stringify(existing,null,2));await rename(tmp,target);console.log('Catalog size:',existing.length,'new:',success);
