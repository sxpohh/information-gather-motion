import {resolve} from 'node:path';
import {createProject} from '../assets/template/scripts/create.mjs';
try{if(process.argv.length!==4)throw Error('Usage: node create.mjs <product.json> <NEW-output-directory>');console.log(JSON.stringify(createProject(resolve(process.argv[2]),resolve(process.argv[3])),null,2));}catch(e){console.error(e.message);process.exitCode=1;}
