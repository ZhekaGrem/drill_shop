"""Ілюстрації категорій каталогу → public/assets/img/categories/<slug>.webp.

Категорії shchilnui Drill (мерч гурту): футболки, худі, кепки, аксесуари.
Реальні slug'и з БД недоступні (backend локально не піднятий — на порту 3001
слухає інший Next.js-процес, а не Express API), тож використано fallback-набір
з ТЗ: t-shirts, hoodies, caps, accessories + category-generic (для категорій
без власної ілюстрації).

Той самий публічний Flux.1-dev воркфлоу RunningHub 1823665769094754305, що й у
референсному скрипті `F:\\Progect\\2026\\smm-factory\\scripts\\generate_emark_slug_illustrations.py`:
  17 BasicScheduler        steps=40
  25 RandomNoise           noise_seed = BASE_SEED + індекс слага
  37 SDXLEmptyLatentSize+  width_override/height_override = 1024
  43 CLIPTextEncodeFlux    t5xxl/clip_l, guidance=2.5
  57 LoraLoader            strength_model/strength_clip = 1.0
Ліміт RunningHub — 1 конкурентна задача, тому батч строго послідовний.

Пайплайн кадру: Flux t2i → transparent-background (InSPyReNet, через uvx,
з fallback на "пропустити cutout" якщо модель не завантажилась) → Pillow
crop-to-alpha-bbox (pad 8) → webp quality=90 (PIL, без ffmpeg). Якщо файл
виходить більшим за 150KB — попередньо downscale до max 640px по довшій стороні.

Ключ RUNNINGHUB_API_KEY читається з F:\\Progect\\2026\\smm-factory\\.env і НІКОЛИ
не друкується.

Використання (з кореня frontend, через uv):
  uv run --with httpx,pillow python scripts/generate_category_illustrations.py --frames smoke
  uv run --with httpx,pillow python scripts/generate_category_illustrations.py --frames all
  uv run --with httpx,pillow python scripts/generate_category_illustrations.py --frames caps,hoodies --force
"""
from __future__ import annotations

import argparse
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import httpx

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "assets" / "img" / "categories"
ENV_PATH = Path(r"F:\Progect\2026\smm-factory\.env")

WORKFLOW_T2I = "1823665769094754305"
POLL_SEC = 10
TIMEOUT_SEC = 1200
BASE_SEED = 20260809
PRESET = {"steps": 40, "size": 1024, "guidance": 2.5, "lora": 1.0}
MAX_BYTES = 150 * 1024
MAX_SIDE = 640

# v1 — clean 3D product render, Diia-app friendly (без CLIPTextEncodeFlux
# негативного промпта у графі; заборони на текст Flux регулярно ігнорує й
# домальовує псевдонапис, тому опис поверхні дано позитивно).
STYLE = (
    "Clean 3D product render, photorealistic studio product photography, "
    "soft even studio lighting, sharp focus, high detail, single centered "
    "object, isolated on a plain seamless light grey studio background, no "
    "shadow on the floor. The garment is completely blank and unbranded: "
    "plain blank cotton fabric surface with no printed text, no letters, no "
    "numbers, no logos, no brand markings, no stickers, no labels of any "
    "kind. No watermark, no people, no extra props. Product: "
)

FRAMES: dict[str, str] = {
    "t-shirts": "a white blank crew-neck t-shirt on an invisible mannequin, front view",
    "hoodies": "a black blank pullover hoodie laid flat as a ghost mannequin, front view",
    "caps": "a black blank baseball cap, three-quarter view",
    "accessories": (
        "a small neat group of blank merch accessories standing together: a canvas tote bag, "
        "an enamel mug and a fabric lanyard"
    ),
    "category-generic": "a neat folded stack of blank apparel, plain unbranded garments",
}
SMOKE_KEY = "t-shirts"


