"""Minimal PBO reader/writer (uncompressed entries only).
usage: pbo.py list X.pbo | cat X.pbo name | patch X.pbo name file out.pbo"""
import hashlib, struct, sys


def read(path):
    b = open(path, "rb").read()
    pos, props, entries = 0, [], []
    while True:
        end = b.index(b"\0", pos)
        name = b[pos:end].decode("latin1")
        method, orig, res, ts, size = struct.unpack_from("<5I", b, end + 1)
        pos = end + 21
        if name == "" and method == 0x56657273:
            while True:
                end = b.index(b"\0", pos)
                k = b[pos:end]
                pos = end + 1
                if not k:
                    break
                end = b.index(b"\0", pos)
                props.append((k, b[pos:end]))
                pos = end + 1
            continue
        if name == "":
            break
        entries.append([name, method, orig, res, ts, size])
    for e in entries:
        if e[1] not in (0,):
            sys.exit(f"compressed entry {e[0]} (method {e[1]:#x}) not supported")
        e.append(b[pos:pos + e[5]])
        pos += e[5]
    return props, entries


def write(path, props, entries):
    out = bytearray()
    out += b"\0" + struct.pack("<5I", 0x56657273, 0, 0, 0, 0)
    for k, v in props:
        out += k + b"\0" + v + b"\0"
    out += b"\0"
    for name, method, orig, res, ts, size, data in entries:
        out += name.encode("latin1") + b"\0" + struct.pack("<5I", method, len(data) if orig else 0, res, ts, len(data))
    out += b"\0" + struct.pack("<5I", 0, 0, 0, 0, 0)
    for e in entries:
        out += e[6]
    out += b"\0" + hashlib.sha1(out).digest()
    open(path, "wb").write(out)


if __name__ == "__main__":
    cmd, pbo = sys.argv[1], sys.argv[2]
    props, entries = read(pbo)
    if cmd == "list":
        print(props)
        for e in entries:
            print(e[0], e[5])
    elif cmd == "cat":
        sys.stdout.buffer.write(next(e[6] for e in entries if e[0].lower() == sys.argv[3].lower()))
    elif cmd == "patch":
        e = next(e for e in entries if e[0].lower() == sys.argv[3].lower())
        e[6] = open(sys.argv[4], "rb").read()
        write(sys.argv[5], props, entries)
