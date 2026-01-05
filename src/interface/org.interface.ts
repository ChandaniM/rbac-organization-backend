export interface CreateOrgDTO {
    name: string;
    display_name?: string;
    description?: string;
    status?: string;
    parent_id?: string | null;
    created_by?: number;
  }
  
  export interface UpdateOrgDTO {
    id: string;
    name?: string;
    display_name?: string;
    description?: string;
    status?: string;
    parent_id?: string | null;
    updated_by?: number;
  }