const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    // 1. 从请求头/请求体/查询参数中获取 JWT Token
    // 示例：从请求头 Authorization 中获取（格式：Bearer <token>）
    const token = req.headers.authorization 
      ? req.headers.authorization.split(' ')[1] 
      : null;
  
    if (!token) {
      // 无 Token，直接拒绝
      return res.status(401).json({ error: "Unauthorized: 缺少身份验证 Token" });
    }
  
    try {
      // 2. 校验 JWT Token（使用签发时的 secret）
      const decoded = jwt.verify(token, 'fingerprint_customer'); // 替换为实际 secret
      // 3. Token 有效，将解码后的用户信息挂载到 req，方便后续路由使用
      req.user = decoded; 
      next(); // 继续执行后续路由
    } catch (err) {
      // 4. Token 无效（过期/篡改等）
      console.error(err);
      return res.status(403).json({ error: "Forbidden: 身份验证 Token 无效" });
    }
  });
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
