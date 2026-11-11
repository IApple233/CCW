"""Create responsive stills from the existing paired gallery posters (requires Pillow)."""
import json
from pathlib import Path

from PIL import Image

root = Path(__file__).resolve().parent.parent
output = root / 'assets/media/previews'
output.mkdir(exist_ok=True)
collections = json.loads((root / 'assets/gallery.json').read_text())
resampling = getattr(Image, 'Resampling', Image).LANCZOS
count = 0
for entries in collections.values():
    for item in entries:
        with Image.open(root / item['poster']) as source:
            source = source.convert('RGB')
            for width in (480, 960):
                height = round(source.height * width / source.width)
                source.resize((width, height), resampling).save(
                    output / f'{item["id"]}-{width}.webp', quality=84)
                count += 1
print(f'Prepared {count} responsive previews from the existing gallery posters.')
