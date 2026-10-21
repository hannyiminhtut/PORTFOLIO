import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
let source=fs.readFileSync('src/main.tsx','utf8');
const tree=ts.createSourceFile('main.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const seed={text:{},links:{github:'https://github.com/hannyiminhtut'},images:{},collections:{}};
const edits=[];let textIndex=0;let linkIndex=0;
const icons=Object.fromEntries(['Database','Layers','BrainCircuit','Terminal','Code2','ArrowRight','Cloud'].map(n=>[n,n]));
function walk(node){
 if(ts.isVariableDeclaration(node)&&['projects','skills'].includes(node.name.getText(tree))){seed.collections[node.name.getText(tree)]=vm.runInNewContext('('+node.initializer.getText(tree)+')',icons);edits.push([node.parent.parent.getStart(tree),node.parent.parent.end,'']);return;}
 if(ts.isJsxText(node)&&node.getText(tree).trim()){
  const text=node.getText(tree).trim();const key='text_'+(++textIndex);seed.text[key]=text;edits.push([node.getStart(tree),node.end,`{copy('${key}')}`]);
 }
 if(ts.isJsxAttribute(node)&&['title','kicker','alt','href'].includes(node.name.getText(tree))&&node.initializer&&ts.isStringLiteral(node.initializer)){
  const value=node.initializer.text;
  if(node.name.getText(tree)==='href'&&!value.startsWith('http')&&!value.startsWith('mailto:'))return;
  const key='field_'+(++linkIndex);const kind=node.name.getText(tree)==='href'?'links':'text';seed[kind][key]=value;edits.push([node.initializer.getStart(tree),node.initializer.end,`{data.${kind}.${key}}`]);
 }
 if(ts.isCallExpression(node)&&node.expression.getText(tree)==='asset'&&node.arguments.length&&ts.isStringLiteral(node.arguments[0]))seed.images[node.arguments[0].text]='/assets/'+node.arguments[0].text;
 if(ts.isArrayLiteralExpression(node)&&ts.isJsxExpression(node.parent)){
  const raw=node.getText(tree);let key;
  if(raw.includes("title:'Software as"))key='focus';else if(raw.includes("date:'2022"))key='education';else if(raw.includes("mark:'FE'"))key='certificates';else if(raw.includes("'award-2.jpg','Award"))key='gallery';
  if(key){seed.collections[key]=vm.runInNewContext('('+raw+')',icons);edits.push([node.getStart(tree),node.end,`data.collections.${key}`]);return;}
 }
 ts.forEachChild(node,walk);
}
walk(tree);
for(const [start,end,replacement] of edits.sort((a,b)=>b[0]-a[0]))source=source.slice(0,start)+replacement+source.slice(end);
for(const image of ['profile.jpg','fe-1.jpg','fe-2.jpg','n3.jpg','n4.jpg','award-1.jpg','award-2.jpg','award-3.jpg'])seed.images[image]='/assets/'+image;
source=source.replace("const github='https://github.com/hannyiminhtut';",'');
source=source.replace('const asset=(name:string)=>`/assets/${name}`;','');
source=source.replace('function App(){',`export function App({preview}:{preview?:Content}){\n const published=usePortfolioContent();const data=preview??published;\n const copy=(key:string)=>data.text[key]??'';const github=data.links.github;const asset=(name:string)=>data.images[name]??name;\n const projects=data.collections.projects.map(p=>({...p,icon:iconMap[p.icon]??Code2}));const skills=data.collections.skills;`);
source=source.replace('icon:Icon,...f','icon:iconName,...f').replace('<Icon size={23}/>','<FocusIcon name={iconName}/>');
source=source.replace("import './styles.css';",`import './styles.css';\nimport {usePortfolioContent,type Content} from './content';\nimport {Admin} from './admin';\nconst iconMap:Record<string,typeof Code2>={Database,Layers,BrainCircuit,Terminal,Code2,ArrowRight,Cloud};\nfunction FocusIcon({name}:{name:string}){const Icon=iconMap[name]??Code2;return <Icon size={23}/>}`);
source=source.replace('<App/>',"window.location.pathname.startsWith('/admin')?<Admin/>:<App/>");
fs.writeFileSync('src/main.tsx',source);fs.writeFileSync('src/initial-content.json',JSON.stringify(seed,null,2));
const config=JSON.parse(fs.readFileSync('tsconfig.json','utf8'));config.compilerOptions.resolveJsonModule=true;fs.writeFileSync('tsconfig.json',JSON.stringify(config,null,2));
console.log('Migrated existing text, links, photos, and collections into editable content.');
