const express = require("express");
const router = new express.Router();
const Comments = require("../models/Comment");
const Blogs = require("../models/Blogs");
const auth = require("../middleware/Auth");

router.get("/getComments/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const blogs = await Blogs.findOne({ _id: id, Deleted: false })
      .populate({
        path: "Comments",
        model: "Comment",
        select: ["User", "Body", "Likes", "Replies","createdAt"],
        match: { Deleted: false },
        populate: {
          path: "User",
          select: ["Name", "Designation", "Avatar", "Institution","SuperUser"],
        },
      })
      .exec();

    if (!blogs) {
      res.status(404).send();
    } else {
      res.status(200).send(blogs);
    }
  } catch (e) {
    console.log(e);
    res.status(404).send();
  }
});

router.post("/createComment/:id", auth, async (req, res) => {
  try {
    const blog = await Blogs.findOne({ _id: req.params.id });

    if (!blog) {
      return res.status(404).send();
    }
    if(!req.body.Body || !req.body.Body.trim()){
      throw new Error('Comment cant be empty!')
    }
    const comment = new Comments({
      Body: req.body.Body,
      User: req.user._id,
      Blog: req.params.id,
    });

    const newComment = await comment.save();
    blog.Comments.push(newComment._id);
    await blog.save();
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/like/:id", auth, async (req, res) => {
  try {
    const comment = await Comments.findOne({
      _id: req.params.id,
      Deleted: false,
    });
    if (!comment) throw new Error();

    const like = comment.Likes.find((curr) => {
      return curr.toString().trim() == req.user._id.toString().trim();
    });
    if (like) {
      const likeArray = comment.Likes.filter(
        (curr) => curr.toString().trim() != req.user._id.toString().trim()
      );
      comment.Likes = likeArray;
    } else {
      comment.Likes.push(req.user._id);
    }

    await comment.save();
    res.status(200).send(comment);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.patch("/updateComment/:id", auth, async (req, res) => {
  const id = req.params.id;
  try {
    const comment = await Comments.findOne({ _id: id, Deleted: false });
    if (!comment) {
      return res.status(404).send();
    }
   
    if (comment.User.toString().trim() !== req.user._id.toString().trim()) {
      return res.status(401).send();
    }
    
    if(!req.body.Body || !req.body.Body.trim()){
      throw new Error('Comment cant be empty!')
    }

    comment.Body = req.body.Body;
    await comment.save();
    res.status(200).send(comment.Body);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/deleteComment/:id", auth, async (req, res) => {
  const id = req.params.id;

  try {
    const comment = await Comments.findOne({ _id: id, Deleted: false });
    if (!comment) return res.status(404).send();

    if (!req.Admin && comment.User.toString().trim() !== req.user._id.toString().trim()) {
      return res.status(401).send();
    }
    const blog = await Blogs.findOne({
      _id: comment.Blog.toString().trim(),
      Deleted: false,
    });
    const newCommentArray = blog.Comments.filter(
      (comment) => comment.toString().trim() !== id.toString().trim()
    );
    blog.Comments = newCommentArray;
    await blog.save();
    comment.Deleted = true;
    await comment.save();
    res.status(200).send();
  } catch (e) {
    res.status(400).send();
  }
});

module.exports = router;
