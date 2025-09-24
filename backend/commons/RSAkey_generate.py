from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from pathlib import Path
import os
import stat
import secrets

# 生成RSA密钥
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048
)

# 设置密钥保存路径
home_path = Path(__file__).parent.parent
RSAkey_path = home_path.joinpath("attachments/key")
if not RSAkey_path.exists():
    RSAkey_path.mkdir(parents=True)

# 从环境变量中获取加密密钥
secret_key = os.environ.get("SECRET_KEY")
if not secret_key:
    print("环境变量 SECRET_KEY 未设置！")
    secret_key = secrets.token_hex(32)
    secret_key = secret_key.encode()
    print("随机保护密钥生成完成！")
    print(f"Generated temporary key: {secret_key}")

# 将私钥写入到文件中
with open(RSAkey_path.joinpath("private_key.pem"), "wb") as f:
    f.write(private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.BestAvailableEncryption(secret_key)
    ))

    # 权限设置
    os.chmod(RSAkey_path.joinpath("private_key.pem"), stat.S_IRUSR | stat.S_IWUSR)

# 从私钥中提取公钥
public_key = private_key.public_key()

# 将公钥保存到文件
with open(RSAkey_path.joinpath("public_key.pem"), "wb") as f:
    f.write(public_key.public_bytes(
        encoding=serialization.Encoding.PEM,  # 指定编码格式为PEM，这是一种适合存储密钥的常见文本格式
        format=serialization.PublicFormat.SubjectPublicKeyInfo  # 指定公钥的格式为X.509主题公钥信息格式
    ))

print("RSA keys generated and saved securely!")