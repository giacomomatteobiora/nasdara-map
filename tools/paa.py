"""Minimal reader for DayZ .paa textures (DXT1/DXT5, optionally LZO-compressed mip 0)."""
import struct

from PIL import Image

FORMATS = {0xFF01: 1, 0xFF05: 3}  # PAA type -> BCn number for Pillow's "bcn" decoder


def lzo1x_decompress(src, out_len):
    """Pure-Python LZO1X decompressor (port of minilzo's lzo1x_decompress)."""
    out = bytearray()
    ip = 0

    def copy_match(m_pos, n):
        if m_pos < 0:
            raise ValueError("LZO: lookbehind overrun")
        if len(out) - m_pos >= n:
            out.extend(out[m_pos:m_pos + n])
        else:
            for i in range(n):
                out.append(out[m_pos + i])

    state = "start"
    t = 0
    if src[0] > 17:
        t = src[0] - 17
        ip = 1
        if t < 4:
            state = "match_next"
        else:
            out.extend(src[ip:ip + t])
            ip += t
            state = "first_literal_run"

    while True:
        if state == "start":
            t = src[ip]; ip += 1
            if t >= 16:
                state = "match"
                continue
            if t == 0:
                while src[ip] == 0:
                    t += 255; ip += 1
                t += 15 + src[ip]; ip += 1
            out.extend(src[ip:ip + t + 3])
            ip += t + 3
            state = "first_literal_run"

        if state == "first_literal_run":
            t = src[ip]; ip += 1
            if t >= 16:
                state = "match"
            else:
                m_pos = len(out) - 0x801 - (t >> 2) - (src[ip] << 2); ip += 1
                copy_match(m_pos, 3)
                state = "match_done"

        if state == "match":
            if t >= 64:
                m_pos = len(out) - 1 - ((t >> 2) & 7) - (src[ip] << 3); ip += 1
                copy_match(m_pos, (t >> 5) + 1)
            elif t >= 32:
                t &= 31
                if t == 0:
                    while src[ip] == 0:
                        t += 255; ip += 1
                    t += 31 + src[ip]; ip += 1
                m_pos = len(out) - 1 - ((src[ip] >> 2) + (src[ip + 1] << 6)); ip += 2
                copy_match(m_pos, t + 2)
            elif t >= 16:
                m_pos = len(out) - ((t & 8) << 11)
                t &= 7
                if t == 0:
                    while src[ip] == 0:
                        t += 255; ip += 1
                    t += 7 + src[ip]; ip += 1
                m_pos -= (src[ip] >> 2) + (src[ip + 1] << 6); ip += 2
                if m_pos == len(out):
                    break  # end of stream
                copy_match(m_pos - 0x4000, t + 2)
            else:
                m_pos = len(out) - 1 - (t >> 2) - (src[ip] << 2); ip += 1
                copy_match(m_pos, 2)
            state = "match_done"

        if state == "match_done":
            t = src[ip - 2] & 3
            if t == 0:
                state = "start"
                continue
            state = "match_next"

        if state == "match_next":
            out.extend(src[ip:ip + t])
            ip += t
            t = src[ip]; ip += 1
            state = "match"

    if len(out) != out_len:
        raise ValueError(f"LZO: got {len(out)} bytes, expected {out_len}")
    return bytes(out)


def decode(data):
    """Decode the largest mipmap of a .paa file into an RGB Pillow image."""
    kind = struct.unpack_from("<H", data, 0)[0]
    if kind not in FORMATS:
        raise ValueError(f"unsupported PAA type {kind:04x}")
    p = 2
    while data[p:p + 4] == b"GGAT":
        p += 12 + struct.unpack_from("<I", data, p + 8)[0]
    p += 2 + struct.unpack_from("<H", data, p)[0] * 3  # palette
    w, h = struct.unpack_from("<HH", data, p)
    size = int.from_bytes(data[p + 4:p + 7], "little")
    raw = data[p + 7:p + 7 + size]
    lzo = bool(w & 0x8000)
    w &= 0x7FFF
    n = FORMATS[kind]
    expected = w * h // 2 if n == 1 else w * h
    if lzo:
        raw = lzo1x_decompress(raw, expected)
    return Image.frombytes("RGBA", (w, h), raw, "bcn", (n,)).convert("RGB")
