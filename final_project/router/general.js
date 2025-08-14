const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// 用户注册功能
public_users.post("/register", (req, res) => {
    // 从请求体获取用户名和密码
    const { username, password } = req.body;

    // 验证输入是否完整
    if (!username || !password) {
        return res.status(400).json({ 
            message: "Error: 用户名和密码都是必填项" 
        });
    }

    // 检查用户名是否已存在
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ 
            message: "Error: 用户名已存在，请选择其他用户名" 
        });
    }

    // 注册新用户
    const newUser = {
        username: username,
        password: password // 注意：实际项目中需要加密存储密码，如使用bcrypt
    };
    users.push(newUser);

    // 返回成功响应
    return res.status(201).json({ 
        message: "Register a new user successfully!" 
    });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(300).json(books);
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    // 获取 URL 中的 isbn 参数
    const isbn = req.params.isbn;
    // 在 books 对象中查找对应的图书
    const book = books[isbn];
    if (book) {
        // 如果找到图书，返回图书信息
        return res.status(200).json(book);
    } else {
        // 如果未找到图书，返回错误信息
        return res.status(404).json({message: "Book not found"});
    }
    // 以下是原来的占位代码，可以删除
    // return res.status(300).json({message: "Yet to be implemented"});
});
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    // 获取URL参数中的作者名
    const targetAuthor = req.params.author;
    
    // 存储查询到的图书
    const booksByAuthor = [];
    
    // 遍历所有图书，筛选出作者匹配的书籍
    for (const isbn in books) {
        // 不区分大小写的匹配（可选，根据需求调整）
        if (books[isbn].author.toLowerCase() === targetAuthor.toLowerCase()) {
            // 可以选择包含ISBN信息，方便客户端识别
            booksByAuthor.push({
                isbn: isbn,
                ...books[isbn]
            });
        }
    }
    
    if (booksByAuthor.length > 0) {
        // 找到匹配的图书，返回结果
        return res.status(200).json(booksByAuthor);
    } else {
        // 未找到匹配的图书
        return res.status(404).json({ message: "No books found by this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    // 获取URL参数中的书名
    const targetTitle = req.params.title.toLowerCase();
    
    // 存储查询到的图书
    const booksByTitle = [];
    
    // 遍历所有图书，筛选出标题匹配的书籍
    for (const isbn in books) {
        // 将图书标题转为小写进行模糊匹配
        if (books[isbn].title.toLowerCase().includes(targetTitle)) {
            booksByTitle.push({
                isbn: isbn,
                ...books[isbn]
            });
        }
    }
    
    if (booksByTitle.length > 0) {
        // 找到匹配的图书，返回结果
        return res.status(200).json(booksByTitle);
    } else {
        // 未找到匹配的图书
        return res.status(404).json({ message: "No books found with this title" });
    }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    // 获取URL参数中的ISBN
    const isbn = req.params.isbn;
    
    // 查找对应的图书
    const book = books[isbn];
    
    if (book) {
        // 检查是否有评论
        if (book.reviews && Object.keys(book.reviews).length > 0) {
            // 返回该图书的所有评论
            return res.status(200).json(book.reviews);
        } else {
            // 图书存在但无评论
            return res.status(200).json({ message: "No reviews found for this book" });
        }
    } else {
        // 未找到对应ISBN的图书
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
