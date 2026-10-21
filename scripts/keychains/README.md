# брілок

Photo-referenced reconstruction of three plush keychain colorways, not a photogrammetric scan. All 115 source JPGs in the workspace's `брілок` folder were reviewed on five numbered contact sheets. Larger plush items, hats, garlands, packaging and alternate views are references, not additional products.

Key references:

- Turquoise/purple: IMG20250720140919, IMG20250720140926, IMG20250720140944.
- Green keychains: IMG20251109152701–IMG20251109153004; IMG20251214103127; IMG20251214103334–IMG20251214103911; IMG_20251218_183358_532/675/776, IMG_20251218_183425_137.
- Purple keychains: IMG20251214103246, IMG20251214103334–IMG20251214104629.
- Size comparisons: IMG20251024124104/108/111/214, IMG_20251206_164431_930/164438_186/164445_101.
- Other photographs show larger decorative pieces, hats, garlands or different angles; no inferred products or real-world dimensions.

Three colors are separate collection products, each with L, XL, XXL variants. User-approved prices: 350, 420, 550 UAH, independent of color; initial quantity 100 per color/size. Size names are labels; physical measurements were not supplied.

Models use closed 3D bodies, an irregular soft surface, fiber details and double metal rings. Fiber color/normal maps are sampled from source photos at 512². Backs and occluded details are approximations. Around 32k triangles, 1.0–1.4 MB per GLB; no 4K textures or hair simulation. Posters are rendered from the same geometry. Actual product photos are retained in the gallery.

Rebuild: run `node scripts/keychains/prepare-textures.cjs /absolute/path/to/drill_shop`, then Blender background with `--python scripts/keychains/build-models.py`. The generator writes beside itself unless an output directory follows `--`; source fiber/normal maps must be there. Convert PNG posters to WebP, and copy GLB/posters into public paths before publishing. Cloudinary model URLs carry embedded textures and do not require a frontend deployment.

Validation: `node scripts/keychains/check.cjs`.
Read-only DB audit: `node scripts/keychains/create-collection.cjs --check`.
Publish: `node scripts/keychains/create-collection.cjs --apply --confirm=brilok`.
The publisher uploads and validates CDN assets before one database transaction. It refuses existing slugs and never resets existing stock. Production models/posters/photos use the existing Cloudinary account; local copies are committed for reproducibility.

Display title: «Брілочанский». Last collection on the public homepage. Product names: «зелений», «філоветовий», «міксований». Description: «Пухнасті брілки з металевим кільцем для барабончиків.»