def load_key() -> tuple[str, str]:
    if not ENV_PATH.exists():
        raise SystemExit(f"нема .env з RUNNINGHUB_API_KEY: {ENV_PATH}")
    env: dict[str, str] = {}
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip()
    key = env.get("RUNNINGHUB_API_KEY", "")
    if not key:
        raise SystemExit("RUNNINGHUB_API_KEY порожній у .env")
    return key, env.get("RUNNINGHUB_BASE_URL", "https://www.runninghub.ai").rstrip("/")


class RH:
    def __init__(self, key: str, base: str):
        self.key, self.base = key, base
        self.host = base.split("://", 1)[1]
        self.c = httpx.Client(timeout=300, follow_redirects=True)

    def post(self, path: str, payload: dict) -> dict:
        r = self.c.post(f"{self.base}{path}", json=payload,
                        headers={"Host": self.host, "Content-Type": "application/json"})
        return r.json()

    def coins(self) -> str:
        return (self.post("/uc/openapi/accountStatus", {"apikey": self.key}).get("data") or {}).get("remainCoins", "?")

    def run(self, node_info: list[dict], label: str) -> list[dict]:
        created = self.post("/task/openapi/create", {
            "apiKey": self.key, "workflowId": WORKFLOW_T2I, "nodeInfoList": node_info,
        })
        if created.get("code") != 0:
            raise RuntimeError(f"{label} create fail: {created}")
        task_id = created["data"]["taskId"]
        print(f"{label}: taskId={task_id}", flush=True)
        t0, status = time.time(), ""
        while time.time() - t0 < TIMEOUT_SEC:
            time.sleep(POLL_SEC)
            st = self.post("/task/openapi/status", {"apiKey": self.key, "taskId": task_id})
            status = st.get("data") if isinstance(st.get("data"), str) else ""
            print(f"  [{int(time.time() - t0):4d}s] {status}", flush=True)
            if status in ("SUCCESS", "FAILED"):
                break
        if status != "SUCCESS":
            raise RuntimeError(f"{label} не SUCCESS: {status}")
        outs = self.post("/task/openapi/outputs", {"apiKey": self.key, "taskId": task_id})
        if outs.get("code") != 0 or not outs.get("data"):
            raise RuntimeError(f"{label} outputs fail: {outs}")
        return outs["data"]

    def download(self, url: str, dest: Path) -> None:
        r = self.c.get(url)
        r.raise_for_status()
        dest.write_bytes(r.content)


def run_with_retries(rh: RH, node_info: list[dict], label: str, retries: int = 2) -> list[dict]:
    last_err: Exception | None = None
    for attempt in range(retries + 1):
        try:
            return rh.run(node_info, label)
        except Exception as e:  # noqa: BLE001 - треба зловити й httpx, і RuntimeError
            last_err = e
            print(f"{label}: спроба {attempt + 1} невдала: {e}", flush=True)
    raise RuntimeError(f"{label}: усі спроби вичерпано: {last_err}")


def node_info(slug: str, seed: int) -> list[dict]:
    positive = STYLE + FRAMES[slug] + "."
    clip_l = positive[:200].rsplit(",", 1)[0]
    return [
        {"nodeId": "43", "fieldName": "t5xxl", "fieldValue": positive},
        {"nodeId": "43", "fieldName": "clip_l", "fieldValue": clip_l},
        {"nodeId": "43", "fieldName": "guidance", "fieldValue": PRESET["guidance"]},
        {"nodeId": "37", "fieldName": "width_override", "fieldValue": PRESET["size"]},
        {"nodeId": "37", "fieldName": "height_override", "fieldValue": PRESET["size"]},
        {"nodeId": "17", "fieldName": "steps", "fieldValue": PRESET["steps"]},
        {"nodeId": "57", "fieldName": "strength_model", "fieldValue": PRESET["lora"]},
        {"nodeId": "57", "fieldName": "strength_clip", "fieldValue": PRESET["lora"]},
        {"nodeId": "25", "fieldName": "noise_seed", "fieldValue": seed},
    ]


