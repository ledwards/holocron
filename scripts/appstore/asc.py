"""App Store Connect API client: python3 scripts/appstore/asc.py METHOD PATH [JSON_BODY]

Signs requests with the API key in ~/.appstoreconnect/private_keys. Used to
create versions, attach builds, set What's New and submit for review."""
import base64, json, os, sys, time
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature

KEY_ID = '4V2X7S37YK'
ISSUER = '69a6de70-247e-47e3-e053-5b8c7c11a4d1'
KEY_PATH = os.path.expanduser(f'~/.appstoreconnect/private_keys/AuthKey_{KEY_ID}.p8')


def b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()


def token() -> str:
    header = {'alg': 'ES256', 'kid': KEY_ID, 'typ': 'JWT'}
    now = int(time.time())
    payload = {'iss': ISSUER, 'iat': now, 'exp': now + 1100, 'aud': 'appstoreconnect-v1'}
    signing_input = f"{b64(json.dumps(header).encode())}.{b64(json.dumps(payload).encode())}"
    with open(KEY_PATH, 'rb') as f:
        key = serialization.load_pem_private_key(f.read(), password=None)
    r, s = decode_dss_signature(key.sign(signing_input.encode(), ec.ECDSA(hashes.SHA256())))
    return f"{signing_input}.{b64(r.to_bytes(32, 'big') + s.to_bytes(32, 'big'))}"


def call(method: str, path: str, body=None):
    url = path if path.startswith('http') else 'https://api.appstoreconnect.apple.com' + path
    # This Python has no SSL module, so the request goes through curl.
    import subprocess
    args = ['curl', '-sSg', '-X', method, url, '-H', f'Authorization: Bearer {token()}',
            '-H', 'Content-Type: application/json', '-w', '\n%{http_code}']
    if body is not None:
        args += ['--data', json.dumps(body)]
    out = subprocess.run(args, capture_output=True, text=True, check=True).stdout
    text, _, status = out.rpartition('\n')
    return int(status), json.loads(text) if text.strip() else None


if __name__ == '__main__':
    method, path = sys.argv[1], sys.argv[2]
    body = json.loads(sys.argv[3]) if len(sys.argv) > 3 else None
    status, result = call(method, path, body)
    print(status)
    print(json.dumps(result, indent=1))
