#!/usr/bin/env python3
"""Offline, stdlib-only validation for BioLab's authentic microscope evidence pack."""
import hashlib
import json
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
M = json.loads((ROOT / "docs/biology/authentic-microscopy/manifest.json").read_text())
ROOT_ASSET = "public/biology/authentic-microscopy/"

def blob_sha(buf: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(buf)).encode() + b"\0" + buf).hexdigest()

def png_pixels(blob: bytes):
    assert blob[:8] == b"\x89PNG\r\n\x1a\n", "not PNG"
    offset, width, height, payload = 8, None, None, bytearray()
    while offset < len(blob):
        n = struct.unpack_from(">I", blob, offset)[0]
        typ = blob[offset+4:offset+8]
        data = blob[offset+8:offset+8+n]
        expected = struct.unpack_from(">I", blob, offset+8+n)[0]
        assert zlib.crc32(typ + data) == expected, "bad PNG CRC"
        if typ == b"IHDR":
            width, height, depth, mode = struct.unpack_from(">IIBB", data)
            assert (depth, mode) == (8, 0), "expected 8-bit grayscale"
        if typ == b"IDAT":
            payload.extend(data)
        offset += 12+n
        if typ == b"IEND":
            break
    unfiltered = zlib.decompress(payload)
    assert len(unfiltered) == height * (width+1), "invalid raw scanline count"
    assert all(unfiltered[r*(width+1)] == 0 for r in range(height)), "nonzero PNG filter not supported"
    return width, height, b"".join(unfiltered[r*(width+1)+1:(r+1)*(width+1)] for r in range(height))

def tiff_pixels(blob: bytes):
    assert blob[:4] == b"II*\x00", "expected little-endian TIFF"
    u16 = lambda p: struct.unpack_from("<H", blob, p)[0]
    u32 = lambda p: struct.unpack_from("<I", blob, p)[0]
    off = u32(4)
    count = u16(off)
    tags = {}
    for i in range(count):
        p = off + 2 + i * 12
        tags[u16(p)] = (u16(p+2), u32(p+4), u32(p+8))
    def one(code):
        typ, count, value = tags[code]
        assert count == 1
        return value & 65535 if typ == 3 else value
    def values(code):
        typ, count, value = tags[code]
        if count == 1:
            return [one(code)]
        fmt = "<" + ("H" if typ == 3 else "I")*count
        return list(struct.unpack_from(fmt, blob, value))
    w, h, bits, comp, photo = [one(i) for i in (256,257,258,259,262)]
    assert bits == 8 and photo == 1 and one(277) == 1
    offsets, lengths, rows = values(273), values(279), one(278)
    assert len(offsets) == len(lengths)
    out = bytearray()
    for i, (pos, size) in enumerate(zip(offsets, lengths)):
        expected = min(rows, h - i*rows) * w
        raw = blob[pos:pos+size]
        if comp == 1:
            expanded = raw
        elif comp == 32773:
            expanded = bytearray()
            p = 0
            while p < len(raw) and len(expanded) < expected:
                code = raw[p]; p += 1
                if code < 128:
                    n = code + 1
                    expanded.extend(raw[p:p+n]); p += n
                elif code > 128:
                    n = 257 - code
                    expanded.extend(bytes([raw[p]])*n); p += 1
        else:
            raise AssertionError("unsupported TIFF compression " + str(comp))
        assert len(expanded) == expected, "TIFF strip mismatch"
        out.extend(expanded)
    assert len(out) == w*h
    return w, h, bytes(out)

def run():
    assets = M["assets"]
    assert len(assets) == 4
    assert len({a["imagePath"] for a in assets}) == 4
    allowed = {"CC0 1.0", "CC BY 4.0"}
    for a in assets:
        assert a["source"]["usageLicense"] in allowed
        assert a["specimen"]["species"] and a["modality"]
        p = ROOT / a["imagePath"]
        assert p.is_file(), f"missing asset: {p}"
        data = p.read_bytes()
        assert blob_sha(data) == a["pngGitBlobSha"], f"Git blob mismatch: {p}"
        if a["originalPath"]:
            src = ROOT / a["originalPath"]
            original = src.read_bytes()
            assert blob_sha(original) == a["originalGitBlobSha"]
            x, y, pixels = tiff_pixels(original)
            px, py, pp = png_pixels(data)
            assert (x, y) == (px, py) == (512,512), "image dimensions changed"
            assert pixels == pp, f"pixel values changed: {p}"
            v = a["verification"]
            assert min(pp) == v["pixelMinimum"] and max(pp) == v["pixelMaximum"]
            assert not a["scale"]["allowAbsoluteMeasurement"]
        else:
            assert data[:4] == b"RIFF" and data[8:12] == b"WEBP"
            assert a["scale"]["barValue"] == 500 and a["scale"]["barUnit"] == "nm"
    assert len({a["exerciseId"] for a in assets}) == 2
    print("PASS: 4 accepted views; 3 TIFF↔PNG exact pixel matches; specimen, rights, source blob and scale gates.")

if __name__ == "__main__":
    run()
