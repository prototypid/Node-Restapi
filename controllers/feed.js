const { validationResult } = require("express-validator");
const Post = require("../models/post");
const post = require("../models/post");

const addStatusCodeToErrorObject = (errorObject, statusCode = 500) => {
  if (!errorObject.statusCode) errorObject.statusCode = statusCode;
  return errorObject;
};

exports.getPosts = (req, res, next) => {
  Post.find()
    .then((posts) => {
      res.status(200).json({
        posts: posts,
      });
    })
    .catch((err) => {
      const e = addStatusCodeToErrorObject(err);
      next(e);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // not an async code
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: "test/img",
    creator: { name: "Thatsboy" },
  });
  post
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Post created successfully!",
        post: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;

      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      // post not found
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }

      // post found
      res.status(200).json({ message: "Post fetched", post: post });
    })
    .catch((err) => next(err)); // we set 500 statusCode in error handling middleware
};
