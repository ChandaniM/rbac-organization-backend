features 
    .login
    .register
    .dashboard page
    add user
    delete user 
    view all user of paritcular company
    update details of that emp
routes
awth 
error handling

- db : mkdir -p ~/data/db    

- mongod --dbpath ~/data/db 


-----------
// Organization Management System (Multi-Tenant + RBAC)
// Each organization = one tenant
// Snake_case naming convention

Table org {
  id uuid [pk]
  name varchar
  display_name varchar
  description varchar
  status varchar
  parent_id int [ref: > org.id]
  created_at timestamp
  created_by int
  updated_at timestamp
  updated_by int
}

Table users {
  id int [pk]
  tenantId int [ref: > org.id]
  username varchar
  email varchar
  password_hash varchar
  is_active boolean
  email_verified boolean
  created_at timestamp

  Indexes {
    (tenantId, email) [unique]
  }
}

Table user_invitations {
  id int [pk]
  tenantId int [ref: > org.id]
  email varchar
  role_id int [ref: > roles.id]
  token varchar
  expires_at timestamp
  accepted boolean
}

Table roles {
  id int [pk]
  tenantId int [ref: > org.id]
  name varchar
  description varchar
  created_at timestamp

  Indexes {
    (tenantId, name) [unique]
  }
}

Table permissions {
  id int [pk]
  name varchar
  description varchar
}

Table role_permissions {
  role_id int [ref: > roles.id]
  permission_id int [ref: > permissions.id]

  Indexes {
    (role_id, permission_id) [unique]
  }
}

Table user_roles {
  user_id int [ref: > users.id]
  role_id int [ref: > roles.id]
  assigned_at timestamp

  Indexes {
    (user_id, role_id) [unique]
  }
}

Table user_hierarchy {
  user_id int [ref: > users.id]
  manager_id int [ref: > users.id]
}

Table org_settings {
  id int [pk]
  tenantId int [ref: > org.id]
  logo_url varchar
  config json
}

admin@system@123