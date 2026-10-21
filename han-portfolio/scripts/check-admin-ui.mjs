import assert from 'node:assert/strict';
import {createServer} from 'vite';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try{
 const {ItemForm,ItemList,copyGroups,linkNames,photoNames}=await server.ssrLoadModule('/src/admin-ui.tsx');
 const noop=()=>{};
 const project=renderToStaticMarkup(React.createElement(ItemForm,{kind:'projects',value:{name:'Sample project',description:'Description',tags:['React','TypeScript'],repo:'demo',theme:'violet',icon:'Code2',type:'software',category:'Hidden'},onChange:noop}));
 assert(project.includes('GitHub repository name'));
 assert(project.includes('Technologies'));
 assert(!project.includes('Hidden'));
 assert(!project.includes('software'));
 const gallery=renderToStaticMarkup(React.createElement(ItemForm,{kind:'gallery',value:['/assets/fe-2.jpg','Ceremony'],onChange:noop}));
 assert(gallery.includes('Choose replacement photo'));assert(gallery.includes('type="file"'));assert(gallery.includes('Caption'));
 const list=renderToStaticMarkup(React.createElement(ItemList,{kind:'projects',items:[{name:'UniVault',description:'University system'}],onEdit:noop,onDelete:noop,onMove:noop}));
 assert(list.includes('UniVault'));assert(list.includes('Delete UniVault'));assert(list.includes('Move UniVault up'));assert(list.includes('Edit'));
 const empty=renderToStaticMarkup(React.createElement(ItemList,{kind:'skills',items:[],onEdit:noop,onDelete:noop,onMove:noop}));
 assert(empty.includes('No skills yet'));
 assert(copyGroups.research.some(f=>f.label==='Paper title'));assert(linkNames.researchPaper);assert(photoNames['fe-2.jpg']);
 const {researchFromLegacy,checkResearch}=await server.ssrLoadModule('/src/research.ts');
 const legacy={text:{text_25:'My edited paper',text_26:'Han',text_28:'Coauthor',text_29:'Saved summary'},links:{researchPaper:'https://example.com/paper.pdf'},collections:{}};
 const migrated=researchFromLegacy(legacy);assert.equal(migrated.length,1);assert.equal(migrated[0].title,'My edited paper');assert.equal(migrated[0].summary,'Saved summary');
 assert.equal(researchFromLegacy({...legacy,collections:{research:[]}}).length,0);
 assert.throws(()=>checkResearch([{...migrated[0],paperUrl:'javascript:alert(1)'}]));
 const paper=renderToStaticMarkup(React.createElement(ItemForm,{kind:'research',value:{...migrated[0],image:''},onChange:noop,onUpload:async()=>"https://example.com/photo.jpg"}));
 assert(paper.includes('Paper PDF or publication URL'));assert(paper.includes('Choose photo from device'));assert(!paper.includes('original-paper'));
 console.log('Admin rendering checks passed: project fields, gallery form, list controls, empty state, and friendly labels.');
}finally{await server.close()}
