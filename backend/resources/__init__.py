from flask import Flask
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

from commons.configs import MYSQL_CONFIG

app = Flask(__name__)
CORS(app)
api = Api(app)
app.config['SQLALCHEMY_DATABASE_URI'] = MYSQL_CONFIG
db = SQLAlchemy(app)

from resources import (
role_resource,
role_category_resource,
post_resource,
post_category_resource,
user_resource,
attachment_resource
)