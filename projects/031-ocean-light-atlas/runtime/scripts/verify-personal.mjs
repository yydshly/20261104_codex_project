import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
for(const script of ['verify-rocket-browser.mjs','verify-character-controls.mjs']){
  const result=spawnSync(process.execPath,[fileURLToPath(new URL(script,import.meta.url))],{stdio:'inherit',env:{...process.env,SEA_CHARACTER:'personal0597'}});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status||1);
}
