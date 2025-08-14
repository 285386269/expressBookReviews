const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
// JWT密钥（实际项目中应存储在环境变量中）
const JWT_SECRET = 'your_jwt_secret_key';

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

// 用户登录功能
regd_users.post("/login", (req, res) => {
    // 从请求体获取用户名和密码
    const { username, password } = req.body;

    // 验证输入是否完整
    if (!username || !password) {
        return res.status(400).json({ 
            message: "Error: 用户名和密码都是必填项" 
        });
    }

    // 查找用户并验证密码
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ 
            message: "Error: 用户名或密码不正确" 
        });
    }

    // 生成JWT令牌（有效期1小时）
    const token = jwt.sign(
        { username: user.username }, // 存储在令牌中的用户信息
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    // 将令牌保存到会话（假设已配置express-session）
    req.session.token = token;
    
    // 返回登录成功信息和令牌
    return res.status(200).json({
        message: "登录成功",
        token: token // 可选：返回令牌给客户端，方便前端存储
    });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
   // 1. 获取必要参数
   const isbn = req.params.isbn;
   const reviewContent = req.query.review; // 从查询参数获取评论内容
   const currentUser = req.username; // 从中间件获取当前登录用户名

   // 2. 验证评论内容是否存在
   if (!reviewContent) {
       return res.status(400).json({ message: "请提供评论内容（通过?review=参数）" });
   }

   // 3. 检查图书是否存在
   if (!books[isbn]) {
       return res.status(404).json({ message: "未找到该ISBN对应的图书" });
   }

   // 4. 初始化评论对象（如果图书还没有评论）
   if (!books[isbn].reviews) {
       books[isbn].reviews = {};
   }

   // 5. 处理评论（新增或更新）
   const bookReviews = books[isbn].reviews;
   
   if (bookReviews[currentUser]) {
       // 同一用户再次评论，执行更新操作
       const oldReview = bookReviews[currentUser];
       bookReviews[currentUser] = reviewContent;
       return res.status(200).json({
           message: "评论已更新",
           isbn: isbn,
           username: currentUser,
           oldReview: oldReview,
           newReview: reviewContent
       });
   } else {
       // 新用户评论，执行新增操作
       bookReviews[currentUser] = reviewContent;
       return res.status(201).json({
           message: "评论已添加",
           isbn: isbn,
           username: currentUser,
           review: reviewContent
       });
   }
});

// 删除书评（仅能删除自己的评论）
regd_users.delete("/auth/review/:isbn", (req, res) => {
    // 1. 获取必要参数
    const isbn = req.params.isbn;
    const currentUser = req.username; // 当前登录用户

    // 2. 检查图书是否存在
    if (!books[isbn]) {
        return res.status(404).json({ message: "未找到该ISBN对应的图书" });
    }

    // 3. 检查该图书是否有评论
    const bookReviews = books[isbn].reviews;
    if (!bookReviews || Object.keys(bookReviews).length === 0) {
        return res.status(404).json({ message: "该图书暂无评论" });
    }

    // 4. 检查当前用户是否有该图书的评论
    if (!bookReviews[currentUser]) {
        return res.status(403).json({ message: "无权删除他人评论或评论不存在" });
    }

    // 5. 执行删除操作
    const deletedReview = bookReviews[currentUser];
    delete bookReviews[currentUser];

    // 6. 返回删除结果
    return res.status(200).json({
        message: "评论已成功删除",
        isbn: isbn,
        username: currentUser,
        deletedReview: deletedReview
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
