const express = require("express");
const router = new express.Router();
const Blog = require("../models/Blogs");
const auth = require("../middleware/Auth");
const User = require("../models/User");

router.get("/Allblogs", async (req, res) => {
  try {
    let sort;
    // /Allblogs?sortBy=popularity&skip=5
    if (req.query.sortBy === "popularity") {
      sort = { LikesLength: "desc" };
    }else if(req.query.sortBy === "oldest-first"){
      sort = { createdAt: 1 };
    } 
    else {
      sort = { createdAt: "desc" };
    }

    const blogs = await Blog.find({ Deleted: false })
      .limit(10)
      .skip(parseInt(req.query.skip))
      .sort(sort)
      .populate({
        path: "User",
        select: ["Name", "Designation", "Avatar", "Institution", "SuperUser"],
        match: { Deleted: false },
      })
      .exec();
    res.status(200).send(blogs);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/write", auth, async (req, res) => {
  try {
    if(!req.body.Body || !req.body.Body.trim()){
      throw new Error('Blog cant be empty!')
    }
    const blog = new Blog({ Body: req.body.Body, User: req.user._id });
    const newBlog = await blog.save();
    const user = await User.findOne({ _id: req.user._id });
    user.Blogs.push(newBlog._id);
    await user.save();
    res.status(200).send(newBlog);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const blog = await Blog.findOne({ _id: _id, Deleted: false });
    if (!blog) return res.status(404).send();

    if (
      !req.Admin &&
      blog.User.toString().trim() != req.user._id.toString().trim()
    ) {
      return res.status(401).send();
    }

    blog.Deleted = true;
    await blog.save();

    res.status(200).send();
  } catch (e) {
    return res.status(400).send(e);
  }
});

router.get("/currentBlog/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const blog = await Blog.findOne({ _id: id, Deleted: false }).populate({
      path: "User",
      select: ["Name", "Designation", "Avatar", "Institution","SuperUser"],
      match: { Deleted: false },
    });
    if (!blog) res.status(404).send();

    res.status(200).send(blog);
  } catch (e) {
    return res.status(400).send(e);
  }
});

router.patch("/currBlog/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const blog = await Blog.findOne({ _id: id, Deleted: false });
    if (!blog) res.status(404).send();
    
    if(!req.body.Body || !req.body.Body.trim()){
      throw new Error('Blog cant be empty!')
    }
    
    blog.Body = req.body.Body;
    await blog.save();
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/like/:id", auth, async (req, res) => {
  try {
    const blog = await Blog.findOne({
      _id: req.params.id,
      Deleted: false,
    });

    if (!blog) {
      return res.status(404).send();
    }

    const like = blog.Likes.find((curr) => {
      return curr.toString().trim() == req.user._id.toString().trim();
    });

    if (like) {
      const likeArray = blog.Likes.filter(
        (curr) => curr.toString().trim() != req.user._id.toString().trim()
      );
      blog.Likes = likeArray;
    } else {
      blog.Likes.push(req.user._id);
    }

    blog.LikesLength = blog.Likes.length;

    await blog.save();
    res.status(200).send(blog);
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});

module.exports = router;
