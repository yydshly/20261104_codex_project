"""Read PNG/ICC structure from one public URL; no image rewrite or saved media."""
import binascii,hashlib,json,pathlib,struct,urllib.request,zlib
URL='https://pbs.twimg.com/media/HWIskbCaQAALZjo.png?name=orig'
req=urllib.request.Request(URL,headers={'User-Agent':'XiaoyouResearch/1.0'})
with urllib.request.urlopen(req,timeout=30) as res:
    media=res.read(8_000_001)
    status=res.status
    content_type=res.headers.get('Content-Type')
assert len(media)<=8_000_000, 'Unexpectedly large image'
assert media[:8]==b'\x89PNG\r\n\x1a\n', 'Not a PNG'
pos=8; chunks=[]; ihdr=None; cicp=None; icc=None; palette=None; end=None
while pos+12<=len(media):
    n=struct.unpack_from('>I',media,pos)[0]
    typ=media[pos+4:pos+8]
    data=media[pos+8:pos+8+n]
    assert pos+12+n<=len(media), 'Truncated chunk'
    crc=struct.unpack_from('>I',media,pos+8+n)[0]
    ok=(binascii.crc32(typ+data)&0xffffffff)==crc
    chunks.append(dict(type=typ.decode('ascii'),bytes=n,crc_ok=ok))
    if typ==b'IHDR':
        w,h,depth,col,compression,filter_method,interlace=struct.unpack('>IIBBBBB',data)
        ihdr=dict(width=w,height=h,bit_depth=depth,color_type=col,compression=compression,filter=filter_method,interlace=interlace)
    elif typ==b'cICP':
        cicp=list(data)
    elif typ==b'PLTE':
        palette=dict(entries=n//3)
    elif typ==b'iCCP':
        name,rest=data.split(b'\0',1)
        method=rest[0]; profile=zlib.decompress(rest[1:])
        assert len(profile)>=132
        tag_count=struct.unpack_from('>I',profile,128)[0]
        tags=[]; descs=[]; internal_cicp=None
        for i in range(tag_count):
            signature,offset,size=struct.unpack_from('>4sII',profile,132+i*12)
            payload=profile[offset:offset+size];tagtype=payload[:4].decode('ascii',errors='replace')
            tags.append(dict(signature=signature.decode('ascii',errors='replace'),type=tagtype,size=size))
            if signature==b'cicp': internal_cicp=list(payload[8:12])
            if signature==b'desc':
                if payload[:4]==b'mluc':
                    count,rec_size=struct.unpack_from('>II',payload,8)
                    for j in range(count):
                        rec=16+j*rec_size
                        lang=payload[rec:rec+4].decode('ascii',errors='replace')
                        length,at=struct.unpack_from('>II',payload,rec+4)
                        descs.append(dict(language=lang,text=payload[at:at+length].decode('utf-16-be',errors='replace')))
                elif payload[:4]==b'desc':
                    length=struct.unpack_from('>I',payload,8)[0]
                    descs.append(dict(text=payload[12:12+length].rstrip(b'\0').decode('latin-1')))
        icc=dict(chunk_profile_name=name.decode('latin-1'),compression_method=method,bytes=len(profile),declared_bytes=struct.unpack_from('>I',profile,0)[0],sha256=hashlib.sha256(profile).hexdigest(),version_hex=profile[8:12].hex(),profile_class=profile[12:16].decode('ascii',errors='replace'),color_space=profile[16:20].decode('ascii',errors='replace'),pcs=profile[20:24].decode('ascii',errors='replace'),signature=profile[36:40].decode('ascii',errors='replace'),descriptions=descs,internal_cicp=internal_cicp,tags=tags)
    pos+=n+12
    if typ==b'IEND':
        end=pos;break
result=dict(case_id='12',inspection_date='2026-11-22',source_url=URL,http_status=status,content_type=content_type,bytes=len(media),sha256=hashlib.sha256(media).hexdigest(),ihdr=ihdr,chunks=chunks,all_chunk_crc_ok=all(x['crc_ok'] for x in chunks),cicp=cicp,icc=icc,palette=palette,trailing_bytes=len(media)-end if end is not None else None,original_media_saved=False,modified_media=False,scope='Only this CDN response was parsed; profile signaling is not physical display brightness, platform-wide preservation, or a validated conversion.')
out=pathlib.Path(__file__).resolve().parent/'png-structure-review.json'
out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in result.items() if k!='icc'},ensure_ascii=False))
print(json.dumps(dict(icc_header={k:v for k,v in (icc or {}).items() if k!='tags'},icc_tag_types=[(x['signature'],x['type']) for x in (icc or {}).get('tags',[])]),ensure_ascii=False))

