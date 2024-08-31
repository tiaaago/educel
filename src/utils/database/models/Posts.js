import { Schema, models, model } from "mongoose";

const postsSchema = new Schema({
    id: { type: Number, required: true, unique: true },
    createdAt: { type: Date, required: true },
    author: { type: Number, required: true },
    from: { type: Array, required: true },
    content: { type: String, required: true },
    seen: { type: Array, default: [] },
    olderVersions: { type: Array, default: [] },
    fixed: { type: Boolean, default: false }
});

const Posts = models.posts || model("posts", postsSchema);

export default Posts;