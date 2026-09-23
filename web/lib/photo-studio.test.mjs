import test from 'node:test';
import assert from 'node:assert/strict';
import { blurPixels, cropRegion, selectionRegion, safeRegion, dateLabel, fileIssue } from './photo-studio.ts';

test('portrait crop preserves ratio and stays within the original at every pan extreme', () => {
  for (const [width,height] of [[4000,3000],[1200,4000],[801,601]]) {
    for(const zoom of [1,1.5,3]) for(const x of [0,50,100]) for(const y of [0,50,100]) {
      const c=cropRegion(width,height,{aspect:'portrait',zoom,x,y});
      assert.ok(Math.abs(c.width/c.height-.8)<1e-9);
      assert.ok(c.x>=0&&c.y>=0&&c.x+c.width<=width+1e-9&&c.y+c.height<=height+1e-9);
    }
  }
});
test('reverse-drawn selection maps through a zoomed crop into source pixels',()=>{
  const crop=cropRegion(1000,800,{aspect:'square',zoom:2,x:100,y:0});
  assert.deepEqual(crop,{x:600,y:0,width:400,height:400});
  assert.deepEqual(selectionRegion({x:.75,y:.8},{x:.25,y:.2},crop,1000,800),{x:.7,y:.1,width:.2,height:.30000000000000004});
});
test('region clamping prevents covers extending outside the image',()=>{
  assert.deepEqual(safeRegion({x:-2,y:.9,width:2,height:2}),{x:0,y:.9,width:1,height:1-.9});
});
test('blur changes detailed pixels without mutating the source or introducing transparency',()=>{
  const source=new Uint8ClampedArray([0,0,0,255,255,255,255,255,0,0,0,255]);
  const result=blurPixels(source,3,1,1);
  assert.deepEqual([...result],[85,85,85,255,85,85,85,255,85,85,85,255]);
  assert.equal(source[4],255);
});
test('blur matches a reference box blur including edge clamping',()=>{
  const width=5,height=4,r=2;
  const original=Uint8ClampedArray.from({length:width*height*4},(_,i)=>(i*17)%256);
  const horizontal=new Uint8ClampedArray(original.length),expected=new Uint8ClampedArray(original.length);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)for(let c=0;c<4;c++){
    let sum=0;for(let k=-r;k<=r;k++)sum+=original[(y*width+Math.max(0,Math.min(width-1,x+k)))*4+c];
    horizontal[(y*width+x)*4+c]=Math.round(sum/(2*r+1));
  }
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)for(let c=0;c<4;c++){
    let sum=0;for(let k=-r;k<=r;k++)sum+=horizontal[(Math.max(0,Math.min(height-1,y+k))*width+x)*4+c];
    expected[(y*width+x)*4+c]=Math.round(sum/(2*r+1));
  }
  assert.deepEqual(blurPixels(original,width,height,r),expected);
});
test('dates reject impossible input and remain stable across timezones',()=>{
  assert.equal(dateLabel('2026-02-30'),'');
  assert.equal(dateLabel('2026-09-23'),'Sep 23, 2026');
  assert.equal(dateLabel('2024-02-29'),'Feb 29, 2024');
});
test('unsupported formats and oversized files are rejected',()=>{
  assert.match(fileIssue({name:'test.heic',type:'image/heic',size:12}),/JPEG/);
  assert.match(fileIssue({name:'x.png',type:'image/png',size:13*1024*1024}),/12 MB/);
  assert.equal(fileIssue({name:'x.JPEG',type:'',size:123}),null);
  assert.match(fileIssue({name:'x.jpg',type:'image/svg+xml',size:123}),/JPEG/);
});