def cutout(png: Path) -> Path:
    """RGBA-вирізка фону через transparent-background (uvx). З fallback."""
    try:
        subprocess.run(
            ["uvx", "--from", "transparent-background", "transparent-background",
             "--source", str(png), "--dest", str(png.parent), "--type", "rgba"],
            check=True, capture_output=True, text=True, timeout=600,
        )
        rgba = png.parent / f"{png.stem}_rgba.png"
        if rgba.exists():
            return rgba
        print(f"  cutout: {rgba} не створено, fallback на оригінал", flush=True)
    except Exception as e:  # noqa: BLE001
        print(f"  cutout: невдача ({e}), fallback на оригінал без вирізки", flush=True)
    return png


def crop_to_alpha(png: Path, pad: int = 8) -> Path:
    """Обрізати прозорі поля до bbox непрозорих пікселів (якщо є альфа)."""
    from PIL import Image

    with Image.open(png) as im:
        im = im.convert("RGBA")
        bbox = im.getbbox()
        if not bbox:
            raise RuntimeError(f"crop_to_alpha: кадр повністю прозорий: {png}")
        left, top = max(0, bbox[0] - pad), max(0, bbox[1] - pad)
        right, bottom = min(im.width, bbox[2] + pad), min(im.height, bbox[3] + pad)
        out = png.parent / f"{png.stem}_crop.png"
        im.crop((left, top, right, bottom)).save(out)
    return out


def to_webp(png: Path, dest: Path) -> Path:
    """Pillow-конвертація в webp q90, з downscale якщо >150KB (без ffmpeg)."""
    from PIL import Image

    dest.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(png) as im:
        im = im.convert("RGBA")
        im.save(dest, format="WEBP", quality=90)
        if dest.stat().st_size > MAX_BYTES and max(im.size) > MAX_SIDE:
            scale = MAX_SIDE / max(im.size)
            new_size = (round(im.width * scale), round(im.height * scale))
            im.resize(new_size, Image.LANCZOS).save(dest, format="WEBP", quality=90)
    return dest


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--frames", required=True, help="smoke | all | слаги через кому")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    if args.frames == "smoke":
        keys = [SMOKE_KEY]
    elif args.frames == "all":
        keys = list(FRAMES)
    else:
        keys = [k.strip() for k in args.frames.split(",")]
        unknown = [k for k in keys if k not in FRAMES]
        if unknown:
            raise SystemExit(f"невідомі слаги: {unknown} (доступні: {list(FRAMES)})")

    order = sorted(FRAMES)
    plan = [(k, BASE_SEED + order.index(k)) for k in order if k in keys]

    raw_dir = Path(tempfile.mkdtemp(prefix="category_illustrations_"))
    rh = RH(*load_key())

    coins_before = rh.coins()
    print(f"коінів до старту: {coins_before}", flush=True)
    try:
        coins_int = int(coins_before)
    except (TypeError, ValueError):
        raise SystemExit(f"BLOCKED: не вдалось прочитати баланс коінів: {coins_before!r}")
    if coins_int <= 0:
        raise SystemExit(f"BLOCKED: недостатньо коінів на RunningHub (remainCoins={coins_int})")

    done, skipped, spent = [], [], 0
    for slug, seed in plan:
        dest = OUT_DIR / f"{slug}.webp"
        if dest.exists() and not args.force:
            skipped.append(slug)
            print(f"{slug}: вже є — пропуск (--force щоб перегнати)", flush=True)
            continue
        label = f"{slug}[seed={seed}]"
        retries = 2 if args.frames == "smoke" else 0
        outs = run_with_retries(rh, node_info(slug, seed), label, retries=retries)
        png = raw_dir / f"{slug}_seed{seed}.png"
        rh.download(outs[0]["fileUrl"], png)
        webp = to_webp(crop_to_alpha(cutout(png)), dest)
        coins = outs[0].get("consumeCoins")
        spent += int(coins or 0)
        done.append(slug)
        size_kb = webp.stat().st_size / 1024
        print(f"{label} → {webp} ({size_kb:.1f}KB, коіни: {coins}, {outs[0].get('taskCostTime')}с)", flush=True)

    coins_after = rh.coins()
    print(f"коінів після: {coins_after} | витрачено ≈{spent}")
    print(f"готово: {len(done)}, пропущено: {len(skipped)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
