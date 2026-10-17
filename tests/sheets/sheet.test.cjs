const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const read=file=>fs.readFileSync(path.join(process.cwd(),file),'utf8');

test('stage result sheet has no redundant close button',()=>{
 const content=read('src/features/results/components/StageResultSheet.tsx');
 assert.doesNotMatch(content,/<AppButton\s+title=["']بستن["']/);
 assert.match(content,/title="ادامه مسیر"/);
 assert.match(content,/title="دوباره بازی کن"/);
 assert.match(content,/onDismiss=\{onClose\}/);
});

test('common bottom sheet supports both drag-down and outside press',()=>{
 const content=read('src/components/overlays/AppSheet.tsx');
 assert.match(content,/enablePanDownToClose/);
 assert.match(content,/pressBehavior="close"/);
});

test('child profile sheet does not need a redundant close action',()=>{
 const content=read('src/features/children/components/AddChildSheet.tsx');
 assert.match(content,/enablePanDownToClose=\{!saving\}/);
 assert.doesNotMatch(content,/<AppButton\s+title=["']بستن["']/);
});
