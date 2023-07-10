const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");

const Post = require("../models/post");
const User = require("../models/user");

const addStatusCodeToErrorObject = (errorObject, statusCode = 500) => {
  if (!errorObject.statusCode) errorObject.statusCode = statusCode;
  return errorObject;
};

const createNewErrorObject = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;

  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res.status(200).json({
        message: "Fetched posts successfully.",
        posts: posts,
        totalItems: totalItems,
      });
    })
    .catch((err) => next(err));

  // Post.find()
  //   .then((posts) => {
  //     res.status(200).json({
  //       posts: posts,
  //     });
  //   })
  //   .catch((err) => {
  //     const e = addStatusCodeToErrorObject(err);
  //     next(e);
  //   });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // not an async code
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }

  // if image is saved successfully
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  let creator;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId, // Added by the isAuth middleware
  });
  post
    .save()
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully!",
        post: post,
        creator: { id: creator._id, name: creator.name },
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

exports.updatePost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = createNewErrorObject(
      "Validation failed, entered data is incorrect!!",
      422
    );
    console.log(error);
    throw error;
  }

  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image; // if no new image was uploaded, old path is returned.

  // if new image is uploaded
  if (req.file) {
    imageUrl = req.file.path;
  }

  if (!imageUrl) {
    const error = new Error("No file uploaded!!");
    error.statusCode = 422;
    throw error;
  }

  // update database
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        throw createNewErrorObject("Could not find post.", 404);
      }

      // Check if user is authorized
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not authorized.");
        error.statusCode = 403;
        throw error;
      }

      // delete previous image if new image is uploaded
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }

      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;

      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Post updated!!", post: result });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        throw createNewErrorObject("Post not found.", 404);
      }

      // if (post.creator.toString() !== req.userId) {
      //   const error = new Error("Not authorized.");
      //   error.statusCode = 403;
      //   throw error;
      // }

      // check logged in user
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId); // mongoose gives pull method to remove the post from post array
      return user.save();
    })
    .then((result) => {
      console.log(result);
      res.status(200).json({ message: "Post Deleted." });
    })
    .catch((err) => {
      next(err);
    });
};
