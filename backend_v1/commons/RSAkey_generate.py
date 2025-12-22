# 提供生成RSA密钥的功能
from cryptography.hazmat.primitives.asymmetric import rsa
# 提供序列化和反序列化密钥的功能
from cryptography.hazmat.primitives import serialization
from pathlib import Path

# 生成RSA私钥
private_key = rsa.generate_private_key(
    public_exponent=65537,              # 公钥指数，通常使用65537，提供良好的安全性和性能平衡
    key_size=2048                       # 以位为单位的密码长度，2048位为目前安全且性能良好的选择
)

# 设置密钥保存路径
home_path = Path(__file__).parent.parent
RSAkey_path = home_path.joinpath("attachments/key")
if not RSAkey_path.exists():
    RSAkey_path.mkdir(parents=True)

# 将私钥保存到文件
with open(RSAkey_path.joinpath("private_key.pem"), "wb") as f:
    f.write(private_key.private_bytes(                          # 将私钥对象转换为字符串
        encoding=serialization.Encoding.PEM,                    # 指定编码格式为PEM，这是一种适合存储密钥的常见文本格式
        format=serialization.PrivateFormat.TraditionalOpenSSL,  # 指定私钥的格式为传统的OpenSSL格式
        encryption_algorithm=serialization.NoEncryption()       # 指定不加密密钥
    ))

# 从私钥中提取公钥
public_key = private_key.public_key()

# 将公钥保存到文件
with open(RSAkey_path.joinpath("public_key.pem"), "wb") as f:
    f.write(public_key.public_bytes(
        encoding=serialization.Encoding.PEM,                    # 指定编码格式为PEM，这是一种适合存储密钥的常见文本格式
        format=serialization.PublicFormat.SubjectPublicKeyInfo  # 指定公钥的格式为X.509主题公钥信息格式
    ))

print("RSA key generated and saved successfully")