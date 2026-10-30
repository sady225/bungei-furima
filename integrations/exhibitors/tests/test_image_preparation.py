import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from PIL import Image


class DerivativeTest(unittest.TestCase):
    def test_reencodes_without_source_metadata_and_preserves_original(self):
        with tempfile.TemporaryDirectory(prefix='furima-private-') as tmp:
            root=Path(tmp);source=root/'PRIVATE-ORIGINAL.jpg';out=root/'reviewed'
            image=Image.new('RGB',(2400,1200),'#5a7b5f')
            exif=Image.Exif();exif[270]='PRIVATE-DESCRIPTION';exif[315]='PRIVATE-AUTHOR'
            image.save(source,exif=exif)
            original_hash=hashlib.sha256(source.read_bytes()).hexdigest()
            subprocess.run([sys.executable,str(Path(__file__).parents[1]/'prepare-images.py'),str(source),'--output',str(out)],check=True,capture_output=True)
            manifest=json.loads((out/'manifest.json').read_text());self.assertEqual(len(manifest),1)
            target=out/manifest[0]['filename'];raw=target.read_bytes()
            self.assertEqual(hashlib.sha256(raw).hexdigest(),manifest[0]['sha256'])
            self.assertNotIn(b'PRIVATE',raw);self.assertNotIn(b'EXIF',raw);self.assertNotIn(b'XMP ',raw)
            with Image.open(target) as clean:
                self.assertEqual(clean.format,'WEBP');self.assertLessEqual(max(clean.size),1600);self.assertFalse(clean.getexif())
            self.assertEqual(hashlib.sha256(source.read_bytes()).hexdigest(),original_hash)


if __name__=='__main__':unittest.main()
