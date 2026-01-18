// 1️⃣ Insert Permissions
db.permissions.insertMany([
    { _id: ObjectId(), name: "create_organization", description: "Create tenants" },
    { _id: ObjectId(), name: "add_users", description: "Add users" },
    { _id: ObjectId(), name: "assign_roles", description: "Assign roles" },
    { _id: ObjectId(), name: "view_team", description: "View team" },
    { _id: ObjectId(), name: "edit_team", description: "Edit team" },
    { _id: ObjectId(), name: "view_profile", description: "View profile" }
  ]);