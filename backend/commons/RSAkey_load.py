from cryptography.hazmat.primitives import serialization
from commons.utils import get_key_path
from commons.configs import SECRET_KEY

# 载入私钥
def load_private_key():
    key_path = get_key_path()
    key_path = key_path.joinpath("private_key.pem")
    with open(key_path, 'rb') as f:
        private_key = serialization.load_pem_private_key(
            f.read(),
            password = None
        )
    return private_key