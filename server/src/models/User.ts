import { pool } from '../config/database';

export interface User {
    id: number;
    name: string;
    email: string;
    password_hash?: string; // Opcional para não expor a senha no front-end após o login
    role?: 'client' | 'admin';
    image_url?: string | null;
    phone?: string | null;
    cep?: string | null;
    city?: string | null;
    state?: string | null;
    neighborhood?: string | null;
    address?: string | null;
    number?: string | null;
    complement?: string | null;
    created_at?: string;
}

export type NewUser = Omit<User, 'id' | 'created_at' | 'password_hash'> & {
    password_hash: string;
};

export type UserUpdate = Partial<Omit<User, 'id' | 'created_at'>>;

const publicUserFields = `
    id, name, email, role, image_url, phone, cep, city, state,
    neighborhood, address, number, complement, created_at
`;

export const UserModel = {
    async create(user: NewUser): Promise<User> {
        const {
            name, email, password_hash, role = 'client', image_url = null,
            phone = null, cep = null, city = null, state = null,
            neighborhood = null, address = null, number = null, complement = null,
        } = user;

        const query = `
            INSERT INTO users (
                name, email, password_hash, role, image_url, phone, cep, city,
                state, neighborhood, address, number, complement
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING ${publicUserFields};
        `;
        const values = [
            name, email, password_hash, role, image_url, phone, cep, city,
            state, neighborhood, address, number, complement,
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    async getAll(): Promise<User[]> {
        const result = await pool.query(`SELECT ${publicUserFields} FROM users ORDER BY id ASC`);
        return result.rows;
    },

    async getById(id: number): Promise<User | null> {
        const result = await pool.query(`SELECT ${publicUserFields} FROM users WHERE id = $1`, [id]);
        return result.rows[0] || null;
    },

    async getByEmail(email: string): Promise<User | null> {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    },

    async update(id: number, user: UserUpdate): Promise<User | null> {
        const allowedFields = new Set([
            'name', 'email', 'password_hash', 'role', 'image_url', 'phone', 'cep',
            'city', 'state', 'neighborhood', 'address', 'number', 'complement',
        ]);
        const entries = Object.entries(user).filter(
            ([field, value]) => allowedFields.has(field) && value !== undefined,
        );

        if (entries.length === 0) {
            return this.getById(id);
        }

        const assignments = entries.map(([field], index) => `${field} = $${index + 1}`);
        const values: (string | number | null)[] = entries.map(
            ([, value]) => value as string | null,
        );
        values.push(id);

        const query = `
            UPDATE users
            SET ${assignments.join(', ')}
            WHERE id = $${values.length}
            RETURNING ${publicUserFields};
        `;
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    },

    async delete(id: number): Promise<boolean> {
        const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    },
};

