import { Schema, models, model } from "mongoose";

const roleSchema = new Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    position: { type: Number, required: true },
    permissions: { type: Array, default: [] },
    isClass: { type: Boolean, default: false },
    editable: { type: Boolean, default: true },
});

const Roles = models.roles || model("roles", roleSchema);

export default Roles;