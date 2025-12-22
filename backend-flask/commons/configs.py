from dotenv import load_dotenv
import os

# 导入环境配置文件
load_dotenv()

# MySQL 配置
MYSQL_CONFIG = os.getenv('MYSQL_CONFIG')

# RSA 配置
SECRET_KEY = os.getenv('SECRET_KEY')

# JWT 配置
JWT_SECRET = os.getenv('JWT_SECRET')
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')

# LLM 配置
MODEL_API_BASE = os.getenv('MODEL_API_BASE')
MODEL_API_KEY = os.getenv('MODEL_API_KEY')
MODEL_API_NAME = os.getenv('MODEL_API_NAME')