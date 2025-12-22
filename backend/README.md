chatAnon后端项目整体架构如下：
```
chatAnon/backend/
├── src/                   ← 项目主代码目录
│    └──main
│       └──java
│            └──ben.chatanon
│                   ├── config/                 ← 项目配置（Spring Security访问拦截、跨域配置、静态资源映射等）
│                   ├── controller/             ← 控制层
│                   ├── entity/                 ← 映射类（dto、vo、数据库映射类）
│                   │       ├── dto/            ← 数据传输对象，后端和数据库间传输的JSON格式化数据
│                   │       ├── vo/             ← 视图对象，后端与前端间传输的JSON格式化数据
│                   │       ├── entity_chat/    ← 聊天模块相关映射类
│                   │       ├── entity_post/    ← 论坛模块相关映射类
│                   │       ├── entity_role/    ← 角色模块相关映射类
│                   │       ├── RestBean        ← 返回结果集工具类
│                   │       ├── Users           ← 用户映射类
│                   │       └── userType        ← 用户身份与权限划分映射
│                   ├── filter/                 ← 过滤器（JWT鉴权对接口访问放行）
│                   ├── repository/             ← 仓库层
│                   ├── service/                ← 服务层
│                   ├── util/                   ← 辅助工具类（JWT、RSA等相关类）
│                   └── ChatAnonApplication     ← 后端应用入口
│
├── resources/             ← 资源存放区（static静态资源、application配置）
├── upload/                ← 存放用户上传的头像/角色卡等图片资源
├── .gitignore             ← 版本控制非上传仓库文件配置
├── README.md              ← 项目说明
└── pom.xml                ← Maven项目核心配置文件
```