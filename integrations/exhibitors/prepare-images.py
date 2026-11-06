#!/usr/bin/env python3
"""Run outside the public checkout. Originals are preserved; output is private until reviewed."""
import argparse, hashlib, json
from pathlib import Path
from PIL import Image, ImageOps

parser=argparse.ArgumentParser()
parser.add_argument('inputs',nargs='+',type=Path)
parser.add_argument('--output',required=True,type=Path)
args=parser.parse_args()
checkout=Path(__file__).resolve().parents[2]
if args.output.resolve().is_relative_to(checkout):
    parser.error('output must be outside public checkout')
if not 1<=len(args.inputs)<=3: parser.error('1–3 images required')
args.output.mkdir(parents=True,exist_ok=True)
result=[]
Image.MAX_IMAGE_PIXELS=20_000_000
for source in args.inputs:
    with Image.open(source) as im:
        if im.format not in ('PNG','JPEG','WEBP') or getattr(im,'is_animated',False): raise ValueError('static JPEG/PNG/WebP only')
        im=ImageOps.exif_transpose(im).convert('RGB'); im.thumbnail((1600,1600))
        # New pixel buffer carries no EXIF, XMP, ICC or source filename.
        clean=Image.new('RGB',im.size);clean.paste(im)
        temp=args.output/'converted.webp';clean.save(temp,'WEBP',quality=82,method=6)
    raw=temp.read_bytes()
    if len(raw)>1024*1024: raise ValueError('derivative exceeds 1 MiB')
    digest=hashlib.sha256(raw).hexdigest();target=args.output/(digest+'.webp');temp.replace(target)
    result.append({'filename':target.name,'sha256':digest,'bytes':len(raw)})
(args.output/'manifest.json').write_text(json.dumps(result,indent=2)+'\n')
print('Derivatives prepared. Review pixels and upload to the PRIVATE approved folder before approving.')
