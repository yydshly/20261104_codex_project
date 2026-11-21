// Pin this runtime to the reviewed 0597 4.3 variant.
const url=new URL(location.href);
for(const key of ['hero','study','review','legacy'])url.searchParams.delete(key);
url.searchParams.set('seaside','1');url.searchParams.set('detail','hands43');
history.replaceState(null,'',url);
await import('./scene.bundle.js');
