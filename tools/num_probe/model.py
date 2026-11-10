# JSONSerialization and JSONDecoder (Int) number rules, as a model checked
# against this machine's Foundation. Build the oracle first:
#   swiftc -O batch.swift -o batch   (probe.swift, probe2.swift: one-off probes)
#   python3 -I model.py <seed> <count>    prints mismatches; 0 expected
# The port's rules are Skee.Host.serial_number_ok and decoded_int.
import os, re, random, subprocess, sys
TOK = re.compile(r'^(-?)(0|[1-9][0-9]*)(?:\.([0-9]+))?(?:[eE]([+-]?[0-9]+))?$')
CAP = 2**128
def ser(t):
    m = TOK.match(t)
    if not m: return 'X'
    sign, ip, fp, ep = m.group(1), m.group(2), m.group(3) or '', m.group(4)
    if ep is not None and len(ep) > 4: return 'X'
    n = (0 if ip == '0' else len(ip)) + len(fp)
    if n <= 17:
        if fp == '' and ep is None: return 'R'
        return 'R' if float(t) != float('inf') else 'X'
    if fp == '' and ep is None and int(ip) < 2**64: return 'R'
    mant, exp, over = 0, 0, False
    for c in ip:
        if not over and mant*10+int(c) < CAP: mant = mant*10+int(c)
        else:
            over = True; exp += 1
            if exp > 127: return 'X'
    for c in fp:
        if not over and mant*10+int(c) < CAP:
            mant = mant*10+int(c); exp -= 1
            if exp < -128: return 'X'
        else: over = True
    if ep is not None: exp += int(ep)
    return 'R' if -128 <= exp <= 127 else 'X'

def dec(t):
    m = TOK.match(t)
    sign, ip, fp, ep = m.group(1), m.group(2), m.group(3) or '', m.group(4)
    neg = sign == '-'
    if fp == '' and ep is None:
        v = -int(ip) if neg else int(ip)
        return str(v) if -2**63 <= v < 2**63 else 'nil'
    d = float(t)
    if not (-2.0**63 <= d < 2.0**63): return 'nil'
    if abs(d) < 2.0**53:
        return str(int(d)) if d == int(d) else 'nil'
    # Decimal: 128-bit mantissa, digits past it dropped (integer ones scale up)
    mant, exp, over = 0, 0, False
    for c in ip:
        if not over and mant*10+int(c) < CAP: mant = mant*10+int(c)
        else: over = True; exp += 1
    for c in fp:
        if not over and mant*10+int(c) < CAP: mant = mant*10+int(c); exp -= 1
        else: over = True
    if ep is not None: exp += int(ep)
    while mant and mant % 10 == 0: mant //= 10; exp += 1
    if exp < 0:
        if mant >= 2**64: return 'nil'
        v = mant // 10**(-exp)
    else: v = mant * 10**exp
    if v > 2**63-1: return 'nil'
    return str(-v if neg else v)

def rnd(r):
    sign = r.choice(['', '', '-'])
    k = r.choice([0,1,2,5,15,16,17,18,19,20,25,38,39,40,60,120,165,166,167,200])
    if k == 0: ip = '0'
    else: ip = r.choice('123456789') + ''.join(r.choice(r.choice(['0123456789','0','9','09'])) for _ in range(k-1))
    fp = ''
    if r.random() < 0.6:
        f = r.choice([1,2,5,16,17,18,20,30,38,40,100,127,128,129,130,200])
        fp = '.' + ''.join(r.choice(r.choice(['0123456789','0','9','05'])) for _ in range(f))
    ep = ''
    if r.random() < 0.6:
        e = r.choice([0,1,2,3,16,17,18,19,30,100,126,127,128,129,140,160,165,166,200,290,300,307,308,309,320,330,400])
        es = r.choice(['', '+', '-'])
        pad = r.choice(['', '', '0', '00'])
        ep = r.choice('eE') + es + pad + str(e)
    return sign + ip + fp + ep

if __name__ == '__main__':
    r = random.Random(int(sys.argv[1]) if len(sys.argv) > 1 else 1)
    toks = [rnd(r) for _ in range(int(sys.argv[2]) if len(sys.argv) > 2 else 20000)]
    # near the Int64 / 2^53 edges
    for base in ['9007199254740991','9007199254740992','9007199254740993','9223372036854775807','9223372036854775808','9223372036854775296','9223372036854774784','18446744073709551615','18446744073709551616']:
        for s in ['', '-']:
            for tail in ['', '.0', '.5', '.9', '.1', '.00000000000000000001', '.' + '0'*30 + '1', 'e0', '0e-1', '.0e0', '00000000000000000000e-20', '1e-1', '5e-1', '9e-1', '0000000000000000000000001e-25']:
                toks.append(s + base + tail)
            for off in range(-1100, 1100, 37):
                toks.append(s + str(int(base) + off))
    out = subprocess.run(['./batch'], input='\n'.join(toks) + '\n', capture_output=True, text=True, cwd=os.path.dirname(os.path.abspath(__file__))).stdout.split('\n')
    bad = 0
    for t, o in zip(toks, out):
        sv, dv = o.split(' ')
        ms = ser(t)
        md = dec(t) if sv == 'R' or True else None
        if ms != sv or md != dv:
            bad += 1
            if bad <= 25: print('MISMATCH', t[:80], len(t), 'swift', sv, dv, 'model', ms, md)
    print('tokens', len(toks), 'mismatches', bad)
