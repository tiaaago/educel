import { Schema, models, model } from "mongoose";

const userSchema = new Schema({
    id: { type: Number, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    createdAt: { type: Date, required: true },
    lastLogin: { type: Date, select: false },
    name: { type: String, required: true, uppercase: true, unique: true },
    password: { type: String, required: true, select: false },
    roles: { type: Array, default: [ 1 ] },
    events: { type: Array, default: [] },
    pushNotificationData: { type: Array, select: false },
    lastNotificationRequest: { type: String },
    profilePicture: { type: String },
    banned: {
        state: { type: Boolean, default: false },
        reason: { type: String },
        until: { type: String },
        by: { type: String },
    }
});

const Users = models.users || model("users", userSchema);

export default Users;