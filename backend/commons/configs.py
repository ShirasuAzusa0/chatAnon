from dotenv import load_dotenv
import os

# 导入环境配置文件
load_dotenv()

# MySQL 配置
MYSQL_CONFIG = os.getenv('MYSQL_CONFIG')

# JWT 配置
JWT_SECRET = os.getenv('JWT_SECRET_KEY')
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')